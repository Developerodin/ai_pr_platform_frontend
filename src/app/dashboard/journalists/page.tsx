"use client";

import { useState, useEffect } from "react";
import { JournalistTable } from "@/components/journalists/journalist-table";
import { AddJournalistDialog } from "@/components/journalists/add-journalist-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Globe, Upload } from "lucide-react";
import { journalistApi } from "@/lib/api";
import { ImportJournalistsDialog } from "@/components/journalists/import-journalists-dialog";

interface JournalistStats {
  total_journalists: number;
  active_journalists: number;
  verified_journalists: number;
  verification_rate: number;
  top_categories: Array<{
    category: string;
    count: number;
  }>;
  top_countries: Array<{
    country: string;
    count: number;
  }>;
}

export default function JournalistsPage() {
  const [stats, setStats] = useState<JournalistStats>({
    total_journalists: 0,
    active_journalists: 0,
    verified_journalists: 0,
    verification_rate: 0,
    top_categories: [],
    top_countries: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      const response = await journalistApi.stats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load journalist stats:", error);
    }
  };

  const handleJournalistAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Journalists</h1>
    <p className="text-muted-foreground">
      Manage your journalist database and track engagement
    </p>
  </div>
  <div className="flex gap-2">
    <ImportJournalistsDialog onImportComplete={handleJournalistAdded} />
    <AddJournalistDialog onJournalistAdded={handleJournalistAdded} />
  </div>
</div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Journalists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_journalists}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_journalists} active contacts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified_journalists}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.verification_rate * 100).toFixed(1)}% verification rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.top_categories[0]?.category || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.top_categories[0]?.count || 0} journalists
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.top_countries.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.top_countries[0]?.country || "N/A"} ({stats.top_countries[0]?.count || 0})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      {stats.top_categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Distribution of journalists by coverage area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.top_categories.map((category) => (
                <Badge key={category.category} variant="secondary">
                  {category.category} ({category.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journalists Table */}
      <JournalistTable key={refreshKey} />
    </div>
  );
}
