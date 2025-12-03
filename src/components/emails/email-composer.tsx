"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Users, 
  Mail, 
  Filter,
  Search,
  Loader2,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Pitch, Journalist } from "@/lib/types";
import { journalistApi, emailApi } from "@/lib/api";
import { toast } from "sonner";

const emailSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailComposerProps {
  pitch: Pitch;
  trigger?: React.ReactNode;
  onEmailSent?: () => void;
}

export function EmailComposer({ pitch, trigger, onEmailSent }: EmailComposerProps) {
  const [open, setOpen] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<Pitch>(pitch); // 🆕 Local state for current pitch
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [selectedJournalists, setSelectedJournalists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: pitch.content.email_pitch.subject,
      message: pitch.content.email_pitch.body,
    },
  });

  // 🆕 Update local pitch state when prop changes (from edits/rewrites)
  useEffect(() => {
    setCurrentPitch(pitch);
    
    // Update form values with the latest content
    form.setValue("subject", pitch.content.email_pitch.subject);
    form.setValue("message", pitch.content.email_pitch.body);
  }, [pitch, form]);

  useEffect(() => {
    if (open) {
      loadJournalists();
    }
  }, [open]);

  // 🆕 Reset form when dialog opens to get latest content
  useEffect(() => {
    if (open) {
      form.setValue("subject", currentPitch.content.email_pitch.subject);
      form.setValue("message", currentPitch.content.email_pitch.body);
    }
  }, [open, currentPitch, form]);

  const loadJournalists = async () => {
    try {
      setLoading(true);
      const response = await journalistApi.list({ limit: 100 });
      setJournalists(response.data.journalists || []);
    } catch (error) {
      toast.error("Failed to load journalists");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Function to refresh content from latest pitch data
  const refreshContent = () => {
    form.setValue("subject", currentPitch.content.email_pitch.subject);
    form.setValue("message", currentPitch.content.email_pitch.body);
    toast.success("Content refreshed with latest version!");
  };

  // 🆕 Check if content has been modified from original
  const isContentModified = () => {
    const currentSubject = form.getValues("subject");
    const currentMessage = form.getValues("message");
    
    return currentSubject !== currentPitch.content.email_pitch.subject || 
           currentMessage !== currentPitch.content.email_pitch.body;
  };

  const filteredJournalists = journalists.filter(journalist => {
    const matchesSearch = journalist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journalist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journalist.publication.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || journalist.category === categoryFilter;
    
    return matchesSearch && matchesCategory && journalist.status === "active";
  });

  const handleJournalistToggle = (journalistId: string) => {
    setSelectedJournalists(prev =>
      prev.includes(journalistId)
        ? prev.filter(id => id !== journalistId)
        : [...prev, journalistId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJournalists.length === filteredJournalists.length) {
      setSelectedJournalists([]);
    } else {
      setSelectedJournalists(filteredJournalists.map(j => j.id));
    }
  };

  const onSubmit = async (data: EmailFormData) => {
    if (selectedJournalists.length === 0) {
      toast.error("Please select at least one journalist");
      return;
    }

    setSending(true);

    try {
      const response = await emailApi.send({
        pitch_id: currentPitch.id,
        journalist_ids: selectedJournalists,
        custom_subject: data.subject !== currentPitch.content.email_pitch.subject ? data.subject : undefined,
        custom_message: data.message !== currentPitch.content.email_pitch.body ? data.message : undefined,
      });

      const result = response.data;
      
      toast.success(
        `✨ Emails with Press Release has been sent! ${result.total_sent} emails sent, ${result.total_failed} failed.`
      );
      
      setOpen(false);
      form.reset();
      setSelectedJournalists([]);
      onEmailSent?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to send emails";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send to Journalists
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Send Email Campaign</DialogTitle>
          <DialogDescription>
            ✨ Send your AI-generated pitch to selected journalists 
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="grid gap-6 py-4 pr-4">
            {/* Email Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Content
                  </div>
                  {/* 🆕 Content status and refresh button */}
                  <div className="flex items-center gap-2">
                    {isContentModified() && (
                      <Badge variant="outline" className="text-xs">
                        Modified
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshContent}
                      className="h-7 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
                {/* 🆕 Show content source info */}
                <CardDescription>
                  Using latest content from pitch. Word count: {currentPitch.content.email_pitch.word_count} words
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    {...form.register("subject")}
                    disabled={sending}
                  />
                  {form.formState.errors.subject && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    {...form.register("message")}
                    disabled={sending}
                    className="font-mono text-sm resize-none min-h-[120px] max-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{journalist_name}"} and {"{publication}"} for personalization
                  </p>
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Journalist Selection - keep existing code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Select Recipients
                  </div>
                  <Badge variant="secondary">
                    {selectedJournalists.length} selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search journalists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select All */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedJournalists.length === filteredJournalists.length && filteredJournalists.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={loading || sending}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Select all ({filteredJournalists.length} journalists)
                  </Label>
                </div>

                {/* Journalists List */}
                <div className="border rounded-md">
                  <ScrollArea className="h-[240px] p-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : filteredJournalists.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p>No journalists found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredJournalists.map((journalist) => (
                          <div
                            key={journalist.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleJournalistToggle(journalist.id)}
                          >
                            <Checkbox
                              checked={selectedJournalists.includes(journalist.id)}
                              onCheckedChange={() => handleJournalistToggle(journalist.id)}
                              disabled={sending}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">{journalist.name}</p>
                                <Badge
                                  variant="secondary"
                                  className={getCategoryColor(journalist.category)}
                                >
                                  {journalist.category}
                                </Badge>
                                {journalist.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {journalist.email} • {journalist.publication}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Response rate: {(journalist.stats.response_rate * 100).toFixed(1)}%</span>
                                <span>{journalist.country}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={sending || selectedJournalists.length === 0}
          >
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sending ? "Sending Branded Emails..." : ` Send to ${selectedJournalists.length} Recipients `}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
