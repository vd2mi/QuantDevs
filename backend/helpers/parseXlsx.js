"use strict";
const XLSX = require("xlsx");

// Convert Excel serial date to JavaScript Date
function excelDateToJSDate(serial) {
  if (typeof serial === 'number' && serial > 0 && serial < 1000000) {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2000 && jsDate.getFullYear() <= 2100) {
      return jsDate;
    }
  }
  if (typeof serial === 'string') {
    const num = parseFloat(serial);
    if (!isNaN(num) && num > 0 && num < 1000000) {
      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2000) {
        return jsDate;
      }
    }
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

// Format date to ISO-like string (YYYY-MM-DD)
function formatDate(date) {
  if (!date) return "";
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const excelDate = excelDateToJSDate(date);
  if (excelDate) {
    const year = excelDate.getFullYear();
    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
    const day = String(excelDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return "";
}

// Convert Arabic digits to Western digits
function arabicToWestern(str) {
  if (typeof str !== 'string') return str;
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  arabicDigits.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), index.toString());
  });
  return result;
}

// Normalize Unicode characters (remove RLM, LRM, etc.)
function normalizeUnicode(str) {
  if (typeof str !== 'string') return str;
  // Remove Right-to-Left Mark (U+200F), Left-to-Right Mark (U+200E), and other invisible Unicode
  return str.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();
}

// Clean header for comparison (CRITICAL FIX #2)
function cleanHeader(h) {
  if (!h) return "";
  return normalizeUnicode(arabicToWestern(String(h)))
    .replace(/[^A-Za-z0-9\u0600-\u06FF]/g, "")
    .toLowerCase();
}

// Detect bank from worksheet content
function detectBank(worksheet, rawText) {
  const text = rawText.toLowerCase();
  if (/alinma|الإنماء|alinma/i.test(text)) return "Alinma";
  if (/al.*rajhi|الراجحي|rajhi/i.test(text)) return "AlRajhi";
  if (/snb|national.*commercial|ncb|الأهلي|ahli/i.test(text)) return "SNB";
  if (/riyad|الرياض/i.test(text)) return "Riyad";
  return "Unknown";
}

// UNIVERSAL SAUDI BANK HEADER DETECTOR
// Works even with Unicode characters and separate cells
function detectHeaderRow(worksheet) {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Normalize Arabic/English variations for matching
  const headerPatterns = [
    /date|التاريخ|تاريخ/i,
    /description|البيان|الوصف|تفاصيل/i,
    /amount|المبلغ|مبلغ|debit|credit|مدين|دائن/i
  ];

  for (let r = 0; r <= Math.min(range.e.r, 30); r++) {
    const rowTexts = [];

    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
      if (cell?.v) {
        // Normalize Unicode and whitespace
        const normalized = normalizeUnicode(String(cell.v));
        rowTexts.push(normalized.replace(/\s+/g, " ").trim());
      }
    }

    const joined = rowTexts.join(" ").toLowerCase();

    // Skip metadata rows (but NOT header rows that contain these words)
    // Only skip if it's clearly a metadata row (customer name, account number, etc.)
    if (/^customer|^name|^account\s+number|^from\[|^to\[/i.test(joined) && rowTexts.length <= 3) {
      continue;
    }

    // Check if row contains at least **2** header-like keywords
    let score = 0;
    for (const pattern of headerPatterns) {
      if (pattern.test(joined)) score++;
    }

    if (score >= 2) return r;
  }

  return 0;
}

// Extract amount from description
function extractAmountFromDescription(description) {
  if (!description) return null;
  const patterns = [
    /SAR\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*SAR/i,
    /ر\.س\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*ر\.س/i,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0 && amount < 1000000) {
        return amount;
      }
    }
  }
  return null;
}

