<div align="center">

<img src="public/pitchcoachAIlogo.png" alt="PitchCoach AI" width="420" />

<br /><br />

**AI-powered speaker guides for every slide in your deck.**

Upload a PDF or PPTX. Get instant, structured coaching — talking points, transitions, timing cues, and stage directions — so you can present with confidence.

[![Live App](https://img.shields.io/badge/Live%20App-pitchcoach.founderpilot.ai-6366f1?style=flat-square&logo=vercel)](https://pitchcoach.founderpilot.ai)
[![Demo](https://img.shields.io/badge/Demo-guide--my--pitch.lovable.app-0ea5e9?style=flat-square&logo=globe)](https://guide-my-pitch.lovable.app)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase%20%2B%20Claude-f59e0b?style=flat-square)](https://github.com/andrewr303/smart-pitch-coach)

</div>

---

<p align="center">
  <img src="screenshot.jpeg" alt="PitchCoach AI Screenshot" width="780" />
</p>

---

## Overview

PitchCoach AI turns a raw slide deck into a slide-by-slide coaching guide in seconds. A Supabase edge function extracts your slides, sends them to Claude (`claude-sonnet-4-6`), and returns a structured JSON guide covering every slide: what to say, how to say it, when to pause, and how to transition.

The result is a keyboard-navigable presenter view — think teleprompter meets speaking coach — built for founders, executives, and anyone who needs to deliver a polished pitch without hours of prep.

---

## Features

- **Instant guide generation** — Upload PDF or PPTX (up to 30 MB, up to 100 slides) and receive a full coaching guide in one click.
- **Slide-by-slide talking points** — Exactly 3 concrete talking points per slide, generated from your actual content.
- **Transition statements** — Natural bridges from each slide to the next, so you never lose the thread.
- **Core message highlights** — The single most important takeaway per slide, surfaced prominently.
- **Keyword tags** — 3–5 keywords per slide for quick mental anchoring before you speak.
- **Stage directions & visual cues** — Contextual reminders tied to charts, images, and diagrams on your slides.
- **Statistics extraction** — Numbers and percentages pulled directly from your deck — no fabrication.
- **Timing & energy levels** — Per-slide recommendations (High / Medium / Low energy) and suggested speaking duration.
- **Built-in presentation timer** — Start, pause, and reset a live clock without leaving the presenter view.
- **Keyboard navigation** — `←` / `→` to move between slides, `Space` to toggle the timer, `Esc` to return to the dashboard.
- **Slide thumbnail sidebar** — Scrollable overview of all slides with instant jump-to navigation.
- **Deck history** — Dashboard keeps all previously processed decks accessible.

---

## How It Works

```
Upload PDF / PPTX
       │
       ▼
Browser parses slides with pdfjs-dist
(text + image extraction per slide)
       │
       ▼
Supabase Edge Function: generate-guide
(Deno runtime, authenticated via JWT)
       │
       ▼
Anthropic Claude API (claude-sonnet-4-6)
System prompt: executive speaking coach persona
Input: slide texts + deck title
Output: structured JSON guide array
       │
       ▼
SpeakerGuideView — keyboard-driven presenter interface
```

Each slide in the output conforms to a strict schema: title, 3 talking points, transition statement, core message, keywords, stats, visual cue, and speaker timing/energy. The Claude system prompt enforces a 50-word cap per section to keep guides scannable under pressure.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| UI Components | Shadcn/UI (Radix UI primitives) |
| Styling | TailwindCSS 3, CSS custom properties |
| Data Fetching | TanStack Query (React Query 5) |
| Forms | React Hook Form + Zod |
| PDF Processing | pdfjs-dist 4 (browser-side) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) |
| Edge Functions | Supabase Functions (Deno runtime) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Routing | React Router 6 |
| Animations | canvas-confetti, Tailwind animations |

---

## Repository Structure

```
smart-pitch-coach/
├── src/
│   ├── components/
│   │   ├── ui/                   # 50+ Shadcn/UI primitives
│   │   ├── AuthGuard.tsx         # Route protection
│   │   ├── DeckCard.tsx          # Dashboard deck card
│   │   ├── EmptyState.tsx        # Onboarding / upload prompt
│   │   ├── FileUpload.tsx        # Drag-and-drop upload handler
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── ProcessingCelebration.tsx  # Post-generation success modal
│   │   ├── SlideGuide.tsx        # Individual slide guide card
│   │   └── SpeakerGuideView.tsx  # Full presenter interface
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── integrations/supabase/
│   │   ├── client.ts             # Supabase client init
│   │   └── types.ts              # Auto-generated DB types
│   ├── pages/
│   │   ├── Index.tsx             # Dashboard + upload flow
│   │   ├── Login.tsx             # Auth page
│   │   └── NotFound.tsx
│   └── lib/utils.ts
├── supabase/
│   └── functions/
│       └── generate-guide/
│           └── index.ts          # Deno edge function (AI orchestration)
├── public/
│   ├── ai/system-prompt.txt      # Claude system prompt
│   └── pitchcoachAIlogo.png
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (or [Bun](https://bun.sh))
- A **Supabase** project (free tier works)
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/andrewr303/smart-pitch-coach.git
cd smart-pitch-coach

# Install dependencies
npm install
# or
bun install
```

### Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

Add the following as Supabase project secrets (via `supabase secrets set` or the Supabase dashboard):

```env
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### Deploy the Edge Function

```bash
# Authenticate with Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref <your-project-id>

# Deploy the guide generation function
npx supabase functions deploy generate-guide
```

### Run Locally

```bash
npm run dev
```

The app starts at `http://localhost:8080`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (port 8080) |
| `npm run build` | Production build |
| `npm run build:dev` | Development mode build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## Deployment

The frontend is a standard Vite SPA — deploy the output of `npm run build` to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

The backend runs entirely on Supabase:
- Authentication is handled by Supabase Auth
- The `generate-guide` edge function runs on Supabase's Deno runtime
- No separate server or container required

**Required environment variables for production:**

| Variable | Where | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend build env | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend build env | Supabase anon/public key |
| `ANTHROPIC_API_KEY` | Supabase secret | Anthropic API key for Claude |

---

## AI Guide Schema

Each slide in the generated guide returns this structure:

```typescript
{
  slideNumber: number;
  title: string;                  // ≤ 10 words
  keyTalkingPoints: string[];     // exactly 3 items
  transitionStatement: string;   // ≤ 50 words
  emphasisTopic: string;          // core message, ≤ 50 words
  keywords: string[];             // 3–5 items
  stats: string[];                // extracted numbers / percentages
  visualCue: string;              // stage direction, ≤ 15 words
  speakerReminder: {
    timing: string;               // e.g. "90 seconds"
    energy: "High" | "Medium" | "Low";
  };
}
```

The Claude system prompt (`public/ai/system-prompt.txt`) enforces strict word limits, prohibits hallucinated statistics, and includes 9 worked examples to anchor output consistency.

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and commit with a descriptive message
4. Push to your fork and open a pull request

Please keep PRs focused — one feature or fix per PR makes review faster.

---

## License

See [LICENSE](LICENSE) for details.
