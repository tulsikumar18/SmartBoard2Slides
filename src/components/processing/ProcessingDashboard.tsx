import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import ProgressIndicator from "./ProgressIndicator";
import ExtractionResults from "./ExtractionResults";

interface ProcessingDashboardProps {
  imageUrl?: string;
  processingStatus?: {
    currentStep: number;
    progress: number;
    steps: Array<{
      id: string;
      label: string;
      status: "pending" | "in-progress" | "completed" | "error";
    }>;
    error: string | null;
  };
  extractionResults?: {
    text: string;
    diagrams: Array<{
      id: string;
      type: string;
      coordinates: { x: number; y: number }[];
      label?: string;
    }>;
  };
  onCancelProcessing?: () => void;
  onRetryProcessing?: () => void;
  onContinueToConversion?: (results: any) => void;
  isProcessing?: boolean;
  processingError?: string | null;
}

const ProcessingDashboard = ({
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  processingStatus = {
    currentStep: 1,
    progress: 45,
    steps: [
      { id: "upload", label: "Upload", status: "completed" },
      { id: "ocr", label: "OCR Text Recognition", status: "in-progress" },
      { id: "diagram", label: "Diagram Recognition", status: "pending" },
      { id: "extraction", label: "Content Extraction", status: "pending" },
    ],
    error: null,
  },
  extractionResults = {
    text: "# Meeting Notes\n\n## Action Items\n- Research competitor pricing\n- Schedule follow-up meeting\n- Prepare Q3 forecast\n\n## Key Decisions\n1. Launch new product in October\n2. Increase marketing budget by 15%\n3. Hire two additional developers",
    diagrams: [
      {
        id: "diagram-1",
        type: "flowchart",
        coordinates: [
          { x: 10, y: 10 },
          { x: 100, y: 100 },
          { x: 200, y: 50 },
        ],
        label: "User Flow Diagram",
      },
      {
        id: "diagram-2",
        type: "box",
        coordinates: [
          { x: 300, y: 200 },
          { x: 400, y: 300 },
        ],
        label: "Revenue Model",
      },
    ],
  },
  onCancelProcessing = () => {},
  onRetryProcessing = () => {},
  onContinueToConversion = () => {},
  isProcessing = true,
  processingError = null,
}: ProcessingDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("progress");
  const [modifiedResults, setModifiedResults] = useState(extractionResults);
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Update modified results when extraction results change
  useEffect(() => {
    if (extractionResults) {
      setModifiedResults(extractionResults);
    }
  }, [extractionResults]);

  // Simulate processing time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1000);
    } else if (!isProcessing && processingTime > 0) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, processingTime]);

  const handleSaveChanges = (data: any) => {
    setModifiedResults(data);
    // Save to localStorage for persistence between sessions
    try {
      localStorage.setItem("extractionResults", JSON.stringify(data));
      console.log("Extraction results saved to local storage");
    } catch (error) {
      console.error("Error saving extraction results to local storage:", error);
    }
  };

  // Load saved results from localStorage on component mount
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem("extractionResults");
      if (savedResults && !extractionResults) {
        const parsedResults = JSON.parse(savedResults);
        setModifiedResults(parsedResults);
        console.log("Loaded saved extraction results from local storage");
      }
    } catch (error) {
      console.error("Error loading saved extraction results:", error);
    }
  }, []);

  // Calculate status based on processing state and results
  const isProcessingComplete =
    !isProcessing && extractionResults && !processingError;
  const hasError = !!processingError;

  // Auto-switch to results tab when processing completes
  useEffect(() => {
    if (isProcessingComplete && activeTab === "progress") {
      setActiveTab("results");
    }
  }, [isProcessingComplete, activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto bg-background p-4 rounded-lg shadow-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Processing Dashboard</h2>
            <p className="text-muted-foreground">
              {isProcessing
                ? "Extracting content from your whiteboard image..."
                : isProcessingComplete
                  ? "Content extraction complete!"
                  : hasError
                    ? "Error during processing"
                    : "Ready to process"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {Math.floor(processingTime / 60)}:
                  {(processingTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
            <TabsList>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={!extractionResults || isProcessing}
              >
                Results
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="progress" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : isProcessingComplete ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Complete
                  </>
                ) : hasError ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Error
                  </>
                ) : (
                  "Ready"
                )}
              </CardTitle>
              <CardDescription>
                {isProcessing
                  ? `Step ${processingStatus.currentStep} of ${processingStatus.steps.length}: ${processingStatus.steps[processingStatus.currentStep - 1]?.label}`
                  : hasError
                    ? "An error occurred during processing"
                    : "View the progress of your image processing"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing Error</AlertTitle>
                  <AlertDescription>
                    {processingError}
                    {processingError && (
                      <div className="mt-2">
                        <p className="font-medium">Suggestions:</p>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          <li>Use an image with clearer handwriting</li>
                          <li>Ensure good lighting in the photo</li>
                          <li>Avoid glare on the whiteboard</li>
                          <li>
                            Try cropping the image to focus on the content
                          </li>
                          <li>Make sure text is large enough to be readable</li>
                          <li>
                            Use high contrast colors (dark text on light
                            background)
                          </li>
                          <li>Avoid using very thin markers or pencils</li>
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Overall Progress ({processingStatus.progress}%)
                    </span>
                  </div>
                  <ProgressIndicator
                    value={processingStatus.progress}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  {processingStatus.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full h-6 w-6 flex items-center justify-center ${
                            step.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : step.status === "in-progress"
                                ? "bg-blue-100 text-blue-600"
                                : step.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : step.status === "in-progress" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : step.status === "error" ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={`${step.status === "in-progress" ? "font-medium" : ""}`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <Badge
                        variant={
                          step.status === "completed"
                            ? "success"
                            : step.status === "in-progress"
                              ? "default"
                              : step.status === "error"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {step.status === "completed"
                          ? "Completed"
                          : step.status === "in-progress"
                            ? "In Progress"
                            : step.status === "error"
                              ? "Error"
                              : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {imageUrl && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Source Image</h3>
                  <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                    <img
                      src={imageUrl}
                      alt="Whiteboard"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={onCancelProcessing}
                disabled={!isProcessing}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {hasError && (
                  <Button onClick={onRetryProcessing} variant="secondary">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
                {isProcessingComplete && (
                  <Button
                    onClick={() => onContinueToConversion(modifiedResults)}
                  >
                    Continue to Conversion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Extraction Results</CardTitle>
              <CardDescription>
                Review and edit the content extracted from your whiteboard image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExtractionResults
                results={modifiedResults}
                onSaveChanges={handleSaveChanges}
                isLoading={isProcessing}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => onContinueToConversion(modifiedResults)}>
                Continue to Conversion
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessingDashboard;
