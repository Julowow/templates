# Bloc 7 — UI Foundation (shadcn/ui + Tailwind + Toast)

Base UI production-ready pour tout projet React + Tailwind.

## Features

- Setup shadcn/ui complet (Radix UI + CVA + Tailwind)
- `cn()` utility (clsx + tailwind-merge)
- Logger dev-only (silencieux en prod)
- Toast system complet (hook + reducer + composants Radix)
- Config Tailwind avec CSS variables pour theming
- PostCSS + Autoprefixer

## Structure

```
src/
  lib/
    utils.ts              # cn() utility
    logger.ts             # Dev-only logger
    api.ts                # API client template
  hooks/
    use-toast.ts          # Toast state management
  components/ui/
    toast.tsx             # Toast components (Radix)
    toaster.tsx           # Toaster wrapper
  index.css               # Tailwind base + CSS variables
tailwind.config.ts        # Tailwind config
postcss.config.js         # PostCSS
components.json           # shadcn/ui config
package.json              # Dependencies
```

## Usage

```bash
npm install
# Ajouter d'autres composants shadcn :
npx shadcn@latest add button
npx shadcn@latest add dialog
```

## Toast usage

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Success",
  description: "Operation completed.",
});

toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong.",
});
```

## Customisation

1. Modifier les CSS variables dans `index.css` pour changer le theme
2. Changer la font dans `tailwind.config.ts`
3. Ajouter des composants shadcn via `npx shadcn@latest add <component>`
