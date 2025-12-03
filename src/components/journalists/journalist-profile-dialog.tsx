"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Building,
  Globe,
  Clock,
  BarChart3,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Journalist } from "@/lib/types";

interface JournalistProfileDialogProps {
  journalist: Journalist;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JournalistProfileDialog({ 
  journalist, 
  trigger, 
  open, 
  onOpenChange 
}: JournalistProfileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external open state if provided, otherwise use internal
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800",
      business: "bg-green-100 text-green-800",
      healthcare: "bg-red-100 text-red-800",
      finance: "bg-yellow-100 text-yellow-800",
      lifestyle: "bg-purple-100 text-purple-800",
      entertainment: "bg-pink-100 text-pink-800",
      sports: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{journalist.name}</div>
              <div className="text-sm text-muted-foreground">{journalist.publication}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Journalist profile and engagement history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <a href={`mailto:${journalist.email}`} className="text-sm font-medium hover:underline">
                  {journalist.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Publication:</span>
                <span className="text-sm font-medium">{journalist.publication}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Country:</span>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{journalist.country}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timezone:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{journalist.timezone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage & Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Coverage & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge className={getCategoryColor(journalist.category)}>
                  {journalist.category}
                </Badge>
              </div>
              {journalist.topics.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {journalist.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={journalist.status === 'active' ? 'default' : 'secondary'}>
                  {journalist.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verified:</span>
                <Badge variant={journalist.verified ? 'default' : 'outline'}>
                  {journalist.verified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{journalist.stats.emails_received}</div>
                  <div className="text-xs text-muted-foreground">Emails Received</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{journalist.stats.responses_sent}</div>
                  <div className="text-xs text-muted-foreground">Responses Sent</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Rate:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={journalist.stats.response_rate > 0.15 ? 'default' : 'secondary'}>
                    {(journalist.stats.response_rate * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Articles Published:</span>
                <span className="text-sm font-medium">{journalist.stats.articles_published}</span>
              </div>
              {journalist.stats.last_contacted && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Contacted:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatDate(journalist.stats.last_contacted)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {journalist.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{journalist.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Best Time:</span>
                <Badge variant="outline">{journalist.contact_info.best_time}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Preferred Day:</span>
                <Badge variant="outline">{journalist.contact_info.preferred_day}</Badge>
              </div>
              {journalist.contact_info.response_time_avg_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response Time:</span>
                  <span className="text-sm font-medium">
                    {journalist.contact_info.response_time_avg_hours} hours
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-xs text-muted-foreground text-center">
            Added on {formatDate(journalist.created_at)} • Source: {journalist.source}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
