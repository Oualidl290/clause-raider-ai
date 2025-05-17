
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";
import { genHash, OPENAI_API_KEY } from "../_shared/utils.ts";

// No need to check for OPENAI_API_KEY since we're importing it directly
// if (!OPENAI_API_KEY) {
//   console.error("OPENAI_API_KEY is required");
// }

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the usage data for this user
    const { data: usageData, error: usageError } = await supabaseClient
      .from("user_api_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (usageError) {
      return new Response(
        JSON.stringify({ error: "Failed to check usage limits", details: usageError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check usage limits based on plan
    const maxCallsPerDay = usageData.plan === "elite" ? 100 : (usageData.plan === "pro" ? 30 : 5);
    if (usageData.calls_today >= maxCallsPerDay) {
      return new Response(
        JSON.stringify({ error: "Daily usage limit reached. Please upgrade your plan." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { company_name, raw_text, url = null } = requestData;

    if (!company_name || !raw_text) {
      return new Response(
        JSON.stringify({ error: "company_name and raw_text are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a hash for version tracking
    const version_hash = await genHash(raw_text);

    // Create a new document record
    const { data: document, error: documentError } = await supabaseClient
      .from("tos_documents")
      .insert({
        user_id: user.id,
        company_name,
        raw_text,
        url,
        version_hash,
        status: "processing"
      })
      .select()
      .single();

    if (documentError) {
      return new Response(
        JSON.stringify({ error: "Failed to create document", details: documentError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Split the text into chunks (simple paragraph-based splitting for now)
    const chunks = raw_text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 10);
    
    // Process each chunk (in a real system, this would be done asynchronously)
    const processedClauses = [];
    
    for (const chunkText of chunks) {
      // Only process the first 10 chunks (for demo purposes and API usage control)
      if (processedClauses.length >= 10) break;
      
      try {
        // Call OpenAI API to analyze the chunk
        const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",  // using 3.5 to be cost-effective
            messages: [
              {
                role: "system",
                content: "You are a legal expert analyzing Terms of Service agreements. Identify the category, risk level (low/medium/high), and enforceability of clauses."
              },
              {
                role: "user",
                content: `Analyze this clause from Terms of Service:
                """${chunkText}"""
                
                Return a JSON object with these fields:
                - category: The type of clause (e.g., arbitration, data usage, cancellation)
                - risk_level: "low", "medium", or "high" based on potential consumer harm
                - enforceable: true if likely enforceable, false if likely not enforceable, null if unclear
                - loophole_summary: A brief explanation of any potential loopholes or concerns
                
                Format as valid JSON only.`
              }
            ]
          })
        });

        const aiResponse = await analysisResponse.json();
        
        if (!aiResponse.choices || !aiResponse.choices[0]?.message?.content) {
          console.error("Invalid AI response", aiResponse);
          continue;
        }

        // Parse the AI response
        const responseContent = aiResponse.choices[0].message.content;
        let parsedResponse;
        
        try {
          // Try to parse the JSON response
          const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                            responseContent.match(/\{[\s\S]*\}/);
          
          const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : responseContent;
          parsedResponse = JSON.parse(jsonStr);
          
          // Insert the clause into the database
          const { data: clause, error: clauseError } = await supabaseClient
            .from("clauses")
            .insert({
              document_id: document.id,
              text: chunkText,
              category: parsedResponse.category || "uncategorized",
              risk_level: parsedResponse.risk_level || "low",
              enforceable: parsedResponse.enforceable,
              loophole_summary: parsedResponse.loophole_summary || null
            })
            .select()
            .single();

          if (clauseError) {
            console.error("Failed to insert clause:", clauseError);
          } else {
            processedClauses.push(clause);
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError, responseContent);
        }
      } catch (analysisError) {
        console.error("Error analyzing chunk:", analysisError);
      }
    }

    // Update document status to analyzed
    await supabaseClient
      .from("tos_documents")
      .update({ status: "analyzed" })
      .eq("id", document.id);

    // Update usage count
    await supabaseClient
      .from("user_api_usage")
      .update({ 
        calls_today: usageData.calls_today + 1,
        last_call: new Date().toISOString()
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ 
        status: "success", 
        document_id: document.id,
        clauses_analyzed: processedClauses.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
