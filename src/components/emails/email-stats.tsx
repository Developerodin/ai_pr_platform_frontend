"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Eye, 
  Reply, 
  TrendingUp,
  ExternalLink,
  Calendar
} from "lucide-react";
import { emailApi } from "@/lib/api";
import { toast } from "sonner";

interface EmailStats {
  total_emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  open_rate: number;
  response_rate: number;
  credits_remaining: number;
}

interface EmailInteraction {
  id: string;
  type: string;
  status: string;
  email_data?: {
    subject: string;
    content: string;
  };
  journalist: {
    id: string;
    name: string;
    email: string;
    publication: string;
  };
  pitch?: {
    id: string;
    headline: string;
    company_name: string;
  };
  response_received: boolean;
  interaction_date: string;
  response_date?: string;
}

interface EmailInteractionsResponse {
  interactions: EmailInteraction[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
}

export function EmailStats() {
  const [stats, setStats] = useState<EmailStats>({
    total_emails_sent: 0,
    emails_opened: 0,
    emails_replied: 0,
    open_rate: 0,
    response_rate: 0,
    credits_remaining: 100,
  });
  const [interactions, setInteractions] = useState<EmailInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadInteractions();
  }, []);

  const loadStats = async () => {
    try {
      const response = await emailApi.stats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load email stats:", error);
    }
  };

  const loadInteractions = async () => {
    try {
      setLoading(true);
      const response = await emailApi.interactions({ limit: 20 });
      setInteractions(response.data.interactions || []);
    } catch (error) {
      toast.error("Failed to load email interactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      opened: "bg-purple-100 text-purple-800",
      clicked: "bg-orange-100 text-orange-800",
      replied: "bg-emerald-100 text-emerald-800",
      bounced: "bg-red-100 text-red-800",
      failed: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || colors.sent;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_emails_sent}</div>
            <p className="text-xs text-muted-foreground">
              Total email campaigns sent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.open_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.emails_opened} emails opened
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.response_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.emails_replied} responses received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.response_rate > 0.15 ? "Great" : stats.response_rate > 0.08 ? "Good" : "Average"}
            </div>
            <p className="text-xs text-muted-foreground">
              Industry benchmark: 8-15%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Email Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Activity</CardTitle>
          <CardDescription>
            Track your email campaigns and journalist interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No email activity</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start sending pitches to see email analytics here.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journalist</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{interaction.journalist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {interaction.journalist.publication}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">
                            {interaction.email_data?.subject}
                          </div>
                          {interaction.pitch && (
                            <div className="text-sm text-muted-foreground truncate">
                              {interaction.pitch.headline}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(interaction.status)}>
                          {interaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(interaction.interaction_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {interaction.response_received ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Reply className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">
                              {interaction.response_date ? formatDate(interaction.response_date) : "Yes"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
