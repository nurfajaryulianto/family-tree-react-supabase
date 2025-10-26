[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)

# Family Tree App with Real-time Collaboration

A comprehensive family tree application with advanced real-time collaboration features, built with modern web technologies. This project demonstrates multi-user genealogy management with live updates, presence tracking, and collaborative editing capabilities.

## Tech Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Data Management:** [TanStack Query](https://tanstack.com/query)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Validation:** [Zod](https://zod.dev/)

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account for database
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd codeguide-vite-supabase
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables Setup**

   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the environment variables in `.env` (see Configuration section below)

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.**

## Configuration

### Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to Project Settings > API
4. Copy the `Project URL` as `VITE_SUPABASE_URL`
5. Copy the `anon` public key as `VITE_SUPABASE_ANON_KEY`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

### Core Family Tree Features
- 🌳 Interactive Family Tree Builder with multi-generation support
- 👥 Comprehensive Member Management with detailed profiles
- 🔗 Advanced Relationship Management (parent, child, spouse, sibling)
- 📝 Rich Member Profiles with photos, documents, and biographies
- 🎨 Beautiful UI with Tailwind CSS and Radix UI components
- 📱 Fully Responsive Design for all devices

### Real-time Collaboration Features
- 🔄 **Live Updates** - Instant synchronization across all connected users
- 👁️ **Presence Tracking** - See who's currently viewing or editing the tree
- 🖱️ **Collaborative Cursors** - Track other users' cursor positions in real-time
- 🔔 **Visual Notifications** - Toast notifications for changes made by collaborators
- 📊 **Activity Feed** - Timeline of all recent changes with user attribution
- ✨ **Change Highlights** - Visual indicators for newly added or updated members
- 🎯 **Member Focus** - See which members other users are currently viewing
- 🌐 **Connection Status** - Real-time connectivity monitoring and auto-reconnection

### Technical Features
- ⚡ Fast Development with Vite
- 🗄️ Supabase Database Integration with Row-Level Security
- 🔄 Data Fetching with TanStack Query and optimistic updates
- 🎭 Beautiful Animations with Framer Motion
- 📝 Type-Safe Forms with React Hook Form and Zod validation
- 🔒 Secure Authentication and Authorization
- 🎯 TypeScript for type safety and better development experience

## Project Structure

```
codeguide-vite-supabase/
├── src/                # Source files
│   ├── components/    # React components
│   ├── lib/          # Utility functions
│   ├── hooks/        # Custom hooks
│   └── types/        # TypeScript types
├── public/            # Static assets
└── documentation/     # Generated documentation from CodeGuide
```

## Real-time Collaboration Setup

To enable real-time collaboration features:

1. **Set up the database schema**:
   ```bash
   # If using Supabase CLI
   supabase db push
   ```

2. **Enable Realtime** in your Supabase project:
   - Go to Supabase Dashboard → Project → Replication
   - Enable Realtime for tables: `trees`, `members`, `relationships`, `activities`, `presence`

3. **Configure RLS Policies** (included in migration):
   - All tables have Row-Level Security enabled
   - Users can only access trees they own or are invited to
   - Presence and activities are isolated per tree

4. **Use the RealtimeCollaborationProvider**:
   ```typescript
   import { RealtimeCollaborationProvider } from '@/contexts/RealtimeCollaborationContext'

   function App() {
     return (
       <RealtimeCollaborationProvider treeId="your-tree-id">
         <FamilyTreeComponent />
       </RealtimeCollaborationProvider>
     )
   }
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:

   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:

   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
