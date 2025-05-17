
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';

const AnalyzeTOS = () => {
  const [companyName, setCompanyName] = useState('');
  const [tosText, setTosText] = useState('');
  const [tosUrl, setTosUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      toast({
        title: "Missing company name",
        description: "Please enter the company name",
        variant: "destructive"
      });
      return;
    }
    
    if (!tosText || tosText.length < 100) {
      toast({
        title: "Insufficient text",
        description: "Please enter more text from the Terms of Service",
        variant: "destructive"
      });
      return;
    }

    await processSubmission(companyName, tosText, tosUrl);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      toast({
        title: "Missing company name",
        description: "Please enter the company name",
        variant: "destructive"
      });
      return;
    }
    
    if (!tosUrl || !tosUrl.startsWith('http')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // In a real app, we'd fetch the TOS from the URL here
      // For this demo, we'll just use a placeholder
      const fetchedText = `This is simulated TOS text for ${companyName} that would be fetched from ${tosUrl}.\n\n` +
        "By accessing or using our service, you agree to be bound by these Terms. " +
        "We reserve the right to update these Terms at any time without notice. " +
        "Your continued use of the Service after any changes constitutes acceptance.\n\n" +
        "You agree to waive your right to participate in a class-action lawsuit.\n\n" +
        "We may share your personal data with partners and affiliates without additional consent.\n\n" +
        "All disputes shall be resolved through binding arbitration in the state of Delaware.\n\n" +
        "We may charge your payment method without additional notice for subscription renewals.\n\n" +
        "You grant us a perpetual, irrevocable license to user content you upload.";
      
      setTosText(fetchedText);
      await processSubmission(companyName, fetchedText, tosUrl);
    } catch (error: any) {
      console.error("Error fetching TOS:", error);
      toast({
        title: "Failed to fetch TOS",
        description: error.message || "There was an error fetching the Terms of Service",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const processSubmission = async (company: string, text: string, url: string | null) => {
    setIsProcessing(true);
    
    try {
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to analyze Terms of Service",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      const token = session.data.session.access_token;
      
      // Call our edge function to process the TOS
      const response = await supabase.functions.invoke("analyze-tos", {
        body: {
          company_name: company,
          raw_text: text,
          url: url || null
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze Terms of Service");
      }

      toast({
        title: "Analysis started",
        description: "We're analyzing the Terms of Service. Results will be available soon.",
      });
      
      // Redirect to document view
      navigate(`/document/${response.data.document_id}`);
    } catch (error: any) {
      console.error("Error analyzing TOS:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze Terms of Service",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Analyze Terms of Service - TOS Raider</title>
        <meta name="description" content="Analyze Terms of Service agreements to find loopholes and concerns" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Analyze Terms of Service</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Submit Terms of Service</CardTitle>
            <CardDescription>
              Enter a company's Terms of Service for AI-powered analysis. We'll identify problematic clauses and potential loopholes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Amazon, Netflix, Spotify"
                className="mb-6"
                required
              />
            </div>

            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="text">
                  <FileText className="h-4 w-4 mr-2" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Globe className="h-4 w-4 mr-2" />
                  Enter URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text">
                <form onSubmit={handleTextSubmit}>
                  <Label htmlFor="tos-text">Terms of Service Text</Label>
                  <Textarea 
                    id="tos-text"
                    value={tosText}
                    onChange={(e) => setTosText(e.target.value)}
                    placeholder="Paste the full Terms of Service text here..."
                    className="min-h-[300px] mb-4"
                    required
                  />
                  
                  <div className="flex items-center text-sm text-amber-600 mb-6">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>The more complete text you provide, the better our analysis will be.</span>
                  </div>
                  
                  <Button type="submit" disabled={isProcessing} className="w-full">
                    {isProcessing ? "Processing..." : "Analyze Terms of Service"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="url">
                <form onSubmit={handleUrlSubmit}>
                  <Label htmlFor="tos-url">Terms of Service URL</Label>
                  <Input
                    id="tos-url"
                    value={tosUrl}
                    onChange={(e) => setTosUrl(e.target.value)}
                    placeholder="https://example.com/terms"
                    className="mb-6"
                    type="url"
                    required
                  />
                  
                  <div className="flex items-center text-sm text-amber-600 mb-6">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>We'll extract and analyze the content from this page.</span>
                  </div>
                  
                  <Button type="submit" disabled={isProcessing} className="w-full">
                    {isProcessing ? "Fetching & Processing..." : "Fetch & Analyze Terms"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default AnalyzeTOS;
