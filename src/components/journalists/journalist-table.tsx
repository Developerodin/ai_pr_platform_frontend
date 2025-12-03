"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Upload,
  Mail,
  Edit,
  Trash2,
  ExternalLink,
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Journalist } from "@/lib/types";
import { journalistApi } from "@/lib/api";
import { toast } from "sonner";
import { ImportJournalistsDialog } from "./import-journalists-dialog";
import { JournalistProfileDialog } from "./journalist-profile-dialog";
import { AddJournalistDialog } from "./add-journalist-dialog";


export function JournalistTable() {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournalist, setSelectedJournalist] = useState<Journalist | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleViewProfile = (journalist: Journalist) => {
  setSelectedJournalist(journalist);
  setProfileDialogOpen(true);
};

  useEffect(() => {
    loadJournalists();
  }, []);

  const loadJournalists = async () => {
    try {
      setLoading(true);
      const response = await journalistApi.list({ limit: 50 });
      setJournalists(response.data.journalists || []);
    } catch (error) {
      toast.error("Failed to load journalists");
      console.error("Error loading journalists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journalist?")) return;
    
    try {
      await journalistApi.delete(id);
      toast.success("Journalist deleted successfully");
      loadJournalists();
    } catch (error) {
      toast.error("Failed to delete journalist");
    }
  };

  const filteredJournalists = journalists.filter(journalist =>
    journalist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journalist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journalist.publication.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading journalists...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
  <div className="relative flex-1 max-w-sm">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search journalists..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10"
    />
  </div>
  <div className="flex gap-2">
    <ImportJournalistsDialog onImportComplete={loadJournalists} />
<AddJournalistDialog onJournalistAdded={loadJournalists} />
  </div>
</div>

      {/* Journalists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journalists Database</CardTitle>
          <CardDescription>
            Manage your journalist contacts and track engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredJournalists.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No journalists</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first journalist.
              </p>
              <div className="mt-6">
<AddJournalistDialog onJournalistAdded={loadJournalists} />
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Publication</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Response Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournalists.map((journalist) => (
                    <TableRow key={journalist.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{journalist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {journalist.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{journalist.publication}</div>
                          <div className="text-sm text-muted-foreground">
                            {journalist.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(journalist.category)}
                        >
                          {journalist.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(journalist.stats.response_rate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {journalist.stats.responses_sent}/{journalist.stats.emails_received} emails
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={journalist.status === 'active' ? 'default' : 'secondary'}
                        >
                          {journalist.status}
                        </Badge>
                        {journalist.verified && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
<DropdownMenuItem onClick={() => handleViewProfile(journalist)}>
  <ExternalLink className="mr-2 h-4 w-4" />
  View Profile
</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(journalist.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Profile Dialog - Outside of table */}
{selectedJournalist && (
  <JournalistProfileDialog 
    journalist={selectedJournalist}
    open={profileDialogOpen}
    onOpenChange={setProfileDialogOpen}
  />
)}
    </div>
  );
}
