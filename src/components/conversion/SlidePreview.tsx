import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SlidePreviewProps {
  slides?: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
  }>;
  onExport?: () => void;
}

const SlidePreview = ({
  slides = [
    {
      id: "slide-1",
      title: "Introduction",
      content: "Smart Board to Slide Deck Converter",
      imageUrl:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    },
    {
      id: "slide-2",
      title: "Key Features",
      content:
        "OCR Text Recognition, Diagram Extraction, Template Customization",
      imageUrl:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    },
    {
      id: "slide-3",
      title: "How It Works",
      content:
        "Upload whiteboard image → Process content → Generate slides → Export",
      imageUrl:
        "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&q=80",
    },
  ],
  onExport = () => console.log("Export slides"),
}: SlidePreviewProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${fullscreen ? "fixed inset-0 z-50" : "relative"}`}
    >
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Slide Preview</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={`relative ${fullscreen ? "h-[calc(100vh-8rem)]" : "h-[450px]"}`}
      >
        <Carousel
          className="w-full h-full"
          onSelect={(api) => {
            if (api) {
              setCurrentSlide(api.selectedScrollSnap());
            }
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="h-full flex flex-col p-6 bg-white">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {slide.title}
                    </h2>
                  </div>

                  {slide.imageUrl && (
                    <div className="flex-1 flex items-center justify-center mb-6 overflow-hidden">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    </div>
                  )}

                  <div className="text-center text-lg text-gray-700">
                    <p>{slide.content}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? "bg-primary" : "bg-gray-300"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <CarouselPrevious className="-left-3 bg-white" />
          <CarouselNext className="-right-3 bg-white" />
        </Carousel>
      </div>

      <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Slide {currentSlide + 1} of {slides.length}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
            }
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlidePreview;
