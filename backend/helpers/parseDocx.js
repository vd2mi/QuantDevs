"use strict";
const mammoth = require("mammoth");

async function parseDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    if (!text || text.trim().length === 0) {
      throw new Error("Document appears to be empty");
    }
    
    return { text };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

module.exports = parseDocx;

