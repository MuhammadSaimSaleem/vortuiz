# ⚡ Vortuiz

**Vortuiz** is an interactive quiz-building, examination, and performance analytics web platform built for educators and students. Powered by Next.js, React, TypeScript, Tailwind CSS, and Supabase, it streamlines assessment creation, delivers distraction-free test-taking experiences, and provides actionable insights into student progress.

## ✨ Key Features

* **📝 Intuitive Quiz & Exam Builder:** Create, organize, and customize assessments with support for multiple-choice questions, time limits, point weights, and randomized question ordering.
* **⏱️ Real-Time Examination Experience:** Clean, responsive test-taking interface featuring live countdown timers, progress tracking, and automatic submission upon timeout.
* **📊 Comprehensive Analytics Dashboard:** Visual performance breakdowns for both educators and students, highlighting accuracy rates, score distributions, and topic-level strengths and weaknesses.
* **👥 Role-Based Access Control:** Dedicated workflows and dashboards tailored for teachers/creators and students/examinees.
* **🔐 Secure Authentication & Data Persistence:** Powered by Supabase Auth and PostgreSQL with Row-Level Security (RLS) to keep user data and exam results protected.
* **📱 Fully Responsive UI:** Styled with Tailwind CSS for a seamless experience across desktop, tablet, and mobile browsers.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router), React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Backend & Database:** Supabase (PostgreSQL, Authentication, Row-Level Security)
* **Deployment:** Vercel (Recommended)

## 🚀 Getting Started

Follow these steps to set up and run Vortuiz locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or newer)
* npm, yarn, pnpm, or bun
* A [Supabase](https://supabase.com/) project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vortuiz.git
   cd vortuiz
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```text
vortuiz/
├── app/                  # Next.js App Router pages, layouts, and API routes
├── components/           # Reusable UI components (QuizBuilder, Timer, AnalyticsCharts)
├── hooks/                # Custom React hooks for auth, timers, and quiz state
├── lib/                  # Supabase client setup and utility functions
├── types/                # TypeScript interfaces and database schemas
└── public/               # Static assets and icons
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Vortuiz or add new features:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
