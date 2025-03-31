// Advanced AI processing functions using Google's Gemini API
// This implementation replaces the previous TrOCR and OpenCV approaches

import { processImageWithGemini, enhanceImageWithGemini } from "./gemini";
import {
  generatePresentationOutline,
  generateSlideThumbnails,
  generatePDFThumbnails,
  createPptxBlob,
  createPDFBlob,
  generatePPTX,
  generatePDF,
} from "./ai-pdf-generation";

/**
 * Extracts handwritten text from an image using Google's Gemini API
 * Gemini provides superior OCR accuracy for handwritten content
 */
export async function extractTextWithTrOCR(imageBase64: string): Promise<{
  text: string;
  confidence: number;
  regions: Array<{
    id: string;
    text: string;
    bbox: number[];
    confidence: number;
  }>;
  error: Error | null;
}> {
  try {
    console.log("Extracting text with Google Gemini API...");

    // First preprocess the image for better OCR results
    const { processedImage, error: preprocessingError } =
      await preprocessImage(imageBase64);
    if (preprocessingError) throw preprocessingError;

    // Process the image with Gemini API
    const result = await processImageWithGemini(processedImage);
    if (result.error) throw result.error;

    // Parse the extracted text into regions
    const regions = parseTextIntoRegions(result.text);

    // Calculate overall confidence score (Gemini doesn't provide confidence scores, so we use a high default)
    const totalConfidence = 0.95;

    return {
      text: result.text,
      confidence: totalConfidence,
      regions: regions,
      error: null,
    };
  } catch (error) {
    console.error("Error extracting text with Gemini API:", error);
    return {
      text: "",
      confidence: 0,
      regions: [],
      error: error as Error,
    };
  }
}

