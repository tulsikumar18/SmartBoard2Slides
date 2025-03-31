import React from "react";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, AlertCircle } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface ProgressIndicatorProps {
  steps?: ProcessingStep[];
  currentStep?: number;
  progress?: number;
  error?: string | null;
}

const ProgressIndicator = ({
  steps = [
    { id: "upload", label: "Upload", status: "completed" },
    { id: "ocr", label: "OCR Text Recognition", status: "in-progress" },
    { id: "diagram", label: "Diagram Recognition", status: "pending" },
    { id: "extraction", label: "Content Extraction", status: "pending" },
  ],
  currentStep = 1,
  progress = 45,
  error = null,
}: ProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Processing Status</h3>
        <Progress value={progress} className="h-2 w-full" />
        <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-md ${isActive ? "bg-blue-50 border border-blue-100" : ""}`}
            >
              <div className="mr-3">
                {step.status === "completed" ? (
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Check className="h-5 w-5" />
                  </div>
                ) : step.status === "in-progress" ? (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
                    <Clock className="h-5 w-5" />
                  </div>
                ) : step.status === "error" ? (
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-medium ${isActive ? "text-blue-700" : isPast ? "text-gray-700" : "text-gray-500"}`}
                >
                  {step.label}
                </h4>
                <p className="text-sm text-gray-500">
                  {step.status === "completed"
                    ? "Completed"
                    : step.status === "in-progress"
                      ? "In progress..."
                      : step.status === "error"
                        ? "Error occurred"
                        : "Waiting to start"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