// Determine transaction type from description
function determineType(description, amount, debitCol, creditCol, row) {
  if (!description) {
    // Fallback to amount sign
    return amount >= 0 ? "income" : "expense";
  }
  
  const descUpper = description.toUpperCase();
  const descLower = description.toLowerCase();
  const descArabic = description;
  
  // Income indicators
  const isIncome = 
    /\bCR\b/.test(descUpper) ||
    /credit|deposit|salary|راتب|إيداع|دائن|حوالة.*واردة|transfer.*in/i.test(descLower) ||
    /إيداع|دائن/i.test(descArabic) ||
    (creditCol && row[creditCol] != null && row[creditCol] !== "" && parseFloat(String(row[creditCol]).replace(/[^\d.-]/g, "")) > 0);
  
  // Expense indicators
  const isExpense = 
    /\bDR\b/.test(descUpper) ||
    /debit|withdrawal|purchase|شراء|تم.*الشراء|سحب|مدين|apple.*pay|mada/i.test(descLower) ||
    /تم الشراء|شراء|سحب|مدين/i.test(descArabic) ||
    (debitCol && row[debitCol] != null && row[debitCol] !== "" && parseFloat(String(row[debitCol]).replace(/[^\d.-]/g, "")) > 0);
  
  if (isIncome && !isExpense) return "income";
  if (isExpense && !isIncome) return "expense";
  
  // Fallback to amount sign
  return amount >= 0 ? "income" : "expense";
}

// Detect BNPL
function detectBNPL(description) {
  if (!description) return { isBnpl: false, category: "other" };
  
  const descLower = description.toLowerCase();
  const descArabic = description;
  
  // Check BNPL FIRST (before other categories)
  if (/tabby|تابي/i.test(descLower) || /تابي/i.test(descArabic)) {
    return { isBnpl: true, category: "bnpl" };
  }
  if (/tamara|تمارا/i.test(descLower) || /تمارا/i.test(descArabic)) {
    return { isBnpl: true, category: "bnpl" };
  }
  if (/cashew|كاشيو/i.test(descLower) || /كاشيو/i.test(descArabic)) {
    return { isBnpl: true, category: "bnpl" };
  }
  if (/spot(ii)?|spotti|spotty|postpay|noon/i.test(descLower)) {
    return { isBnpl: true, category: "bnpl" };
  }
  
  // Check for salary
  if (/salary|payroll|wage|راتب|stipend/i.test(descLower) || /راتب/i.test(descArabic)) {
    return { isBnpl: false, category: "salary" };
  }
  
  // Check for purchase
  if (/purchase|شراء|تم.*الشراء/i.test(descLower) || /تم الشراء|شراء/i.test(descArabic)) {
    return { isBnpl: false, category: "purchase" };
  }
  
  // Check for transfer
  if (/transfer|حوالة|تحويل/i.test(descLower) || /حوالة|تحويل/i.test(descArabic)) {
    return { isBnpl: false, category: "transfer" };
  }
  
  // Check for fee
  if (/fee|رسوم|commission/i.test(descLower) || /رسوم/i.test(descArabic)) {
    return { isBnpl: false, category: "fee" };
  }
  
  return { isBnpl: false, category: "other" };
}