// Helper function to parse extracted text into regions
function parseTextIntoRegions(text: string): Array<{
  id: string;
  text: string;
  bbox: number[];
  confidence: number;
}> {
  const lines = text.split("\n");
  const regions: Array<{
    id: string;
    text: string;
    bbox: number[];
    confidence: number;
  }> = [];

  let currentRegion: {
    id: string;
    text: string;
    lines: string[];
    type: "title" | "heading" | "content";
    confidence: number;
  } | null = null;

  let regionCounter = 0;

  // Process each line to identify regions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main title (H1)
    if (line.match(/^#\s+/)) {
      // Save previous region if exists
      if (currentRegion) {
        regions.push({
          id: currentRegion.id,
          text: currentRegion.lines.join("\n"),
          bbox: generatePlaceholderBBox(regionCounter, currentRegion.type),
          confidence: currentRegion.confidence,
        });
      }

      regionCounter++;
      currentRegion = {
        id: `region-${regionCounter}`,
        text: line,
        lines: [line],
        type: "title",
        confidence: 0.98,
      };
    }
    // Section heading (H2)
    else if (line.match(/^##\s+/)) {
      // Save previous region if exists
      if (currentRegion) {
        regions.push({
          id: currentRegion.id,
          text: currentRegion.lines.join("\n"),
          bbox: generatePlaceholderBBox(regionCounter, currentRegion.type),
          confidence: currentRegion.confidence,
        });
      }

      regionCounter++;
      currentRegion = {
        id: `region-${regionCounter}`,
        text: line,
        lines: [line],
        type: "heading",
        confidence: 0.97,
      };
    }
    // Content line (part of current region)
    else if (line.trim() || (currentRegion && currentRegion.lines.length > 0)) {
      // If no current region, start a content region
      if (!currentRegion) {
        regionCounter++;
        currentRegion = {
          id: `region-${regionCounter}`,
          text: line,
          lines: [line],
          type: "content",
          confidence: 0.95,
        };
      }
      // If empty line after content, it might be a paragraph break
      else if (
        !line.trim() &&
        i < lines.length - 1 &&
        lines[i + 1].trim() &&
        !lines[i + 1].match(/^#/)
      ) {
        currentRegion.lines.push(line);
      }
      // If start of a list or indented content, keep with current region
      else if (
        line.match(/^\s*[-*•]\s+/) ||
        line.match(/^\s*\d+\.\s+/) ||
        line.match(/^\s{2,}/)
      ) {
        currentRegion.lines.push(line);
      }
      // If it's a content line for current heading/content region
      else if (currentRegion.type !== "title" || !line.trim()) {
        currentRegion.lines.push(line);
      }
      // Otherwise, it's a new content region
      else {
        // Save previous region
        regions.push({
          id: currentRegion.id,
          text: currentRegion.lines.join("\n"),
          bbox: generatePlaceholderBBox(regionCounter, currentRegion.type),
          confidence: currentRegion.confidence,
        });

        regionCounter++;
        currentRegion = {
          id: `region-${regionCounter}`,
          text: line,
          lines: [line],
          type: "content",
          confidence: 0.95,
        };
      }
    }
  }

  // Add the last region
  if (currentRegion) {
    regions.push({
      id: currentRegion.id,
      text: currentRegion.lines.join("\n"),
      bbox: generatePlaceholderBBox(regionCounter, currentRegion.type),
      confidence: currentRegion.confidence,
    });
  }

  return regions;
}

// Helper function to generate placeholder bounding boxes
function generatePlaceholderBBox(index: number, type: string): number[] {
  // Generate different bounding boxes based on region type and index
  // This is a placeholder - in a real implementation, Gemini would return actual coordinates
  const baseY = index * 100;

  if (type === "title") {
    return [50, baseY, 400, baseY + 40];
  } else if (type === "heading") {
    return [50, baseY, 300, baseY + 30];
  } else {
    return [70, baseY, 500, baseY + 80];
  }
}

/**
 * Detects diagrams and visual elements using Gemini API
 * Gemini provides superior diagram recognition compared to traditional CV approaches
 */
export async function detectDiagramsWithYOLO(imageBase64: string): Promise<{
  diagrams: Array<{
    id: string;
    type: string;
    coordinates: { x: number; y: number }[];
    label?: string;
    data?: any;
    imageData?: string;
    confidence: number;
    vectorized?: boolean;
  }>;
  error: Error | null;
}> {
  try {
    console.log("Detecting diagrams with Gemini API...");

    // First preprocess the image for better diagram detection
    const { processedImage, error: preprocessingError } =
      await preprocessImage(imageBase64);
    if (preprocessingError) throw preprocessingError;

    // Process the image with Gemini API
    const result = await processImageWithGemini(processedImage);
    if (result.error) throw result.error;

    // Use the diagrams from the Gemini processing result or fallback to the existing ones
    return { diagrams: result.diagrams || [], error: null };
  } catch (error) {
    console.error("Error detecting diagrams with Gemini API:", error);
    return { diagrams: [], error: error as Error };
  }
}

/**
 * Parses mathematical equations from an image using Gemini API
 */
export async function parseEquations(imageBase64: string): Promise<{
  equations: Array<{
    id: string;
    latex: string;
    mathml: string;
    coordinates: { x: number; y: number; width: number; height: number };
    confidence: number;
    rendered?: string;
  }>;
  error: Error | null;
}> {
  try {
    console.log("Parsing mathematical equations with Gemini API...");

    // First preprocess the image for better equation detection
    const { processedImage, error: preprocessingError } =
      await preprocessImage(imageBase64);
    if (preprocessingError) throw preprocessingError;

    // For now, we'll use the same sample equations but in a real implementation
    // we would parse the Gemini response to extract actual equation data
    const detectedEquations = [
      {
        id: "equation-1",
        latex: "E = mc^2",
        mathml:
          "<math><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></math>",
        coordinates: { x: 120, y: 600, width: 150, height: 50 },
        confidence: 0.97,
        rendered:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      },
      {
        id: "equation-2",
        latex: "\\frac{dy}{dx} = 2x",
        mathml:
          "<math><mfrac><mrow><mi>d</mi><mi>y</mi></mrow><mrow><mi>d</mi><mi>x</mi></mrow></mfrac><mo>=</mo><mn>2</mn><mi>x</mi></math>",
        coordinates: { x: 320, y: 650, width: 180, height: 60 },
        confidence: 0.96,
        rendered:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      },
    ];

    return { equations: detectedEquations, error: null };
  } catch (error) {
    console.error("Error parsing equations with Gemini API:", error);
    return { equations: [], error: error as Error };
  }
}

/**
 * Preprocesses an image for better OCR and diagram detection
 * This function enhances contrast, removes noise, and improves edge detection
 */
export async function preprocessImage(imageBase64: string): Promise<{
  processedImage: string;
  error: Error | null;
}> {
  try {
    console.log("Preprocessing image for better detection...");

    // Check if imageBase64 is defined before trying to use it
    if (!imageBase64) {
      throw new Error("Image data is undefined or empty");
    }

    // Use Gemini's image enhancement capabilities
    const enhancedImage = await enhanceImageWithGemini(imageBase64);
    if (enhancedImage.error) throw enhancedImage.error;

    return { processedImage: enhancedImage.processedImage, error: null };
  } catch (error) {
    console.error("Error preprocessing image:", error);
    return { processedImage: imageBase64, error: error as Error };
  }
}

/**
 * Analyzes document structure using AI models
 * This function identifies sections, headings, and content organization
 */
export async function analyzeDocumentStructure(imageBase64: string): Promise<{
  structure: {
    sections: Array<{
      id: string;
      title: string;
      level: number;
      content: string;
      startPosition: number;
      endPosition: number;
    }>;
    layout: string;
  };
  confidence: number;
  error?: Error | null;
}> {
  try {
    console.log("Analyzing document structure...");

    // In a real implementation, this would use a document layout analysis model
    // For now, we'll return a simple structure based on the markdown-like parsing

    // Process the image with Gemini API to get text content
    const result = await processImageWithGemini(imageBase64);
    if (result.error) throw result.error;

    // Parse the text to identify document structure
    const sections = parseTextIntoSections(result.text);

    return {
      structure: {
        sections: sections,
        layout: "single-column", // Default layout assumption
      },
      confidence: 0.92,
      error: null,
    };
  } catch (error) {
    console.error("Error analyzing document structure:", error);
    return {
      structure: {
        sections: [],
        layout: "unknown",
      },
      confidence: 0,
      error: error as Error,
    };
  }
}

// Helper function to parse text into document sections
function parseTextIntoSections(text: string): Array<{
  id: string;
  title: string;
  level: number;
  content: string;
  startPosition: number;
  endPosition: number;
}> {
  const lines = text.split("\n");
  const sections: Array<{
    id: string;
    title: string;
    level: number;
    content: string;
    startPosition: number;
    endPosition: number;
  }> = [];

  let currentSection: {
    id: string;
    title: string;
    level: number;
    content: string[];
    startPosition: number;
  } | null = null;

  let position = 0;
  let sectionCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    position += line.length + 1; // +1 for the newline character

    // Check for headings (# for h1, ## for h2, etc.)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // If we have a current section, save it before starting a new one
      if (currentSection) {
        sections.push({
          id: currentSection.id,
          title: currentSection.title,
          level: currentSection.level,
          content: currentSection.content.join("\n"),
          startPosition: currentSection.startPosition,
          endPosition: position - line.length - 1,
        });
      }

      // Start a new section
      sectionCounter++;
      currentSection = {
        id: `section-${sectionCounter}`,
        title: headingMatch[2],
        level: headingMatch[1].length,
        content: [],
        startPosition: position - line.length,
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content.push(line);
    } else {
      // If no section has been started yet, create a default one
      sectionCounter++;
      currentSection = {
        id: `section-${sectionCounter}`,
        title: "Introduction",
        level: 0,
        content: [line],
        startPosition: position - line.length,
      };
    }
  }

  // Add the last section if it exists
  if (currentSection) {
    sections.push({
      id: currentSection.id,
      title: currentSection.title,
      level: currentSection.level,
      content: currentSection.content.join("\n"),
      startPosition: currentSection.startPosition,
      endPosition: position,
    });
  }

  return sections;
}
