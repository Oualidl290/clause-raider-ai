
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, AlertTriangle, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/AuthLayout';
import type { Database } from '@/integrations/supabase/types';

type TOSDocument = Database['public']['Tables']['tos_documents']['Row'];
type UserApiUsage = Database['public']['Tables']['user_api_usage']['Row'];

const Dashboard = () => {
  const [documents, setDocuments] = useState<TOSDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiUsage, setApiUsage] = useState<UserApiUsage | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data: docs, error: docsError } = await supabase
          .from('tos_documents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (docsError) throw docsError;
        setDocuments(docs || []);
        
        // Fetch API usage
        const { data: usage, error: usageError } = await supabase
          .from('user_api_usage')
          .select('*')
          .maybeSingle();
        
        if (usageError) throw usageError;
        setApiUsage(usage);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading dashboard",
          description: error.message || "Failed to load your data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleAnalyzeNew = () => {
    navigate('/analyze');
  };

  const handleViewDocument = (id: string) => {
    navigate(`/document/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'analyzed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Analyzed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRemainingCalls = () => {
    if (!apiUsage) return '?';
    const maxCallsPerDay = apiUsage.plan === 'elite' ? 100 : (apiUsage.plan === 'pro' ? 30 : 5);
    return maxCallsPerDay - apiUsage.calls_today;
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Dashboard - TOS Raider</title>
        <meta name="description" content="View and analyze your Terms of Service documents" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your Terms of Service analyses</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <Button onClick={handleAnalyzeNew} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Analyze New TOS
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{documents.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">API Calls Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {apiUsage ? apiUsage.calls_today : '0'}
                <span className="text-sm text-muted-foreground ml-2">
                  ({getRemainingCalls()} remaining)
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg bg-amber-100 text-amber-800">
                {apiUsage ? apiUsage.plan.toUpperCase() : 'FREE'}
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Terms of Service documents you've analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
                <TabsTrigger value="pending">Pending/Processing</TabsTrigger>
              </TabsList>
              
              {['all', 'analyzed', 'pending'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No documents yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Get started by analyzing your first Terms of Service
                      </p>
                      <Button onClick={handleAnalyzeNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Analyze New TOS
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {documents
                        .filter(doc => 
                          tab === 'all' || 
                          (tab === 'analyzed' && doc.status === 'analyzed') ||
                          (tab === 'pending' && (doc.status === 'pending' || doc.status === 'processing'))
                        )
                        .map(doc => (
                          <div key={doc.id} className="py-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{doc.company_name}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                {getStatusBadge(doc.status)}
                                <span>
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" onClick={() => handleViewDocument(doc.id)}>
                              View Analysis
                            </Button>
                          </div>
                        ))
                      }
                      
                      {documents.filter(doc => 
                        tab === 'all' || 
                        (tab === 'analyzed' && doc.status === 'analyzed') ||
                        (tab === 'pending' && (doc.status === 'pending' || doc.status === 'processing'))
                      ).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No documents in this category
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleAnalyzeNew} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Analyze New Terms of Service
            </Button>
          </CardFooter>
        </Card>
        
        {apiUsage && apiUsage.plan === 'free' && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Upgrade Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You're currently on the Free plan with limited daily API calls. 
                Upgrade to Pro or Elite for more analyses and advanced features.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="default">
                Upgrade Now
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
