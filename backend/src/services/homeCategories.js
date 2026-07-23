// backend/src/services/homeCategories.js
/*
================================================================================
File Name : homeCategories.js
Description : Builds the homepage carousel sections dynamically. Groups all
              published articles by category, keeps only the categories that
              have at least `minCount` published articles, and returns the
              latest `perCategory` articles (newest first) for each one.
              New categories appear automatically the moment they cross the
              minCount threshold, and disappear automatically if they drop
              below it again — no frontend or backend code changes needed.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const Article = require('../models/Article');

/**
 * @param {object} [options]
 * @param {number} [options.minCount=8] - Minimum published articles a category needs to qualify for the homepage
 * @param {number} [options.perCategory=8] - Max (latest) articles returned per category
 * @returns {Promise<Array<{ category: string, count: number, articles: Array }>>}
 */
async function getHomepageCategorySections({ minCount = 8, perCategory = 8 } = {}) {
  const results = await Article.aggregate([
    { $match: { status: 'published' } },

    // Newest-first, using publishedAt when it's set and falling back to
    // createdAt for articles that don't have one.
    { $addFields: { sortDate: { $ifNull: ['$publishedAt', '$createdAt'] } } },
    { $sort: { sortDate: -1 } },

    // Group by category. $push preserves the order established by the
    // $sort above, so every category's `articles` array is already
    // newest-first — no extra per-group sort needed.
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        articles: {
          $push: {
            _id: '$_id',
            title: '$title',
            slug: '$slug',
            category: '$category',
            excerpt: '$excerpt',
            image: '$image',
            thumbnail: '$thumbnail',
            author: '$author',
            date: '$date',
            readTime: '$readTime',
            createdAt: '$createdAt',
            publishedAt: '$publishedAt',
          },
        },
      },
    },

    // Only categories with enough published articles make the homepage.
    { $match: { count: { $gte: minCount } } },

    // Trim each category down to its latest `perCategory` articles and
    // return only what the homepage actually needs.
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
        articles: { $slice: ['$articles', perCategory] },
      },
    },

    { $sort: { category: 1 } },
  ]);

  return results;
}

module.exports = { getHomepageCategorySections };