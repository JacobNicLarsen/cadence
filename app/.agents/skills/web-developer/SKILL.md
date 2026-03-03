---
name: web-developer
description: Full-stack web development expert specializing in React, Node.js, modern web architectures, design systems, and API integration. Use when building or refactoring web applications, dashboards, SPAs, or full-stack projects. Covers frontend (React/Vite/Tailwind), backend (Node/Express), APIs, database design, and deployment.
---

# Web Developer

## Recommended Model
**Primary:** `codex` - Full-stack implementation, React components, API endpoints, database queries
**Architecture:** `opus` - Complex system design, architectural decisions, scalability planning
**Quick fixes:** `sonnet` - Bug fixes, small features, CSS tweaks

---

## 🔄 Automatic QA Policy

**Status:** ✅ **ENABLED** - Always iterate for UI/UX work; selective for backend

**Why:** Frontend/UI work is subjective and visual quality matters. Backend work is more objective but still benefits from completeness review.

**What this means:**
- Fitz automatically QA's all web development deliverables after sub-agent completion
- Creates detailed feedback document if requirements missing or quality issues found
- Spawns iteration agent with feedback until work is complete
- You only review finished, production-ready code

**Quality Bar:**
- ✅ Meets ALL requirements in task brief (not partial completion)
- ✅ UI work matches any design inspiration provided
- ✅ Code is clean, well-organized, and maintainable
- ✅ Responsive design works on mobile and desktop
- ✅ Dark mode support if applicable
- ✅ No placeholder/rough styling on customer-facing interfaces
- ✅ Backend APIs have proper error handling and validation
- ✅ Works correctly - no obvious bugs or breaking changes

**Exceptions:**
- **Quick fixes/patches:** Single QA review, don't iterate unless broken
- **Backend-only work:** Light QA (works correctly?), not visual polish
- **Experiments/prototypes:** Skip QA if marked as draft

**You can override:** Say "skip QA" or "good enough, ship it" to bypass iteration

---

## Core Expertise

### Frontend Development
- **React** - Modern hooks, component patterns, state management
- **Vite** - Fast builds, HMR, optimization
- **Tailwind CSS** - Utility-first styling, design systems
- **Chart.js / D3** - Data visualization
- **Responsive design** - Mobile-first, accessible UIs

### Backend Development
- **Node.js + Express** - RESTful APIs, middleware, routing
- **Database integration** - PostgreSQL, MongoDB, Supabase
- **Authentication** - OAuth, JWT, session management
- **API design** - RESTful patterns, versioning, documentation

### Full-Stack Patterns
- **Project structure** - Monorepo vs. separate repos
- **State management** - Context, Zustand, React Query
- **Error handling** - Client + server side
- **Performance optimization** - Code splitting, lazy loading, caching
- **Deployment** - Vercel, Railway, PM2, Docker

## Project Architecture Checklist

Before starting any web project, define:

### 1. **Tech Stack**
- Frontend framework (React, Vue, vanilla JS?)
- Build tool (Vite, Next.js, Create React App?)
- Styling approach (Tailwind, CSS modules, styled-components?)
- State management (Context, Zustand, Redux?)
- Backend runtime (Node, Deno, Bun?)
- Database (PostgreSQL, MongoDB, Supabase, Firebase?)

### 2. **Project Structure**
```
project-name/
├── frontend/           # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── api/       # API client functions
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── backend/           # Express API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── server.js
└── README.md
```

### 3. **Data Flow**
- How does data get from backend → frontend?
- Where is state stored (local, context, external store)?
- How are API calls handled (fetch, axios, React Query)?
- What's the caching strategy?

### 4. **Error Handling**
- Client-side error boundaries
- API error responses (consistent format)
- User-facing error messages
- Logging strategy

## React Best Practices

### Component Patterns

**Presentational Components** (UI only):
```jsx
export function MetricCard({ title, value, change, status }) {
  return (
    <div className={`card status-${status}`}>
      <h3>{title}</h3>
      <div className="value">{value}</div>
      <div className={`change ${change > 0 ? 'positive' : 'negative'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
      </div>
    </div>
  )
}
```

**Container Components** (logic):
```jsx
export function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false))
  }, [])
  
  if (loading) return <LoadingSpinner />
  return <MetricCard {...data} />
}
```

**Custom Hooks** (reusable logic):
```jsx
function useAPI(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [endpoint])
  
  return { data, loading, error }
}
```

### State Management Philosophy
- **useState** - Local component state
- **useContext** - Shared state (theme, user, global settings)
- **React Query / SWR** - Server state (API data, caching)
- **Zustand / Redux** - Complex global state (if really needed)

**Rule:** Keep state as local as possible. Lift only when necessary.

## API Design Patterns

### RESTful Endpoints
```
GET    /api/portfolio/overview       # Summary stats
GET    /api/properties               # List all properties
GET    /api/properties/:id           # Single property details
POST   /api/properties/:id/metrics   # Update metrics
GET    /api/insights                 # AI-generated insights
GET    /api/alerts                   # Active alerts
```

### Response Format (Consistent)
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-29T20:00:00Z",
    "cached": true
  }
}
```

### Error Format
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid property ID",
    "details": { ... }
  }
}
```

## Performance Optimization

### Frontend
- **Code splitting** - Lazy load routes/components
- **Memoization** - `useMemo`, `React.memo` for expensive renders
- **Virtualization** - For long lists (react-window)
- **Image optimization** - WebP, lazy loading, srcset
- **Bundle analysis** - Keep bundle size < 500KB

### Backend
- **Caching** - Redis, in-memory cache for frequent queries
- **Database indexing** - Index frequently queried fields
- **Rate limiting** - Prevent API abuse
- **Compression** - gzip/brotli responses
- **Connection pooling** - Reuse database connections

### Network
- **HTTP/2** - Multiplexing, server push
- **CDN** - Static assets served from edge
- **Prefetching** - Preload critical resources
- **Service workers** - Offline support, caching

## Design System Integration

When building UIs, establish:

### 1. **Color System**
```css
:root {
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
}
```

### 2. **Typography Scale**
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
```

