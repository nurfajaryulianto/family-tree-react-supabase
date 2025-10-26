# Backend Structure Document

This document outlines the backend setup for the Family Tree React application using Supabase. It explains the overall architecture, data management, APIs, hosting, infrastructure, security, and monitoring strategies in everyday language.

## 1. Backend Architecture

- We use Supabase as our primary backend service. Supabase provides a hosted PostgreSQL database, built-in authentication, file storage, real-time subscriptions, and serverless functions (Edge Functions).
- The frontend (React + Vite) communicates with Supabase via RESTful calls and real-time WebSocket connections.
- Key design patterns and frameworks:
  • BaaS (Backend-as-a-Service) with Supabase to minimize server maintenance.
  • Serverless Edge Functions for custom business logic (GEDCOM parsing, AI integrations, DNA matching).
  • Real-time subscriptions for live collaboration.
- How it supports project goals:
  • Scalability: Supabase automatically scales the database and edge function execution as usage grows.
  • Maintainability: Using a single platform reduces infrastructure complexity; schema changes and RLS policies live in one place.
  • Performance: Built-in caching in PostgREST, real-time sockets, and edge functions near users minimize latency.

## 2. Database Management

- We use a relational (SQL) database powered by PostgreSQL.
- Supabase Auth manages user accounts and issues JSON Web Tokens (JWT) for secure API calls.
- Supabase Storage holds user-uploaded photos, documents, and GEDCOM files.
- Data practices:
  • Structured data: Users, family trees, members, relationships, media, DNA, and invites each have dedicated tables.
  • Access control: Row-Level Security (RLS) policies ensure users see or edit only what they should.
  • Real-time: Clients subscribe to changes on key tables to reflect updates instantly.

## 3. Database Schema

Below is a human-friendly description of the main tables and an SQL schema for PostgreSQL.

Tables (in plain language):
- users: Registered accounts (email, name, etc.)
- trees: Each user’s family tree project
- members: Individual people (name, birth date, death date, notes)
- relationships: Links between members (parent-child or marriage)
- photos: Metadata about stored images tied to members
- documents: Metadata about stored files (GEDCOM, certificates)
- dna_data: Raw DNA uploads and processing status
- collaboration_invites: Invitations sent to others to view/edit a tree

SQL Schema for PostgreSQL:
```sql
-- Users table managed by Supabase Auth
-- We rely on auth.users, so no custom definition here.

-- Trees table
CREATE TABLE public.trees (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid NOT NULL REFERENCES auth.users(id),
  name           text NOT NULL,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Members table
CREATE TABLE public.members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id        uuid NOT NULL REFERENCES public.trees(id),
  first_name     text NOT NULL,
  last_name      text NOT NULL,
  birth_date     date,
  death_date     date,
  notes          text,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Relationships table
CREATE TABLE public.relationships (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id        uuid NOT NULL REFERENCES public.trees(id),
  from_member_id uuid NOT NULL REFERENCES public.members(id),
  to_member_id   uuid NOT NULL REFERENCES public.members(id),
  type           text NOT NULL CHECK (type IN ('parent','spouse','sibling')),
  created_at     timestamp with time zone DEFAULT now()
);

-- Photos table
CREATE TABLE public.photos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES public.members(id),
  storage_path   text NOT NULL,
  uploaded_at    timestamp with time zone DEFAULT now(),
  description    text
);

-- Documents table
CREATE TABLE public.documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id        uuid NOT NULL REFERENCES public.trees(id),
  storage_path   text NOT NULL,
  file_type      text NOT NULL,
  uploaded_at    timestamp with time zone DEFAULT now(),
  description    text
);

-- DNA Data table
CREATE TABLE public.dna_data (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id),
  storage_path   text NOT NULL,
  status         text NOT NULL CHECK (status IN ('pending','processing','complete','error')),
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Collaboration Invites table
CREATE TABLE public.collaboration_invites (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id        uuid NOT NULL REFERENCES public.trees(id),
  invited_email  text NOT NULL,
  role           text NOT NULL CHECK (role IN ('view','edit')),
  token          text NOT NULL,
  sent_at        timestamp with time zone DEFAULT now(),
  accepted_at    timestamp with time zone
);
```

