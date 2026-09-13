## Frontend

### Installation

Run a command in your terminal from `frontend` folder to install dependencies:

```
npm i
```

Create `.env` file with local variables (see `.env.example` for example configuration)

### Run

Command:

```
npm run dev
```

Will start a dev server on localhost:5173

### Tech stack

- **React** — UI library
- **TypeScript** — static typing
- **Vite** — development server and production build tooling
- **Tailwind CSS** — utility-first styling
- **ESLint** — code-quality and linting
- **Prettier** — code formatting

### Architecture

The UI follows [**Atomic Design**](https://atomicdesign.bradfrost.com/) principles to keep components reusable and composable.

The general structure is:

```text
src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── pages/
├── hooks/
├── api/
├── types/
├── utils/
└── ...
```

### Import conventions

Imports follow three groups:

1. External libraries
2. Application imports using the `@/` alias
3. Relative imports

Example:

```tsx
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { useRequest } from "@/hooks/useRequest";

import { formatDate } from "./utils";
```

Imports are automatically sorted by ESLint.

### Code quality

The project uses:

- **Prettier** for formatting
- **ESLint** for code-quality rules
- **TypeScript** for type checking
- **ESLint import sorting** for consistent import organization

You can also run the checks manually:

```bash
npm run typecheck
npm run lint
npm run format:check
```
