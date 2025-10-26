# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the Family Tree application. It’s written in clear everyday language so anyone can understand how to work with and extend the frontend.

---

## 1. Frontend Architecture

### Overview
The Family Tree app is built as a Single-Page Application (SPA). It uses React for the user interface and connects to a Backend-as-a-Service (BaaS) powered by Supabase. The entire development workflow is driven by Vite for fast builds and hot module replacement.

### Key Frameworks and Libraries
- **React 18**: Handles UI rendering and component lifecycle.  
- **Vite**: Provides a lightning-fast dev server and optimized production builds.  
- **TypeScript**: Adds static type checking for safer, easier-to-maintain code.  
- **Tailwind CSS**: Utility-first styling framework for rapid UI development.  
- **Shadcn UI & Radix UI**: Pre-built, accessible React components styled with Tailwind.  
- **TanStack Query**: Manages server data fetching, caching, and synchronization.  
- **React Hook Form & Zod**: Builds and validates forms in a simple, type-safe way.  
- **Framer Motion**: Creates smooth animations and transitions.  
- **React Router DOM**: Handles in-app navigation and routing.  

### Scalability, Maintainability & Performance
- **Modular Folder Structure**: Code is organized by feature (e.g., `tree/`, `auth/`, `dashboard/`), which makes it easy to add or remove functionality without bloating unrelated areas.  
- **Component-Driven Development**: Reusable UI components minimize duplication and accelerate development.  
- **Type Safety**: TypeScript models (e.g., `FamilyMember`, `Relationship`) catch mistakes early and keep the codebase predictable.  
- **Server-State Management**: TanStack Query prevents unnecessary network calls and automatically keeps data fresh in the UI.  
- **Optimized Builds**: Vite’s code-splitting and tree-shaking keep bundle sizes small, boosting load times.  

---

## 2. Design Principles

### Usability
- Clear button labels and form fields guide users through tasks like adding or editing family members.  
- Consistent layouts mean users don’t have to relearn patterns when they switch between pages.  

### Accessibility
- Semantic HTML elements (`<button>`, `<dialog>`, `<nav>`) and ARIA attributes ensure compatibility with screen readers.  
- Keyboard navigation is fully supported—dialogs, menus, and tree nodes can all be opened and used without a mouse.  
- Color choices meet WCAG AA contrast standards for readability.  

### Responsiveness
- Layouts adapt from mobile to desktop using Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`).  
- The tree visualizer reflows and rescales so it remains usable on small screens.  

---

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS**: Utility classes for spacing, typography, colors, and more. Styles live alongside markup for fast feedback.  
- **Component Themes**: Shadcn UI and Radix UI components are built on top of Tailwind, so they inherit project-wide styling rules.

### Theming
- CSS variables (`--color-primary`, `--color-bg`) control primary and background colors.  
- A light and dark mode switch toggles these variables at the root level.  

### Visual Style
- **Modern Flat Design**: Clean, minimal shadows, crisp edges. Interactive elements highlight on hover or focus.  
- **Glassmorphism Accents**: Semi-transparent panels with subtle backdrop blur for dialogs and floating menus.  

### Color Palette
- Primary: #4F46E5 (Indigo)  
- Secondary: #10B981 (Emerald)  
- Accent: #F59E0B (Amber)  
- Background (Light): #F9FAFB  
- Background (Dark): #1F2937  
- Text (Light): #111827  
- Text (Dark): #F3F4F6  

### Typography
- **Font Family**: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif  
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold)  

---

## 4. Component Structure

### Organization
```
src/
 ├ features/
 │   ├ auth/          # Login, register, password reset
 │   ├ dashboard/     # Widgets, activity feed
 │   ├ tree/          # TreeBuilder, MemberNode, RadialMenu, ProfilePage
 │   └ ...
 ├ components/
 │   └ ui/            # Buttons, dialogs, inputs (Shadcn + Radix)
 ├ hooks/             # Custom React hooks
 ├ lib/               # Supabase client, utility functions
 └ providers/         # Context providers (theme, auth)
```

### Benefits of Component-Based Architecture
- **Reusability**: Build once, use in many places (e.g., a generic `Dialog` or `Button`).  
- **Isolation**: Components encapsulate their own styles and logic, reducing side effects.  
- **Testability**: Smaller pieces are easier to test in isolation.  

---

## 5. State Management

### Server State
- **TanStack Query** handles data fetching, caching, background updates, and error handling for all Supabase queries and mutations.  
- Real-time subscriptions (Supabase) feed into TanStack Query to automatically refresh affected data.

### Client (UI) State
- **Zustand** (or Context API) manages ephemeral UI state such as:
  - Tree zoom/pan levels  
  - Radial menu open/closed state  
  - Theme (light/dark) selection  

### Data Flow
1. A component calls a `useQuery` hook to fetch data.  
2. TanStack Query checks cache or network, returns state to the component.  
3. User actions (e.g., “Add Member”) trigger a `useMutation`.  
4. On success, a query invalidation refreshes relevant queries.  

---

## 6. Routing and Navigation

- **React Router DOM** defines routes in a central `AppRoutes.tsx` file.  
- Main routes:
  - `/auth/*` – Authentication flows (login, register, reset)  
  - `/dashboard` – Overview of recent activity and widgets  
  - `/tree` – Visual family tree interface  
  - `/tree/person/:personId` – Individual member profile page  
- Nested routes and layout components keep common UI (navbars, sidebars) persistent across pages.  
- Link components (`<Link>` or `<NavLink>`) enable client-side navigation without full reloads.  

---

## 7. Performance Optimization

- **Code Splitting & Lazy Loading**: React `lazy()` and `<Suspense>` split heavy components (e.g., tree visualizer) into separate chunks.  
- **Asset Optimization**: Tailwind’s PurgeCSS removes unused styles in production.  
- **Image Optimization**: Supabase Storage + on-the-fly transforms reduce image file sizes.  
- **Memoization**: `React.memo`, `useMemo`, and `useCallback` avoid unnecessary renders in large trees.  
- **Pre-Fetching**: TanStack Query’s `prefetchQuery` warms up data for likely next pages.  

---

## 8. Testing and Quality Assurance

### Unit & Integration Tests
- **Vitest** for writing fast unit tests.  
- **React Testing Library** for testing component behavior (forms, dialogs, menus).  
- **Zod** schemas tested to confirm validation rules.

### End-to-End (E2E) Tests
- **Cypress** or **Playwright** simulates user flows:
  - Login/register  
  - Adding/editing a family member  
  - Importing/exporting GEDCOM files  

### Linting & Formatting
- **ESLint** enforces code style and catches common bugs.  
- **Prettier** auto-formats code on save/commit.  
- **Commit Hooks (Husky)** run lint and tests before pushing changes.  

---

## 9. Conclusion and Overall Summary

This frontend setup provides a robust, maintainable, and high-performance foundation for the Family Tree application. By adhering to these guidelines—modular architecture, clear design principles, utility-first styling, component reuse, thoughtful state management, and rigorous testing—you ensure a consistent developer experience and a polished user interface. The combination of React, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, and Supabase delivers an end-to-end solution that can grow from a simple MVP to a fully featured genealogy platform.  

With these guidelines as your roadmap, your team can confidently build, test, and extend the frontend while keeping code quality and user satisfaction at the forefront.