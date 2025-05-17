
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, FileText, AlertCircle, Upload, Link, FileSearch, History } from "lucide-react";

const Dashboard = () => {
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  return (
    <>
      <Helmet>
        <title>Dashboard - TOS Raider</title>
        <meta name="description" content="Analyze Terms of Service documents with AI" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-tos-navy font-heading">Dashboard</h1>
            <p className="text-gray-600">Analyze terms of service documents to find loopholes and protect your rights</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Analyze New Document</CardTitle>
                  <CardDescription>
                    Upload or provide a URL to a terms of service document to begin analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="url" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <Link className="h-4 w-4" /> URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload
                      </TabsTrigger>
                      <TabsTrigger value="paste" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Paste Text
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">Terms of Service URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="url"
                            placeholder="https://example.com/terms"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button className="bg-tos-blue hover:bg-tos-blue/90">
                            Analyze <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Enter the direct URL to a company's terms of service page
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-blue-800">Popular Services</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {["Netflix", "Amazon", "Spotify", "Apple", "Google", "Microsoft"].map((service) => (
                            <Button
                              key={service}
                              variant="outline"
                              size="sm"
                              className="bg-white"
                            >
                              {service}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="mx-auto flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-4" />
                          <h3 className="text-gray-700 font-medium">Upload a TOS Document</h3>
                          <p className="text-sm text-gray-500 mt-1">Drag and drop or click to upload</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                          <Button className="mt-4 bg-tos-blue hover:bg-tos-blue/90">
                            Select File
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="paste" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paste-text">Paste Terms of Service Text</Label>
                        <textarea
                          id="paste-text"
                          placeholder="Paste the full terms of service text here..."
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px]"
                        />
                        <div className="flex justify-end">
                          <Button className="bg-tos-blue hover:bg-tos-blue/90">
                            Analyze Text <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-tos-navy mb-4 font-heading">Recent Analyses</h2>
                <div className="space-y-4">
                  {[
                    { company: "Netflix", date: "May 15, 2025", clauses: 8, status: "completed" },
                    { company: "Spotify", date: "May 12, 2025", clauses: 4, status: "completed" },
                    { company: "Airbnb", date: "May 8, 2025", clauses: 12, status: "completed" }
                  ].map((item, index) => (
                    <Card key={index} className="hover:border-tos-blue/40 transition-all cursor-pointer">
                      <CardContent className="p-0">
                        <div className="flex items-center p-4">
                          <div className="h-10 w-10 rounded-full bg-tos-navy/10 flex items-center justify-center mr-4">
                            <FileText className="h-5 w-5 text-tos-navy" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.company} Terms of Service</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{item.date}</span>
                              <span className="mx-2">•</span>
                              <span className="text-tos-blue font-medium">{item.clauses} problematic clauses</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Analyses Used</span>
                        <span className="font-medium">3 / 5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-tos-blue rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Email Templates</span>
                        <span className="font-medium">2 / 3</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-tos-blue rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileSearch className="h-4 w-4 mr-2" /> New Analysis
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" /> View History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" /> Report a TOS Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-tos-gold/10 border-tos-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-tos-gold" /> Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Install our Chrome extension to automatically detect and analyze
                    Terms of Service while browsing the web.
                  </p>
                  <Button variant="outline" className="mt-4 w-full border-tos-gold/30 hover:bg-tos-gold/20 text-tos-navy">
                    Get Chrome Extension
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
