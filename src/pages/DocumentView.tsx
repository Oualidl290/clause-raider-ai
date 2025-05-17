
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Copy, FileText } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database } from '@/integrations/supabase/types';

type Clause = Database['public']['Tables']['clauses']['Row'];
type TOSDocument = Database['public']['Tables']['tos_documents']['Row'];
type LoopholeAction = Database['public']['Tables']['loophole_actions']['Row'];

const riskLevelColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  high: 'bg-red-100 text-red-800 hover:bg-red-200'
};

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<TOSDocument | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [generatingAction, setGeneratingAction] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'opt-out' | 'refund' | 'delete-data' | null>(null);
  const [action, setAction] = useState<LoopholeAction | null>(null);

  useEffect(() => {
    const fetchDocumentAndClauses = async () => {
      if (!id) return;
      
      try {
        // Fetch the document
        const { data: docData, error: docError } = await supabase
          .from('tos_documents')
          .select('*')
          .eq('id', id)
          .single();
        
        if (docError) throw docError;
        setDocument(docData);
        
        // Fetch clauses for this document
        const { data: clausesData, error: clausesError } = await supabase
          .from('clauses')
          .select('*')
          .eq('document_id', id)
          .order('risk_level', { ascending: false });
        
        if (clausesError) throw clausesError;
        setClauses(clausesData);
      } catch (err: any) {
        console.error("Error fetching document:", err);
        setError(err.message || "Failed to load document");
        toast({
          title: "Error loading document",
          description: err.message || "Failed to load document",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentAndClauses();
  }, [id]);

  const handleClauseSelect = (clause: Clause) => {
    setSelectedClause(clause);
  };

  const handleGenerateAction = async (type: 'cancel' | 'opt-out' | 'refund' | 'delete-data') => {
    if (!selectedClause) return;
    
    setActionType(type);
    setGeneratingAction(true);
    
    try {
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate actions",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      const token = session.data.session.access_token;
      
      // Check if action already exists for this clause and type
      const { data: existingAction } = await supabase
        .from('loophole_actions')
        .select('*')
        .eq('clause_id', selectedClause.id)
        .eq('action_type', type)
        .maybeSingle();
      
      if (existingAction) {
        setAction(existingAction);
        setActionDialogOpen(true);
        return;
      }
      
      // Generate a new action
      const response = await supabase.functions.invoke("generate-action", {
        body: {
          clause_id: selectedClause.id,
          action_type: type
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate action");
      }
      
      setAction(response.data.action);
      setActionDialogOpen(true);
    } catch (error: any) {
      console.error("Error generating action:", error);
      toast({
        title: "Failed to generate action",
        description: error.message || "There was an error generating the action",
        variant: "destructive"
      });
    } finally {
      setGeneratingAction(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  const renderStatusBadge = () => {
    if (!document) return null;
    
    switch(document.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'analyzed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Analyzed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="text-center">
            <p>Loading document...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!document) {
    return (
      <AuthLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Document Not Found</AlertTitle>
            <AlertDescription>The requested document could not be found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Helmet>
        <title>{document.company_name} TOS Analysis - TOS Raider</title>
        <meta name="description" content={`Analysis of ${document.company_name}'s Terms of Service`} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{document.company_name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Terms of Service Analysis</p>
              {renderStatusBadge()}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button variant="outline" className="mr-2" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate('/analyze')}>
              Analyze Another TOS
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column - list of clauses */}
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Identified Clauses</CardTitle>
                <CardDescription>
                  {clauses.length} clauses found in this Terms of Service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="high">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="high">High Risk</TabsTrigger>
                    <TabsTrigger value="medium">Medium Risk</TabsTrigger>
                    <TabsTrigger value="low">Low Risk</TabsTrigger>
                  </TabsList>
                  
                  {['high', 'medium', 'low'].map((risk) => (
                    <TabsContent key={risk} value={risk} className="space-y-4">
                      {clauses.filter(c => c.risk_level === risk).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No {risk} risk clauses found
                        </div>
                      ) : (
                        clauses
                          .filter(c => c.risk_level === risk)
                          .map(clause => (
                            <Card 
                              key={clause.id} 
                              className={`cursor-pointer border-l-4 ${
                                selectedClause?.id === clause.id ? 'border-primary' : `border-${risk === 'high' ? 'red' : risk === 'medium' ? 'amber' : 'green'}-500`
                              }`}
                              onClick={() => handleClauseSelect(clause)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge className={riskLevelColors[clause.risk_level]}>
                                    {clause.risk_level.charAt(0).toUpperCase() + clause.risk_level.slice(1)} Risk
                                  </Badge>
                                  <Badge variant="outline">{clause.category}</Badge>
                                </div>
                                <p className="line-clamp-3 text-sm">
                                  {clause.text}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right column - clause details */}
          <div className="md:col-span-7">
            {selectedClause ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Clause Analysis</CardTitle>
                      <CardDescription>{selectedClause.category}</CardDescription>
                    </div>
                    <Badge className={riskLevelColors[selectedClause.risk_level]}>
                      {selectedClause.risk_level.charAt(0).toUpperCase() + selectedClause.risk_level.slice(1)} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Clause Text</h3>
                    <div className="relative bg-muted p-4 rounded-md">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(selectedClause.text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <p className="text-sm whitespace-pre-wrap">{selectedClause.text}</p>
                    </div>
                  </div>
                  
                  {selectedClause.risk_level === 'high' && (
                    <Alert className="border-red-500 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-800">High Risk Detected</AlertTitle>
                      <AlertDescription className="text-red-700">
                        This clause may significantly limit your rights or create unfavorable obligations.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedClause.enforceable !== null && (
                    <div>
                      <h3 className="font-medium mb-2">Enforceability</h3>
                      <Alert className={selectedClause.enforceable ? "border-amber-500 bg-amber-50" : "border-green-500 bg-green-50"}>
                        {selectedClause.enforceable ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <AlertTitle className="text-amber-800">Likely Enforceable</AlertTitle>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertTitle className="text-green-800">Potentially Unenforceable</AlertTitle>
                          </>
                        )}
                      </Alert>
                    </div>
                  )}
                  
                  {selectedClause.loophole_summary && (
                    <div>
                      <h3 className="font-medium mb-2">Potential Loopholes</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm">{selectedClause.loophole_summary}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleGenerateAction('cancel')}
                    disabled={generatingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Cancel Service
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleGenerateAction('opt-out')}
                    disabled={generatingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Opt Out
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleGenerateAction('refund')}
                    disabled={generatingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleGenerateAction('delete-data')}
                    disabled={generatingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Delete My Data
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex flex-col justify-center items-center py-12">
                <div className="text-center p-6">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No Clause Selected</CardTitle>
                  <CardDescription>
                    Select a clause from the list to see its analysis and available actions.
                  </CardDescription>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'cancel' && 'Service Cancellation'}
                {actionType === 'opt-out' && 'Opt-Out Request'}
                {actionType === 'refund' && 'Refund Request'}
                {actionType === 'delete-data' && 'Data Deletion Request'}
              </DialogTitle>
              <DialogDescription>
                Use this template to communicate with {document.company_name}
              </DialogDescription>
            </DialogHeader>
            
            {action && (
              <div className="space-y-6">
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  <div className="whitespace-pre-wrap">{action.email_template}</div>
                </ScrollArea>
                
                {action.legal_reference && (
                  <div>
                    <h3 className="font-medium mb-2">Legal References</h3>
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-sm whitespace-pre-wrap">{action.legal_reference}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => copyToClipboard(action?.email_template || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthLayout>
  );
};

export default DocumentView;
