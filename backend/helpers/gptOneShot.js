"use strict";
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractFinancialData({ sampleText, summaryStats }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const ruleBasedScore = summaryStats.ruleBasedScore || 650;
  const savingsRatio = summaryStats.savingsRatio || 0;
  const bnplDepth = summaryStats.bnplDepth || 0;
  const incomeStability = summaryStats.incomeStability || 0;
  const spendingVolatility = summaryStats.spendingVolatility || 0;
  
  // FIX #7: Improve AI Summary - base ONLY on actual metrics, no hardcoded assumptions
  const prompt = `You are a financial risk analyst for a bank. Analyze this financial data and provide structured insights.

Sample transactions:
${sampleText}

Financial Summary (USE THESE EXACT VALUES):
- Total transactions: ${summaryStats.totalTransactions || 0}
- Total income: ${summaryStats.totalIncome || 0} SAR
- Total expenses: ${summaryStats.totalExpenses || 0} SAR
- Savings ratio: ${(savingsRatio * 100).toFixed(2)}% ${savingsRatio > 0.3 ? "(HIGH - positive savings)" : savingsRatio < 0 ? "(NEGATIVE - spending exceeds income)" : "(MODERATE)"}
- BNPL depth: ${(bnplDepth * 100).toFixed(2)}% (${summaryStats.bnplCount || 0} transactions, ${summaryStats.bnplAmount || 0} SAR) ${bnplDepth > 0.3 ? "(HIGH RISK)" : bnplDepth > 0.15 ? "(MODERATE RISK)" : bnplDepth > 0 ? "(LOW RISK)" : "(NO BNPL)"}
- Income stability: ${(incomeStability * 100).toFixed(2)}% ${incomeStability > 0.8 ? "(STABLE)" : incomeStability < 0.4 ? "(UNSTABLE)" : "(MODERATE)"}
- Spending volatility: ${(spendingVolatility * 100).toFixed(2)}% ${spendingVolatility < 0.3 ? "(LOW - consistent spending)" : spendingVolatility > 0.7 ? "(HIGH - erratic spending)" : "(MODERATE)"}
- Rule-based credit score: ${ruleBasedScore} (range: 300-850)

CRITICAL SCORING RULES:
1. Credit score range is STRICTLY 300 to 850. Higher score = lower risk.
2. DO NOT default to 650 or any hardcoded value. Calculate based ONLY on the metrics above.
3. Base your expectedScore calculation on:
   - Savings ratio: ${(savingsRatio * 100).toFixed(2)}% (${savingsRatio > 0.3 ? "positive" : savingsRatio < 0 ? "negative" : "low"})
   - BNPL ratio: ${(bnplDepth * 100).toFixed(2)}% (${bnplDepth === 0 ? "none" : bnplDepth > 0.3 ? "high" : "moderate"})
   - Income stability: ${(incomeStability * 100).toFixed(2)}% (${incomeStability > 0.8 ? "stable" : "variable"})
   - Spending volatility: ${(spendingVolatility * 100).toFixed(2)}% (${spendingVolatility < 0.3 ? "low" : spendingVolatility > 0.7 ? "high" : "moderate"})
4. If savings ratio is ${(savingsRatio * 100).toFixed(2)}% and BNPL is ${(bnplDepth * 100).toFixed(2)}%, what should the score be?
5. Reference the rule-based score (${ruleBasedScore}) as a guide, but calculate independently based on metrics.
6. Your expectedScore should be within ±50 points of ${ruleBasedScore} unless metrics strongly suggest otherwise.

Respond ONLY in this JSON format:
{
  "metadata": {
    "accountType": "checking",
    "currency": "SAR"
  },
  "insights": {
    "recommendations": [
      "Specific recommendation referencing savings ratio ${(savingsRatio * 100).toFixed(2)}%",
      "Specific recommendation referencing BNPL depth ${(bnplDepth * 100).toFixed(2)}%",
      "Specific recommendation referencing income stability ${(incomeStability * 100).toFixed(2)}% or spending volatility ${(spendingVolatility * 100).toFixed(2)}%"
    ],
    "predictions": {
      "expectedScore": <calculate based on metrics above, not hardcoded>
    }
  },
  "explanation": {
    "whyScoreChanged": "2-3 sentence explanation that references ONLY these specific numbers: savings ratio ${(savingsRatio * 100).toFixed(2)}%, BNPL depth ${(bnplDepth * 100).toFixed(2)}%, income stability ${(incomeStability * 100).toFixed(2)}%, spending volatility ${(spendingVolatility * 100).toFixed(2)}%. Do not mention generic assumptions."
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial risk analyst for a bank. Provide structured JSON responses. Credit scores range from 300-850. Higher scores indicate lower risk. Do not default to 650 - use actual financial metrics to determine the score.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower temperature for more consistent scoring
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from GPT response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Extract expected score and clamp it
    let expectedScore = parsed.insights?.predictions?.expectedScore;
    if (typeof expectedScore !== 'number' || isNaN(expectedScore)) {
      expectedScore = ruleBasedScore; // Fallback to rule-based score
    }
    
    // Clamp to valid range
    expectedScore = Math.max(300, Math.min(850, Math.round(expectedScore)));
    
    // Build recommendations
    const recommendations = parsed.insights?.recommendations || [];
    if (recommendations.length === 0) {
      recommendations.push("Review your financial patterns and consider improving savings ratio.");
    }
    
    // Build explanation
    let whyScoreChanged = parsed.explanation?.whyScoreChanged || "";
    if (!whyScoreChanged) {
      whyScoreChanged = `Based on savings ratio of ${(savingsRatio * 100).toFixed(2)}%, BNPL depth of ${(bnplDepth * 100).toFixed(2)}%, and income stability of ${(incomeStability * 100).toFixed(2)}%.`;
    }
    
    return {
      metadata: parsed.metadata || { accountType: "checking", currency: "SAR" },
      insights: {
        recommendations: recommendations,
        predictions: {
          expectedScore: expectedScore,
        },
      },
      explanation: {
        whyScoreChanged: whyScoreChanged,
      },
    };
  } catch (error) {
    console.error("GPT API error:", error);
    // Return fallback structure
    return {
      metadata: { accountType: "checking", currency: "SAR" },
      insights: {
        recommendations: ["Analysis completed. Review your financial patterns."],
        predictions: {
          expectedScore: ruleBasedScore, // Use rule-based score as fallback
        },
      },
      explanation: {
        whyScoreChanged: `Financial analysis completed. Rule-based score: ${ruleBasedScore}.`,
      },
    };
  }
}

module.exports = { extractFinancialData };
