import { NextResponse } from "next/server";

// Use environment variable for backend URL (set in Vercel)
// Falls back to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:7860";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided", details: "Please upload a file to analyze." },
        { status: 400 }
      );
    }

    // Forward the request to the backend Express server
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const backendResponse = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = await backendResponse.json();
      } catch {
        const text = await backendResponse.text();
        errorData = { error: text || "Backend analysis failed", details: "" };
      }
      
      console.error("Backend error response:", errorData);
      
      return NextResponse.json(
        {
          message: errorData.error || errorData.message || "Backend analysis failed",
          details: errorData.details || errorData.error || `Backend returned ${backendResponse.status}`,
        },
        { status: backendResponse.status || 500 }
      );
    }

    const backendData = await backendResponse.json();

    // Transform backend response to match frontend expectations
    // Backend returns: { metadata, transactions, features, score, insights, explanation, aiSummary, summary }
    // Frontend expects: { features, score, summary }
    
    // Transform features to match frontend format
    const backendFeatures = backendData.features || {};
    
    // Merge spotii into other for BNPL breakdown
    const bnplBreakdown = {
      tabby: backendFeatures.bnplBreakdown?.tabby || 0,
      tamara: backendFeatures.bnplBreakdown?.tamara || 0,
      cashew: backendFeatures.bnplBreakdown?.cashew || 0,
      other: (backendFeatures.bnplBreakdown?.other || 0) + (backendFeatures.bnplBreakdown?.spotii || 0),
    };

    // Merge spotii into other for remaining installments
    const bnplRemainingInstallments = {
      tabby: backendFeatures.bnplRemainingInstallments?.tabby || 0,
      tamara: backendFeatures.bnplRemainingInstallments?.tamara || 0,
      cashew: backendFeatures.bnplRemainingInstallments?.cashew || 0,
      other: (backendFeatures.bnplRemainingInstallments?.other || 0) + (backendFeatures.bnplRemainingInstallments?.spotii || 0),
    };

    // Merge spotii into other for monthly payments
    const estimatedMonthlyBnplPayment = {
      tabby: backendFeatures.estimatedMonthlyBnplPayment?.tabby || 0,
      tamara: backendFeatures.estimatedMonthlyBnplPayment?.tamara || 0,
      cashew: backendFeatures.estimatedMonthlyBnplPayment?.cashew || 0,
      other: (backendFeatures.estimatedMonthlyBnplPayment?.other || 0) + (backendFeatures.estimatedMonthlyBnplPayment?.spotii || 0),
    };

    // Transform month format from "YYYY-MM" to "Month YYYY" if needed
    const formatMonth = (monthKey) => {
      if (!monthKey || monthKey === "unknown") return monthKey;
      if (monthKey.includes(" ")) return monthKey; // Already formatted
      const [year, month] = monthKey.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthName = monthNames[parseInt(month) - 1] || month;
      return `${monthName} ${year}`;
    };

    const monthlyIncome = (backendFeatures.monthlyIncome || []).map(item => ({
      month: formatMonth(item.month),
      amount: item.amount || 0,
    }));

    const monthlySpending = (backendFeatures.monthlySpending || []).map(item => ({
      month: formatMonth(item.month),
      amount: item.amount || 0,
    }));

    const monthlyBalances = (backendFeatures.monthlyBalances || []).map(item => ({
      month: formatMonth(item.month),
      balance: item.balance || 0,
    }));

    const transformedFeatures = {
      totalIncome: backendFeatures.totalIncome || 0,
      totalSpent: backendFeatures.totalSpent || 0,
      savingsRatio: backendFeatures.savingsRatio || 0,
      incomeStability: backendFeatures.incomeStability || 0,
      spendingVolatility: backendFeatures.spendingVolatility || 0,
      bnplDepth: backendFeatures.bnplDepth || 0,
      monthlyIncome,
      monthlySpending,
      monthlyBalances,
      bnplBreakdown,
      bnplRemainingInstallments,
      estimatedMonthlyBnplPayment,
      salaryWarnings: backendFeatures.salaryWarnings || [],
    };
    
    const transformedResponse = {
      features: transformedFeatures,
      score: backendData.score || 0,
      summary: backendData.summary || backendData.aiSummary || "Analysis completed.",
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Analysis error:", error);
    
    // Check if it's a connection error to backend
    if (error.message?.includes("fetch failed") || error.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          message: "Backend server is not running",
          details: `Please make sure the backend server is running on ${BACKEND_URL}. Run 'npm run dev:backend' to start it.`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: "Analysis failed",
        details: error.message || "An unexpected error occurred during analysis.",
      },
      { status: 500 }
    );
  }
}

