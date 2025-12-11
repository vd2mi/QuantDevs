"use strict";
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const parseXlsx = require("./helpers/parseXlsx");
const parseDocx = require("./helpers/parseDocx");
const { extractFinancialData } = require("./helpers/gptOneShot");
const computeFeatures = require("./helpers/computeFeatures");

const app = express();

// CORS configuration for production
// Allow all origins in production (HF Spaces) - Vercel domains vary
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production (HF Spaces)
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, 
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "QuantDevs financial analyzer backend running" });
});

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded. Please upload an .xlsx or .docx file." });
    }

    const ext = path.extname(req.file.originalname || "").toLowerCase();
    if (ext !== ".xlsx" && ext !== ".docx") {
      return res
        .status(400)
        .json({ error: "Unsupported file type. Only .xlsx and .docx are allowed." });
    }

    let parsedTransactions = [];
    let sampleText = "";
    let rawTextForGpt = "";

    try {
      if (ext === ".xlsx") {
        const { rows, rawText } = parseXlsx(req.file.buffer);
        parsedTransactions = rows;
        rawTextForGpt = rawText;
        console.log(`\n${"=".repeat(60)}`);
        console.log(`Parsed ${parsedTransactions.length} transactions from XLSX file`);
        console.log(`${"=".repeat(60)}\n`);
        if (parsedTransactions.length > 0) {
          console.log("Sample transaction:", JSON.stringify(parsedTransactions[0], null, 2));
        }
      } else if (ext === ".docx") {
        const { text } = await parseDocx(req.file.buffer);
        rawTextForGpt = text || "";
        console.log(`Extracted ${rawTextForGpt.length} characters from DOCX file`);
      }
    } catch (parseError) {
      console.error("\n" + "=".repeat(60));
      console.error("PARSE ERROR CAUGHT:");
      console.error("=".repeat(60));
      console.error("Error message:", parseError.message);
      console.error("Full error:", parseError);
      console.error("=".repeat(60) + "\n");
      
      const errorMessage = parseError.message || "Failed to parse document";
      return res.status(400).json({
        error: errorMessage.includes("No valid transactions") 
          ? "No valid transactions could be extracted from the document."
          : errorMessage,
        details: errorMessage // This should include column names from parseXlsx
      });
    }

    if (!rawTextForGpt || rawTextForGpt.trim().length === 0) {
      return res
        .status(400)
        .json({ 
          error: "Uploaded document appears to be empty or could not be parsed.",
          details: "Please ensure your file contains transaction data and is not corrupted."
        });
    }

    let transactions = parsedTransactions;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      const fileType = ext === ".xlsx" ? "Excel" : "Word";
      return res.status(400).json({ 
        error: "No valid transactions could be extracted from the document.",
        details: `The ${fileType} file was parsed but no transaction rows were found. Please ensure your bank statement contains transaction data.`
      });
    }

    // Compute features first
    const { features, score: baseScore } = computeFeatures(transactions);

    // Build summary stats for AI
    const bnplTransactions = transactions.filter(t => t.isBnpl || t.category === "bnpl");
    const bnplCount = bnplTransactions.length;
    const bnplAmount = bnplTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Get time range
    const dates = transactions.map(t => t.date).filter(d => d).sort();
    const timeRange = dates.length > 0 ? {
      start: dates[0],
      end: dates[dates.length - 1]
    } : null;

    const summaryStats = {
      totalTransactions: transactions.length,
      totalIncome: features.totalIncome,
      totalExpenses: features.totalSpent,
      savingsRatio: features.savingsRatio,
      bnplDepth: features.bnplDepth,
      incomeStability: features.incomeStability,
      spendingVolatility: features.spendingVolatility,
      ruleBasedScore: baseScore,
      bnplCount: bnplCount,
      bnplAmount: bnplAmount,
      bnplRatio: features.bnplDepth,
      timeRange: timeRange,
    };

    // Use rawText from parser (sample transactions)
    sampleText = rawTextForGpt || "";

    // Call GPT with computed features
    const { metadata, insights, explanation } = await extractFinancialData({
      sampleText,
      summaryStats: summaryStats,
    });

    // Extract AI expected score
    const aiExpectedScore = insights?.predictions?.expectedScore;
    
    // Score blending logic with proper type checking
    let finalScore = baseScore;
    let scoreSource = "rule_based";
    const diff = typeof aiExpectedScore === "number" && !isNaN(aiExpectedScore) 
      ? Math.abs(aiExpectedScore - baseScore) 
      : Infinity;
    
    if (aiExpectedScore && !isNaN(aiExpectedScore) && diff <= 80) {
      // Blend: 60% rule-based, 40% AI
      finalScore = Math.round((0.6 * baseScore + 0.4 * aiExpectedScore) / 10) * 10;
      finalScore = Math.max(300, Math.min(850, finalScore)); // Clamp
      scoreSource = "blended";
      
      console.log(`\n📊 Score Calculation:`);
      console.log(`  Rule-based score: ${baseScore}`);
      console.log(`  AI expected score: ${aiExpectedScore} (difference: ${diff})`);
      console.log(`  ✅ Using blended score: ${finalScore} (60% rule + 40% AI)\n`);
    } else {
      console.log(`\n📊 Score Calculation:`);
      console.log(`  Rule-based score: ${baseScore}`);
      if (aiExpectedScore) {
        console.log(`  AI expected score: ${aiExpectedScore} (difference: ${diff} > 80)`);
        console.log(`  ⚠️  Using rule-based score only\n`);
      } else {
        console.log(`  ⚠️  No AI score available, using rule-based score\n`);
      }
    }

    // Build AI summary
    const aiSummary = [
      explanation?.whyScoreChanged || "",
      ...(insights?.recommendations || []),
    ]
      .filter(Boolean)
      .join(" ") || "Financial analysis completed successfully.";

    // Return payload compatible with frontend
    const payload = {
      metadata: metadata || { accountType: "checking", currency: "SAR" },
      transactions: transactions.slice(0, 100), // Limit to first 100 for response size
      features: features,
      score: finalScore,
      baseScore: baseScore,
      aiExpectedScore: aiExpectedScore || null,
      scoreSource: scoreSource,
      insights: insights,
      explanation: explanation,
      aiSummary: aiSummary,
      summary: aiSummary, // Keep for backward compatibility
      ai: {
        metadata: metadata,
        recommendations: insights?.recommendations || [],
        explanation: explanation,
      },
      transactionsSample: transactions.slice(0, 10), // Small sample for debugging
    };

    res.json(payload);
  } catch (error) {
    console.error("Error in /analyze:", error);
    let errorMessage = "An unexpected error occurred while analyzing the document.";
    let errorDetails = "";

    if (error && error.message) {
      errorMessage = error.message;
      if (error.message.includes("Transaction table not found")) {
        errorDetails = "Your XLSX file may not be in the expected format. Try downloading the statement in English mode or ensure it contains a transaction table with headers.";
      } else if (error.message.includes("Could not find transaction header")) {
        errorDetails = "The parser could not locate the transaction table. Please ensure your statement includes columns for date, description, and amount/debit/credit.";
      } else if (error.message.includes("Failed to parse JSON")) {
        errorDetails = "The AI analysis failed. Please try again or contact support if the issue persists.";
      } else if (error.message.includes("OPENAI_API_KEY")) {
        errorDetails = "AI service is not configured. Please check your API key settings.";
      }
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails || "Please try uploading your file again or contact support.",
    });
  }
});

const port = process.env.PORT || 7860;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`API endpoint: http://localhost:${port}/analyze`);
});


