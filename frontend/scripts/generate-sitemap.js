import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://vaahaninternational.com'; // Adjust to your actual domain
// Using production API as primary source. During local build, fallback to localhost if production is down.
const PRODUCTION_API = 'https://vaahan-international.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

const staticPaths = [
  '',
  '/about',
  '/contact',
  '/articles',
  '/travelogues',
  '/compare-cars',
  '/ai-mode'
];

async function generate() {
  console.log('🔄 Generating sitemap...');
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Add static paths
  staticPaths.forEach(p => {
    xml += `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  // Helper to fetch from production with local fallback
  const fetchFromApi = async (endpoint) => {
    try {
      const response = await fetch(`${PRODUCTION_API}${endpoint}`);
      if (response.ok) return await response.json();
    } catch (err) {
      console.log(`⚠️ Production API fetch failed for ${endpoint}, checking local...`);
      try {
        const response = await fetch(`${LOCAL_API}${endpoint}`);
        if (response.ok) return await response.json();
      } catch (localErr) {
        console.log(`❌ All API attempts failed for ${endpoint}`);
      }
    }
    return null;
  };

  // 2. Fetch dynamic articles
  try {
    const data = await fetchFromApi('/articles');
    if (data && data.success && Array.isArray(data.articles)) {
      const published = data.articles.filter(a => a.status === 'published');
      published.forEach(a => {
        xml += `  <url>\n    <loc>${SITE_URL}/article/${a.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      });
      console.log(`✅ Loaded ${published.length} articles.`);
    } else {
      console.log('⚠️ No articles fetched. Using static guides fallback.');
    }
  } catch (err) {
    console.error('⚠️ Warning: Failed to process dynamic articles for sitemap.', err.message);
  }

  // 3. Fetch dynamic travelogues
  try {
    const data = await fetchFromApi('/travelogues');
    if (data && Array.isArray(data.travelogues)) {
      const published = data.travelogues.filter(t => t.status === 'published');
      published.forEach(t => {
        xml += `  <url>\n    <loc>${SITE_URL}/travelogue/${t.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      });
      console.log(`✅ Loaded ${published.length} travelogues.`);
    } else {
      console.log('⚠️ No travelogues fetched. Using static travelogues fallback.');
    }
  } catch (err) {
    console.error('⚠️ Warning: Failed to process dynamic travelogues for sitemap.', err.message);
  }

  xml += '</urlset>';

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`🎉 Sitemap successfully generated at: ${outputPath}`);
}

generate();
