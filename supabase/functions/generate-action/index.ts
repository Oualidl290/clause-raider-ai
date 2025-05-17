
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required");
}

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

    // Parse the request body
    const requestData = await req.json();
    const { clause_id, action_type } = requestData;

    if (!clause_id || !action_type) {
      return new Response(
        JSON.stringify({ error: "clause_id and action_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the clause from the database
    const { data: clause, error: clauseError } = await supabaseClient
      .from("clauses")
      .select(`
        *,
        tos_documents!inner (
          company_name,
          user_id
        )
      `)
      .eq("id", clause_id)
      .single();

    if (clauseError || !clause) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch clause", details: clauseError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to this clause
    if (clause.tos_documents.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to access this clause" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OpenAI to generate action response
    const actionPrompts = {
      "cancel": `Generate a professionally-worded email to cancel a service with ${clause.tos_documents.company_name} based on this problematic clause: "${clause.text}". Include any specific legal rights that may apply.`,
      "opt-out": `Create an opt-out request email for ${clause.tos_documents.company_name} referencing this clause: "${clause.text}". Include relevant legal protections if applicable.`,
      "refund": `Draft a refund request email to ${clause.tos_documents.company_name} based on issues with this clause: "${clause.text}". Cite consumer protection laws where relevant.`,
      "delete-data": `Create a formal data deletion request email for ${clause.tos_documents.company_name} referencing GDPR/CCPA rights and this clause: "${clause.text}".`
    };

    const actionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful legal assistant drafting formal response letters."
          },
          {
            role: "user",
            content: actionPrompts[action_type]
          }
        ]
      })
    });

    const aiResponse = await actionResponse.json();
    
    if (!aiResponse.choices || !aiResponse.choices[0]?.message?.content) {
      return new Response(
        JSON.stringify({ error: "Failed to generate action response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email_template = aiResponse.choices[0].message.content;

    // Generate legal reference (simplified version for demo)
    const legalReferenceResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal expert. Provide relevant legal references or consumer protection laws."
          },
          {
            role: "user",
            content: `Provide 1-3 specific legal references (laws, court cases, or regulations) that would support a consumer taking ${action_type} action related to this clause: "${clause.text}"`
          }
        ]
      })
    });

    const legalRefAIResponse = await legalReferenceResponse.json();
    const legal_reference = legalRefAIResponse.choices?.[0]?.message?.content || null;

    // Create the loophole action record
    const { data: action, error: actionError } = await supabaseClient
      .from("loophole_actions")
      .insert({
        clause_id,
        action_type,
        email_template,
        legal_reference,
        status: "draft"
      })
      .select()
      .single();

    if (actionError) {
      return new Response(
        JSON.stringify({ error: "Failed to create action", details: actionError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: "success", action }),
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
