import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

// Always use mock client for this demo application
const useMockClient = true;

// These would be your actual Supabase credentials in production
// For demo purposes, we'll use placeholder values if env vars aren't set
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "mock-anon-key";

// Log info about Supabase configuration
console.log("Supabase configuration: Using mock client =", useMockClient);

// Create a mock client when credentials are missing or in development mode
const createSupabaseClient = () => {
  if (useMockClient || !supabaseUrl || !supabaseAnonKey) {
    // Return a mock client with the same interface but no-op functions
    return {
      storage: {
        from: () => ({
          upload: async () => ({
            data: null,
            error: new Error("Supabase credentials not configured"),
          }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          remove: async () => ({
            error: new Error("Supabase credentials not configured"),
          }),
        }),
      },
      from: () => ({
        insert: async () => ({
          error: new Error("Supabase credentials not configured"),
        }),
      }),
    } as unknown as ReturnType<typeof createClient<Database>>;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export async function uploadImage(
  file: File,
  path: string,
): Promise<{
  data: { path: string } | null;
  error: Error | null;
}> {
  try {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    // If using mock client, simulate successful upload
    if (useMockClient) {
      console.log("Using mock Supabase client - simulating upload");
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log("Mock upload successful, file path:", filePath);
      return { data: { path: filePath }, error: null };
    }

    // Real implementation for when Supabase is properly configured
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log("Attempting to upload to bucket: whiteboard-images");

    const { data, error } = await supabase.storage
      .from("whiteboard-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    console.log("Upload successful, file path:", filePath);
    return { data: { path: filePath }, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getImageUrl(path: string): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from("whiteboard-images")
      .getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting image URL:", error);
    return null;
  }
}

export async function deleteImage(
  path: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from("whiteboard-images")
      .remove([path]);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: error as Error };
  }
}

export async function logProcessingResult(data: {
  imageId: string;
  userId?: string;
  processingTime: number;
  extractedTextLength: number;
  diagramCount: number;
  status: "success" | "error";
  errorMessage?: string;
}): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from("processing_results").insert([data]);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error logging processing result:", error);
    return { error: error as Error };
  }
}
