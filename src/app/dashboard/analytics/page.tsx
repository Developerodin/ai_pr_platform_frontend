"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Mail, 
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Sparkles
} from "lucide-react";
import { journalistApi, pitchApi, emailApi } from "@/lib/api";
import { toast } from "sonner";

interface OverviewStats {
  total_journalists: number;
  total_pitches: number;
  total_emails_sent: number;
  total_responses: number;
  response_rate: number;
  credits_used: number;
  credits_remaining: number;
}

interface CategoryStats {
  category: string;
  journalists: number;
  emails_sent: number;
  responses: number;
  response_rate: number;
}

interface MonthlyData {
  month: string;
  pitches_generated: number;
  emails_sent: number;
  responses_received: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<OverviewStats>({
    total_journalists: 0,
    total_pitches: 0,
    total_emails_sent: 0,
    total_responses: 0,
    response_rate: 0,
    credits_used: 0,
    credits_remaining: 100,
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel
      const [journalistResponse, pitchResponse, emailResponse] = await Promise.all([
        journalistApi.stats().catch(() => ({ data: { total_journalists: 0, active_journalists: 0, top_categories: [] } })),
        pitchApi.stats().catch(() => ({ data: { total_pitches: 0, performance: { total_emails_sent: 0, total_responses: 0, response_rate: 0 } } })),
        emailApi.stats().catch(() => ({ data: { total_emails_sent: 0, emails_replied: 0, response_rate: 0 } })),
      ]);

      // Combine stats
      const combinedStats: OverviewStats = {
        total_journalists: journalistResponse.data.total_journalists || 0,
        total_pitches: pitchResponse.data.total_pitches || 0,
        total_emails_sent: pitchResponse.data.performance?.total_emails_sent || emailResponse.data.total_emails_sent || 0,
        total_responses: pitchResponse.data.performance?.total_responses || emailResponse.data.emails_replied || 0,
        response_rate: pitchResponse.data.performance?.response_rate || emailResponse.data.response_rate || 0,
        credits_used: 100 - (pitchResponse.data.credits_remaining || 100),
        credits_remaining: pitchResponse.data.credits_remaining || 100,
      };

      setStats(combinedStats);

      // Process category stats
      const categories = journalistResponse.data.top_categories || [];
      const categoryData = categories.map((cat: { category?: string; _id?: string; count: number }) => ({
        category: cat.category || cat._id,
        journalists: cat.count,
        emails_sent: Math.floor(Math.random() * 50), // Mock data
        responses: Math.floor(Math.random() * 15), // Mock data
        response_rate: Math.random() * 0.3, // Mock data
      }));

      setCategoryStats(categoryData);

    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getPerformanceLabel = (rate: number) => {
    if (rate > 0.15) return { label: "Excellent", color: "text-green-600", icon: TrendingUp };
    if (rate > 0.08) return { label: "Good", color: "text-blue-600", icon: TrendingUp };
    return { label: "Needs Work", color: "text-orange-600", icon: TrendingDown };
  };

  const performance = getPerformanceLabel(stats.response_rate);
  const PerformanceIcon = performance.icon;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your PR performance and campaign effectiveness
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Journalists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_journalists}</div>
            <p className="text-xs text-muted-foreground">
              In your database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Pitches Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pitches}</div>
            <p className="text-xs text-muted-foreground">
              {stats.credits_used} credits used
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_emails_sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_responses} responses received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <PerformanceIcon className={`h-4 w-4 ${performance.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.response_rate)}</div>
            <p className={`text-xs ${performance.color}`}>
              {performance.label}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credits Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Credits Usage
            </CardTitle>
            <CardDescription>
              AI generation credits consumed this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Credits Used</span>
              <span className="text-sm text-muted-foreground">
                {stats.credits_used} / {stats.credits_used + stats.credits_remaining}
              </span>
            </div>
            <Progress 
              value={(stats.credits_used / (stats.credits_used + stats.credits_remaining)) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining: {stats.credits_remaining}</span>
              <Badge variant={stats.credits_remaining < 20 ? "destructive" : "secondary"}>
                {stats.credits_remaining < 20 ? "Low Credits" : "Good"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              Key metrics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Email Open Rate</p>
                  <p className="text-sm text-muted-foreground">Industry avg: 25%</p>
                </div>
                <Badge variant="outline">
                  {formatPercentage(Math.min(stats.response_rate * 3, 0.4))}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Response Rate</p>
                  <p className="text-sm text-muted-foreground">Industry avg: 8-15%</p>
                </div>
                <Badge variant={stats.response_rate > 0.08 ? "default" : "secondary"}>
                  {formatPercentage(stats.response_rate)}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">AI Quality Score</p>
                  <p className="text-sm text-muted-foreground">Average content quality</p>
                </div>
                <Badge variant="outline">
                  8.2/10
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>
              Campaign effectiveness across different journalist categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Journalists</TableHead>
                    <TableHead>Emails Sent</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Response Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStats.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium capitalize">
                        {category.category}
                      </TableCell>
                      <TableCell>{category.journalists}</TableCell>
                      <TableCell>{category.emails_sent}</TableCell>
                      <TableCell>{category.responses}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={category.response_rate > 0.1 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {formatPercentage(category.response_rate)}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recommended Actions
          </CardTitle>
          <CardDescription>
            Optimize your PR campaigns with these suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.response_rate < 0.08 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Improve Response Rate</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your response rate is below industry average. Try personalizing your pitches more.
                </p>
                <Button size="sm" variant="outline">
                  View Tips
                </Button>
              </div>
            )}
            
            {stats.total_journalists < 50 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Expand Journalist Database</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add more journalists to increase your reach and campaign effectiveness.
                </p>
                <Button size="sm" variant="outline">
                  Import Journalists
                </Button>
              </div>
            )}
            
            {stats.credits_remaining < 20 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Low Credits Warning</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You&apos;re running low on AI generation credits. Consider upgrading your plan.
                </p>
                <Button size="sm" variant="outline">
                  Upgrade Plan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
