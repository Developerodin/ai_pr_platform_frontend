// components/newsroom/newsroom-overview.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Users,
  Eye,
  ExternalLink,
  Share2
} from "lucide-react";
import { Newsroom } from "@/lib/types";
import { toast } from "sonner";

interface NewsroomOverviewProps {
  newsroom: Newsroom;
  onUpdate: () => void;
}

export function NewsroomOverview({ newsroom }: NewsroomOverviewProps) {
  const handleSharePublicUrl = async () => {
    // Use root level URL for public newsroom
    const publicUrl = `${window.location.origin}/newsroom/${newsroom._id}/public`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public newsroom URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handleViewPublic = () => {
    // Open public newsroom in new tab at root level
    const publicUrl = `/newsroom/${newsroom._id}/public`;
    window.open(publicUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Newsroom Overview</h2>
          <p className="text-muted-foreground">
            Your digital newsroom dashboard and company information
          </p>
        </div>
        
        {newsroom.is_public && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSharePublicUrl}>
              <Share2 className="mr-2 h-4 w-4" />
              Share URL
            </Button>
            <Button onClick={handleViewPublic}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Page
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{newsroom.company_info.name}</h3>
              {newsroom.company_info.description && (
                <p className="text-muted-foreground mt-1">
                  {newsroom.company_info.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {newsroom.company_info.industry && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{newsroom.company_info.industry}</Badge>
                  {newsroom.company_info.employee_count && (
                    <Badge variant="outline">{newsroom.company_info.employee_count}</Badge>
                  )}
                </div>
              )}

              {newsroom.company_info.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={newsroom.company_info.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {newsroom.company_info.website}
                  </a>
                </div>
              )}

              {newsroom.company_info.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${newsroom.company_info.email}`}
                    className="text-primary hover:underline"
                  >
                    {newsroom.company_info.email}
                  </a>
                </div>
              )}

              {newsroom.company_info.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{newsroom.company_info.phone}</span>
                </div>
              )}

              {newsroom.company_info.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{newsroom.company_info.address}</span>
                </div>
              )}

              {newsroom.company_info.founded_year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Founded in {newsroom.company_info.founded_year}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Newsroom Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Newsroom Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{newsroom.views}</div>
                <div className="text-sm text-blue-700">Total Views</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{newsroom.press_releases.length}</div>
                <div className="text-sm text-green-700">Press Releases</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{newsroom.media_assets.length}</div>
                <div className="text-sm text-purple-700">Media Assets</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {newsroom.is_public ? 'Public' : 'Private'}
                </div>
                <div className="text-sm text-orange-700">Visibility</div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(newsroom.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{formatDate(newsroom.last_updated)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Newsroom ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{newsroom._id}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates to your newsroom content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recent press releases */}
            {newsroom.press_releases.slice(0, 3).map((release, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{release.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Published on {formatDate(release.published_date)}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent media assets */}
            {newsroom.media_assets.slice(0, 3).map((asset, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{asset.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on {formatDate(asset.uploaded_at)}
                  </p>
                </div>
              </div>
            ))}

            {newsroom.press_releases.length === 0 && newsroom.media_assets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity</p>
                <p className="text-sm">Start by adding press releases or media assets</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Your newsroom's color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-border"
                style={{ backgroundColor: newsroom.brand_colors.primary }}
              />
              <p className="text-xs mt-2 font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">{newsroom.brand_colors.primary}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-border"
                style={{ backgroundColor: newsroom.brand_colors.secondary }}
              />
              <p className="text-xs mt-2 font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">{newsroom.brand_colors.secondary}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-border"
                style={{ backgroundColor: newsroom.brand_colors.accent }}
              />
              <p className="text-xs mt-2 font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">{newsroom.brand_colors.accent}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
