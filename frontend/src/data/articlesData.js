// // src/data/articlesData.js
// /*
// ================================================================================
// File Name : articlesData.js
// Author : Tahseen Raza
// Created Date : 2025-01-15
// Description : Complete articles database with Feature Reviews, New Launches, and Tech Insights
// Company : Vaahan International
// Copyright : (c) 2025 Vaahan International. All rights reserved.
// ================================================================================
// */

// // Feature Reviews Articles (from PDF)
// export const featureReviews = [
//   {
//     id: 1,
//     title: "AWD vs FWD: The ₹2 Lakh Question Nobody Answers Honestly",
//     slug: "awd-vs-fwd",
//     category: "Feature Reviews",
//     subCategory: "Drivetrain Comparison",
//     excerpt: "A practical comparison between AWD and FWD systems for Indian roads. Understand when AWD provides real advantages and whether spending an extra ₹2 lakh is justified.",
//     content: "<h2>The Story</h2><p>My friend paid ₹2 lakhs extra for AWD on his Fortuner. His reasoning: 'AWD is better. More traction. Safer.'</p><p>Six months later, monsoon season. Both of us stuck in the same waterlogged pothole on Mumbai's old airport road. My FWD Compass and his AWD Fortuner both couldn't move. We called the same tow truck.</p><p>He asked me: 'So why did I spend ₹2 lakhs extra?'</p><h2>What AWD Actually Does</h2><p>FWD means front wheels have engine power. Rear wheels just roll. AWD means all four wheels have engine power.</p><h2>The Verdict</h2><p><strong>Should you pay ₹2 lakhs extra for AWD?</strong> No, not for 95% of Indian buyers. Your tires matter 100 times more than AWD.</p>",
//     image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop",
//     author: "Tahseen Raza",
//     date: "2025-01-15",
//     readTime: "8 min read",
//     tags: ["AWD", "FWD", "Drivetrain", "Comparison"]
//   },
//   {
//     id: 2,
//     title: "ADAS Lane Keep Assist: Why It Failed Me on an Indian Highway",
//     slug: "adas-lane-keep-assist",
//     category: "Feature Reviews",
//     subCategory: "ADAS Review",
//     excerpt: "A real-world review of ADAS Lane Keep Assist technology on Indian roads.",
//     content: "<h2>The Story</h2><p>1 PM, Mumbai Pune expressway. 4 hours of driving. Eyes drooping. The steering wheel vibrates. Firm. Like the car is tapping me saying: 'You drifted. Come back.'</p><h2>What Lane Keep Assist Actually Does</h2><p>Camera on windshield watches road. Detects lane markings. If you drift out of lane without signalling, the system vibrates the steering wheel.</p><h2>The Verdict</h2><p>ADAS is an assistant, not a savior. Do not buy it expecting autonomy.</p>",
//     image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
//     author: "Tahseen Raza",
//     date: "2025-01-14",
//     readTime: "6 min read",
//     tags: ["ADAS", "Lane Keep Assist", "Safety"]
//   },
//   {
//     id: 3,
//     title: "Can Your FWD Car Handle Spiti in Winter? The Honest Answer",
//     slug: "fwd-car-spiti-winter",
//     category: "Feature Reviews",
//     subCategory: "Winter Driving",
//     excerpt: "A practical review of how Front-Wheel Drive vehicles perform in extreme winter conditions.",
//     content: "<h2>The Story</h2><p>My colleague bought a Honda City FWD and planned a Spiti trip in December. On the Kaza road at 4,000 meters, heavy snow. His City got stuck.</p><h2>What Actually Matters in Spiti Winter</h2><p>1. Winter tires (most critical) 2. Driver experience 3. Ground clearance</p><h2>The Verdict</h2><p>Your tire choice matters 100 times more than FWD vs AWD.</p>",
//     image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=500&fit=crop",
//     author: "Tahseen Raza",
//     date: "2025-01-13",
//     readTime: "7 min read",
//     tags: ["FWD", "Winter Driving", "Spiti"]
//   },
//   {
//     id: 4,
//     title: "Best Tyres for Long Highway Drives — What Nobody Tells You",
//     slug: "best-highway-tyres",
//     category: "Feature Reviews",
//     subCategory: "Tyres",
//     excerpt: "An in-depth review of what actually matters when choosing tyres for long-distance highway travel.",
//     content: "<h2>The Story</h2><p>I drove Mumbai to Goa on Michelin tyres. ₹18,000 per tyre. My friend drove on Apollo tyres. ₹8,500 per tyre. We both reached Goa safely.</p><h2>The Verdict</h2><p>Budget guideline: ₹8,000 to ₹12,000 per tyre is the sweet spot for Indian highways.</p>",
//     image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop",
//     author: "Tahseen Raza",
//     date: "2025-01-12",
//     readTime: "5 min read",
//     tags: ["Tyres", "Highway Driving", "Maintenance"]
//   }
// ]