## 4. API Design and Endpoints

We rely on two approaches:

1. Built-in REST API (PostgREST) and real-time channels provided by Supabase
2. Custom Edge Functions for advanced workflows

Key endpoints and their roles:

• Authentication (Supabase Auth)
  - Sign up / Sign in / Sign out / Password reset
  - Social logins (Google, Apple)

• Data access (auto-generated)
  - GET /trees — list user’s trees
  - POST /trees — create a new tree
  - GET /members?tree_id=… — list members in a tree
  - POST /members — add a new member
  - PATCH /members?id=… — update member info
  - GET /relationships?tree_id=… — list relationships
  - POST /relationships — add a parent or spouse link

• Storage access (Supabase Storage)
  - Upload and download files via pre-signed URLs

• Edge Functions (custom business logic)
  - /functions/process-gedcom — parse and insert GEDCOM data
  - /functions/export-gedcom — generate GEDCOM from database
  - /functions/automatic-matching — run tree-to-tree or record matching
  - /functions/enhance-photo — proxy to AI service for colorize/restore
  - /functions/process-dna — parse raw DNA and compute matches

## 5. Hosting Solutions

- Primary backend hosting: Supabase Cloud (fully managed).
- Edge Functions run in Supabase’s global network (Deno-based serverless).
- Storage served via a built-in CDN layer for fast media access.
- Why this choice works:
  • Reliability: Supabase’s SLAs and managed Postgres ensure we stay online.
  • Scalability: Automatic scaling of database and functions.
  • Cost-effectiveness: Pay-for-what-you-use model; eliminates server setup.

## 6. Infrastructure Components

- Load Balancing: Handled internally by Supabase for API and Edge Functions.
- Caching:
  • PostgREST response caching where possible.
  • Browser-side caching via TanStack Query.
- Real-time WebSockets: Supabase Realtime for live updates on tables.
- CDN: Supabase Storage CDN for serving images and files quickly worldwide.
- Logging & Observability: Supabase’s built-in logs for database and function invocations.

## 7. Security Measures

- Authentication / Authorization:
  • Supabase Auth issues JWT tokens after login.
  • Row Level Security (RLS) policies restrict table access by user and tree.
  • Social logins and optional Two-Factor Authentication (2FA).
- Data encryption:
  • TLS for data in transit.
  • At-rest encryption in Supabase-managed PostgreSQL and Storage.
- Network Security:
  • API endpoints require valid JWTs.
  • Edge Functions verify user tokens before executing logic.
- Compliance:
  • Supabase is SOC2 compliant; our data lives in secure, audited data centers.

## 8. Monitoring and Maintenance

- Monitoring tools:
  • Supabase dashboard for real-time metrics (CPU, DB connections, function calls).
  • Built-in logs for queries and function executions.
  • Third-party APM (e.g., Datadog) can be integrated via Edge Function logs.
- Maintenance practices:
  • Regular backups managed automatically by Supabase.
  • Scheduled reviews of RLS policies and database indexes.
  • Automated tests for Edge Functions (using Vitest) to catch regressions.
  • Version control of database migrations with dbt or similar tool.

## 9. Conclusion and Overall Backend Summary

The backend for the Family Tree application is built on Supabase, offering a cohesive, scalable, and secure platform. By combining a managed PostgreSQL database, easy-to-use authentication, storage with CDN, real-time subscriptions, and serverless Edge Functions, we ensure:

- A maintainable codebase with minimal infrastructure overhead.
- Rapid development of core features (tree building, profiles, media uploads).
- Powerful extension points for advanced functionality (GEDCOM support, AI enhancements, DNA matching).
- Strong security through JWT, RLS, and encrypted transport.
- A clear upgrade path as usage grows, without the need to manage servers.

This setup aligns with the project’s goals by providing reliable performance, cost-effective scaling, and an approachable development experience for adding new features in the future.