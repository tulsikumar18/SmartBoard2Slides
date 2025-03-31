import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Sparkles,
  Upload,
  FileText,
  Presentation,
} from "lucide-react";
import Header from "./layout/Header";
import UploadContainer from "./upload/UploadContainer";
import ProcessingDashboard from "./processing/ProcessingDashboard";
import ConversionControls from "./conversion/ConversionControls";
import Footer from "./layout/Footer";
import Logo from "./ui/logo";
import { logProcessingResult } from "@/lib/supabase";

const Home = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractionResults, setExtractionResults] = useState<any>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Track processing time
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handleProcessImage = async (file: File, filePath?: string) => {
    // Reset any previous errors
    setProcessingError(null);
    setUploadedFile(file);
    setImageUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setCurrentStep(2);
    setProcessingStartTime(Date.now());
    setStoragePath(filePath || null);
    setProcessingError(null);

    try {
      // Process the image using AI services
      const processImage = async () => {
        try {
          // Convert file to base64 for AI processing
          const fileReader = new FileReader();
          const imageBase64Promise = new Promise<string>((resolve, reject) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = reject;
          });
          fileReader.readAsDataURL(file);
          const imageBase64 = await imageBase64Promise;

          // Import AI processing functions
          const {
            extractTextWithTrOCR,
            detectDiagramsWithYOLO,
            parseEquations,
            preprocessImage,
            analyzeDocumentStructure,
          } = await import("../lib/ai");

          // Step 1: Preprocess the image with advanced CV techniques
          const { processedImage, error: preprocessError } =
            await preprocessImage(imageBase64);
          if (preprocessError) throw preprocessError;
          console.log("Image preprocessing complete");

          // Step 2: Extract text using Microsoft's TrOCR
          const {
            text,
            regions,
            confidence: textConfidence,
            error: textError,
          } = await extractTextWithTrOCR(processedImage);
          if (textError) throw textError;
          console.log(
            `Text extraction complete with ${regions.length} regions, confidence: ${textConfidence.toFixed(2)}`,
          );

          // Step 3: Detect diagrams using YOLOv8 and OpenCV
          const { diagrams, error: diagramError } =
            await detectDiagramsWithYOLO(processedImage);
          if (diagramError) throw diagramError;
          console.log(
            `Diagram detection complete, found ${diagrams.length} diagrams`,
          );

          // Step 4: Parse mathematical equations using MathPix-like technology
          const { equations, error: equationError } =
            await parseEquations(processedImage);
          if (equationError) throw equationError;
          console.log(
            `Equation parsing complete, found ${equations.length} equations`,
          );

          // Step 5: Analyze document structure using PubLayNet/Donut
          const { structure, confidence: structureConfidence } =
            await analyzeDocumentStructure(processedImage);
          console.log(
            `Document structure analysis complete, confidence: ${structureConfidence.toFixed(2)}`,
          );

          // Verify we have meaningful content before proceeding
          if (!text || text.trim().length === 0) {
            throw new Error(
              "No text could be extracted from the image. Please try a clearer image with visible text.",
            );
          }

          // Process extracted content through Claude AI to generate structured slides
          console.log(
            "Processing extracted content through Claude AI for better slide organization",
          );
          // In a real implementation, this would call Claude API to structure the content
          // For now, we'll simulate this processing step
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Combine all results into a comprehensive extraction result
          const results = {
            text,
            textRegions: regions,
            diagrams,
            equations,
            documentStructure: structure,
            sourceImage: imageBase64, // Include the source image for reference
            metadata: {
              textConfidence,
              structureConfidence,
              processingTime: processingStartTime
                ? Date.now() - processingStartTime
                : 0,
            },
          };
          setExtractionResults(results);
          setIsProcessing(false);

          // Log processing result to Supabase
          if (processingStartTime) {
            const processingTime = Date.now() - processingStartTime;
            await logProcessingResult({
              imageId: storagePath || file.name,
              processingTime,
              extractedTextLength: text.length,
              diagramCount: diagrams.length,
              status: "success",
            });
          }
        } catch (error) {
          console.error("Processing error:", error);
          setProcessingError(
            error instanceof Error
              ? error.message
              : "An error occurred during processing",
          );
          setIsProcessing(false);

          // Log error to Supabase
          if (processingStartTime) {
            const processingTime = Date.now() - processingStartTime;
            await logProcessingResult({
              imageId: storagePath || file.name,
              processingTime,
              extractedTextLength: 0,
              diagramCount: 0,
              status: "error",
              errorMessage:
                error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      };

      // Start processing with a slight delay to allow UI updates
      setTimeout(processImage, 500);
    } catch (error) {
      console.error("Processing setup error:", error);
      setProcessingError(
        error instanceof Error ? error.message : "Failed to start processing",
      );
      setIsProcessing(false);
    }
  };

  const handleContinueToConversion = (results: any) => {
    setExtractionResults(results);
    setCurrentStep(3);
  };

  const handleExport = async (format: "pptx" | "pdf") => {
    try {
      // Simulate export process
      alert(`Exporting as ${format.toUpperCase()}...`);
      // In a real implementation, this would trigger the actual export process
    } catch (error) {
      console.error("Export error:", error);
      alert(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setUploadedFile(null);
    setImageUrl(null);
    setIsProcessing(false);
    setExtractionResults(null);
    setCurrentStep(1);
    setProcessingError(null);
    setStoragePath(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-50 to-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="xl" withText={false} />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-ink2deck-dark to-secondary-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ink2Deck Converter
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Transform your whiteboard images into professional slide decks with
            AI-powered content extraction and organization.
          </motion.p>

          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0 bg-white p-4 md:p-3 rounded-xl shadow-md">
              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? "bg-gradient-to-r from-primary to-primary-600 text-white" : "bg-gray-200"} shadow-md`}
                >
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Upload</div>
              </div>

              <div className="hidden md:block w-8 h-1 rounded-full bg-gradient-to-r from-primary-200 to-primary-400"></div>

              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? "bg-gradient-to-r from-primary to-primary-600 text-white" : "bg-gray-200"} shadow-md`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Process</div>
              </div>

              <div className="hidden md:block w-8 h-1 rounded-full bg-gradient-to-r from-primary-200 to-primary-400"></div>

              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? "bg-gradient-to-r from-primary to-primary-600 text-white" : "bg-gray-200"} shadow-md`}
                >
                  <Presentation className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Convert</div>
              </div>
            </div>
          </motion.div>

          {currentStep === 1 && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
            </motion.div>
          )}
        </section>

        {currentStep === 1 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UploadContainer
              onProcessImage={handleProcessImage}
              isProcessing={isProcessing}
            />
          </motion.section>
        )}

        {currentStep === 2 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProcessingDashboard
              imageUrl={imageUrl || undefined}
              isProcessing={isProcessing}
              extractionResults={extractionResults}
              onCancelProcessing={handleReset}
              onRetryProcessing={() => {
                setIsProcessing(true);
                setProcessingStartTime(Date.now());
                // Simulate processing again
                setTimeout(() => setIsProcessing(false), 3000);
              }}
              onContinueToConversion={handleContinueToConversion}
              processingError={processingError}
            />
          </motion.section>
        )}

        {currentStep === 3 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ConversionControls
              extractedContent={extractionResults}
              onExport={handleExport}
            />
          </motion.section>
        )}

        <section className="mt-16 mb-8">
          <div className="bg-gradient-to-br from-white to-primary-50 rounded-xl p-8 shadow-md border border-primary-100">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-ink2deck-dark">
                Key Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-primary-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300 hover:border-primary-300">
                <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-ink2deck-dark">
                  Image Upload
                </h3>
                <p className="text-gray-600">
                  Drag-and-drop interface for easy whiteboard image uploads with
                  preview capabilities.
                </p>
              </div>

              <div className="p-6 border border-primary-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300 hover:border-primary-300">
                <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-ink2deck-dark">
                  AI-Powered Extraction
                </h3>
                <p className="text-gray-600">
                  Advanced OCR and diagram recognition to extract text and
                  visual elements.
                </p>
              </div>

              <div className="p-6 border border-primary-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300 hover:border-primary-300">
                <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Presentation className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-ink2deck-dark">
                  Customizable Slides
                </h3>
                <p className="text-gray-600">
                  Choose from various templates and customize the organization
                  of your slide content.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
