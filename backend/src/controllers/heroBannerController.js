// backend/src/controllers/heroBannerController.js
/*
================================================================================
File Name : heroBannerController.js
Description : Controller for Hero Banner Management.
              - Public endpoint: only active banners, sorted for the slider.
              - Admin endpoint: every banner (active + inactive) for the
                management screen.
              - Publish endpoint: the ONLY way banners are created, updated,
                or removed. It applies the entire pending changeset inside a
                single MongoDB transaction — either every change lands, or
                none of them do, so the homepage is never left with a
                partially-updated Hero.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const mongoose = require('mongoose');
const HeroBanner = require('../models/HeroBanner');

// ========================================
// GET /api/hero-banners - Public: active banners, sorted for the slider
// ========================================
exports.getActiveHeroBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('❌ Get active hero banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero banners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// GET /api/hero-banners/admin - Admin: every banner, for the management screen
// ========================================
exports.getAllHeroBannersAdmin = async (req, res) => {
  try {
    const banners = await HeroBanner.find().sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('❌ Get all hero banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero banners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ========================================
// POST /api/hero-banners/publish - Admin: apply the full pending changeset
//
// Body: { banners: [
//   { _id?, title, desktopImage, mobileImage, buttonText, buttonLink,
//     displayOrder, isActive, _delete? }
// ] }
//
// - Entries with an existing _id are updated.
// - Entries without an _id are created.
// - Entries with _delete: true (and an _id) are removed.
//
// Every non-deleted entry is validated BEFORE anything touches the database.
// If any entry fails validation, nothing is written and a specific error
// identifies which banner needs fixing. The actual writes then happen
// inside a single transaction, so a failure partway through rolls every
// change back — the homepage never sees a half-published Hero.
// ========================================
exports.publishHeroBanners = async (req, res) => {
  const { banners } = req.body;

  if (!Array.isArray(banners) || banners.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No banners were provided to publish.',
    });
  }

  // ---- Validate the entire changeset up front, before writing anything ----
  for (let i = 0; i < banners.length; i += 1) {
    const banner = banners[i];
    const label = `Banner ${i + 1}`;

    if (banner._delete) continue;

    if (!banner.desktopImage || !banner.mobileImage) {
      return res.status(400).json({
        success: false,
        message: `${label} requires both Desktop and Mobile images before publishing.`,
      });
    }
    if (!banner.buttonText || !String(banner.buttonText).trim()) {
      return res.status(400).json({
        success: false,
        message: `${label} requires button text before publishing.`,
      });
    }
    if (!banner.buttonLink || !String(banner.buttonLink).trim()) {
      return res.status(400).json({
        success: false,
        message: `${label} requires a button link before publishing.`,
      });
    }
  }

  // ---- Apply every change inside one transaction ----
  // NOTE: MongoDB transactions require the database to be running as a
  // replica set (Atlas clusters are by default; a bare local `mongod`
  // standalone instance is not — start one with `--replSet` for local
  // testing, or point NODE_ENV at an Atlas connection string).
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const banner of banners) {
      if (banner._delete) {
        if (banner._id) {
          await HeroBanner.findByIdAndDelete(banner._id, { session });
        }
        continue;
      }

      const payload = {
        title: banner.title || '',
        desktopImage: banner.desktopImage,
        mobileImage: banner.mobileImage,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        displayOrder: Number.isFinite(banner.displayOrder) ? banner.displayOrder : 0,
        isActive: banner.isActive !== false,
        updatedAt: new Date(),
      };

      if (banner._id) {
        await HeroBanner.findByIdAndUpdate(banner._id, payload, {
          session,
          runValidators: true,
          new: true,
        });
      } else {
        await HeroBanner.create([payload], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    const updated = await HeroBanner.find().sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      message: 'Hero banners published successfully!',
      banners: updated,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Publish hero banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish hero banners. No changes were saved — the homepage is unaffected.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};