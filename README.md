# Social Publisher

**Multi-platform social media scheduling and analytics dashboard.**

## Overview

A web application for scheduling, publishing, and analyzing social media content across YouTube, Instagram, and TikTok — starting as a personal tool with plans to offer as a SaaS subscription service.

## Features

### Current (MVP)

- **Dashboard** — Overview stats: total posts, scheduled posts, views, engagement
- **Posts** — Create, edit, schedule, and publish posts to multiple platforms
- **Calendar** — Monthly calendar view of scheduled and published posts
- **Analytics** — Performance metrics per platform (views, likes, comments, shares, reach, impressions)
- **Accounts** — Connect/disconnect platform accounts

### Planned

- OAuth authentication for real platform connections
- Actual API publishing (YouTube, Instagram, TikTok APIs)
- Drag-and-drop post scheduling
- Bulk post scheduling
- Team collaboration (multi-user, approval workflows)
- Subscription plans (Free, Pro, Business)
- Email notifications for scheduled posts

## Tech Stack

- **Frontend**: React + TypeScript, React Router, Tailwind CSS 4, shadcn/ui
- **Backend**: Bun + Hono server (API routes)
- **Database**: SQLite via `bun:sqlite`
- **Deployment**: Zo Sites (Bun + Hono)

## Architecture

```
src/
├── App.tsx              # Router + layout
├── main.tsx             # React entry
├── components/
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── theme-provider.tsx
├── pages/
│   ├── Dashboard.tsx    # Overview stats
│   ├── Posts.tsx        # Post CRUD + scheduling
│   ├── Calendar.tsx     # Calendar view
│   ├── Analytics.tsx     # Metrics + charts
│   ├── Accounts.tsx     # Platform connections
│   └── api/
│       └── index.ts     # API routes
└── lib/
    └── db.ts            # Database init + seed data

server.ts                 # Hono server + Vite middleware
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List connected accounts |
| POST | `/api/accounts` | Connect a new account |
| DELETE | `/api/accounts/:id` | Disconnect account |
| GET | `/api/posts` | List posts (filter by status/platform) |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/publish` | Publish a post |
| GET | `/api/analytics` | Fetch analytics (filter by period/platform) |
| GET | `/api/calendar` | Fetch posts for calendar view |

## Development

The site runs on Zo Sites infrastructure. API routes are defined in `src/pages/api/index.ts` and are mounted by `server.ts`.

## Database Schema

- `users` — User accounts (demo user seeded by default)
- `accounts` — Connected platform accounts
- `posts` — Social media posts
- `analytics` — Performance metrics per post/platform

## Notes

- Demo data is seeded automatically on first load (1 user, 3 accounts, sample posts with analytics)
- Authentication is not yet implemented — all requests use the demo user
- OAuth flows for real platform connections are planned for future iterations
- Publishing currently simulates success (no actual API calls to YouTube/Instagram/TikTok)
