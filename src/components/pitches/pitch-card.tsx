"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FileText, 
  Mail,
  Eye, 
  Send, 
  Copy,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import { Pitch } from "@/lib/types";
import { toast } from "sonner";
import { EmailComposer } from "@/components/emails/email-composer";
import { PitchDetailDialog } from "./pitch-detail-dialog";

interface PitchCardProps {
  pitch: Pitch;
  onView?: (pitch: Pitch) => void;
  onEdit?: (pitch: Pitch) => void;
  onDelete?: (pitchId: string) => void;
  onSend?: (pitch: Pitch) => void;
}

export function PitchCard({ pitch, onView, onEdit, onDelete, onSend }: PitchCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      archived: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getAnnouncementTypeLabel = (type: string) => {
    const labels = {
      product_launch: "Product Launch",
      funding: "Funding Round",
      partnership: "Partnership",
      executive_hire: "Executive Hire",
      award: "Award",
      research: "Research",
      other: "Other"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleCopyPressRelease = async () => {
    try {
      await navigator.clipboard.writeText(pitch.content.press_release.body);
      toast.success("Press release copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyEmailPitch = async () => {
    try {
      await navigator.clipboard.writeText(pitch.content.email_pitch.body);
      toast.success("Email pitch copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {pitch.headline}
            </CardTitle>
            <CardDescription>
              {pitch.company_name} • {getAnnouncementTypeLabel(pitch.announcement_type)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView?.(pitch)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSend?.(pitch)}>
                <Send className="mr-2 h-4 w-4" />
                Send to Journalists
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyPressRelease}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Press Release
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyEmailPitch}>
                <Mail className="mr-2 h-4 w-4" />
                Copy Email Pitch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(pitch)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(pitch.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Points */}
        <div>
          <h4 className="text-sm font-medium mb-2">Key Points:</h4>
          <div className="flex flex-wrap gap-1">
            {pitch.key_points.slice(0, 3).map((point, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {point.length > 30 ? `${point.substring(0, 30)}...` : point}
              </Badge>
            ))}
            {pitch.key_points.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{pitch.key_points.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{pitch.content.press_release.word_count} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{pitch.content.email_pitch.word_count} words</span>
          </div>
        </div>

        {/* Performance Metrics */}
        {pitch.performance.emails_sent > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Emails Sent:</span>
                <span className="font-medium ml-1">{pitch.performance.emails_sent}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Responses:</span>
                <span className="font-medium ml-1">{pitch.performance.responses_received}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status and Quality */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(pitch.status)}>
              {pitch.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Quality: {pitch.generation_info.quality_score}/10
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(pitch.created_at)}
          </span>
        </div>

    {/* Action Buttons */}
    <div className="flex gap-2 pt-2">
    <EmailComposer
        pitch={pitch}
        trigger={
        <Button size="sm" className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Send Pitch
        </Button>
        }
    />
<PitchDetailDialog
  pitch={pitch}
  onPitchUpdated={(updatedPitch) => {
    // This will update the pitch in the parent component
    onEdit?.(updatedPitch);
  }}
  trigger={
    <Button size="sm" variant="outline">
      <Eye className="mr-2 h-4 w-4" />
      View
    </Button>
  }
/>
    </div>
      </CardContent>
    </Card>
  );
}