// // New Launches
// export const newLaunches = [
//   {
//     id: 101,
//     title: "2026 Hyundai Creta Launch",
//     slug: "hyundai-creta-2026-launch",
//     category: "New Launches",
//     excerpt: "Coming soon. The next generation Hyundai Creta is expected with major updates.",
//     content: "<h2>Coming Soon</h2><p>More details will be added shortly.</p>",
//     image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "Coming Soon",
//     readTime: "2 min read",
//     tags: ["Hyundai", "Creta", "Upcoming"],
//     status: "coming-soon"
//   },
//   {
//     id: 102,
//     title: "New Kia Seltos 2026",
//     slug: "kia-seltos-2026",
//     category: "New Launches",
//     excerpt: "Coming soon. Kia's best-selling SUV gets a major refresh.",
//     content: "<h2>Coming Soon</h2><p>More details will be added shortly.</p>",
//     image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "Coming Soon",
//     readTime: "2 min read",
//     tags: ["Kia", "Seltos", "Upcoming"],
//     status: "coming-soon"
//   }
// ]

// // Tech Insights
// export const techInsights = [
//   {
//     id: 201,
//     title: "What is ADAS? Complete Guide",
//     slug: "what-is-adas",
//     category: "Tech Insights",
//     subCategory: "ADAS",
//     excerpt: "Advanced Driver Assistance Systems explained simply.",
//     content: "<h2>What is ADAS?</h2><p>ADAS stands for Advanced Driver Assistance Systems. It's a collection of electronic systems that help drivers with safety and parking.</p><h2>Common ADAS Features</h2><ul><li>Automatic Emergency Braking (AEB)</li><li>Adaptive Cruise Control (ACC)</li><li>Lane Keep Assist (LKA)</li></ul>",
//     image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "2025-01-10",
//     readTime: "6 min read",
//     tags: ["ADAS", "Safety", "Guide"]
//   },
//   {
//     id: 202,
//     title: "What is ABS? How Anti-lock Braking System Works",
//     slug: "what-is-abs",
//     category: "Tech Insights",
//     subCategory: "Braking Systems",
//     excerpt: "Complete guide to ABS - how it works and why it's important.",
//     content: "<h2>What is ABS?</h2><p>ABS stands for Anti-lock Braking System. It prevents wheels from locking up during emergency braking.</p><h2>Why ABS Exists</h2><p>When you brake hard on a slippery road, your wheels can lock up. ABS prevents this.</p>",
//     image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "2025-01-09",
//     readTime: "5 min read",
//     tags: ["ABS", "Braking", "Safety"]
//   },
//   {
//     id: 203,
//     title: "What is EBD? Electronic Brakeforce Distribution Explained",
//     slug: "what-is-ebd",
//     category: "Tech Insights",
//     subCategory: "Braking Systems",
//     excerpt: "Learn how EBD works with ABS to distribute braking force.",
//     content: "<h2>What is EBD?</h2><p>EBD stands for Electronic Brakeforce Distribution. It works with ABS to distribute braking force optimally.</p>",
//     image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "2025-01-08",
//     readTime: "4 min read",
//     tags: ["EBD", "Braking", "Safety"]
//   },
//   {
//     id: 204,
//     title: "What is ESC? Electronic Stability Control Explained",
//     slug: "what-is-esc",
//     category: "Tech Insights",
//     subCategory: "Stability Systems",
//     excerpt: "Complete guide to ESC - how it prevents skids.",
//     content: "<h2>What is ESC?</h2><p>ESC stands for Electronic Stability Control. It automatically applies brakes to individual wheels when it detects loss of steering control.</p>",
//     image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
//     author: "Vaahan Team",
//     date: "2025-01-07",
//     readTime: "5 min read",
//     tags: ["ESC", "Stability Control", "Safety"]
//   }
// ]

// // Combine all articles
// export const allArticles = [...featureReviews, ...newLaunches, ...techInsights]

// // Get article by slug - FIXED
// export const getArticleBySlug = (slug) => {
//   if (!slug) return null
//   const found = allArticles.find(article => article.slug === slug)
//   console.log("Searching for slug:", slug)
//   console.log("Found article:", found)
//   return found || null
// }

// // Get articles by category
// export const getArticlesByCategory = (categoryName) => {
//   if (categoryName === "Feature Reviews") return featureReviews
//   if (categoryName === "New Launches") return newLaunches
//   if (categoryName === "Tech Insights") return techInsights
//   return allArticles
// }

// // Get all categories
// export const getCategories = () => {
//   return [
//     { id: 1, name: "Feature Reviews", icon: "📝", count: featureReviews.length },
//     { id: 2, name: "New Launches", icon: "🚗", count: newLaunches.length },
//     { id: 3, name: "Tech Insights", icon: "💡", count: techInsights.length }
//   ]
// }

// // Search articles
// export const searchArticles = (query) => {
//   if (!query || query.trim() === "") return allArticles
//   const searchTerm = query.toLowerCase().trim()
//   return allArticles.filter(article => 
//     article.title.toLowerCase().includes(searchTerm) ||
//     (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm)) ||
//     (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
//   )
// }


