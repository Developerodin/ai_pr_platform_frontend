"use client";

import { useState, useEffect } from "react";
import { EmailStats } from "@/components/emails/email-stats";
import { EmailComposer } from "@/components/emails/email-composer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Plus, 
  Mail,
  BarChart3
} from "lucide-react";
import { Pitch } from "@/lib/types";
import { pitchApi } from "@/lib/api";
import { toast } from "sonner";

export default function CampaignsPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ADD THIS LINE
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadPitches();
  }, [refreshKey]);

const loadPitches = async () => {
  try {
    setLoading(true);
    setError("");
    
    console.log("Loading pitches for campaigns..."); // Debug
    
    // Simple API call without filters
    const response = await pitchApi.list();
    console.log("Full response:", response); // Debug
    
    const allPitches = response.data.pitches || [];
    console.log("All pitches:", allPitches); // Debug
    
    // Don't filter by status - show all pitches
    setPitches(allPitches);
    
    if (allPitches.length === 0) {
      console.log("No pitches found");
    }
    
  } catch (error: unknown) {
    console.error("Error loading pitches:", error);
    const apiError = error as { response?: { data?: { detail?: string } } };
    console.error("Error response:", apiError.response?.data); // Debug
    setError(apiError.response?.data?.detail || "Failed to load pitches");
    toast.error("Failed to load pitches");
  } finally {
    setLoading(false);
  }
};



  const handleEmailSent = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Email campaign analytics will update shortly");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
        <p className="text-muted-foreground">
          Send your AI-generated pitches to journalists and track performance
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Campaign Analytics
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Campaign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <EmailStats key={refreshKey} />
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Campaign</CardTitle>
              <CardDescription>
                Select a pitch from your library to send to journalists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pitches.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No pitches available</h3>
                  <p className="mt-1 text-muted-foreground mb-4">
                    Create some AI pitches first before sending email campaigns.
                  </p>
                  <Button onClick={() => window.location.href = '/dashboard/pitches'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate AI Pitch
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pitches.map((pitch) => (
                    <Card key={pitch.id} className="relative">
                      <CardHeader>
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {pitch.headline}
                        </CardTitle>
                        <CardDescription>
                          {pitch.company_name} • {pitch.announcement_type.replace('_', ' ')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Quality Score:</span>
                          <Badge variant="outline">
                            {pitch.generation_info.quality_score}/10
                          </Badge>
                        </div>
                        
                        {pitch.performance.emails_sent > 0 && (
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sent:</span>
                              <span>{pitch.performance.emails_sent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Responses:</span>
                              <span>{pitch.performance.responses_received}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <EmailComposer
                            pitch={pitch}
                            onEmailSent={handleEmailSent}
                            trigger={
                              <Button className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Send Campaign
                              </Button>
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
