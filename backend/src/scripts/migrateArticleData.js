// backend/src/scripts/migrateArticleData.js
/*
const Article = require('../models/Article');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaahan_auth');
    console.log('✅ MongoDB Connected');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Load article data from JSON file
const loadArticleData = () => {
  try {
    const jsonPath = path.join(__dirname, '../data/articles.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ articles.json not found at:', jsonPath);
      console.log('📁 Please create articles.json in backend/src/data/');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📁 Loaded ${data.length} articles from articles.json`);
    return data;
  } catch (error) {
    console.error('❌ Error loading article data:', error);
    process.exit(1);
  }
};

// Migrate articles
const migrateArticles = async () => {
  console.log('\n📚 Starting Article Data Migration...\n');
  console.log('─'.repeat(50));
  
  await connectDB();
  
  // Clear existing articles
  console.log('\n🗑️ Clearing existing articles...');
  await Article.deleteMany({});
  console.log('✅ Existing articles cleared\n');
  
  const articlesData = loadArticleData();
  
  if (articlesData.length === 0) {
    console.log('⚠️ No articles to migrate.');
    process.exit(0);
  }
  
  let count = 0;
  let errors = [];
  
  for (const articleData of articlesData) {
    try {
      // Create article with all fields
      const article = new Article({
        title: articleData.title,
        slug: articleData.slug,
        category: articleData.category,
        subCategory: articleData.subCategory || '',
        excerpt: articleData.excerpt,
        content: articleData.content,
        image: articleData.image,
        author: articleData.author,
        date: articleData.date,
        readTime: articleData.readTime,
        tags: articleData.tags || [],
        status: articleData.status || 'published',
        seoTitle: articleData.seoTitle || articleData.title,
        seoDescription: articleData.seoDescription || articleData.excerpt,
        publishedAt: articleData.publishedAt || new Date(),
      });
      
      await article.save();
      count++;
      
      if (count % 5 === 0 || count === articlesData.length) {
        console.log(`   ✅ Migrated ${count}/${articlesData.length} articles...`);
      }
    } catch (error) {
      console.error(`❌ Error migrating article: ${articleData.title}`, error.message);
      errors.push({ title: articleData.title, error: error.message });
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total Articles: ${articlesData.length}`);
  console.log(`   Successfully Migrated: ${count}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors:');
    errors.forEach(err => {
      console.log(`   - ${err.title}: ${err.error}`);
    });
  }
  
  console.log('\n✅ Article Migration Completed Successfully!');
  
  // Verify data
  const articleCount = await Article.countDocuments();
  console.log(`\n📈 Database Counts:`);
  console.log(`   Articles: ${articleCount}`);
  
  process.exit(0);
};

migrateArticles();