// src/data/articlesData.js
/*
================================================================================
File Name : articlesData.js
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Complete articles database with full content from PDF
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

// Feature Reviews Articles (Complete from PDF)
export const featureReviews = [
  {
    id: 1,
    title: "AWD vs FWD: The ₹2 Lakh Question Nobody Answers Honestly",
    slug: "awd-vs-fwd",
    category: "Feature Reviews",
    subCategory: "Drivetrain Comparison",
    excerpt: "A practical comparison between AWD and FWD systems for Indian roads. Understand when AWD provides real advantages and whether spending an extra ₹2 lakh is justified.",
    content: `
      <div class="article-content">
        <h2>The Story</h2>
        <p>My friend paid ₹2 lakhs extra for AWD on his Fortuner. His reasoning: "AWD is better. More traction. Safer."</p>
        <p>Six months later, monsoon season. Both of us stuck in the same waterlogged pothole on Mumbai's old airport road. My FWD Compass and his AWD Fortuner both couldn't move. We called the same tow truck.</p>
        <p>He asked me: "So why did I spend ₹2 lakhs extra?"</p>
        <p>I didn't have a good answer. Until I actually understood what AWD does and does not do.</p>

        <h2>The Dealer Pitch</h2>
        <p>"AWD is better traction. More grip. Safer in rain. Better handling. Get AWD."</p>
        <p>Partially true. Mostly misleading. And definitely not worth ₹2 lakhs for 95% of Indian car buyers.</p>

        <h2>What AWD Actually Does</h2>
        <p>FWD means front wheels have engine power. Rear wheels just roll.</p>
        <p>AWD means all four wheels have engine power. More wheels pushing equals more traction.</p>
        <p>When you accelerate on loose gravel or wet roads, FWD wheels spin and lose grip. AWD wheels grip better because all four are pushing.</p>
        <p><strong>Result:</strong> Faster acceleration in slippery conditions. Better initial grip. That is it.</p>

        <h2>What AWD Does NOT Do</h2>
        <ul>
          <li>Does NOT improve braking (brakes work on all wheels regardless)</li>
          <li>Does NOT improve handling in corners (weight and suspension matter more)</li>
          <li>Does NOT prevent skidding (friction with road is the limit)</li>
          <li>Does NOT work if ground is too slippery (loose gravel, mud all vehicles get stuck)</li>
          <li>Does NOT make you safer in rain (ABS and tires matter more)</li>
        </ul>
        <p>AWD helps you accelerate in slippery conditions. That is all it does.</p>

        <h2>When Does AWD Actually Help?</h2>
        <ul>
          <li><strong>Dirt/gravel roads:</strong> AWD accelerates better than FWD on unmade roads</li>
          <li><strong>Wet grass/muddy fields:</strong> More wheels equals better initial grip</li>
          <li><strong>Hill climbing on loose terrain:</strong> Slight advantage</li>
        </ul>

        <h2>When is AWD Useless?</h2>
        <ul>
          <li><strong>Asphalt roads (paved):</strong> FWD and AWD perform identically in rain</li>
          <li><strong>Highways:</strong> No difference</li>
          <li><strong>Heavy rain:</strong> Both get stuck in waterlogged roads</li>
          <li><strong>City driving:</strong> Completely irrelevant</li>
          <li><strong>Braking:</strong> AWD has zero advantage</li>
        </ul>

        <div class="highlight-box">
          <h3>Indian Road Reality</h3>
          <p><strong>Honest truth:</strong> 90% of Indian driving is on asphalt. On asphalt, AWD vs FWD makes almost zero difference.</p>
          <p>You are paying ₹2 lakhs for a feature that helps you accelerate 3 to 4 times per year on dirt roads or during monsoon. On asphalt where you drive 90% of the time, you get zero benefit.</p>
        </div>

        <h2>The Real Problem AWD Solves</h2>
        <p>AWD solves one specific problem: <strong>getting unstuck from soft terrain.</strong></p>
        <p>If you regularly drive on unpaved roads, muddy/wet grass, beach sand, or forest trails, then AWD is worth it. You genuinely need it.</p>
        <p>But if you drive city to highway to city (99% of Indian car buyers) or monsoon season (just stay in lane, reduce speed, both FWD and AWD get stuck in waterlogged roads equally), then AWD is a luxury, not a necessity.</p>

        <div class="verdict-box">
          <h2>The Verdict</h2>
          <p><strong>Should you pay ₹2 lakhs extra for AWD?</strong></p>
          <p><strong>No, not for 95% of Indian buyers.</strong></p>
          <p><strong>Pay extra ONLY if:</strong> You regularly drive on unpaved roads, hunt, trek, or need off-road capability, or live in hilly/muddy terrain.</p>
          <p><strong>Skip it if:</strong> You mostly drive paved roads, do city commute or highway driving, or your budget is tight.</p>
          <p><strong>Better use ₹2 lakhs on good tires and regular maintenance.</strong></p>
          <p>Your tires matter 100 times more than AWD. A FWD car with good Michelin tires outperforms an AWD car with cheap tires in rain.</p>
          <p><strong>Spend your money on good tires, not AWD.</strong></p>
        </div>
      </div>
    `,
    image: "/AWDvsFWD.png",
    author: "Tahseen Raza",
    date: "January 15, 2025",
    readTime: "8 min read",
    tags: ["AWD", "FWD", "Drivetrain", "Comparison", "Buying Guide"]
  },
  {
    id: 2,
    title: "ADAS Lane Keep Assist: Why It Failed Me on an Indian Highway",
    slug: "adas-lane-keep-assist",
    category: "Feature Reviews",
    subCategory: "ADAS Review",
    excerpt: "A real-world review of ADAS Lane Keep Assist technology on Indian roads. Learn where it helps and where it fails.",
    content: `
      <div class="article-content">
        <h2>The Story</h2>
        <p>1 PM, Mumbai Pune expressway. 4 hours of driving. Eyes drooping. Road monotonous. My eyelids drop for one second.</p>
        <p>The steering wheel vibrates. Firm. Like the car is tapping me saying: "You drifted. Come back."</p>
        <p>I jolt awake. Correct steering. Vibration stops.</p>
        <p>That was lane keep assist. But here is what happened 50 km later.</p>
        <p>Rain started. Heavy. Windshield wipers on full. ADAS disabled itself. No warning. Just disappeared. My eyes, now heavy again with no ADAS safety net, nearly drifted twice before I stopped driving.</p>

        <h2>The Dealer Promise</h2>
        <p>"The car has lane keep assist. The car automatically stays in its lane. Self driving technology."</p>
        <p><strong>Not true.</strong> And dangerous to believe.</p>

        <h2>What Lane Keep Assist Actually Does</h2>
        <p>Camera on windshield watches road. Detects lane markings. If you drift out of lane without signalling, the system either:</p>
        <ol>
          <li>Vibrates the steering wheel to alert you, OR</li>
          <li>Applies a small correction to nudge the car back</li>
        </ol>
        <p>You maintain control. The system assists. If you want to change lanes, your input overrides it.</p>

        <h2>What It Does NOT Do</h2>
        <ul>
          <li>Does NOT drive the car</li>
          <li>Does NOT prevent collisions</li>
          <li>Does NOT work in heavy rain/fog (camera can't see)</li>
          <li>Does NOT work without lane markings</li>
          <li>Does NOT replace paying attention</li>
        </ul>
        <p>It is a warning system. Nothing more.</p>

        <div class="highlight-box">
          <h3>Indian Road Reality</h3>
          <ul>
            <li><strong>Faded lane markings:</strong> Camera cannot detect missing lines</li>
            <li><strong>No lane discipline:</strong> Indian traffic moves freely between lanes. ADAS gets confused</li>
            <li><strong>Heavy rain:</strong> Camera goes blind. ADAS disables</li>
            <li><strong>Fog:</strong> Same problem</li>
            <li><strong>Potholes:</strong> Camera designed for smooth European highways</li>
          </ul>
          <p>ADAS is designed for European roads. Most Indian highways it fails.</p>
          <p><strong>Real scenario:</strong> On Delhi Agra highway, lane markings ended for 20km. ADAS shut off completely. When markings reappeared, it turned back on.</p>
        </div>

        <div class="verdict-box">
          <h2>The Verdict</h2>
          <p><strong>Should you pay extra for lane keep assist?</strong></p>
          <p><strong>Only if:</strong> You drive 500+ km on well-marked highways regularly, drive late at night (fatigue management), or use specific highways like Mumbai Pune with good markings.</p>
          <p><strong>Skip if:</strong> You do city driving (useless), monsoon season (camera blocked), or most Indian highways (poor markings).</p>
          <p><strong>Important:</strong> ADAS is an assistant, not a savior. If you expect it to keep you safe while you doze off, you are wrong. It will fail in rain. It will fail in fog. It will fail on poorly marked roads.</p>
          <p>Do not buy it expecting autonomy. Buy it only if you understand its limits and you still find 40% reliability useful on specific highways.</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
    author: "Tahseen Raza",
    date: "January 14, 2025",
    readTime: "6 min read",
    tags: ["ADAS", "Lane Keep Assist", "Safety Technology", "Driver Assistance"]
  },
  {
    id: 3,
    title: "Can Your FWD Car Handle Spiti in Winter? The Honest Answer",
    slug: "fwd-car-spiti-winter",
    category: "Feature Reviews",
    subCategory: "Winter Driving",
    excerpt: "A practical review of how Front-Wheel Drive vehicles perform in extreme winter conditions at 4,000 meters altitude.",
    content: `
      <div class="article-content">
        <h2>The Story</h2>
        <p>My colleague bought a Honda City FWD and immediately planned a Spiti trip in December. His logic: "Modern cars are advanced. FWD should handle it fine."</p>
        <p>Three days into the trip, on the Kaza road at 4,000 meters altitude, heavy snow. His City got stuck on a relatively mild slope. A Mahindra XUV500 AWD sailed past. He spent 4 hours waiting for a local jeep to pull him out.</p>
        <p>When he got back, he asked: "Why didn't FWD work in snow when it works fine in monsoon rain?"</p>
        <p>Good question. And the answer will save you from making the same mistake.</p>

        <h2>The Dealer Promise</h2>
        <p>"FWD works in all weather. Rain, snow, mud. Modern FWD cars can go anywhere."</p>
        <p>Technically true. Practically dangerous. There is a massive difference between handling rain and handling winter at 4,000 meters altitude.</p>

        <h2>What Changes in Extreme Cold and Snow</h2>
        <p><strong>In monsoon rain on asphalt, your FWD car grips fine because:</strong></p>
        <ul>
          <li>Road surface is still mostly solid asphalt</li>
          <li>Temperature is 25 to 30 degrees</li>
          <li>Tire rubber remains flexible</li>
        </ul>
        <p><strong>In Spiti winter at 4,000 meters:</strong></p>
        <ul>
          <li>Road surface is ice and packed snow (zero grip compared to asphalt)</li>
          <li>Temperature is -10 to -20 degrees</li>
          <li>Tire rubber becomes hard and brittle (loses all flexibility)</li>
          <li>Engine loses power (oxygen is thinner at altitude)</li>
          <li>Brakes become unpredictable (ice is unpredictable)</li>
        </ul>
        <p>FWD advantage (better acceleration traction) becomes completely irrelevant because the road surface itself has zero grip.</p>

        <div class="highlight-box">
          <h3>The Physics Nobody Explains</h3>
          <p>FWD helps you accelerate better on loose surfaces. But in Spiti winter, acceleration is not your problem. <strong>Stopping and steering are.</strong></p>
          <p>When you brake on ice, all four wheels are fighting the same battle: maintaining grip on ice. FWD has zero advantage here.</p>
          <p>When you go around a corner on ice, weight and suspension matter infinitely more than drive wheels. FWD has zero advantage.</p>
          <p>You are stuck on ice because the ice itself has no grip. More wheels pushing does not help when the road is ice.</p>
        </div>

        <h2>Indian Road Reality</h2>
        <p>Spiti winter roads are not "snowy roads." They are <strong>ice roads.</strong> Packed snow turns to black ice under repeated traffic. Black ice is essentially a skating rink.</p>
        <p><strong>Your FWD car can:</strong></p>
        <ul>
          <li>Handle snow on asphalt (monsoon + mountains with good grip): Yes</li>
          <li>Handle unpaved muddy roads: Yes</li>
          <li>Handle packed snow on the first day of snowfall: Yes</li>
          <li>Handle black ice after traffic packed it: No</li>
        </ul>
        <p>The roads from Kaza to Tabo, Tabo to Dhankar, Dhankar to Kinnaur during December to February are black ice. Not snow. Not slush. Ice.</p>
        <p>A FWD car cannot handle black ice any better than a RWD car. AWD helps because it has four wheels pushing instead of two. But even AWD struggles on pure ice.</p>

        <div class="verdict-box">
          <h2>What Actually Matters in Spiti Winter</h2>
          <ol>
            <li><strong>Winter tires (not all season tires):</strong> Most critical</li>
            <li><strong>Driver experience (someone who has driven ice roads):</strong> Second most critical</li>
            <li><strong>Ground clearance (Spiti has snow drifts):</strong> Third</li>
            <li><strong>4WD (not just AWD):</strong> Fourth</li>
          </ol>
          <p><strong>FWD vs AWD ranking: Last.</strong></p>
          <p>A FWD City with winter tires and a good driver beats a 4WD Bolero with all season tires and a bad driver.</p>
        </div>

        <div class="verdict-box">
          <h2>The Verdict</h2>
          <p><strong>Can your FWD car handle Spiti in winter?</strong></p>
          <p>Technically yes. Practically risky.</p>
          <p><strong>DO NOT go if:</strong> You have all season tires (get winter tires first), you have zero experience driving on ice, you are alone (get an experienced driver)</p>
          <p><strong>CAN go if:</strong> You have winter tires installed, you have driven ice roads before OR someone experienced is driving, you drive slowly and carefully, you are mentally prepared for slow speeds (10-15 km/h in bad sections)</p>
          <p><strong>Honest truth:</strong> Your tire choice matters 100 times more than FWD vs AWD. A FWD car with winter tires will beat an AWD car with all season tires on ice.</p>
          <p><strong>Do not skip Spiti because you have FWD. Just get winter tires and a good driver.</strong></p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=500&fit=crop",
    author: "Tahseen Raza",
    date: "January 13, 2025",
    readTime: "7 min read",
    tags: ["FWD", "Winter Driving", "Spiti Valley", "Road Trip"]
  },
  {
    id: 4,
    title: "Best Tyres for Long Highway Drives — What Nobody Tells You",
    slug: "best-highway-tyres",
    category: "Feature Reviews",
    subCategory: "Tyres",
    excerpt: "An in-depth review of what actually matters when choosing tyres for long-distance highway travel in India.",
    content: `
      <div class="article-content">
        <h2>The Story</h2>
        <p>I drove Mumbai to Goa on Michelin tyres. Smooth, quiet, expensive. ₹18,000 per tyre.</p>
        <p>My friend drove the same route on Apollo tyres. Rough, noisier, half the price. ₹8,500 per tyre.</p>
        <p>We both reached Goa safely. Both tyres performed identically on the highway. Both lasted 3 years.</p>
        <p>When he asked me why I spent double, I realized I had been sold a brand, not a tyre. Expensive marketing, not engineering superiority.</p>

        <h2>The Dealer Pitch</h2>
        <p>"Buy Michelin. Premium international brand. Best grip. Safest for highways. Worth the money."</p>
        <p>True that Michelin is good. False that it is the only good option. Misleading that expensive means safer.</p>

        <div class="highlight-box">
          <h3>What Actually Matters for Highway Tyres</h3>
          <p>For long highway drives, you need:</p>
          <ol>
            <li><strong>Grip (traction on wet asphalt):</strong> Matters most</li>
            <li><strong>Sidewall strength (handles potholes without bursting):</strong> Matters a lot</li>
            <li><strong>Rolling resistance (affects fuel economy minimally):</strong> Matters a little</li>
            <li><strong>Tread depth (how much rubber is left):</strong> Matters critically</li>
            <li><strong>Brand reputation:</strong> Matters least</li>
          </ol>
          <p>A ₹9,000 Apollo tyre with good grip and strong sidewalls outperforms a ₹18,000 Michelin with worn tread depth.</p>
        </div>

        <h2>What Does NOT Matter</h2>
        <p>Brand name alone does not matter. Marketing matters.</p>
        <p>Michelin spends ₹500 crores on advertising. That cost is built into your tyre price. You are partly paying for their ads, not engineering.</p>
        <p>Tyre quality varies more by tread pattern than by brand. A good Apollo tyre beats a mediocre Michelin.</p>
        <p>Fuel efficiency claims are mostly marketing. The difference between "fuel efficient" and regular tyres is 1 to 2 kilometers per liter. On a ₹500 litre full tank, you save ₹50. Yearly savings: ₹500. Tyre cost difference: ₹5,000 to ₹10,000. The math does not work.</p>

        <h2>Indian Road Reality</h2>
        <p>Indian highways have:</p>
        <ul>
          <li>Potholes that tear tyres</li>
          <li>Gravel patches that wear tyres faster</li>
          <li>Heavy truck traffic that kicks gravel at your car</li>
          <li>Poor road quality that affects tyre life more than brand</li>
        </ul>
        <p>On these roads, tyre quality matters. But you get good quality from Apollo, CEAT, MRF, JK, Bridgestone, and yes, Michelin.</p>
        <p><strong>You do NOT need to spend ₹18,000 for safety. ₹9,000 to ₹12,000 gets you excellent highway performance.</strong></p>
        <p>Real data: Michelin and Apollo have similar burst rates on Indian highways. Both perform well. Price difference is marketing, not engineering.</p>

        <div class="highlight-box">
          <h3>What ACTUALLY Makes You Safe</h3>
          <ol>
            <li><strong>Tyre pressure (correct PSI):</strong> Most critical. Check every month.</li>
            <li><strong>Tread depth (at least 2mm):</strong> Second most critical. Check visually.</li>
            <li><strong>Rotation every 20,000 km:</strong> Third. Extends tyre life by 30%</li>
            <li><strong>Alignment and balance:</strong> Fourth. Improves handling and life.</li>
            <li><strong>Tyre brand:</strong> Least critical (as long as it is from a reputable manufacturer).</li>
          </ol>
          <p>I have seen people driving Michelin tyres at wrong pressure (under inflated by 3 PSI) who perform worse than people driving Apollo tyres at correct pressure.</p>
        </div>

        <div class="verdict-box">
          <h2>The Verdict</h2>
          <p><strong>What are the best tyres for long highway drives?</strong></p>
          <p>Any tyre from these brands: Apollo, CEAT, JK, MRF, Bridgestone, or Michelin in that order of value for money.</p>
          <p><strong>Skip:</strong> Unknown Chinese brands, copied brands, tyres that are 5+ years old in storage.</p>
          <p><strong>Budget guideline:</strong> ₹8,000 to ₹12,000 per tyre is the sweet spot for Indian highways. You get excellent grip, good durability, and strong sidewalls.</p>
          <p>Spending ₹18,000+ is fine if you want the premium feel and brand confidence. But it does NOT make you safer. Just more comfortable knowing you spent more.</p>
          <p><strong>Remember:</strong> Correct tyre pressure, regular rotation, timely replacement, and good driving habits matter 10 times more than spending extra on brand.</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop",
    author: "Tahseen Raza",
    date: "January 12, 2025",
    readTime: "5 min read",
    tags: ["Tyres", "Highway Driving", "Maintenance", "Safety"]
  }
];

// New Launches (Coming Soon)
export const newLaunches = [
  {
    id: 101,
    title: "2026 Hyundai Creta Launch",
    slug: "hyundai-creta-2026-launch",
    category: "New Launches",
    subCategory: "Upcoming SUV",
    excerpt: "Coming soon. The next generation Hyundai Creta is expected with major updates including ADAS, panoramic sunroof, and new engine options.",
    content: `
      <div class="article-content">
        <h2>2026 Hyundai Creta: What to Expect</h2>
        <p>The next-generation Hyundai Creta is expected to launch in late 2025 or early 2026. Here's what we know so far.</p>
        
        <h3>Expected Features</h3>
        <ul>
          <li>Level 2 ADAS with 5 cameras and 11 sensors</li>
          <li>Panoramic sunroof with ambient lighting</li>
          <li>12.3-inch dual display setup</li>
          <li>Alexa built-in connectivity</li>
          <li>Ventilated seats front and rear</li>
        </ul>
        
        <h3>Expected Powertrain</h3>
        <ul>
          <li>1.5L Turbo Petrol (160 bhp)</li>
          <li>1.5L Diesel (115 bhp)</li>
          <li>Electric version with 450+ km range</li>
        </ul>
        
        <div class="verdict-box">
          <h3>Expected Price & Launch Date</h3>
          <p><strong>Expected price:</strong> ₹11-20 lakh (ex-showroom)</p>
          <p><strong>Launch expected:</strong> Late 2025 - Early 2026</p>
          <p><strong>Bookings open:</strong> Mid 2025</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "Coming Soon",
    readTime: "3 min read",
    tags: ["Hyundai", "Creta", "Upcoming", "SUV"],
    status: "coming-soon"
  },
  {
    id: 102,
    title: "New Kia Seltos 2026",
    slug: "kia-seltos-2026",
    category: "New Launches",
    subCategory: "Upcoming SUV",
    excerpt: "Coming soon. Kia's best-selling SUV gets a major refresh with new design, features, and powertrain options.",
    content: `
      <div class="article-content">
        <h2>Kia Seltos 2026: What We Know</h2>
        <p>Kia is preparing a major update for the Seltos, expected to launch in 2026.</p>
        
        <h3>Expected Updates</h3>
        <ul>
          <li>Revised front and rear design</li>
          <li>Connected LED tail lamps</li>
          <li>Dual 10.25-inch screens</li>
          <li>Level 2 ADAS suite</li>
          <li>360-degree camera</li>
        </ul>
        
        <div class="verdict-box">
          <h3>Expected Launch Timeline</h3>
          <p><strong>Expected price:</strong> ₹10-19 lakh (ex-showroom)</p>
          <p><strong>Launch expected:</strong> 2026</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "Coming Soon",
    readTime: "2 min read",
    tags: ["Kia", "Seltos", "Upcoming", "SUV"],
    status: "coming-soon"
  }
];

// Tech Insights
export const techInsights = [
  {
    id: 201,
    title: "What is ADAS? Complete Guide",
    slug: "what-is-adas",
    category: "Tech Insights",
    subCategory: "ADAS",
    excerpt: "Advanced Driver Assistance Systems explained simply - how they work, benefits, and limitations on Indian roads.",
    content: `
      <div class="article-content">
        <h2>What is ADAS?</h2>
        <p>ADAS stands for <strong>Advanced Driver Assistance Systems</strong>. It's a collection of electronic systems that help drivers with safety and parking. ADAS uses cameras, radar, and sensors to detect obstacles, vehicles, and pedestrians.</p>
        
        <h3>How ADAS Works</h3>
        <p>Cameras and sensors mounted on your car continuously scan the road ahead. When the system detects a potential hazard, it alerts the driver. Some systems can even take automatic action like braking.</p>
        
        <h3>Common ADAS Features</h3>
        <ul>
          <li><strong>Automatic Emergency Braking (AEB):</strong> Brakes automatically to prevent collisions</li>
          <li><strong>Adaptive Cruise Control (ACC):</strong> Maintains safe distance from vehicle ahead</li>
          <li><strong>Lane Keep Assist (LKA):</strong> Warns when you drift out of lane</li>
          <li><strong>Blind Spot Monitoring (BSM):</strong> Alerts you to vehicles in blind spots</li>
          <li><strong>360 Degree Camera:</strong> Helps with parking and maneuvering</li>
        </ul>
        
        <div class="highlight-box">
          <h3>Benefits of ADAS</h3>
          <ul>
            <li>Reduces accidents by alerting drivers to dangers</li>
            <li>Helps prevent rear-end collisions</li>
            <li>Reduces driver fatigue on long journeys</li>
            <li>Makes parking easier with cameras</li>
          </ul>
        </div>
        
        <div class="verdict-box">
          <h3>Limitations on Indian Roads</h3>
          <ul>
            <li>Faded lane markings confuse lane keep assist</li>
            <li>Heavy rain can block cameras</li>
            <li>Two-wheelers lane-splitting can trigger false alerts</li>
            <li>Stray animals are not always detected</li>
          </ul>
          <p><strong>Verdict:</strong> ADAS is helpful but don't rely on it completely. Always pay attention to the road.</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "January 10, 2025",
    readTime: "6 min read",
    tags: ["ADAS", "Safety", "Guide", "Technology"]
  },
  {
    id: 202,
    title: "What is ABS? How Anti-lock Braking System Works",
    slug: "what-is-abs",
    category: "Tech Insights",
    subCategory: "Braking Systems",
    excerpt: "Complete guide to ABS - how it works, why it's important, and common myths debunked.",
    content: `
      <div class="article-content">
        <h2>What is ABS?</h2>
        <p>ABS stands for <strong>Anti-lock Braking System</strong>. It prevents wheels from locking up during emergency braking, allowing you to steer while braking hard. ABS is mandatory on all new cars in India since 2019.</p>
        
        <h3>Why ABS Exists</h3>
        <p>When you brake hard on a slippery road, your wheels can lock up. This causes your car to skid, and you lose steering control. ABS prevents this by pumping the brakes automatically.</p>
        
        <h3>How ABS Works</h3>
        <p>Sensors on each wheel detect when a wheel is about to lock up. The system then rapidly pulses the brakes (up to 15 times per second) to prevent skidding while maintaining maximum braking force.</p>
        
        <div class="highlight-box">
          <h3>Advantages of ABS</h3>
          <ul>
            <li>You can STEER while braking hard</li>
            <li>Stops faster on wet, slippery roads</li>
            <li>Prevents dangerous skidding</li>
            <li>Mandatory on all new cars in India since 2019</li>
          </ul>
        </div>
        
        <div class="verdict-box">
          <h3>Common Myths About ABS</h3>
          <ul>
            <li><strong>Myth:</strong> ABS always stops you faster. <strong>Truth:</strong> ABS's main job is to let you steer, not to stop faster.</li>
            <li><strong>Myth:</strong> You should pump the brakes with ABS. <strong>Truth:</strong> Just brake hard and let ABS work.</li>
          </ul>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "January 9, 2025",
    readTime: "5 min read",
    tags: ["ABS", "Braking", "Safety", "Guide"]
  },
  {
    id: 203,
    title: "What is EBD? Electronic Brakeforce Distribution Explained",
    slug: "what-is-ebd",
    category: "Tech Insights",
    subCategory: "Braking Systems",
    excerpt: "Learn how EBD works with ABS to distribute braking force intelligently between wheels.",
    content: `
      <div class="article-content">
        <h2>What is EBD?</h2>
        <p>EBD stands for <strong>Electronic Brakeforce Distribution</strong>. It works with ABS to distribute braking force optimally between front and rear wheels based on vehicle load and road conditions.</p>
        
        <h3>How EBD Works</h3>
        <p>Sensors detect how much weight is on each wheel. If the rear is lightly loaded (like when you're alone in the car), EBD reduces rear brake pressure to prevent skidding. If the car is fully loaded, EBD increases rear brake pressure for maximum stopping power.</p>
        
        <div class="highlight-box">
          <h3>Benefits of EBD</h3>
          <ul>
            <li>Shorter stopping distances regardless of vehicle load</li>
            <li>Prevents rear wheel skid during braking</li>
            <li>Improves stability during emergency braking</li>
            <li>Works automatically with ABS</li>
          </ul>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "January 8, 2025",
    readTime: "4 min read",
    tags: ["EBD", "Braking", "Safety", "Guide"]
  },
  {
    id: 204,
    title: "What is ESC? Electronic Stability Control Explained",
    slug: "what-is-esc",
    category: "Tech Insights",
    subCategory: "Stability Systems",
    excerpt: "Complete guide to ESC - how it prevents skids and why it's essential for SUV owners.",
    content: `
      <div class="article-content">
        <h2>What is ESC?</h2>
        <p>ESC stands for <strong>Electronic Stability Control</strong>. It automatically applies brakes to individual wheels when it detects loss of steering control, helping you stay on your intended path.</p>
        
        <h3>How ESC Works</h3>
        <p>Sensors monitor your steering wheel angle and the car's actual direction. If the car isn't following your steering (oversteer or understeer), ESC applies brakes to specific wheels to correct the car's path.</p>
        
        <div class="highlight-box">
          <h3>When ESC is Most Valuable</h3>
          <ul>
            <li>Taking turns too fast on wet roads</li>
            <li>Avoiding sudden obstacles on highways</li>
            <li>Driving on hilly, winding roads</li>
            <li>SUVs and tall vehicles (higher rollover risk)</li>
          </ul>
        </div>
        
        <div class="verdict-box">
          <h3>ESC vs Traction Control</h3>
          <p>Traction Control prevents wheel spin during acceleration. ESC prevents skidding during turns. <strong>You need both for maximum safety.</strong></p>
          <p>ESC reduces single-vehicle crash risk by 50%. If you drive an SUV or live in a hilly area, ESC is non-negotiable.</p>
        </div>
      </div>
    `,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop",
    author: "Vaahan Team",
    date: "January 7, 2025",
    readTime: "5 min read",
    tags: ["ESC", "Stability Control", "Safety", "Guide"]
  }
];

// Combine all articles
export const allArticles = [...featureReviews, ...newLaunches, ...techInsights];

// Get article by slug
export const getArticleBySlug = (slug) => {
  if (!slug) return null;
  return allArticles.find(article => article.slug === slug) || null;
};

// Get articles by category
export const getArticlesByCategory = (categoryName) => {
  if (categoryName === "Feature Reviews") return featureReviews;
  if (categoryName === "New Launches") return newLaunches;
  if (categoryName === "Tech Insights") return techInsights;
  return allArticles;
};

// Get all categories
export const getCategories = () => {
  return [
    { id: 1, name: "Feature Reviews", count: featureReviews.length },
    { id: 2, name: "New Launches", count: newLaunches.length },
    { id: 3, name: "Tech Insights", count: techInsights.length }
  ];
};

// Search articles
export const searchArticles = (query) => {
  if (!query || query.trim() === "") return allArticles;
  const searchTerm = query.toLowerCase().trim();
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm)) ||
    (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  );
};