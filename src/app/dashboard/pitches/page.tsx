"use client";

import { useState, useEffect } from "react";
import { PitchGenerator } from "@/components/pitches/pitch-generator";
import { PitchCard } from "@/components/pitches/pitch-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, BarChart3, Search, Plus } from "lucide-react";
import { Pitch } from "@/lib/types";
import { pitchApi } from "@/lib/api";
import { toast } from "sonner";

interface PitchStats {
  total_pitches: number;
  draft_pitches: number;
  sent_pitches: number;
  performance: {
    total_emails_sent: number;
    total_responses: number;
    total_articles: number;
    response_rate: number;
  };
  credits_remaining: number;
}

export default function PitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [stats, setStats] = useState<PitchStats>({
    total_pitches: 0,
    draft_pitches: 0,
    sent_pitches: 0,
    performance: {
      total_emails_sent: 0,
      total_responses: 0,
      total_articles: 0,
      response_rate: 0,
    },
    credits_remaining: 100,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    loadPitches();
    loadStats();
  }, []);

  const loadPitches = async () => {
    try {
      setLoading(true);
      const response = await pitchApi.list({ limit: 50 });
      setPitches(response.data.pitches || []);
    } catch (error) {
      toast.error("Failed to load pitches");
      console.error("Error loading pitches:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await pitchApi.stats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load pitch stats:", error);
    }
  };

  const handlePitchGenerated = (pitch: Pitch) => {
    setPitches(prev => [pitch, ...prev]);
    loadStats(); // Refresh stats
    setActiveTab("library"); // Switch to library tab to show the new pitch
    toast.success("Pitch added to your library!");
  };

  const handleDeletePitch = async (pitchId: string) => {
    if (!confirm("Are you sure you want to delete this pitch?")) return;
    
    try {
      await pitchApi.delete(pitchId);
      setPitches(prev => prev.filter(p => p.id !== pitchId));
      loadStats();
      toast.success("Pitch deleted successfully");
    } catch (error) {
      toast.error("Failed to delete pitch");
    }
  };

  const handleSendPitch = (pitch: Pitch) => {
    // TODO: Implement send to journalists modal
    toast.info("Send to journalists feature coming soon!");
  };

  const filteredPitches = pitches.filter(pitch =>
    pitch.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitch.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Pitch Generator</h1>
        <p className="text-muted-foreground">
          Generate professional PR content with AI and manage your pitch library
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pitches</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pitches}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft_pitches} drafts, {stats.sent_pitches} sent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.total_emails_sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.performance.total_responses} responses received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.performance.response_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.performance.total_articles} articles published
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.credits_remaining}</div>
            <p className="text-xs text-muted-foreground">
              AI generation credits remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate New Pitch
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pitch Library ({pitches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <PitchGenerator onPitchGenerated={handlePitchGenerated} />
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pitches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredPitches.length} pitch{filteredPitches.length !== 1 ? 'es' : ''}
            </Badge>
          </div>

          {/* Pitches Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPitches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pitches found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? "No pitches match your search criteria." : "Generate your first AI pitch to get started."}
                </p>
                <Button onClick={() => setActiveTab("generate")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate New Pitch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPitches.map((pitch) => (
                <PitchCard
                  key={pitch.id}
                  pitch={pitch}
                  onDelete={handleDeletePitch}
                  onSend={handleSendPitch}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
