import React, { useState } from "react";
import {
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ImagePreviewProps {
  imageUrl?: string;
  imageName?: string;
  onRemove?: () => void;
  onReplace?: () => void;
  annotations?: Array<{
    id: string;
    label: string;
    confidence: number;
    bbox?: [number, number, number, number]; // [x, y, width, height]
  }>;
}

const ImagePreview = ({
  imageUrl = "https://images.unsplash.com/photo-1577460551100-907fc3d13dae?w=800&q=80",
  imageName = "whiteboard-image.jpg",
  onRemove = () => console.log("Remove image"),
  onReplace = () => console.log("Replace image"),
  annotations = [],
}: ImagePreviewProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-primary-100">
      <div className="p-4 bg-gradient-to-r from-primary-50 to-white border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium text-ink2deck-dark truncate max-w-[400px]">
            {imageName}
          </span>
          <Badge
            variant="outline"
            className="ml-2 bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-200"
          >
            {imageName.split(".").pop()?.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            title="Zoom out"
            className="text-primary-700 hover:text-primary-900 hover:bg-primary-100"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded-md">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
            title="Zoom in"
            className="text-primary-700 hover:text-primary-900 hover:bg-primary-100"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-auto h-[350px] flex items-center justify-center bg-gray-100">
        {imageUrl ? (
          <div
            className="relative transition-transform duration-200 ease-in-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={imageUrl}
              alt="Whiteboard preview"
              className="max-w-full object-contain"
            />

            {showAnnotations &&
              annotations.map(
                (annotation) =>
                  annotation.bbox && (
                    <div
                      key={annotation.id}
                      className="absolute border-2 border-primary-500 bg-primary-500/10 flex items-end justify-start"
                      style={{
                        left: `${annotation.bbox[0]}%`,
                        top: `${annotation.bbox[1]}%`,
                        width: `${annotation.bbox[2]}%`,
                        height: `${annotation.bbox[3]}%`,
                      }}
                    >
                      <Badge className="m-1 bg-primary-500 text-white text-xs">
                        {annotation.label} (
                        {Math.round(annotation.confidence * 100)}%)
                      </Badge>
                    </div>
                  ),
              )}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p>No image to preview</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gradient-to-r from-primary-50 to-white border-t border-primary-100 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReplace}
            className="flex items-center border-primary-300 text-primary-700 hover:bg-primary-100 hover:text-primary-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Replace
          </Button>

          {annotations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={cn(
                "flex items-center border-primary-300 hover:bg-primary-100",
                showAnnotations
                  ? "bg-primary-100 text-primary-900"
                  : "text-primary-700",
              )}
            >
              {showAnnotations ? "Hide Annotations" : "Show Annotations"}
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center border-primary-300 text-primary-700 hover:bg-primary-100 hover:text-primary-900"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-black/90 p-4">
                <img
                  src={imageUrl}
                  alt="Whiteboard fullscreen"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center border-primary-300 text-primary-700 hover:bg-primary-100 hover:text-primary-900"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
