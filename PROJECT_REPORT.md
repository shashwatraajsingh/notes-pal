# Notes Pal - Comprehensive Project Report

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Problem Statement](#3-problem-statement)
4. [Solution & Features](#4-solution--features)
5. [Technical Architecture](#5-technical-architecture)
6. [System Design](#6-system-design)
7. [Database Schema](#7-database-schema)
8. [Technology Stack](#8-technology-stack)
9. [Key Modules](#9-key-modules)
10. [Scalability & Performance](#10-scalability--performance)
11. [Security Features](#11-security-features)
12. [Minimum Sellable Product (MSP)](#12-minimum-sellable-product-msp)
13. [Future Enhancements](#13-future-enhancements)
14. [Conclusion](#14-conclusion)

---

## 1. Executive Summary

**Notes Pal** is a comprehensive web-based learning management platform designed specifically for engineering students. Built with modern web technologies, it provides an integrated ecosystem for accessing study notes, taking quizzes, using flashcards, and getting AI-powered study assistance.

The platform addresses the critical gap in organized, accessible, and interactive study materials for B.Tech students, offering a premium subscription model with tiered access to content.

**Key Highlights:**
- 🎓 University-specific content organization (ABES EC, AKTU)
- 📚 Comprehensive notes, PYQs, and one-shot materials
- 🧠 AI-powered study assistant with subject-specific context
- 💳 Premium subscription with Razorpay integration
- 👥 Referral and reward system
- 📊 Interactive quizzes and flashcards

---

## 2. Project Overview

### 2.1 What is Notes Pal?

Notes Pal is a **Next.js-based learning platform** that centralizes educational resources for engineering students. It combines:

1. **Content Management** - Sanity CMS for rich text notes with LaTeX support
2. **Interactive Learning** - Quizzes and flashcards with progress tracking
3. **AI Assistance** - Google Gemini-powered chatbot for personalized help
4. **Monetization** - Three-tier premium subscription system

### 2.2 Target Audience

- B.Tech students (CSE, IT branches)
- Students from ABES Engineering College and AKTU-affiliated institutions
- Engineering students seeking organized study materials

### 2.3 Project Statistics

| Metric | Value |
|--------|-------|
| Total Dependencies | 90+ packages |
| Database Models | 20+ |
| API Endpoints | 50+ |
| React Components | 100+ |
| Supported Universities | 2 (ABES EC, AKTU) |
| Supported Degrees | 2 (B.Tech CSE, B.Tech IT) |
| Academic Years | 4 (1st to 4th Year) |
| Semesters | 8 (1st to 8th) |

---

## 3. Problem Statement

### 3.1 Current Challenges Faced by Students

1. **Fragmented Resources** - Study materials scattered across WhatsApp groups, PDFs, and websites
2. **Quality Issues** - Unreliable notes with errors and outdated content
3. **No Interactivity** - Static PDFs without self-assessment tools
4. **Lack of AI Support** - No personalized study assistance
5. **Poor Organization** - Difficulty finding semester/subject-specific content

### 3.2 Market Gap

Existing platforms either:
- Provide generic content not tailored to specific universities
- Lack interactive features like quizzes and flashcards
- Don't integrate AI-powered study assistance
- Have poor user experience and outdated designs

---

## 4. Solution & Features

### 4.1 Core Features

#### 📚 Notes Management System
- **Rich Text Notes** - LaTeX support for mathematical equations
- **Content Types** - Notes, MST (Mid-Semester Tests), PYQs (Previous Year Questions), One-Shots, Video Materials, Handwritten Notes
- **Academic Filtering** - Filter by university, degree, year, semester, subject
- **Premium Content** - Tiered access control for exclusive materials

#### 🧪 Quiz System
- **Interactive Quizzes** - Multiple choice questions with explanations
- **Randomization** - Question and option order randomized per attempt
- **Time Tracking** - Optional time limits with performance analytics
- **Score Tracking** - Accuracy percentage and marks calculation
- **Progress History** - Complete attempt history for each user

#### 📇 Flashcard System
- **Flip Cards** - Front/back card interface for memorization
- **Set Organization** - Cards organized into subject-specific sets
- **Visit Tracking** - Track user engagement with each card set
- **Premium Access** - Tier-based access to flashcard sets

#### 🤖 AI Study Assistant
- **Google Gemini Integration** - Powered by Gemini 2.0 Flash
- **Subject-Specific Context** - AI understands the student's current subject
- **Chat History** - Persistent conversation history
- **Academic Context** - Responses tailored to university/semester level

#### 💰 Premium Subscription System
- **Three-Tier Model** - TIER_1, TIER_2, TIER_3 with increasing access
- **Razorpay Integration** - Secure payment processing
- **Duration Options** - 30, 90, 365 day subscriptions
- **Coupon System** - Discount codes with usage limits
- **Upgrade Path** - Seamless tier upgrades

#### 👥 Referral & Wallet System
- **Unique Referral Codes** - Each user gets a shareable code
- **Referrer Rewards** - Wallet credits for successful referrals
- **Referee Discounts** - New users get discounts via referral
- **Wallet Balance** - Accumulated credits usable for purchases

#### 👤 User Management
- **Google OAuth** - One-click sign-in with Google
- **Onboarding Flow** - Academic profile setup on first login
- **Profile Management** - Edit academic details anytime
- **Device Fingerprinting** - Multi-device login tracking

#### 🛡️ Admin Panel
- **Content Management** - CRUD operations for notes, quizzes, flashcards
- **User Management** - View, block, grant premium to users
- **Analytics Dashboard** - Purchase history, user statistics
- **Bulk Import** - CSV import for quizzes and content

---

## 5. Technical Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │   Pages    │  │ Components │  │   React Hooks      │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Next.js API Routes                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │   Auth     │  │  Premium   │  │     AI Chat        │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER (DAL)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │   │
│  │  │  Notes  │  │  Quiz   │  │ Premium │  │  Referral   │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌────────────────────┐           ┌──────────────────────────┐  │
│  │    PostgreSQL      │           │      Sanity CMS          │  │
│  │  (User Data, Auth, │           │  (Notes Content,         │  │
│  │   Premium, Quiz)   │           │   Rich Text, Media)      │  │
│  └────────────────────┘           └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Razorpay   │  │ Google OAuth │  │   Google Gemini AI  │   │
│  │  (Payments)  │  │    (Auth)    │  │     (Chatbot)       │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/            # Admin dashboard routes
│   ├── (auth)/             # Authentication pages
│   ├── (staticPages)/      # Static pages (About, Terms, etc.)
│   ├── (user)/             # User dashboard routes
│   ├── api/                # API endpoints
│   └── studio/             # Sanity Studio integration
├── cache/                  # Caching utilities
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── ai/                 # AI chat components
│   ├── landing/            # Landing page sections
│   ├── note/               # Note display components
│   ├── premium/            # Premium purchase flow
│   ├── quiz/               # Quiz system
│   └── ui/                 # shadcn/ui components
├── dal/                    # Data Access Layer
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── sanity/                 # Sanity CMS configuration
└── utils/                  # Utility functions
```

---

## 6. System Design

### 6.1 Authentication Flow

```
User clicks "Sign in with Google"
         │
         ▼
┌─────────────────────────┐
│   Google OAuth 2.0      │
│   (Consent Screen)      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Better Auth Callback  │
│   /api/auth/callback    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Check if User Exists  │
└─────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
  Yes        No
    │         │
    │    ┌────┴────────────┐
    │    │ Create User +   │
    │    │ Redirect to     │
    │    │ Onboarding      │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────┐
│   Create Session +      │
│   Device Fingerprint    │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Redirect to Dashboard │
└─────────────────────────┘
```

### 6.2 Premium Purchase Flow

```
User selects Premium Tier
         │
         ▼
┌─────────────────────────┐
│   Apply Coupon/Referral │
│   (Optional)            │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Calculate Final Price │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Create Razorpay Order │
│   (Server-side)         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Open Razorpay Modal   │
│   (Client-side)         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   User Completes Payment│
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Razorpay Webhook      │
│   /api/premium/webhook  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Verify Payment        │
│   Activate Premium      │
│   Process Referral      │
└─────────────────────────┘
```

### 6.3 Quiz Attempt Flow

```
User starts Quiz
         │
         ▼
┌─────────────────────────┐
│   Generate Random Seeds │
│   for Q & Option Order  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Create QuizAttempt    │
│   status: IN_PROGRESS   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   User Answers Questions│
│   (Auto-save per Q)     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Submit Quiz           │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Calculate Score       │
│   Update Attempt Status │
│   status: COMPLETED     │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Display Results       │
│   with Explanations     │
└─────────────────────────┘
```

---

## 7. Database Schema

### 7.1 Entity Relationship Overview

The database uses **PostgreSQL** with **Prisma ORM**. Here are the key models:

#### User & Authentication Models
| Model | Purpose |
|-------|---------|
| `User` | Core user entity with profile, premium status, wallet |
| `Session` | User login sessions with token management |
| `Account` | OAuth provider accounts (Google) |
| `UserProfile` | Academic details (university, degree, year, semester) |
| `DeviceFingerprint` | Multi-device login tracking |

#### Premium & Payment Models
| Model | Purpose |
|-------|---------|
| `PremiumPurchase` | Records of premium subscriptions |
| `PurchaseDiscount` | Discounts applied to purchases |
| `DiscountCoupon` | Coupon codes for discounts |
| `ReferralProgram` | Active referral program configuration |
| `ReferralReward` | Rewards given for referrals |

#### Quiz System Models
| Model | Purpose |
|-------|---------|
| `Quiz` | Quiz metadata and settings |
| `Question` | Individual questions in a quiz |
| `QuestionOption` | Answer options for questions |
| `QuizAttempt` | User's attempt record |
| `QuizAnswer` | Individual answers in an attempt |

#### Flashcard System Models
| Model | Purpose |
|-------|---------|
| `FlashcardSet` | Collection of flashcards |
| `FlashcardItem` | Individual flashcard (front/back) |
| `FlashcardVisit` | User engagement tracking |

#### AI Chat Models
| Model | Purpose |
|-------|---------|
| `Chat` | Chat session with academic context |
| `ChatMessage` | Individual messages in chat |

### 7.2 Key Database Enums

```prisma
enum Role { USER, ADMIN }
enum University { MEDICAPS, IPS }
enum Degree { BTECH_CSE, BTECH_IT }
enum Year { FIRST_YEAR, SECOND_YEAR, THIRD_YEAR, FOURTH_YEAR }
enum Semester { FIRST_SEMESTER, ... EIGHTH_SEMESTER }
enum PremiumTier { TIER_1, TIER_2, TIER_3 }
enum PaymentStatus { PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED }
enum AttemptStatus { IN_PROGRESS, COMPLETED, ABANDONED, TIME_UP }
enum MessageRole { USER, ASSISTANT }
```

---

## 8. Technology Stack

### 8.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.8 | React framework with App Router |
| **React** | 19.0.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **Motion** | 12.18.1 | Animation library |
| **shadcn/ui** | Latest | Pre-built UI components |
| **Radix UI** | Latest | Headless UI primitives |
| **Lenis** | 1.3.8 | Smooth scrolling |

### 8.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.3.8 | Server-side endpoints |
| **Prisma** | 6.9.0 | Database ORM |
| **PostgreSQL** | Latest | Relational database |
| **Better Auth** | 1.2.9 | Authentication system |
| **Zod** | 3.25.67 | Data validation |

### 8.3 Content Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **Sanity CMS** | 3.93.0 | Headless CMS |
| **next-sanity** | 9.12.0 | Sanity + Next.js integration |
| **Portable Text** | 3.2.1 | Rich text rendering |
| **KaTeX** | 0.16.22 | LaTeX math rendering |

### 8.4 External Services

| Service | Purpose |
|---------|---------|
| **Google OAuth** | User authentication |
| **Google Gemini AI** | AI chatbot functionality |
| **Razorpay** | Payment processing |
| **Telegram Bot** | Admin notifications |

### 8.5 Development Tools

| Tool | Purpose |
|------|---------|
| **Turbopack** | Fast bundler |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |

---

## 9. Key Modules

### 9.1 Data Access Layer (DAL)

The DAL provides a clean abstraction between components and database operations:

```
src/dal/
├── ai/              # AI chat queries & mutations
├── coupon/          # Discount coupon operations
├── flashcard/       # Flashcard CRUD & user queries
├── note/            # Notes fetching & filtering
├── premium/         # Premium purchase & status
├── quiz/            # Quiz management & attempts
├── referral/        # Referral system operations
└── user/            # User profile & management
```

**Benefits:**
- Centralized data logic
- Reusable across components
- Easy to test and maintain
- Consistent error handling

### 9.2 Caching Layer

Implements smart caching for performance:

```
src/cache/
├── admin.ts         # Admin data caching
├── notes.ts         # Notes content caching
├── premium.ts       # Premium status caching
└── user.ts          # User session caching
```

### 9.3 Academic Configuration System

Hierarchical configuration for university structure:

```typescript
ACADEMIC_CONFIG = {
  MEDICAPS: {
    info: { label: "ABES EC", ... },
    degrees: {
      BTECH_CSE: {
        info: { ... },
        years: {
          FIRST_YEAR: {
            semesters: { ... }
          }
        }
      }
    }
  }
}
```

---

## 10. Scalability & Performance

### 10.1 Scalability Features

#### 1. **Stateless Architecture**
- No server-side session storage
- JWT-based authentication
- Easily horizontally scalable

#### 2. **Database Optimization**
- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- Pagination for large datasets

#### 3. **CDN Integration Ready**
- Static assets served via Next.js static optimization
- Image optimization with `next/image`
- CSS and JS bundling with Turbopack

#### 4. **Caching Strategy**
- Server-side data caching
- Sanity CDN for content delivery
- Browser caching for static resources

#### 5. **Modular Architecture**
- Microservice-ready structure
- Independent modules (Quiz, Flashcard, Premium)
- Easy to split into separate services

### 10.2 Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | Automatic per-route splitting by Next.js |
| **Lazy Loading** | Dynamic imports for heavy components |
| **Image Optimization** | WebP conversion, responsive sizing |
| **Tree Shaking** | Unused code elimination |
| **Preloading** | Critical resource prefetching |

### 10.3 Scaling Strategies

**Vertical Scaling:**
- Increase server resources (CPU, RAM)
- Upgrade database tier

**Horizontal Scaling:**
- Multiple Next.js instances behind load balancer
- Database read replicas
- Separate CMS and app servers

**Estimated Capacity:**
| Tier | Concurrent Users | Monthly Active Users |
|------|-----------------|---------------------|
| Current | 100 | 1,000 |
| Basic Scale | 500 | 10,000 |
| Enterprise | 5,000+ | 100,000+ |

---

## 11. Security Features

### 11.1 Authentication Security

- **OAuth 2.0** - Secure Google authentication
- **Session Management** - Encrypted session tokens
- **Device Fingerprinting** - Multi-device tracking and management
- **Cookie Security** - HTTP-only, secure, same-site cookies

### 11.2 Data Protection

- **Input Validation** - Zod schema validation on all inputs
- **SQL Injection Prevention** - Prisma parameterized queries
- **XSS Prevention** - React's built-in escaping
- **CSRF Protection** - Token-based protection

### 11.3 Payment Security

- **Razorpay Webhook Signature** - Verified webhook authenticity
- **Server-side Order Creation** - No price tampering
- **Secure Payment Modal** - Razorpay's PCI-DSS compliant checkout

### 11.4 Access Control

- **Role-based Access** - USER, ADMIN roles
- **Premium Tier Gating** - Content access based on subscription
- **Route Protection** - Middleware-based authentication checks

---

## 12. Minimum Sellable Product (MSP)

### 12.1 Core MSP Features

The following features constitute the **Minimum Sellable Product**:

#### Must-Have Features ✅
1. **User Authentication**
   - Google OAuth login
   - Profile creation with academic details
   - Session management

2. **Notes Access**
   - Browse notes by university/semester/subject
   - Read notes with LaTeX rendering
   - Premium content gating

3. **Premium Subscription**
   - Single tier purchase (can start with one tier)
   - Razorpay payment integration
   - Automatic access activation

4. **Basic Admin Panel**
   - User management
   - Premium grant feature
   - Content visibility control

#### Nice-to-Have Features 🔄
- Quiz system
- Flashcard system
- AI chatbot
- Referral system
- Wallet system
- Multiple payment methods

### 12.2 MSP Cost Estimation

| Component | Estimated Cost (Monthly) |
|-----------|-------------------------|
| PostgreSQL (Managed) | $15-30 |
| Vercel Pro | $20 |
| Sanity (Free Tier) | $0 |
| Razorpay | 2% per transaction |
| Google Cloud (Auth) | $0 (Free tier) |
| **Total** | **$35-50/month** |

### 12.3 Revenue Model

| Tier | Price (30 days) | Access Level |
|------|-----------------|--------------|
| TIER_1 | ₹99 | Basic notes access |
| TIER_2 | ₹199 | + Quizzes, Flashcards |
| TIER_3 | ₹299 | + AI Chat, All content |

**Break-even Analysis:**
- Monthly costs: ~₹4,000
- At ₹199 per subscription: 20 subscriptions/month to break even

---

## 13. Future Enhancements

### 13.1 Short-term Roadmap (3-6 months)

1. **Mobile App** - React Native or Flutter implementation
2. **More Universities** - Expand to 10+ engineering colleges
3. **Video Lectures** - Integration with YouTube/Loom
4. **Offline Mode** - PWA with service workers
5. **Social Features** - Discussion forums, note sharing

### 13.2 Long-term Vision (1-2 years)

1. **Multi-language Support** - Hindi, regional languages
2. **Live Classes** - WebRTC-based live sessions
3. **Mentorship Program** - Connect with seniors/alumni
4. **Campus Partnerships** - Official university integrations
5. **B2B Model** - Sell to coaching institutes

### 13.3 Technical Improvements

1. **GraphQL API** - More flexible data fetching
2. **Redis Caching** - In-memory caching layer
3. **Elasticsearch** - Advanced search functionality
4. **Analytics Dashboard** - User behavior insights
5. **Content Recommendation** - ML-based suggestions

---

## 14. Conclusion

**Notes Pal** represents a modern, scalable solution to the fragmented educational resource problem faced by engineering students. By combining:

- **Content Management** with Sanity CMS
- **Interactive Learning** with quizzes and flashcards
- **AI Assistance** with Google Gemini
- **Monetization** with a fair tiered pricing model

The platform provides a comprehensive learning ecosystem that can scale from hundreds to millions of users with the right infrastructure investments.

### Key Differentiators

1. **University-Specific** - Tailored content for specific institutions
2. **AI-Powered** - Subject-aware study assistance
3. **Complete Ecosystem** - Notes + Quiz + Flashcards + AI in one place
4. **Developer-Friendly** - Clean architecture, well-documented code
5. **Scalable** - Built with modern best practices

### Project Metrics Summary

| Metric | Value |
|--------|-------|
| Lines of Code | 50,000+ |
| Database Models | 20+ |
| React Components | 100+ |
| API Endpoints | 50+ |
| Test Coverage | (To be implemented) |
| Documentation | Comprehensive |

---

**Report Generated:** December 15, 2025  
**Version:** 1.0.0  
**Author:** Notes Pal Development Team

---

*This document is confidential and intended for internal use only.*
