// backend/src/controllers/toolController.js
/*
================================================================================
File Name : toolController.js
Description : Thin HTTP layer for the automotive calculators living in
              src/tools/. Each calculator exposes its own
              { validate, calculate, format } trio; this controller just
              wires request -> validate -> calculate -> format -> response,
              the same way every other controller in this codebase does.
              Adding a new calculator (Mileage, EV Range, Running Cost)
              means adding a new exported handler here that points at its
              own tools/<name>/ module — the Loan Calculator handler below
              never needs to change.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const { calculateEmi } = require('../tools/loanCalculator/calculator');
const { validateLoanInput } = require('../tools/loanCalculator/validator');
const { formatEmiResult } = require('../tools/loanCalculator/formatter');

/**
 * POST /api/tools/loan/emi
 * Body: { loanAmount, interestRate, tenureMonths }
 */
exports.calculateLoanEmi = async (req, res) => {
  try {
    const { loanAmount, interestRate, tenureMonths } = validateLoanInput(req.body);

    const raw = calculateEmi({ loanAmount, interestRate, tenureMonths });
    const data = formatEmiResult(raw);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('❌ Loan EMI calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate loan EMI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
