// Gemini API integration for image processing and OCR

const GEMINI_API_KEY = "AIzaSyDb2WorLK8NeXhV1e_41EPnSVB3Eb5Lk4c";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Process an image with Gemini API for OCR and content extraction
 */
export async function processImageWithGemini(imageBase64: string): Promise<{
  text: string;
  diagrams: any[];
  error: Error | null;
}> {
  try {
    console.log("Processing image with Gemini API...");

    // Check if imageBase64 is defined before trying to use it
    if (!imageBase64) {
      throw new Error("Image data is undefined or empty");
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Prepare the request to Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Extract all text from this whiteboard image. Identify any diagrams, charts, or visual elements. Preserve the structure with proper markdown formatting.",
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // For now, we'll return the extracted text and mock diagrams
    // In a real implementation, we would parse the Gemini response to extract actual diagram data
    return {
      text: extractedText,
      diagrams: mockDiagrams(),
      error: null,
    };
  } catch (error) {
    console.error("Error processing image with Gemini API:", error);
    return {
      text: "",
      diagrams: [],
      error: error as Error,
    };
  }
}

/**
 * Enhance image quality for better OCR using Gemini's capabilities
 */
export async function enhanceImageWithGemini(imageBase64: string): Promise<{
  enhancedImage: string;
  processedImage: string;
  error: Error | null;
}> {
  try {
    console.log("Enhancing image with Gemini API...");

    // Check if imageBase64 is defined before trying to use it
    if (!imageBase64) {
      throw new Error("Image data is undefined or empty");
    }

    // In a real implementation, we would use Gemini to enhance the image
    // For now, we'll just return the original image
    return {
      enhancedImage: imageBase64,
      processedImage: imageBase64,
      error: null,
    };
  } catch (error) {
    console.error("Error enhancing image with Gemini API:", error);
    return {
      enhancedImage: imageBase64,
      processedImage: imageBase64,
      error: error as Error,
    };
  }
}

// Helper function to generate mock diagrams
function mockDiagrams() {
  return [
    {
      id: "extracted-element-1",
      type: "text-block",
      coordinates: [
        { x: 120, y: 150 },
        { x: 450, y: 400 },
      ],
      label: "Extracted Text Block",
      confidence: 0.96,
      vectorized: true,
      data: {
        text: "Extracted text from the whiteboard",
        style: {
          backgroundColor: "#f5f5f5",
          textColor: "#333333",
          fontFamily: "Arial",
        },
      },
      imageData:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    },
    {
      id: "extracted-element-2",
      type: "image-region",
      coordinates: [
        { x: 500, y: 150 },
        { x: 700, y: 350 },
      ],
      label: "Extracted Image Region",
      confidence: 0.98,
      vectorized: false,
      data: {
        description: "Visual element extracted from the whiteboard",
      },
      imageData:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    },
  ];
}
