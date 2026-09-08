# FashionVista Frontend

Customer-facing storefront for FashionVista e-commerce.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Server state | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Carousel | Embla Carousel |
| Icons | Lucide React |
| Charts | Recharts |

## Folder Structure

```
src/
  assets/         Static assets
  components/     Reusable UI components
  pages/          Route-level page components
  hooks/          Custom React hooks
  services/       API call functions (Axios)
  store/          Zustand stores
  types/          TypeScript type definitions
  utils/          Helper functions
public/           Static files served as-is
```

## Commands

```powershell
cd D:\FashionVista\FashionVista_Frontend

npm run dev       # Dev server (Vite, usually :5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint check
npx tsc --noEmit  # Type check without emit
```

## Code Patterns

- **Data fetching**: TanStack Query `useQuery`/`useMutation` wrapping Axios service functions
- **Forms**: `useForm` from React Hook Form + Zod schema for validation
- **Global state**: Zustand stores in `src/store/`
- **Auth**: In-memory auth (no localStorage/cookie persistence) — see recent commits
- **Routing**: `react-router-dom` `<Routes>` in App.tsx or similar root

## API

Backend runs at `http://localhost:8080` (dev) or configured via env var.

## Conventions

- Functional components only, no class components
- Named exports preferred over default for components
- Tailwind classes directly in JSX (no CSS modules)
- No `console.log` in committed code
- TypeScript strict — no `any` without comment explaining why
