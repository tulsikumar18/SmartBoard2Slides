import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DragDropZoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected?: () => void;
  maxSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

const DragDropZone = ({
  onFileAccepted = () => {},
  onFileRejected = () => {},
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg"],
  className,
}: DragDropZoneProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejectionReasons = rejectedFiles[0].errors
          .map((err: any) => err.message)
          .join(", ");
        setError(`File rejected: ${rejectionReasons}`);
        onFileRejected();
        return;
      }

      if (acceptedFiles.length > 0) {
        setError(null);
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted, onFileRejected],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: acceptedFileTypes.reduce(
        (acc, type) => ({ ...acc, [type]: [] }),
        {},
      ),
      maxSize,
      multiple: false,
    });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-background",
          "min-h-[400px]",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          error && "border-destructive",
          !isDragActive &&
            !isDragReject &&
            !error &&
            "border-muted-foreground/30 hover:border-muted-foreground/50",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {isDragReject ? (
            <div className="text-destructive">
              <AlertCircle className="h-16 w-16 mb-2" />
              <p className="text-lg font-medium">File type not supported</p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "p-4 rounded-full bg-primary/10",
                  isDragActive && "bg-primary/20",
                )}
              >
                {isDragActive ? (
                  <Upload className="h-10 w-10 text-primary" />
                ) : (
                  <Image className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop your whiteboard image here"
                    : "Drag & drop your whiteboard image"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats:{" "}
                  {acceptedFileTypes
                    .map((type) => type.replace("image/", "").toUpperCase())
                    .join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum size: {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                Browse files
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DragDropZone;
