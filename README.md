# ⚡ Vortuiz

**Vortuiz** is a full-stack educational quiz, examination, and performance analytics web application built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**. It provides dedicated, role-based portals for **Teachers** and **Students** to manage subjects, create and take assessments, share study resources, and track learning outcomes.

---

## ✨ Features

### 👨‍🏫 Teacher Portal (`/teachers`)
* **Teacher Dashboard:** Centralized overview of active quizzes, enrolled students, and recent submissions.
* **Quiz Builder & Editor:** Create, configure, and edit assessments (`/teachers/quiz/create` & `/teachers/quiz/[id]/edit`).
* **Detailed Grading & Results:** Review class-wide quiz results and drill down into individual student attempts (`/teachers/quiz/[id]/results/[studentId]`).
* **Subject & Resource Management:** Organize academic subjects and upload/manage learning materials in the Resource Library.
* **Student Directory & Analytics:** View student profiles and monitor cohort performance trends via interactive charts.

### 🎓 Student Portal (`/students`)
* **Student Dashboard:** Track upcoming quizzes, enrolled subjects, and recent scores.
* **Interactive Quiz Engine:** Dedicated exam-taking flow (`/students/quiz/[id]/start`) with instant post-submission results and breakdowns (`/students/quiz/[id]/results`).
* **Subject Management & Resource Library:** Browse enrolled courses and access shared study materials.
* **Achievements & Analytics:** Visual progress tracking, performance analytics, and milestone achievements.

### 🔐 Authentication & User Profiles
* **Supabase Auth & SSR:** Full session management powered by `@supabase/ssr` with OAuth/email callback handling (`/auth/callback`).
* **Customizable Profiles:** Dedicated profile management (`/profile` & `/profile/edit`) featuring an avatar picker and server-side avatar upload API (`/api/upload-avatar`).
* **Theme Support:** Dark and light mode support via `next-themes`.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| **Styling & UI** | Tailwind CSS v4, Shadcn UI, Radix UI, Framer Motion, Lucide React, React Icons |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Storage) via `@supabase/supabase-js` & `@supabase/ssr` |
| **Data Fetching & State** | TanStack React Query v5, React Context API |
| **Data Visualization** | Recharts |
| **Notifications** | Sonner |

---

## 📁 Project Structure

```text
├── app/
│   ├── api/upload-avatar/        # Server-side avatar upload route handler
│   ├── auth/                     # Authentication pages & OAuth callback route
│   ├── features/                 # Platform features showcase page
│   ├── profile/                  # User profile view & edit pages
│   ├── students/(session)/       # Authenticated student portal
│   │   ├── achievements/         # Student badges & milestones
│   │   ├── analytics/            # Student performance charts
│   │   ├── dashboard/            # Student overview
│   │   ├── quiz/                 # Quiz browser, exam runner, & result views
│   │   ├── resource-library/     # Study materials
│   │   └── subject-management/   # Enrolled subjects
│   └── teachers/(session)/       # Authenticated teacher portal
│       ├── analytics/            # Class & quiz analytics
│       ├── dashboard/            # Teacher overview
│       ├── quiz/                 # Quiz creation, editing, & per-student grading
│       ├── resource-library/     # Resource uploads & management
│       ├── student-directory/    # Enrolled students list
│       └── subject-management/   # Course & subject administration
├── assets/images/                # Static branding and UI assets
├── components/ui/                # Shadcn UI & custom interface components (NavBar, Sidebar, AvatarPicker, etc.)
├── contexts/                     # Global providers (ProfileContext, QueryClient)
├── lib/
│   ├── supabase/                 # Supabase browser & server clients
│   ├── data.ts                   # Data helpers & queries
│   ├── toast.tsx                 # Toast notification utilities
│   └── utils.tsx                 # Shared utility functions
├── schema.sql                    # PostgreSQL database schema
├── data.sql                      # Seed data for local development
└── proxy.ts                      # Request/session proxy middleware
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 20+
* **pnpm** (recommended, `pnpm-lock.yaml` included) or **npm**
* A **Supabase** project

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up the Database
1. Open the **SQL Editor** in your Supabase dashboard.
2. Run the contents of `schema.sql` to create the required tables, relationships, and Row-Level Security (RLS) policies.
3. *(Optional)* Run `data.sql` to populate the database with sample seed data.

### 5. Run the Development Server
```bash
pnpm dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

* `pnpm dev` — Starts the Next.js development server.
* `pnpm build` — Builds the application for production.
* `pnpm start` — Runs the compiled production server.
* `pnpm lint` — Runs ESLint across the codebase.
* `pnpm clean` — Removes the `.next` build cache directory.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
