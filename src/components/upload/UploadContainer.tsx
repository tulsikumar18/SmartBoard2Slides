import React, { useState, useCallback, useEffect } from "react";
import { ArrowRight, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import DragDropZone from "./DragDropZone";
import ImagePreview from "./ImagePreview";
import { uploadImage } from "@/lib/supabase";

interface UploadContainerProps {
  onProcessImage?: (file: File, storagePath?: string) => void;
  isProcessing?: boolean;
}

const UploadContainer = ({
  onProcessImage = () => {},
  isProcessing = false,
}: UploadContainerProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);

  useEffect(() => {
    // Reset error when tab changes
    setUploadError(null);
  }, [activeTab]);

  const handleFileAccepted = useCallback((file: File) => {
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setActiveTab("preview");
    setUploadError(null);
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setActiveTab("upload");
    setStoragePath(null);
    setUploadError(null);
  }, [previewUrl]);

  const handleReplaceImage = useCallback(() => {
    setActiveTab("upload");
  }, []);

  const handleProcessImage = useCallback(async () => {
    if (!uploadedFile) {
      setUploadError("No file selected for upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      console.log("Starting upload to Supabase...");
      // Upload to Supabase
      const { data, error } = await uploadImage(uploadedFile, "uploads");

      clearInterval(progressInterval);

      if (error) {
        console.error("Upload failed with error:", error);
        throw error;
      }

      if (!data || !data.path) {
        throw new Error("Upload succeeded but no file path was returned");
      }

      console.log("Upload successful, path:", data.path);
      setUploadProgress(100);
      setStoragePath(data.path);

      // Small delay to show 100% progress before proceeding
      setTimeout(() => {
        setIsUploading(false);
        onProcessImage(uploadedFile, data.path);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error
          ? `Failed to upload image: ${error.message}`
          : "Failed to upload image: Unknown error",
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [uploadedFile, onProcessImage]);

  return (
    <Card className="w-full max-w-[1200px] mx-auto bg-gradient-to-b from-white to-primary-50 shadow-lg border-primary-200 overflow-hidden">
      <CardHeader className="border-b border-primary-100 bg-gradient-to-r from-primary-50 to-white">
        <CardTitle className="text-2xl text-ink2deck-dark">
          Upload Whiteboard Image
        </CardTitle>
        <CardDescription>
          Upload your whiteboard image to convert it into a professional slide
          deck
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {uploadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-primary-100">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              disabled={!previewUrl}
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-0">
            <DragDropZone
              onFileAccepted={handleFileAccepted}
              maxSize={20 * 1024 * 1024} // 20MB
              acceptedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
              className="max-w-[800px] mx-auto"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            {previewUrl && uploadedFile && (
              <ImagePreview
                imageUrl={previewUrl}
                imageName={uploadedFile.name}
                onRemove={handleRemoveImage}
                onReplace={handleReplaceImage}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t border-primary-100 p-6 flex flex-col">
        {(isUploading || isProcessing) && (
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{isUploading ? "Uploading..." : "Processing..."}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-primary-100" />
          </div>
        )}

        <div className="flex justify-end w-full">
          <Button
            onClick={handleProcessImage}
            disabled={!uploadedFile || isProcessing || isUploading}
            className="flex items-center bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white shadow-md transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            {isProcessing || isUploading ? (
              <>
                <Upload className="mr-2 h-5 w-5 animate-pulse" />
                {isUploading ? "Uploading..." : "Processing..."}
              </>
            ) : (
              <>
                Process Image
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UploadContainer;
