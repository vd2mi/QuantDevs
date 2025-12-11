"use strict";

function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  // Normalize Arabic digits to Western digits
  if (typeof dateStr === 'string') {
    // Convert Arabic digits (٠١٢٣٤٥٦٧٨٩) to Western (0123456789)
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let normalized = dateStr;
    arabicDigits.forEach((arabic, index) => {
      normalized = normalized.replace(new RegExp(arabic, 'g'), index.toString());
    });
    const d = new Date(normalized);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 2000 && d.getFullYear() <= 2100) {
      return d;
    }
  }
  
  const d = new Date(dateStr);
  if (!isNaN(d.getTime()) && d.getFullYear() >= 2000 && d.getFullYear() <= 2100) {
    return d;
  }
  return null;
}

function monthKey(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "unknown";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function stdDev(values) {
  if (!values || values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function computeSpendingSpeed(transactions) {
  const salaryTx = transactions.filter((t) => {
    return t.category === "salary" || (t.type === "income" && t.amount > 0);
  });
  
  if (salaryTx.length === 0) return 0.5;
  
  const sorted = [...transactions].sort((a, b) => {
    const da = parseDate(a.date)?.getTime() || 0;
    const db = parseDate(b.date)?.getTime() || 0;
    return da - db;
  });
  
  const daysToSpend = [];
  
  salaryTx.forEach((s) => {
    const start = parseDate(s.date);
    if (!start) return;
    const salaryAmount = Math.abs(s.amount);
    let spent = 0;
    let days = 30;
    
    for (const tx of sorted) {
      const d = parseDate(tx.date);
      if (!d || d <= start) continue;
      const diffDays = Math.floor((d - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 30) break;
      if (tx.amount < 0) {
        spent += Math.abs(tx.amount);
      }
      if (spent >= salaryAmount) {
        days = diffDays;
        break;
      }
    }
    daysToSpend.push(days);
  });
  
  if (daysToSpend.length === 0) return 0.5;
  const avgDays = daysToSpend.reduce((sum, v) => sum + v, 0) / daysToSpend.length;
  return 1 - Math.min(avgDays / 30, 1);
}

function computeFeatures(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error("computeFeatures expects a non-empty array of transactions.");
  }
  
  // Basic totals
  let totalIncome = 0;
  let totalSpent = 0;
  let totalBnpl = 0;
  
  const bnplBreakdown = {
    tabby: 0,
    tamara: 0,
    cashew: 0,
    spotii: 0,
    other: 0,
  };
  
  const bnplTransactionCounts = {
    tabby: 0,
    tamara: 0,
    cashew: 0,
    spotii: 0,
    other: 0,
  };
  
  // Monthly aggregations
  const monthlyIncomeMap = {};
  const monthlySpendingMap = {};
  
  // Process transactions
  for (const tx of transactions) {
    const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
    
    if (amount > 0) {
      totalIncome += amount;
    } else if (amount < 0) {
      totalSpent += Math.abs(amount);
    }
    
    // BNPL detection - FIX #3: Only classify if explicit BNPL patterns match
    if (tx.isBnpl || tx.category === "bnpl") {
      const desc = (tx.description || "").toLowerCase();
      const descArabic = tx.description || "";
      
      // FIX #3: Check for explicit BNPL keywords
      const hasExplicitBnplKeywords = 
        /installment|3\s*payments|4\s*payments|monthly\s*plan|bnpl|buy\s*now\s*pay\s*later/i.test(desc) ||
        /قسط|أقساط|دفعة/i.test(descArabic);
      
      // Known provider names
      const isTabby = /tabby|تابي/i.test(desc) || /تابي/i.test(descArabic);
      const isTamara = /tamara|تمارا/i.test(desc) || /تمارا/i.test(descArabic);
      const isCashew = /cashew|كاشيو/i.test(desc) || /كاشيو/i.test(descArabic);
      
      // FIX #6: Spotii/Postpay/Noon require explicit BNPL keywords
      const isSpotiiRaw = /spot(ii)?|spotti|spotty|postpay/i.test(desc);
      const isNoonRaw = /noon/i.test(desc);
      const isSpotii = isSpotiiRaw && hasExplicitBnplKeywords;
      const isNoon = isNoonRaw && hasExplicitBnplKeywords;
      
      // Only classify as BNPL if provider name OR explicit keywords
      if (isTabby || isTamara || isCashew || isSpotii || isNoon || hasExplicitBnplKeywords) {
        const bnplAmount = Math.abs(amount);
        totalBnpl += bnplAmount;
        
        if (isTabby) {
          bnplBreakdown.tabby += bnplAmount;
          bnplTransactionCounts.tabby++;
        } else if (isTamara) {
          bnplBreakdown.tamara += bnplAmount;
          bnplTransactionCounts.tamara++;
        } else if (isCashew) {
          bnplBreakdown.cashew += bnplAmount;
          bnplTransactionCounts.cashew++;
        } else if (isSpotii) {
          bnplBreakdown.spotii += bnplAmount;
          bnplTransactionCounts.spotii++;
        } else if (isNoon) {
          // Noon goes to "other" BNPL category (only if keywords present)
          bnplBreakdown.other += bnplAmount;
          bnplTransactionCounts.other++;
        } else if (hasExplicitBnplKeywords) {
          // FIX #1: Only add to "other" if explicit BNPL keywords found AND amount repeats ≥2 times within 40 days
          // Check if this amount appears multiple times
          const txDate = parseDate(tx.date);
          if (txDate) {
            const similarAmountTxs = transactions.filter(t => {
              const tDate = parseDate(t.date);
              if (!tDate) return false;
              const daysDiff = Math.abs((txDate.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
              const amountDiff = Math.abs(Math.abs(t.amount) - bnplAmount) / bnplAmount;
              return daysDiff <= 40 && amountDiff < 0.05; // Same amount within 40 days
            });
            
            // Only classify as BNPL if amount appears ≥2 times
            if (similarAmountTxs.length >= 2) {
              bnplBreakdown.other += bnplAmount;
              bnplTransactionCounts.other++;
            }
          }
        }
      }
    }
    
    // Monthly aggregation
    const month = monthKey(tx.date);
    if (amount > 0) {
      monthlyIncomeMap[month] = (monthlyIncomeMap[month] || 0) + amount;
    } else if (amount < 0) {
      monthlySpendingMap[month] = (monthlySpendingMap[month] || 0) + Math.abs(amount);
    }
  }
  
  // FIX #1: Ensure all months with transactions are included, default to 0
  // Get all unique months from transactions (including those with only dates)
  const allTransactionMonths = new Set();
  for (const tx of transactions) {
    const month = monthKey(tx.date);
    if (month !== "unknown") {
      allTransactionMonths.add(month);
    }
  }
  
  // Combine with months that have income/spending
  const allMonthsSet = new Set([
    ...Object.keys(monthlyIncomeMap),
    ...Object.keys(monthlySpendingMap),
    ...Array.from(allTransactionMonths)
  ]);
  
  // Convert to sorted array
  const allMonths = Array.from(allMonthsSet).sort();
  
  // Build monthly arrays with defaults
  const monthlyIncome = allMonths.map(month => ({
    month,
    amount: monthlyIncomeMap[month] || 0
  }));
  
  const monthlySpending = allMonths.map(month => ({
    month,
    amount: monthlySpendingMap[month] || 0
  }));
  
  // FIX #1: Compute monthly balances with safe numeric handling - return { month, balance }
  const safe = (v) => Number.isFinite(v) ? v : 0;
  const monthlyBalances = [];
  let runningBalance = 0;
  
  for (const month of allMonths) {
    const income = safe(monthlyIncomeMap[month] || 0);
    const spending = safe(monthlySpendingMap[month] || 0);
    runningBalance += (income - spending);
    monthlyBalances.push({
      month: month,
      balance: safe(runningBalance)
    });
  }
  
  // Compute savings ratio (clamped to avoid insane values)
  const savings = totalIncome - totalSpent;
  let savingsRatio = totalIncome > 0 ? savings / totalIncome : 0;
  savingsRatio = Math.max(-1.5, Math.min(1.5, savingsRatio)); // Clamp between -150% and +150%
  
  // Compute income stability
  const incomeValues = monthlyIncome.map(m => m.amount);
  let incomeStability = 0.5;
  if (incomeValues.length > 1 && totalIncome > 0) {
    const mean = totalIncome / incomeValues.length;
    const std = stdDev(incomeValues);
    const cv = mean > 0 ? std / mean : 1;
    incomeStability = Math.max(0, Math.min(1, 1 - Math.min(cv, 1)));
  } else if (incomeValues.length === 1 && totalIncome > 0) {
    incomeStability = 1.0; // Single month = stable
  }
  
  // Compute spending volatility
  const spendingValues = monthlySpending.map(m => m.amount);
  let spendingVolatility = 0.5;
  if (spendingValues.length > 1 && totalSpent > 0) {
    const mean = totalSpent / spendingValues.length;
    const std = stdDev(spendingValues);
    const cv = mean > 0 ? std / mean : 1;
    spendingVolatility = Math.max(0, Math.min(1, cv));
  } else if (spendingValues.length === 1 && totalSpent > 0) {
    spendingVolatility = 0.0; // Single month = no volatility
  }
  
  // Compute BNPL depth
  const bnplDepth = totalIncome > 0 ? totalBnpl / totalIncome : 0;
  
  // Compute spending speed
  const spendingSpeed = computeSpendingSpeed(transactions);
  
  // FIX #2: Overhaul BNPL installment detection
  // Group BNPL transactions by provider and detect installment cycles
  const bnplTransactions = transactions.filter(t => {
    if (!t.isBnpl && t.category !== "bnpl") return false;
    const desc = (t.description || "").toLowerCase();
    const descArabic = t.description || "";
    const hasExplicitBnplKeywords = 
      /installment|3\s*payments|4\s*payments|monthly\s*plan|bnpl|buy\s*now\s*pay\s*later/i.test(desc) ||
      /قسط|قسّط|أقساط|دفعة/i.test(descArabic);
    
    // Known providers (always BNPL)
    const isKnownProvider = /tabby|تابي|tamara|تمارا|cashew|كاشيو/i.test(desc) ||
                           /تابي|تمارا|كاشيو/i.test(descArabic);
    
    // Spotii/Postpay/Noon require explicit keywords
    const isSpotiiWithKeywords = (/spot(ii)?|spotti|spotty|postpay/i.test(desc) && hasExplicitBnplKeywords);
    const isNoonWithKeywords = (/noon/i.test(desc) && hasExplicitBnplKeywords);
    
    return isKnownProvider || isSpotiiWithKeywords || isNoonWithKeywords || hasExplicitBnplKeywords;
  });
  
  // Group by provider
  const bnplByProvider = {
    tabby: [],
    tamara: [],
    cashew: [],
    spotii: [],
    other: []
  };
  
  for (const tx of bnplTransactions) {
    const desc = (tx.description || "").toLowerCase();
    const descArabic = tx.description || "";
    const date = parseDate(tx.date);
    if (!date) continue;
    
    if (/tabby|تابي/i.test(desc) || /تابي/i.test(descArabic)) {
      bnplByProvider.tabby.push({ ...tx, parsedDate: date });
    } else if (/tamara|تمارا/i.test(desc) || /تمارا/i.test(descArabic)) {
      bnplByProvider.tamara.push({ ...tx, parsedDate: date });
    } else if (/cashew|كاشيو/i.test(desc) || /كاشيو/i.test(descArabic)) {
      bnplByProvider.cashew.push({ ...tx, parsedDate: date });
    } else if (/spot(ii)?|spotti|spotty|postpay/i.test(desc)) {
      // FIX #6: Spotii/Postpay - only if explicit BNPL keywords
      const hasExplicitBnplKeywords = 
        /installment|3\s*payments|4\s*payments|monthly\s*plan|bnpl|buy\s*now\s*pay\s*later/i.test(desc) ||
        /قسط|قسّط|أقساط|دفعة/i.test(descArabic);
      if (hasExplicitBnplKeywords) {
        bnplByProvider.spotii.push({ ...tx, parsedDate: date });
      }
    } else if (/noon/i.test(desc)) {
      // FIX #6: Noon - only if explicit BNPL keywords, goes to "other"
      const hasExplicitBnplKeywords = 
        /installment|3\s*payments|4\s*payments|monthly\s*plan|bnpl|buy\s*now\s*pay\s*later/i.test(desc) ||
        /قسط|قسّط|أقساط|دفعة/i.test(descArabic);
      if (hasExplicitBnplKeywords) {
        bnplByProvider.other.push({ ...tx, parsedDate: date });
      }
    } else {
      // FIX #1: Other BNPL - only if explicit keywords AND amount repeats ≥2 times within 40 days
      const hasExplicitBnplKeywords = 
        /installment|3\s*payments|4\s*payments|monthly\s*plan|bnpl|buy\s*now\s*pay\s*later/i.test(desc) ||
        /قسط|قسّط|أقساط|دفعة/i.test(descArabic);
      if (hasExplicitBnplKeywords) {
        // Check if amount repeats ≥2 times within 40 days
        const txAmount = Math.abs(tx.amount);
        const similarAmountTxs = bnplTransactions.filter(t => {
          const tDate = parseDate(t.date);
          if (!tDate) return false;
          const daysDiff = Math.abs((date.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
          const amountDiff = Math.abs(Math.abs(t.amount) - txAmount) / txAmount;
          return daysDiff <= 40 && amountDiff < 0.05;
        });
        
        // Only push to "other" if amount repeats ≥2 times
        if (similarAmountTxs.length >= 2) {
          bnplByProvider.other.push({ ...tx, parsedDate: date });
        }
      }
      // No unconditional push - only add when conditions are met above
    }
  }
  
  // FIX #4: Improved BNPL installment cycle detection
  const detectInstallmentPlan = (txs) => {
    if (txs.length === 0) {
      return { totalInstallments: 0, completedInstallments: 0, amountPerPayment: 0 };
    }
    
    // Sort by date
    const sorted = [...txs].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    // Group by similar amounts (within 5% tolerance)
    const groups = [];
    for (const tx of sorted) {
      const amount = Math.abs(tx.amount);
      const found = groups.find(g => {
        const avgAmount = g.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / g.transactions.length;
        return Math.abs(amount - avgAmount) / avgAmount < 0.05;
      });
      if (found) {
        found.transactions.push(tx);
      } else {
        groups.push({ amount, transactions: [tx] });
      }
    }
    
    // Find the largest group (most common payment amount)
    const largestGroup = groups.reduce((max, g) => 
      g.transactions.length > max.transactions.length ? g : max, 
      groups[0] || { transactions: [], amount: 0 }
    );
    
    if (largestGroup.transactions.length === 0) {
      // FIX #2: Single transaction - assume it's first payment of 4-installment plan
      // This prevents showing 0 remaining installments for active BNPL
      return { 
        totalInstallments: 4, 
        completedInstallments: 1, 
        amountPerPayment: Math.abs(sorted[0].amount) 
      };
    }
    
    const groupTxs = largestGroup.transactions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    const firstDate = groupTxs[0].parsedDate.getTime();
    const lastDate = groupTxs[groupTxs.length - 1].parsedDate.getTime();
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const avgAmount = largestGroup.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / largestGroup.transactions.length;
    
    let totalInstallments = groupTxs.length;
    let completedInstallments = groupTxs.length;
    
    // Determine cycle based on rules
    if (groupTxs.length === 4 && daysDiff >= 28 && daysDiff <= 50) {
      // 4-installment plan (28-50 days spread)
      totalInstallments = 4;
      completedInstallments = 4;
    } else if (groupTxs.length === 3 && daysDiff >= 15 && daysDiff <= 30) {
      // 3-installment plan (15-30 days spread)
      totalInstallments = 3;
      completedInstallments = 3;
    } else if (groupTxs.length === 2) {
      // 2-installment plan
      totalInstallments = 2;
      completedInstallments = 2;
    } else if (groupTxs.length === 1) {
      // Single payment - assume it's the first payment of a 4-installment plan (common for BNPL)
      // This is more realistic than assuming it's fully paid
      totalInstallments = 4;
      completedInstallments = 1; // Only 1 payment seen so far
    } else {
      // Default: assume number of payments = group length
      totalInstallments = groupTxs.length;
      completedInstallments = groupTxs.length;
    }
    
    return {
      totalInstallments,
      completedInstallments,
      amountPerPayment: avgAmount
    };
  };
  
  // FIX #3 & #4: Calculate monthly installments correctly
  const bnplRemainingInstallments = {
    tabby: 0,
    tamara: 0,
    cashew: 0,
    spotii: 0,
    other: 0,
  };
  
  const estimatedMonthlyBnplPayment = {
    tabby: 0,
    tamara: 0,
    cashew: 0,
    spotii: 0,
    other: 0,
  };
  
  for (const [provider, txs] of Object.entries(bnplByProvider)) {
    const plan = detectInstallmentPlan(txs);
    
    // FIX #3: Calculate remaining installments correctly
    // remaining = totalInstallments - completedInstallments
    const remaining = Math.max(0, plan.totalInstallments - plan.completedInstallments);
    bnplRemainingInstallments[provider] = remaining;
    
    // FIX #4: Monthly installment = amountPerPayment AS LONG AS remaining > 0
    // Do NOT check for latest month transaction - installment plans continue regardless
    if (remaining > 0 && plan.amountPerPayment > 0) {
      estimatedMonthlyBnplPayment[provider] = plan.amountPerPayment;
    } else {
      estimatedMonthlyBnplPayment[provider] = 0;
    }
  }
  
  // Compute rule-based credit score
  let baseScore = 600; // Default
  
  // Base score from savings ratio
  if (savingsRatio > 0.5) {
    baseScore = 720;
  } else if (savingsRatio > 0.3) {
    baseScore = 680;
  } else if (savingsRatio > 0.15) {
    baseScore = 640;
  } else if (savingsRatio > 0) {
    baseScore = 600;
  } else if (savingsRatio >= -0.5) {
    baseScore = 540;
  } else {
    baseScore = 480;
  }
  
  // Adjust for BNPL depth
  if (bnplDepth > 0.3) {
    baseScore -= 90;
  } else if (bnplDepth > 0.15) {
    baseScore -= 60;
  } else if (bnplDepth > 0) {
    baseScore -= 30;
  }
  
  // Adjust for income stability
  if (incomeStability > 0.8) {
    baseScore += 30;
  } else if (incomeStability > 0.6) {
    baseScore += 15;
  } else if (incomeStability < 0.4) {
    baseScore -= 30;
  }
  
  // Adjust for spending volatility
  if (spendingVolatility > 0.7) {
    baseScore -= 30;
  } else if (spendingVolatility > 0.5) {
    baseScore -= 20;
  } else if (spendingVolatility > 0.3) {
    baseScore -= 10;
  }
  
  // Clamp and round
  baseScore = Math.max(300, Math.min(850, baseScore));
  baseScore = Math.round(baseScore / 10) * 10;
  
  // FIX #8: Add new metrics
  // Top 5 Spending Categories
  const categorySpending = {};
  for (const tx of transactions) {
    if (tx.amount < 0) {
      const category = tx.category || "other";
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(tx.amount);
    }
  }
  const topSpendingCategories = Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Average Monthly Savings
  const monthlySavings = monthlyIncome.map((inc, idx) => {
    const spending = monthlySpending[idx]?.amount || 0;
    return safe(inc.amount - spending);
  });
  const averageMonthlySavings = monthlySavings.length > 0
    ? monthlySavings.reduce((sum, s) => sum + s, 0) / monthlySavings.length
    : 0;
  
  // Recurring merchants (merchants that appear >= 3 times)
  const merchantCounts = {};
  for (const tx of transactions) {
    if (tx.amount < 0 && tx.description) {
      // Extract merchant name (simplified: take first meaningful words)
      const desc = tx.description.toLowerCase();
      const merchantMatch = desc.match(/(?:at|في|@)\s*([a-z0-9\s]+?)(?:\s+on|\s+في|\s+#|$)/i) ||
                            desc.match(/^([a-z0-9\s]{5,30})/i);
      if (merchantMatch) {
        const merchant = merchantMatch[1].trim().substring(0, 50);
        if (merchant.length > 3) {
          merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
        }
      }
    }
  }
  const recurringMerchants = Object.entries(merchantCounts)
    .filter(([_, count]) => count >= 3)
    .map(([merchant, count]) => ({ merchant, transactionCount: count }))
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 10);
  
  // Spike detection: transactions that deviate > 2.5× from monthly average
  const avgMonthlySpending = totalSpent / Math.max(1, allMonths.length);
  const spikes = [];
  for (const tx of transactions) {
    if (tx.amount < 0) {
      const amount = Math.abs(tx.amount);
      if (amount > avgMonthlySpending * 2.5) {
        spikes.push({
          date: tx.date,
          description: tx.description || "",
          amount: amount,
          deviation: ((amount / avgMonthlySpending - 1) * 100).toFixed(1) + "%"
        });
      }
    }
  }
  spikes.sort((a, b) => b.amount - a.amount);
  
  return {
    features: {
      totalIncome,
      totalSpent,
      savingsRatio,
      incomeStability,
      spendingVolatility,
      bnplDepth,
      spendingSpeed,
      monthlyIncome,
      monthlySpending,
      monthlyBalances,
      bnplBreakdown,
      bnplRemainingInstallments,
      estimatedMonthlyBnplPayment,
      // New metrics
      topSpendingCategories,
      averageMonthlySavings,
      recurringMerchants,
      spendingSpikes: spikes.slice(0, 10), // Top 10 spikes
    },
    score: baseScore
  };
}

module.exports = computeFeatures;
