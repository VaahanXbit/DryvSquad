// backend/src/routes/contactRoutes.js
/*
================================================================================
File Name : contactRoutes.js
Author : Tahseen Raza
Created Date : 2026-06-30
Description : Contact routes for handling contact form submissions
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const express = require('express');
const router = express.Router();
const { sendContactForm } = require('../controllers/contactController');

// Send contact form
router.post('/', sendContactForm);

module.exports = router;