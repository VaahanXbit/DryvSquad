// backend/src/config/cloudinary.js
/*
================================================================================
File Name : cloudinary.js
Description : Cloudinary configuration. Hero Banner images (and, if you
              adopt this pattern elsewhere later, article/travelogue images
              too) are uploaded here instead of being stored as base64
              inside MongoDB documents — this keeps documents small and API
              responses fast, and gives every image a real, CDN-backed,
              cacheable URL instead of an inline blob.

              Requires a free Cloudinary account: https://cloudinary.com
              Add these to your backend .env:
                CLOUDINARY_CLOUD_NAME=...
                CLOUDINARY_API_KEY=...
                CLOUDINARY_API_SECRET=...
              (found on your Cloudinary dashboard after signup)

              Also requires the cloudinary package:
                npm install cloudinary
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;