// Check if row is metadata (CRITICAL FIX #1)
// Only skip if ALL cells are non-numeric and match pure header/label pattern
function isMetadataRow(row, allColumns, isHeaderRow = false) {
  // Never skip header rows
  if (isHeaderRow) return false;
  
  const values = Object.values(row).map(v => String(v || "").trim()).filter(v => v);
  if (values.length === 0) return true; // Empty row
  
  // Check if row has ANY numeric values (likely a transaction)
  const hasNumericValue = values.some(v => {
    const num = parseFloat(v.replace(/[^\d.-]/g, ""));
    return !isNaN(num) && Math.abs(num) > 0 && Math.abs(num) < 10000000;
  });
  
  // If row has numeric values, it's likely a transaction (not metadata)
  if (hasNumericValue) return false;
  
  // Only skip if ALL cells are non-numeric AND match pure metadata pattern
  const rowText = values.join(" ").toLowerCase();
  const isPureMetadata = 
    (/^customer\s*name|^اسم\s*العميل$/i.test(rowText) && values.length <= 2) ||
    (/^account\s+number|^رقم\s+الحساب$/i.test(rowText) && values.length <= 2) ||
    (/^from\[|^to\[/i.test(rowText) && values.length <= 2) ||
    (/^statement\s+period|^فترة\s+البيان$/i.test(rowText) && values.length <= 2) ||
    (/^brief\s+statement/i.test(rowText) && values.length <= 2);
  
  return isPureMetadata;
}

function parseXlsx(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawText = XLSX.utils.sheet_to_csv(worksheet);
    
    const bank = detectBank(worksheet, rawText);
    const headerRowIndex = detectHeaderRow(worksheet);
    
    // CRITICAL FIX: Extract header row values manually and normalize them
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headerValues = [];
    
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: headerRowIndex, c })];
      if (cell?.v) {
        const normalized = normalizeUnicode(String(cell.v));
        headerValues.push(normalized.trim());
      } else {
        headerValues.push(`__EMPTY_${c}`);
      }
    }
    
    // Create range starting AFTER header row
    const dataRange = {
      s: { r: headerRowIndex + 1, c: range.s.c },
      e: range.e
    };
    
    // Parse data rows as arrays (no header, just raw data)
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      range: dataRange,
      header: 1, // Array of arrays
      defval: "",
      raw: true,
      cellDates: false
    });
    
    if (!rawData || rawData.length === 0) {
      throw new Error("No data found in the Excel file.");
    }
    
    // Convert arrays to objects using normalized header values
    const jsonData = rawData.map(rowArray => {
      const rowObj = {};
      headerValues.forEach((header, idx) => {
        rowObj[header] = rowArray[idx] !== undefined ? rowArray[idx] : "";
      });
      return rowObj;
    });
    
    const allColumns = headerValues.filter(h => h && !h.startsWith('__EMPTY'));
    if (allColumns.length === 0) {
      // Fallback: use all header values
      allColumns.push(...headerValues);
    }
    
    // Find column indices (CRITICAL FIX #2: use cleanHeader for matching)
    const findColumn = (patterns) => {
      for (const pattern of patterns) {
        const found = headerValues.find(h => {
          const cleaned = cleanHeader(h);
          return pattern.test(cleaned);
        });
        if (found) return found;
      }
      return null;
    };
    
    const dateCol = findColumn([
      /date|التاريخ|transaction.*date|posting.*date|تاريخ.*عملية/i,
      /^تاريخ/i,
      /^date$/i
    ]);
    
    const descCol = findColumn([
      /description|details|وصف|تفاصيل|البيان|narration|particulars|memo/i,
      /transaction.*details|تفاصيل.*عملية/i
    ]);
    
    const amountCol = findColumn([
      /amount|مبلغ|المبلغ|balance|رصيد/i
    ]);
    
    const debitCol = findColumn([
      /debit|withdrawal|سحب|مدين/i
    ]);
    
    const creditCol = findColumn([
      /credit|deposit|إيداع|دائن/i
    ]);
    
    // Process rows
    const rows = [];
    
    for (const row of jsonData) {
      // Skip metadata rows (but not header-like rows in data)
      if (isMetadataRow(row, allColumns, false)) continue;
      
      let date = "";
      let description = "";
      let amount = 0;
      
      // Extract date (CRITICAL FIX #4: Comprehensive normalization)
      if (dateCol && row[dateCol] !== undefined && row[dateCol] !== null && row[dateCol] !== "") {
        let dateValue = row[dateCol];
        const excelDate = excelDateToJSDate(dateValue);
        if (excelDate) {
          date = formatDate(excelDate);
        }
      }
      
      // Fallback: Try to find date in other columns if dateCol didn't work
      if (!date && headerValues.length > 0) {
        for (let idx = 0; idx < Math.min(5, headerValues.length); idx++) {
          const col = headerValues[idx];
          if (col === dateCol || col === descCol || col === amountCol || col === debitCol || col === creditCol) continue;
          const val = row[col];
          if (val === undefined || val === null || val === "") continue;
          
          const excelDate = excelDateToJSDate(val);
          if (excelDate) {
            date = formatDate(excelDate);
            break;
          }
        }
      }
      
      // CRITICAL FIX #4: Don't skip rows without dates - try harder or use empty date
      // Only skip if we have NO date AND NO description AND NO amount
      // This prevents losing valid transactions
      
      // CRITICAL FIX #3: Concatenate ALL non-date/non-amount columns for full description
      // This catches BNPL merchants in column 4, 5, etc.
      const fullDescParts = [];
      
      // Add primary description column if found
      if (descCol && row[descCol] !== undefined && row[descCol] !== null && row[descCol] !== "") {
        fullDescParts.push(normalizeUnicode(String(row[descCol])));
      }
      
      // Add ALL other non-date/non-amount columns
      for (const [key, value] of Object.entries(row)) {
        if (key === dateCol || key === amountCol || key === debitCol || key === creditCol || key === descCol) continue;
        if (value !== undefined && value !== null && value !== "") {
          const valStr = normalizeUnicode(String(value)).trim();
          // Skip pure numeric values (likely amounts in wrong column)
          if (valStr && !/^-?\d+[.,]?\d*$/.test(valStr) && valStr.length > 2) {
            fullDescParts.push(valStr);
          }
        }
      }
      
      description = fullDescParts.join(" ").trim();
      
      // Extract amount - CRITICAL FIX: Priority order + handle negative credits/debits + trailing minus
      let extractedAmount = null;
      
      // Helper function to parse amount with trailing minus support (CRITICAL FIX #6)
      const parseAmount = (str) => {
        if (!str || str === "") return null;
        const strNorm = String(str).trim();
        // Handle trailing minus: "1,235.50-"
        const hasTrailingMinus = strNorm.endsWith("-");
        const cleaned = strNorm.replace(/-/g, "").replace(/,/g, "");
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num > 0) {
          return hasTrailingMinus ? -num : num;
        }
        return null;
      };
      
      // PRIORITY 1: Debit column (expenses) - CRITICAL FIX #5: Handle negative debits
      if (debitCol && row[debitCol] !== "" && row[debitCol] != null) {
        const debitVal = parseAmount(row[debitCol]);
        if (debitVal !== null) {
          // If debit is negative, it's actually a credit (income)
          // If debit is positive, it's an expense
          extractedAmount = debitVal < 0 ? Math.abs(debitVal) : -Math.abs(debitVal);
        }
      }
      
      // PRIORITY 2: Credit column (income) - CRITICAL FIX #5: Handle negative credits
      if (extractedAmount === null && creditCol && row[creditCol] !== "" && row[creditCol] != null) {
        const creditVal = parseAmount(row[creditCol]);
        if (creditVal !== null) {
          // If credit is negative, it's actually a debit (expense)
          // If credit is positive, it's income
          extractedAmount = creditVal < 0 ? -Math.abs(creditVal) : Math.abs(creditVal);
        }
      }
      
      // PRIORITY 3: Generic amount column - only if debit/credit didn't work
      if (extractedAmount === null && amountCol && row[amountCol] !== "" && row[amountCol] != null) {
        const amountVal = parseAmount(row[amountCol]);
        if (amountVal !== null && amountVal !== 0) {
          extractedAmount = amountVal;
        }
      }
      
      // PRIORITY 4: Extract from description - only if columns didn't work
      if (extractedAmount === null && description) {
        const descAmount = extractAmountFromDescription(description);
        if (descAmount !== null) {
          extractedAmount = descAmount;
        }
      }
      
      // If still no amount, skip this row
      if (extractedAmount === null || extractedAmount === 0) continue;
      
      amount = extractedAmount;
      
      // CRITICAL: Detect BNPL BEFORE determining type/category
      const { isBnpl, category } = detectBNPL(description);
      
      // Determine type
      const type = determineType(description, amount, debitCol, creditCol, row);
      
      // Adjust amount sign based on type (but preserve debit/credit logic)
      const fromDebitCredit = (debitCol && row[debitCol] !== "" && row[debitCol] != null) ||
                              (creditCol && row[creditCol] !== "" && row[creditCol] != null);
      
      if (!fromDebitCredit) {
        // Only adjust if amount came from generic column or description
        if (type === "income" && amount < 0) {
          amount = Math.abs(amount);
        } else if (type === "expense" && amount > 0) {
          amount = -Math.abs(amount);
        }
      }
      
      // CRITICAL FIX #4: Only skip if we have absolutely nothing useful
      // Don't skip just because date is missing - description and amount are more important
      if (!description && extractedAmount === null) continue;
      
      rows.push({
        date: date || "",
        description: description || "",
        amount: amount,
        type: type,
        category: category,
        isBnpl: isBnpl,
        bank: bank,
        original: {
          rawDate: dateCol ? row[dateCol] : null,
          rawDescription: descCol ? row[descCol] : null,
          rawAmount: amountCol ? row[amountCol] : null
        }
      });
    }
    
    if (rows.length === 0) {
      throw new Error("No valid transactions could be extracted from the document.");
    }
    
    // Create sample text for AI (first 20 transactions)
    const sampleRows = rows.slice(0, 20);
    const sampleText = sampleRows.map(r => 
      `${r.date} | ${r.description} | ${r.amount > 0 ? '+' : ''}${r.amount.toFixed(2)} SAR | ${r.type}`
    ).join('\n');
    
    return {
      rows: rows,
      rawText: sampleText + '\n\n... (total: ' + rows.length + ' transactions)'
    };
    
  } catch (error) {
    throw new Error(`Failed to parse XLSX: ${error.message}`);
  }
}

module.exports = parseXlsx;
