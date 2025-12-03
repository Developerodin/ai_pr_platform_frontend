"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Mail, 
  TrendingUp,
  Plus,
  Send,
  BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";
import { journalistApi, pitchApi, emailApi } from "@/lib/api";

interface QuickStats {
  journalists: number;
  pitches: number;
  emails_sent: number;
  response_rate: number;
  credits_remaining: number;
}

export function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats>({
    journalists: 0,
    pitches: 0,
    emails_sent: 0,
    response_rate: 0,
    credits_remaining: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const [journalistRes, pitchRes, emailRes] = await Promise.allSettled([
        journalistApi.stats(),
        pitchApi.stats(),
        emailApi.stats(),
      ]);

      setStats({
        journalists: journalistRes.status === 'fulfilled' ? journalistRes.value.data.total_journalists || 0 : 0,
        pitches: pitchRes.status === 'fulfilled' ? pitchRes.value.data.total_pitches || 0 : 0,
        emails_sent: emailRes.status === 'fulfilled' ? emailRes.value.data.total_emails_sent || 0 : 0,
        response_rate: emailRes.status === 'fulfilled' ? emailRes.value.data.response_rate || 0 : 0,
        credits_remaining: pitchRes.status === 'fulfilled' ? pitchRes.value.data.credits_remaining || 100 : 100,
      });
    } catch (error) {
      console.error("Failed to load quick stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journalists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.journalists}</div>
            <p className="text-xs text-muted-foreground">
              In your database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Pitches</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pitches}</div>
            <p className="text-xs text-muted-foreground">
              Generated with AI
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emails_sent}</div>
            <p className="text-xs text-muted-foreground">
              Campaign emails
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.response_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Email performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Generate AI Pitch</CardTitle>
            <CardDescription>
              Create professional PR content with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/pitches')} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Pitch
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Send Campaign</CardTitle>
            <CardDescription>
              Email your pitches to journalists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/campaigns')}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Email Campaign
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>View Analytics</CardTitle>
            <CardDescription>
              Track your PR performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/analytics')}
              className="w-full"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Credits Status */}
      <Card>
        <CardHeader>
          <CardTitle>Credits Status</CardTitle>
          <CardDescription>
            AI generation credits remaining
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.credits_remaining}</div>
              <p className="text-sm text-muted-foreground">Credits remaining</p>
            </div>
            <div className="text-right">
              <Badge variant={stats.credits_remaining < 20 ? "destructive" : "secondary"}>
                {stats.credits_remaining < 20 ? "Low Credits" : "Good"}
              </Badge>
              {stats.credits_remaining < 20 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Consider upgrading your plan
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
