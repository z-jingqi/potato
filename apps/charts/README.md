# Charts - Personal Data Tracking App

A mobile-first web application for tracking and visualizing personal data with custom charts. Built with Next.js, deployed on Cloudflare Pages.

## Features

- **Custom Charts**: Create trend charts (time-series with visualizations) or simple record charts
- **Multiple Value Types**: Track numbers, text, or boolean (yes/no) values
- **Advanced Visualizations**: Line, bar, and area charts using Recharts
- **Categories**: Organize your charts (coming soon)
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Secure Authentication**: Username/password authentication with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Data Fetching**: SWR for optimistic UI updates
- **Database**: SQLite (local dev) / Cloudflare D1 (production)
- **ORM**: Drizzle ORM
- **Charts**: Recharts
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
cd charts
npm install
```

2. The database is already initialized. If needed, you can reset it:

```bash
npm run db:push
```

3. Update the `.env.local` file with a secure secret:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=./local.db
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create Account**: Click "Create Account" on the home page or navigate to `/register`
   - Enter your username and password
   - Password must be at least 8 characters
2. **Sign In**: After registration, sign in with your credentials
3. **Create a Chart**: Click "New" button to create your first chart
   - Choose between Trend (for time-series data) or Record (for simple entries)
   - Select value type: Number, Text, or Yes/No
   - For number values, add a unit (kg, cm, etc.)
4. **Add Data**: Open a chart and click "Add" to enter data points
5. **View Trends**: Charts automatically visualize your data over time

## Project Structure

```
charts/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── charts/           # Chart pages
│   │   └── categories/       # Category management
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth
│   │   ├── charts/           # Chart CRUD
│   │   ├── categories/       # Category CRUD
│   │   └── register/         # User registration
│   ├── login/                # Login page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn components
│   └── user-menu.tsx         # User menu with sign out
├── lib/
│   ├── db/                   # Database schema & client
│   ├── hooks/                # SWR hooks
│   └── validations/          # Zod schemas
└── types/                    # TypeScript types
```

## Database Schema

- **users**: User accounts
- **categories**: Chart categories
- **charts**: Chart definitions
- **data_points**: Individual data entries

## Deployment to Cloudflare Pages

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Create a D1 database:
```bash
wrangler d1 create charts-db
```

3. Update `wrangler.toml` with your database ID

4. Deploy:
```bash
npm run pages:deploy
```

## Security Notes

- Change `NEXTAUTH_SECRET` to a secure random string in production
- Passwords are hashed with bcrypt
- All dashboard routes are protected by middleware
- Database access is restricted to authenticated users

## Future Enhancements

- [ ] Category management UI
- [ ] Data export (CSV, JSON)
- [ ] Chart sharing
- [ ] Progressive Web App (PWA) features
- [ ] Data aggregation (daily/weekly/monthly)
- [ ] Multiple chart types (pie, scatter, heatmap)
- [ ] Bulk data import
- [ ] Dark mode toggle
- [ ] Chart templates

## License

ISC
