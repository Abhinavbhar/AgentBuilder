import React, { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { X, Upload, FileText, Trash2, Bot, AlertCircle } from "lucide-react";
import axios from 'axios';

import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_FILE_SIZE_MB = 10;
const MAX_TOTAL_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
];

const ALLOWED_EXTENSIONS = [".pdf", ".csv", ".docx", ".odt"];

export default function CreateBot() {
  const [botName, setBotName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeErrorDialog, setSizeErrorDialog] = useState({
    open: false,
    message: "",
  });
  const [upload,setUploading]=useState(true)

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const remainingSpace = MAX_TOTAL_SIZE_BYTES - totalSize;
  const usedPercentage = (totalSize / MAX_TOTAL_SIZE_BYTES) * 100;

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("csv")) return "📊";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `"${file.name}" (${sizeMB.toFixed(1)} MB) exceeds the ${MAX_FILE_SIZE_MB} MB limit.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported file format.`;
    }
    if (totalSize + file.size > MAX_TOTAL_SIZE_BYTES) {
      return `Adding "${file.name}" would exceed the total ${MAX_FILE_SIZE_MB} MB limit.`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Show size error in dialog, other errors in toast
    const sizeErrors = errors.filter(error => error.includes("exceeds") || error.includes("would exceed"));
    const otherErrors = errors.filter(error => !error.includes("exceeds") && !error.includes("would exceed"));

    if (sizeErrors.length > 0) {
      setSizeErrorDialog({
        open: true,
        message: sizeErrors.join("\n")
      });
    }

    if (otherErrors.length > 0) {
      otherErrors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setFiles(prev => {
        const updatedFiles = [...prev, ...validFiles];
        // Remove duplicates based on name and size
        return updatedFiles.filter((file, index, self) =>
          index === self.findIndex(f => f.name === file.name && f.size === file.size)
        );
      });
      if (validFiles.length === 1) {
        toast.success(`Added ${validFiles[0].name}`);
      } else {
        toast.success(`Added ${validFiles.length} files`);
      }
    }
  }, [totalSize]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    // Reset input to allow selecting same files again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!botName.trim()) {
      toast.error("Please enter a chatbot name.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file.");
      return;
    }

    try {
      // Show popup / animation
      setUploading(true);

      // Build FormData for backend
      const formData = new FormData();
      formData.append("title", botName);
      formData.append("description", description);
      formData.append("no_of_files", files.length.toString());
      files.forEach((file, i) => {
        formData.append("file" + i, file);
      });
      console.log("came to submit function")

      toast.success(`Your bot "${botName}"is now being processed!`);
      // Send to your Fiber backend
        const response = await fetch("http://localhost:8080/user/createbot", {
      method: "POST",
      body:formData
    });

      console.log(response.body)
    } catch (err) {
      toast.error("Something went wrong while uploading files.");
      console.error(err);
    } finally {
      console.log()
      setUploading(false);
    }
  };


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your AI ChatBot
            </h1>
            <p className="text-gray-600">
              Configure your personal assistant with knowledge from your documents
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatBot Configuration
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Give your bot a personality and feed it with knowledge
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Bot Name */}
                <div className="space-y-3">
                  <Label htmlFor="botName" className="text-sm font-semibold text-gray-700">
                    ChatBot Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="botName"
                      placeholder="e.g. Support Assistant, Documentation Bot, HR Helper..."
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                      required
                    />
                    <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Description - Fixed textarea */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Personality & Instructions *
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      placeholder={`Describe your chatbot's role and how it should behave...

Example: 
"You are a friendly customer support assistant. Use the provided documentation to answer questions accurately. 
If you don't know the answer, politely suggest contacting the support team and offer helpful alternatives."`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl resize-y"
                      required
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {description.length} characters
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-700">
                      Training Documents
                    </Label>
                    <span className="text-sm text-gray-500">
                      {formatFileSize(totalSize)} / {MAX_FILE_SIZE_MB} MB used
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={usedPercentage} className="h-2 rounded-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatFileSize(totalSize)} used</span>
                      <span>{formatFileSize(remainingSpace)} remaining</span>
                    </div>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 scale-[1.02]"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${
                      isDragging ? "text-blue-500" : "text-gray-400"
                    }`} />
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">
                        Drop your files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports {ALLOWED_EXTENSIONS.join(", ")} files
                      </p>
                      <p className="text-xs text-gray-400">
                        Individual file size limit: {MAX_FILE_SIZE_MB} MB
                      </p>
                    </div>
                    <Input
                      type="file"
                      multiple
                      accept={ALLOWED_EXTENSIONS.join(",")}
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 rounded-lg"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Uploaded Files ({files.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={files.length === 0 || !botName.trim()}
                >
                  Create Your ChatBot
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Tips */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 Your bot will be ready to answer questions based on the documents you provide
            </p>
          </div>
        </div>
      </div>

      {/* Size Error Dialog */}
      <AlertDialog open={sizeErrorDialog.open} onOpenChange={(open) => setSizeErrorDialog(prev => ({...prev, open}))}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <AlertDialogTitle className="text-red-600">File Too Large</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-4">
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">
                  The following files exceed the size limit:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">
                    {sizeErrorDialog.message}
                  </pre>
                </div>
                <p className="text-sm text-gray-600">
                  Please choose files smaller than {MAX_FILE_SIZE_MB} MB each, or remove some files to free up space.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}