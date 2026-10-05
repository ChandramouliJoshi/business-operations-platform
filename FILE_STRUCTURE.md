# Business Operations Platform - File Structure

This repository currently contains a NestJS backend application and a Prisma database schema definition.

```text
business-operations-platform/
├── .git/
├── FILE_STRUCTURE.md
├── db schema.pdf
├── backend/
│   ├── .agents/
│   ├── .claude/
│   ├── .env
│   ├── .git
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── .prettierrc
│   ├── .windsurf/
│   ├── README.md
│   ├── dist/                  # generated build output
│   ├── generated/             # Prisma client generation output
│   ├── node_modules/          # installed dependencies
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma      # main Prisma schema
│   ├── prisma7.config.ts
│   ├── skills-lock.json
│   ├── src/
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── main.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── tsconfig.build.json
│   ├── tsconfig.build.tsbuildinfo
│   ├── tsconfig.json
│   ├── vitest.config.e2e.ts
│   └── vitest.config.ts
└── .git/                     # repository metadata
```

## Core application structure

- `backend/src/main.ts` – application entry point
- `backend/src/app.module.ts` – root NestJS module
- `backend/src/app.controller.ts` – basic API controller
- `backend/src/app.service.ts` – application service logic
- `backend/src/prisma/prisma.service.ts` – Prisma database connection/service
- `backend/src/prisma/prisma.module.ts` – Prisma module registration
- `backend/prisma/schema.prisma` – database models and relationships

## Domain model highlights

The Prisma schema defines entities such as:

- `users`
- `organizations`
- `departments`
- `projects`
- `requests`
- `tasks`
- `roles`
- `permissions`
- `workflows`
- `audit_logs`
- `notifications`
- `approvals`
