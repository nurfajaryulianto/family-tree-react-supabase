# Project Requirements Document (PRD)

## 1. Project Overview

This project is a web-based platform for building, visualizing, and collaborating on family trees. It solves the pain point of fragmented genealogy data by offering an intuitive, interactive interface where users can add relatives, view detailed profiles, upload photos and documents, and share their work with family members in real time. The core of the application is a dynamic tree visualizer that handles large, multi-generation trees with smooth zoom and pan, making it easy to explore complex lineages.

We’re building this tool to democratize family history research and to support both casual users and serious genealogists. Key objectives for the first release are: 
- Secure user registration and login
- A responsive, interactive family tree builder
- Basic member profile management with media attachments
- Real-time collaboration
- Import/export of GEDCOM files

Success is measured by achieving sub-2-second tree load times for up to 1,000 members, maintaining an intuitive UI (no training required), and ensuring that at least 90% of collaboration actions sync in under one second.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- User authentication (email/password) and optional social login (Google, Apple)
- Role-based access control via Supabase Row-Level Security (RLS)
- Family Tree Builder component with zoom, pan, and radial action menu
- Add/Edit/Delete member forms with client-side validation (React Hook Form + Zod)
- Member Profile pages (personal details, relationships, photos, documents)
- Real-time updates through Supabase subscriptions
- Dashboard showing recent activity, new additions, and simple insights
- Photo & document upload (Supabase Storage) with previews
- GEDCOM import and standardized GEDCOM export via Supabase Edge Function
- Responsive design for desktop and tablet breakpoints

### Out-of-Scope (Later Phases)
- Two-Factor Authentication (2FA)
- AI-powered photo enhancements (colorization, restoration, animation)
- DNA data integration and matching algorithms
- Mobile native packaging or full PWA offline support
- Payment/subscription management (e.g., Stripe integration)
- Advanced automated family matching features
- Custom theming or white-labeling options

---

## 3. User Flow

When a new user lands on the site, they are prompted to register or log in. After creating an account, they see a clean dashboard with recent tree updates and quick actions (“Create New Tree,” “Import GEDCOM,” “View My Trees”). Clicking “Create New Tree” opens an empty canvas and a side form to name the tree. Once created, the user is dropped into the Family Tree Builder screen.

Inside the Tree Builder, the left panel lists tree settings and bulk actions (export, invite collaborators). The main canvas shows a single root node. Clicking a node brings up a radial menu (Add Child, Add Parent, Edit) animated with Framer Motion. Choosing an action opens a modal form where the user fills out details and uploads any photos or documents. Upon saving, the tree updates instantly for all collaborators. Users can switch to the Member Profile view to see or edit full details, and return to the dashboard at any time via the top navigation bar.

---

## 4. Core Features

- **Authentication & Security**: Email/password login, optional social providers, JWT-based sessions, RLS policies for row-level data control
- **Tree Builder**: Interactive canvas with pan/zoom, Framer Motion–powered radial menus, node dragging or repositioning
- **Member Management**: Add/edit/delete member forms with validation (Zod), date pickers for events, relationship linking logic
- **Member Profiles**: Detailed view with editable fields, event timeline, photo and document gallery
- **Real-Time Collaboration**: Supabase subscriptions to sync changes instantly across clients
- **Dashboard**: Recent activity feed, widget for new member suggestions, quick links to trees
- **Media Handling**: Upload via drag-and-drop or file picker, client-side preview, secure Supabase Storage
- **GEDCOM Import/Export**: Server-side parsing and generation in Supabase Edge Function
- **Routing & Navigation**: React Router for page URLs (e.g., `/tree/:treeId`, `/member/:memberId`)

---

## 5. Tech Stack & Tools

**Frontend**  
- React 18 (SPA framework)  
- Vite (build tool)  
- TypeScript (type safety)  
- Tailwind CSS + Shadcn UI + Radix UI (UI components)  
- Framer Motion (animations)  
- React Hook Form + Zod (form handling & validation)  
- TanStack Query (data fetching & caching)  
- React Router DOM (client-side routing)

**Backend**  
- Supabase (BaaS):  
  • PostgreSQL (database)  
  • Auth (user management, social logins)  
  • Storage (photos & documents)  
  • Edge Functions (GEDCOM import/export)  
  • Realtime subscriptions

**Development Tools**  
- VS Code with ESLint, Prettier, Tailwind CSS IntelliSense  
- Vitest + React Testing Library (unit & integration tests)  
- Path aliases (`@/components`, `@/features`) for clean imports

**Future AI Integrations (Phase 2+)**  
- Third-party AI services via Edge Functions (no on-board AI model in V1)

---

## 6. Non-Functional Requirements

- **Performance**:  
  • Initial tree load under 2 seconds for ≤1,000 nodes  
  • UI interactions (pan, zoom, radial menu) finish in <100 ms  
  • API calls <500 ms

- **Security**:  
  • HTTPS/TLS enforcement  
  • Secure JWT tokens and HTTP-only cookies  
  • Supabase RLS policies to restrict row access  
  • Input sanitization on forms

- **Scalability**:  
  • Support 100 concurrent real-time collaborators per tree  
  • Leverage Supabase’s horizontal scaling

- **Usability & Accessibility**:  
  • WCAG 2.1 AA–compliant components  
  • Keyboard navigation and screen-reader labels  
  • Responsive design for desktop/tablet

- **Compliance**:  
  • GDPR support: user data export and deletion on request  
  • Secure data storage in a region-compliant Supabase project

---

## 7. Constraints & Assumptions

- We rely on Supabase’s managed services; any downtime or rate limits must be handled gracefully.
- Users have a stable internet connection; offline support is not in V1.
- Target browsers: latest Chrome, Firefox, Safari, Edge.
- Tree complexity capped at ~5,000 nodes for responsive performance; further optimization later.
- All forms assume UTF-8 and ISO date inputs for consistency.

---

## 8. Known Issues & Potential Pitfalls

- **Large Tree Performance**: Rendering thousands of nodes can degrade performance.  
  *Mitigation:* Virtualize node rendering (render visible viewport only) and batch updates.

- **Real-Time Scale**: Supabase subscriptions may hit connection limits.  
  *Mitigation:* Debounce rapid update bursts and fallback to polling for non-critical updates.

- **GEDCOM Variations**: Real-world GEDCOM files can vary in structure.  
  *Mitigation:* Implement robust error reporting in Edge Function and allow users to review parsed data before final import.

- **Storage Quotas**: Free-tier Supabase Storage limits may be insufficient for large volumes of photos.  
  *Mitigation:* Monitor usage and warn users when nearing quotas; plan paid tier or external CDN later.

By following this PRD, the AI model and development teams can proceed with zero ambiguity, ensuring each feature and requirement is clearly defined for subsequent technical planning and implementation.