### 3. **Spacing System**
```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
```

### 4. **Component Library**
- Buttons (primary, secondary, danger, ghost)
- Cards (default, elevated, bordered)
- Inputs (text, select, checkbox, radio)
- Alerts (success, warning, error, info)
- Modals, tooltips, dropdowns
- Loading states (spinners, skeletons)

## Common Pitfalls to Avoid

### Frontend
- ❌ Prop drilling (use Context or composition)
- ❌ Too many useEffect hooks (consolidate logic)
- ❌ Inline styles (use CSS modules or Tailwind)
- ❌ Not handling loading/error states
- ❌ Forgetting accessibility (ARIA labels, keyboard nav)

### Backend
- ❌ No input validation (validate everything)
- ❌ SQL injection vulnerabilities (use parameterized queries)
- ❌ Exposing sensitive data (sanitize responses)
- ❌ No rate limiting (protect against abuse)
- ❌ Poor error messages (be specific but safe)

### Architecture
- ❌ Premature optimization (build it first, optimize later)
- ❌ Over-engineering (KISS principle)
- ❌ No separation of concerns (mix UI + logic)
- ❌ Tight coupling (components should be modular)
- ❌ No testing (at least smoke tests for critical paths)

## Deployment Checklist

Before shipping:
- [ ] Environment variables configured (not hardcoded)
- [ ] Error logging set up (Sentry, LogRocket)
- [ ] Analytics tracking (GA4, Plausible)
- [ ] Performance monitoring (Lighthouse, Web Vitals)
- [ ] Security headers configured (CSP, CORS, HSTS)
- [ ] Database backups scheduled
- [ ] SSL certificate active
- [ ] API rate limiting enabled
- [ ] Error boundaries in place
- [ ] Loading states for all async actions
- [ ] Mobile responsiveness tested
- [ ] Accessibility audit passed (WCAG AA minimum)
- [ ] README with setup instructions
- [ ] Documentation for API endpoints

## Debugging Workflow

### Frontend Issues
1. Check browser console (errors, warnings)
2. React DevTools (component tree, props, state)
3. Network tab (API calls, response times)
4. Performance tab (render times, memory leaks)

### Backend Issues
1. Check server logs (errors, stack traces)
2. Test endpoints with curl/Postman
3. Database query logs (slow queries)
4. Memory/CPU usage (resource leaks)

### Integration Issues
1. CORS errors (check headers)
2. Authentication failures (token expiration?)
3. Data format mismatches (backend vs frontend)
4. Caching issues (stale data)

## Tech Stack Decision Matrix

| Need | Recommended | Alternative |
|------|-------------|-------------|
| Frontend framework | React + Vite | Next.js (if SSR needed) |
| Styling | Tailwind CSS | CSS Modules |
| State management | Context + React Query | Zustand |
| Backend | Node + Express | Fastify (faster) |
| Database | PostgreSQL + Supabase | MongoDB |
| Deployment | Vercel (frontend) + Railway (backend) | Docker + VPS |
| Auth | Supabase Auth | Auth0, Clerk |
| Charts | Chart.js | Recharts, D3 |

## Example Project Structure (Analytics Dashboard)

```
analytics-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── InsightsPanel.jsx
│   │   │   └── TrafficChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   └── InsightsHub.jsx
│   │   ├── hooks/
│   │   │   ├── useAPI.js
│   │   │   ├── useInsights.js
│   │   │   └── useAlerts.js
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── portfolio.js
│   │   ├── insights.js
│   │   └── alerts.js
│   ├── services/
│   │   ├── ga4.js
│   │   ├── anomalyDetection.js
│   │   └── recommendations.js
│   ├── cache.js
│   └── server.js
└── README.md
```

## When to Ask for Help

- **Complex architectural decisions** → Use `opus` for strategic thinking
- **Performance bottlenecks** → Profile first, optimize second
- **Security concerns** → Always better to ask
- **Unfamiliar APIs** → Read docs, test in isolation first
- **Breaking changes** → Check migration guides, changelogs

## Quality Standards

**Ship code that:**
- ✅ Works on mobile AND desktop
- ✅ Has loading states for all async operations
- ✅ Handles errors gracefully (no silent failures)
- ✅ Is accessible (keyboard nav, ARIA labels)
- ✅ Performs well (Lighthouse score >90)
- ✅ Is maintainable (clear naming, comments where needed)
- ✅ Follows the project's existing patterns

**Don't ship code that:**
- ❌ Has console.log statements (remove or use proper logging)
- ❌ Has hardcoded API keys or secrets
- ❌ Breaks on edge cases (test thoroughly)
- ❌ Has poor performance (optimize critical paths)
- ❌ Is inaccessible (test with keyboard + screen reader)

## Philosophy

- **Pragmatic over perfect** - Ship working code, iterate based on real usage
- **User-first** - Performance, accessibility, and UX trump developer convenience
- **Consistency** - Follow established patterns in the codebase
- **Clarity** - Code is read more than written; prioritize readability
- **Resilience** - Assume things will fail; handle errors gracefully

---

**Use this skill when:** Building or refactoring web applications, making architectural decisions, optimizing performance, or debugging complex full-stack issues.
