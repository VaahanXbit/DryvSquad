// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');
const compareRoutes = require('./routes/compareRoutes');

const carRoutes = require('./routes/carRoutes');
const travelogueRoutes = require('./routes/travelogueRoutes');
const contactRoutes = require('./routes/contactRoutes');
const leadRoutes = require('./routes/leadRoutes');
const locationRoutes = require('./routes/locationRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const homeRoutes = require('./routes/homeRoutes');
const heroBannerRoutes = require('./routes/heroBannerRoutes');

const connectDB = require('./config/database');


// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

const allowedOrigins = [
  // Local Development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",

  // Production Domain
  "https://www.dryvsquad.com",
  "https://dryvsquad.com",

  // Current Production Frontend
  "https://dryv-squad.vercel.app",
  "https://dryv-squad-bcgg9uant-vaahan-xbit-s-projects.vercel.app",

  // Environment Variable
  process.env.FRONTEND_URL,
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without Origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||

      // Allow all future Vercel preview deployments
      (origin.endsWith(".vercel.app") &&
        origin.includes("vaahan-international")) ||

      // Allow localhost on any port
      /^https?:\/\/localhost:\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
}));

// Body parser
// Base64 image payloads (article images, and especially Hero Banner
// publishes — which can carry several images up to 6MB each, ~33% larger
// once base64-encoded, across multiple banners in one request) are far
// larger than Express's default 100kb JSON limit.
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/travelogues', travelogueRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/hero-banners', heroBannerRoutes);




// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app;