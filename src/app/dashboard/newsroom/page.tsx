"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Eye, 
  FileText, 
  Image, 
  Plus,
  Settings,
  Globe,
  Lock
} from "lucide-react";
import { Newsroom, NewsroomStats } from "@/lib/types";
import { newsroomApi } from "@/lib/api";
import { toast } from "sonner";
import { NewsroomSetup } from "@/components/newsroom/newsroom-setup";
import { NewsroomOverview } from "@/components/newsroom/newsroom-overview";
import { MediaAssetManager } from "@/components/newsroom/media-asset-manager";
import { PressReleaseManager } from "@/components/newsroom/press-release-manager";
import { NewsroomSettings } from "@/components/newsroom/newsroom-settings";

export default function NewsroomPage() {
  const [newsroom, setNewsroom] = useState<Newsroom | null>(null);
  const [stats, setStats] = useState<NewsroomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadNewsroom();
    loadStats();
  }, []);

  const loadNewsroom = async () => {
    try {
      const response = await newsroomApi.getMy();
      if (response.data.exists) {
        setNewsroom(response.data.newsroom);
      }
    } catch (error) {
      console.error("Failed to load newsroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await newsroomApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleNewsroomCreated = (newNewsroom: Newsroom) => {
    setNewsroom(newNewsroom);
    loadStats();
    toast.success("Newsroom created successfully!");
  };

  const handleNewsroomUpdated = () => {
    loadNewsroom();
    loadStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show setup page if no newsroom exists
  if (!newsroom) {
    return <NewsroomSetup onNewsroomCreated={handleNewsroomCreated} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Newsroom</h1>
          <p className="text-muted-foreground">
            Manage your company's press releases and media assets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={newsroom.is_public ? "default" : "secondary"}>
            {newsroom.is_public ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Private
              </>
            )}
          </Badge>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Public newsroom views
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Press Releases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.press_releases || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published releases
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.media_assets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Images, videos, documents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.stats.last_updated 
                ? new Date(stats.stats.last_updated).toLocaleDateString()
                : "Never"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Content last modified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="releases" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Press Releases
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Media Assets
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <NewsroomOverview 
            newsroom={newsroom} 
            onUpdate={handleNewsroomUpdated}
          />
        </TabsContent>

        <TabsContent value="releases" className="space-y-6">
          <PressReleaseManager 
            newsroom={newsroom} 
            onUpdate={handleNewsroomUpdated}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaAssetManager 
            newsroom={newsroom} 
            onUpdate={handleNewsroomUpdated}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NewsroomSettings 
            newsroom={newsroom} 
            onUpdate={handleNewsroomUpdated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
