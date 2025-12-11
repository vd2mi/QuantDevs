/**
 * Analyzes a financial document and returns analysis results
 * @param {File} file - The file to analyze
 * @returns {Promise<Object>} Analysis results with features, score, and summary
 */
export async function analyzeDocument(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Create FormData to send the file
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        errorData = { error: text || "Analysis failed", details: "" };
      }
      const error = new Error(errorData.error || errorData.message || "Analysis failed");
      error.details = errorData.details || errorData.message || "";
      console.error("Backend error response:", JSON.stringify(errorData, null, 2));
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      throw error;
    }

    const results = await response.json();
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to analyze document. Please try again.");
  }
}

