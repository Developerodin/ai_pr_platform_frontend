"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Loader2,
  X
} from "lucide-react";
import { importApi } from "@/lib/api";
import { toast } from "sonner";
import type { ApiError, Journalist } from "@/lib/types";

interface ImportPreview {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  field_mapping: Record<string, string>;
  sample_data: Record<string, unknown>[];
  detected_columns: string[];
  suggested_mapping: Record<string, string>;
}

interface ImportResult {
  total_processed: number;
  successfully_imported: number;
  failed_imports: number;
  duplicates_skipped: number;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, unknown>;
  }>;
  imported_journalist_ids: string[];
}

interface ImportJournalistsDialogProps {
  onImportComplete?: () => void;
}

export function ImportJournalistsDialog({ onImportComplete }: ImportJournalistsDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a CSV, Excel, or JSON file");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const previewImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const response = await importApi.preview(file);
      setPreview(response.data);
      setStep('preview');
      toast.success("File analyzed successfully!");
    } catch (error: unknown) {
      const errorMessage = (error as ApiError)?.response?.data?.detail || "Failed to analyze file";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async () => {
    if (!file) return;

    setLoading(true);
    setStep('importing');

    try {
      const response = await importApi.execute(file, {
        skip_duplicates: true,
        update_existing: false,
      });
      
      setResult(response.data);
      setStep('complete');
      
      toast.success(
        `Import completed! ${response.data.successfully_imported} journalists imported successfully.`
      );
      
      onImportComplete?.();
    } catch (error: unknown) {
      const errorMessage = (error as ApiError)?.response?.data?.detail || "Import failed";
      toast.error(errorMessage);
      setStep('preview'); // Go back to preview on error
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await importApi.template();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'journalist_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetDialog, 300); // Reset after dialog closes
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Journalists</DialogTitle>
          <DialogDescription>
            Upload a CSV, Excel, or JSON file to import journalists into your database
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {['upload', 'preview', 'importing', 'complete'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-primary text-primary-foreground' : 
                  ['upload', 'preview', 'importing', 'complete'].indexOf(step) > index ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                }`}>
                  {['upload', 'preview', 'importing', 'complete'].indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    ['upload', 'preview', 'importing', 'complete'].indexOf(step) > index ? 'bg-green-200' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="mb-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {file ? file.name : "Drop your file here"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {file ? 
                    `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB` :
                    "Or click to browse files"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV, Excel (.xlsx, .xls), and JSON files (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    File selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{preview.total_rows}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{preview.valid_rows}</div>
                  <div className="text-xs text-muted-foreground">Valid</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{preview.invalid_rows}</div>
                  <div className="text-xs text-muted-foreground">Invalid</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{preview.duplicate_rows}</div>
                  <div className="text-xs text-muted-foreground">Duplicates</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Field Mapping Preview</h4>
                <div className="space-y-2">
                  {Object.entries(preview.field_mapping).map(([original, mapped]) => (
                    <div key={original} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-mono text-sm">{original}</span>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="secondary">{mapped}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Sample Data Preview</h4>
                <ScrollArea className="h-40 border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Publication</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.sample_data.slice(0, 3).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{String(row.name || '-')}</TableCell>
                          <TableCell>{String(row.email || '-')}</TableCell>
                          <TableCell>{String(row.publication || '-')}</TableCell>
                          <TableCell>{String(row.category || '-')}</TableCell>
                          <TableCell>
                            <Badge variant={String(row.import_status) === 'valid' ? 'default' : 'destructive'}>
                              {String(row.import_status || '-')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importing Journalists...</h3>
              <p className="text-muted-foreground">
                Please wait while we process your file and import the data.
              </p>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && result && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-600 mb-2">Import Completed!</h3>
                <p className="text-muted-foreground">
                  Your journalists have been successfully imported into your database.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.successfully_imported}</div>
                  <div className="text-xs text-green-700">Imported</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.duplicates_skipped}</div>
                  <div className="text-xs text-yellow-700">Skipped</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                    Import Errors ({result.errors.length})
                  </h4>
                  <ScrollArea className="h-32 border rounded p-3">
                    <div className="space-y-2">
                      {result.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">Row {error.row}:</span> {error.error}
                        </div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {result.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={previewImport} 
                disabled={!file || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze File
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={executeImport} 
                disabled={loading || preview?.valid_rows === 0}
              >
                Import {preview?.valid_rows} Journalists
              </Button>
            </>
          )}

          {step === 'importing' && (
            <Button variant="outline" disabled>
              Importing...
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
