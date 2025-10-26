# Family Tree React Supabase - Tech Stack Document

This document explains in simple terms why we picked each technology for the Family Tree application. You don’t need a technical background to understand how these pieces fit together and support the project’s goals.

## 1. Frontend Technologies
These tools power the part of the application you see and interact with in your browser.

- **React 18**
  - A popular JavaScript library for building dynamic user interfaces.
  - Lets us break the UI into small, reusable components (like member cards or buttons).
- **TypeScript**
  - A version of JavaScript that checks for mistakes as we write code (think of it like spell-check for programmers).
  - Helps prevent bugs when handling complex family tree data.
- **Vite**
  - A modern build tool that starts the development server almost instantly and updates your code in real time.
  - Makes our development experience fast and smooth.
- **Tailwind CSS**
  - A utility-based styling system that allows us to create custom designs by composing small CSS classes.
  - Speeds up styling and keeps our design consistent across the app.
- **Shadcn UI & Radix UI**
  - Collections of ready-made, accessible components (dialogs, menus, forms) that can be customized to our look and feel.
  - Save time on building foundational UI elements so we can focus on unique features.
- **TanStack Query**
  - Manages data fetching, caching, and synchronization with the server.
  - Ensures the family tree loads quickly and updates automatically when changes occur.
- **React Hook Form & Zod**
  - Simplify building and validating forms (for example, the “Add Member” form).
  - Provide clear error messages and prevent invalid data from being submitted.
- **Framer Motion**
  - A library for adding smooth animations and transitions.
  - Brings interactivity to the tree visualizer (zoom/pan) and radial menus.

## 2. Backend Technologies
These components handle data storage, business logic, and authentication behind the scenes.

- **Supabase (Backend-as-a-Service)**
  - Provides everything we need: database, authentication, file storage, and serverless functions.
  - Lets us focus on building features instead of managing servers.
- **PostgreSQL Database**
  - A relational database perfectly suited to model people, relationships, photos, and documents.
- **Supabase Auth**
  - Handles user registration, login, password resets, and social providers (Google, Apple).
  - Can be extended to support Two-Factor Authentication (2FA).
- **Supabase Storage**
  - Securely stores user-uploaded photos, scanned documents, and GEDCOM files.
- **Supabase Edge Functions**
  - Run custom server-side code (for example, processing GEDCOM files or calling AI photo enhancement APIs).
  - Keep heavy or sensitive logic off the client.

## 3. Infrastructure and Deployment
These tools help us build, test, and deploy the application reliably and at scale.

- **Version Control: Git & GitHub**
  - Tracks every code change and lets multiple developers collaborate safely.
- **CI/CD: GitHub Actions**
  - Automatically runs tests, linting, and code formatting on every code change.
  - Deploys the latest version of the app when we merge to the main branch.
- **Hosting Frontend**
  - Deployed as a static site on platforms like Vercel or Netlify.
  - Content is served via a global Content Delivery Network (CDN) for fast load times worldwide.
- **Hosting Backend**
  - Supabase handles database hosting, authentication, storage, and serverless functions.
- **Testing Tools**
  - **Vitest** and **React Testing Library** for automated unit and integration tests.
  - Ensure critical features (adding members, form validation, etc.) work as expected.

## 4. Third-Party Integrations
These external services enhance the application’s functionality without reinventing the wheel.

- **Social Login (Google, Apple)**
  - Lets users sign up or log in quickly using their existing accounts.
- **Stripe**
  - Manages subscription payments for premium features (DNA reports, advanced matching, etc.).
- **AI Photo Studio APIs**
  - Provides colorization, restoration, and animation of historical photos.
  - Accessed securely via Supabase Edge Functions.

## 5. Security and Performance Considerations
We’ve built in measures to keep data safe and the experience snappy.

- **Authentication & Authorization**
  - Supabase Auth issues secure JSON Web Tokens (JWTs) for user sessions.
  - Row Level Security (RLS) in PostgreSQL ensures that each user can only access their own data.
  - Two-Factor Authentication is available as an extra layer of security.
- **Data Protection**
  - All data in transit is encrypted over HTTPS.
  - Supabase Storage keeps files in private buckets unless explicitly shared.
- **Performance Optimizations**
  - Vite’s hot-reload and fast rebuilds speed up development.
  - TanStack Query caches server data and reduces redundant network requests.
  - Code splitting and lazy loading only load the code needed for each page.
  - Global CDN delivery ensures quick access to static assets.

## 6. Conclusion and Overall Tech Stack Summary
Our chosen stack aligns perfectly with the project goals:

- A **React + Vite + TypeScript** frontend that is fast, maintainable, and extensible.
- A **Supabase** backend that handles everything from data storage to authentication and serverless functions.
- A modern deployment pipeline based on **GitHub Actions**, **Vercel/Netlify**, and a global CDN for reliability and speed.
- Seamless **third-party integrations** (social login, payments, AI services) that add powerful features.
- Built-in **security** (RLS, 2FA, HTTPS) and **performance** optimizations (caching, code splitting).

This cohesive tech stack provides a robust foundation for building a feature-rich, scalable family tree application that delights users and grows with your needs.