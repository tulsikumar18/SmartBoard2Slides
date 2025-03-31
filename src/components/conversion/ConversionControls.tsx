import React, { useState, useEffect } from "react";
import {
  Download,
  Settings,
  FileType,
  Palette,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TemplateSelector from "./TemplateSelector";
import SlidePreview from "./SlidePreview";

interface ConversionControlsProps {
  extractedContent?: {
    text: string;
    diagrams: Array<{ id: string; type: string; data: any }>;
  };
  onExport?: (format: "pptx" | "pdf") => void;
}

const ConversionControls = ({
  extractedContent = {
    text: "Sample extracted text from whiteboard image. This will be organized into slides.",
    diagrams: [
      {
        id: "diag-1",
        type: "flowchart",
        data: {
          /* sample data */
        },
      },
      {
        id: "diag-2",
        type: "mindmap",
        data: {
          /* sample data */
        },
      },
    ],
  },
  onExport = () => {},
}: ConversionControlsProps) => {
  // Using AI-generated layouts instead of template selection
  const selectedTemplate = "ai-generated";
  const [exportFormat, setExportFormat] = useState<"pptx" | "pdf">("pptx");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    includeSourceImage: true,
    autoOrganizeContent: true,
    slideCount: "auto",
    theme: "light",
    accessibility: true,
    highContrast: false,
  });

  // Generated slides based on the extracted content
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);

  // Generate preview slides when content or relevant settings change
  useEffect(() => {
    if (extractedContent) {
      // Generate slides based on the extracted content structure
      const slides = generatePreviewSlides(extractedContent, selectedTemplate);
      setGeneratedSlides(slides);
    }
  }, [
    extractedContent,
    settings.includeSourceImage,
    settings.autoOrganizeContent,
    settings.slideCount,
  ]);

  // Generate preview slides from extracted content using AI processing
  const generatePreviewSlides = (content: any, template: string) => {
    // Only use actual extracted content, no placeholders
    if (!content || !content.text) {
      return [];
    }

    // Extract title from content if available
    const titleMatch = content.text?.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Whiteboard Conversion";

    // Start with title slide
    const slides = [
      {
        id: "slide-1",
        title: title,
        content: content.text?.split("\n").slice(0, 2).join("\n") || "",
        imageUrl: content.sourceImage || "",
      },
    ];

    // Extract sections from content
    const sections: { heading: string; content: string }[] = [];
    const sectionMatches = content.text?.match(/^##\s+(.+)[\s\S]*?(?=^##|$)/gm);

    if (sectionMatches) {
      sectionMatches.forEach((section: string) => {
        const headingMatch = section.match(/^##\s+(.+)$/m);
        const heading = headingMatch ? headingMatch[1] : "";
        const sectionContent = section.replace(/^##\s+.+$/m, "").trim();

        if (heading) {
          sections.push({
            heading,
            content: sectionContent,
          });
        }
      });
    }

    // Add slides for each major section
    sections.forEach((section) => {
      slides.push({
        id: `slide-${slides.length + 1}`,
        title: section.heading,
        content: section.content || "",
        imageUrl: "",
      });
    });

    // Add slides for diagrams
    if (content.diagrams && content.diagrams.length > 0) {
      content.diagrams.forEach((diagram: any) => {
        slides.push({
          id: `slide-${slides.length + 1}`,
          title:
            diagram.label ||
            `${diagram.type.charAt(0).toUpperCase() + diagram.type.slice(1)}`,
          content: diagram.description || "",
          imageUrl: diagram.imageData || "",
        });
      });
    } else if (settings.includeSourceImage && !content.diagrams?.length) {
      // If no diagrams were detected but we have a source image
      slides.push({
        id: `slide-${slides.length + 1}`,
        title: "Whiteboard Image",
        content: "No diagrams detected in the whiteboard image",
        imageUrl: content.sourceImage || "",
      });
    }

    // Add slides for equations if available
    if (content.equations && content.equations.length > 0) {
      content.equations.forEach((equation: any, index: number) => {
        slides.push({
          id: `slide-${slides.length + 1}`,
          title: equation.label || `Mathematical Equation ${index + 1}`,
          content: equation.latex || equation.text || "",
          imageUrl: equation.imageData || "",
        });
      });
    }

    // Add summary slide with key points
    const keyPoints = extractKeyPoints(content.text);
    slides.push({
      id: `slide-${slides.length + 1}`,
      title: "Summary",
      content: keyPoints.length > 0 ? keyPoints.join("\n• ") : "",
      imageUrl: "",
    });

    return slides;
  };

  // Helper function to extract key points from text content
  const extractKeyPoints = (text: string = "") => {
    // Look for bullet points, numbered lists, or sentences with keywords like "key", "important", etc.
    const bulletPoints = text.match(/^[•\-*]\s+(.+)$/gm) || [];
    const numberedPoints = text.match(/^\d+\.\s+(.+)$/gm) || [];

    // Extract important sentences containing key phrases
    const importantSentences = text
      .split(/[.!?]\s+/)
      .filter((sentence) =>
        /important|key|critical|essential|remember|note|summary/i.test(
          sentence,
        ),
      )
      .map((sentence) => sentence.trim() + ".");

    // Combine all points, remove duplicates, and limit to 5-7 points
    const allPoints = [
      ...bulletPoints,
      ...numberedPoints,
      ...importantSentences,
    ];
    const uniquePoints = Array.from(new Set(allPoints))
      .map((point) => point.replace(/^[•\-*\d\.]+\s+/, ""))
      .slice(0, 7);

    return uniquePoints.length > 0
      ? ["• " + uniquePoints[0], ...uniquePoints.slice(1)]
      : [];
  };

  const handleExport = async () => {
    // Reset previous export state
    setExportError(null);
    setExportUrl(null);

    // Check if we have content to export
    if (!extractedContent || !extractedContent.text) {
      setExportError(
        "No content available to export. Please ensure text was properly extracted.",
      );
      return;
    }

    // Validate content quality before proceeding
    if (extractedContent.text.trim().length < 10) {
      setExportError(
        "The extracted content is too short or low quality. Please try with a clearer image.",
      );
      return;
    }
    try {
      // Show loading state
      setIsExporting(true);

      // Import AI export functions
      const { generatePPTX, generatePDF } = await import("../../lib/ai");

      // Prepare slides data from generated preview slides
      const slidesData = generatedSlides.map((slide) => ({
        title: slide.title,
        content: slide.content,
        imageUrl: slide.imageUrl,
      }));

      // Generate the appropriate format
      let result;
      if (exportFormat === "pptx") {
        result = await generatePPTX({
          text: extractedContent.text,
          diagrams: extractedContent.diagrams,
          template: selectedTemplate,
          theme: settings.theme,
          slides: slidesData,
          accessibility: settings.accessibility,
          highContrast: settings.highContrast,
          includeSourceImage: settings.includeSourceImage,
        });
      } else {
        result = await generatePDF({
          text: extractedContent.text,
          diagrams: extractedContent.diagrams,
          template: selectedTemplate,
          theme: settings.theme,
          slides: slidesData,
          accessibility: settings.accessibility,
          highContrast: settings.highContrast,
          includeSourceImage: settings.includeSourceImage,
        });
      }

      // Handle result
      if (result.error) throw result.error;
      if (result.url) {
        // Trigger actual download using the blob data
        if (result.blob && result.filename) {
          const a = document.createElement("a");
          a.href = result.url;
          a.download = result.filename;
          // Set proper attributes for better download handling
          a.setAttribute(
            "type",
            exportFormat === "pptx"
              ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
              : "application/pdf",
          );
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Store in browser's IndexedDB for persistence (mock implementation)
          console.log(
            `Saving ${result.filename} to local storage for future access.`,
          );
          localStorage.setItem("lastExportedFile", result.filename);
          localStorage.setItem("lastExportedTime", new Date().toISOString());

          // In a real implementation, we would save to IndexedDB or another storage mechanism
          // For now, we'll just call the onExport callback
          onExport(exportFormat);
          setExportUrl(result.url);

          // Set a timeout to revoke the object URL to avoid memory leaks
          setTimeout(() => {
            URL.revokeObjectURL(result.url);
          }, 60000); // Revoke after 1 minute
        } else {
          // Fallback for older implementation
          onExport(exportFormat);
          setExportUrl(result.url);
        }
      }
    } catch (error) {
      console.error(`Error exporting as ${exportFormat}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Export failed";
      setExportError(
        `Failed to create ${exportFormat.toUpperCase()} file: ${errorMessage}. Please try again or use a different format.`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const updateSettings = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg shadow-sm">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Conversion Controls</h1>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className={isExporting ? "opacity-70 cursor-not-allowed" : ""}
          >
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview">
              <FileType className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Slide Generation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="include-source">
                        Include Source Image
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add the original whiteboard image to the first slide
                      </p>
                    </div>
                    <Switch
                      id="include-source"
                      checked={settings.includeSourceImage}
                      onCheckedChange={(checked) =>
                        updateSettings("includeSourceImage", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="auto-organize">
                        Auto-Organize Content
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically organize content into logical sections
                      </p>
                    </div>
                    <Switch
                      id="auto-organize"
                      checked={settings.autoOrganizeContent}
                      onCheckedChange={(checked) =>
                        updateSettings("autoOrganizeContent", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Slide Count</Label>
                    <RadioGroup
                      value={settings.slideCount}
                      onValueChange={(value) =>
                        updateSettings("slideCount", value)
                      }
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto">Auto (Recommended)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minimal" id="minimal" />
                        <Label htmlFor="minimal">Minimal (3-5 slides)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="detailed" id="detailed" />
                        <Label htmlFor="detailed">Detailed (8-12 slides)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="theme-select">Color Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => updateSettings("theme", value)}
                    >
                      <SelectTrigger id="theme-select">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="colorful">Colorful</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Accessibility</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="accessibility">WCAG Compliance</Label>
                        <p className="text-sm text-muted-foreground">
                          Ensure exports meet accessibility standards
                        </p>
                      </div>
                      <Switch
                        id="accessibility"
                        checked={settings.accessibility}
                        onCheckedChange={(checked) =>
                          updateSettings("accessibility", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="space-y-1">
                        <Label htmlFor="high-contrast">High Contrast</Label>
                        <p className="text-sm text-muted-foreground">
                          Use high contrast colors for better readability
                        </p>
                      </div>
                      <Switch
                        id="high-contrast"
                        checked={settings.highContrast}
                        onCheckedChange={(checked) =>
                          updateSettings("highContrast", checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select
                      value={exportFormat}
                      onValueChange={(value: "pptx" | "pdf") =>
                        setExportFormat(value)
                      }
                    >
                      <SelectTrigger id="export-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pptx">PowerPoint (PPTX)</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exportError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Export Error</AlertTitle>
                      <AlertDescription>{exportError}</AlertDescription>
                    </Alert>
                  )}

                  {exportUrl && (
                    <Alert variant="default" className="mt-4 bg-primary-50">
                      <AlertTitle>Export Ready</AlertTitle>
                      <AlertDescription>
                        Your {exportFormat.toUpperCase()} is ready for download.
                        <a
                          href={exportUrl}
                          className="block mt-2 text-primary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download {exportFormat.toUpperCase()}
                        </a>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SlidePreview slides={generatedSlides} onExport={handleExport} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConversionControls;
