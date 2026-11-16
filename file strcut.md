# Business Operations Platform - File Structure

```text
business-operations-platform/
├── .git/
├── .gitignore
├── FILE_STRUCTURE.md
├── file strcut.md
├── db schema.pdf
├── node_modules/
├── package-lock.json
├── package.json
├── backend/
│   ├── .agents/
│   ├── .claude/
│   ├── .env
│   ├── .git/
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── .prettierrc
│   ├── .windsurf/
│   ├── README.md
│   ├── dist/
│   ├── nest-cli.json
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   ├── prisma7.config.ts
│   ├── skills-lock.json
│   ├── src/
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── main.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.spec.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt/
│   │   │   │   └── jwt.guard.ts
│   │   │   └── jwt.strategy/
│   │   │       └── jwt.strategy.ts
│   │   ├── organizations/
│   │   │   ├── departments/
│   │   │   │   ├── departments.controller.spec.ts
│   │   │   │   ├── departments.controller.ts
│   │   │   │   ├── departments.service.spec.ts
│   │   │   │   └── departments.service.ts
│   │   │   ├── members/
│   │   │   │   ├── members.controller.ts
│   │   │   │   └── members.service.ts
│   │   │   ├── organizations.controller.spec.ts
│   │   │   ├── organizations.controller.ts
│   │   │   ├── organizations.module.ts
│   │   │   ├── organizations.service.spec.ts
│   │   │   ├── organizations.service.ts
│   │   │   ├── permissions/
│   │   │   │   ├── permissions.controller.spec.ts
│   │   │   │   ├── permissions.controller.ts
│   │   │   │   ├── permissions.decorator.ts
│   │   │   │   ├── permissions.guard.ts
│   │   │   │   ├── permissions.service.spec.ts
│   │   │   │   └── permissions.service.ts
│   │   │   └── roles/
│   │   │       ├── roles.controller.spec.ts
│   │   │       ├── roles.controller.ts
│   │   │       ├── roles.service.spec.ts
│   │   │       └── roles.service.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── projects/
│   │   │   ├── projects.controller.spec.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.service.spec.ts
│   │   │   └── projects.service.ts
│   │   ├── tasks/
│   │   │   ├── tasks.controller.spec.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.module.ts
│   │   │   ├── tasks.service.spec.ts
│   │   │   └── tasks.service.ts
│   │   ├── workflow-states/
│   │   │   ├── workflow-states.controller.spec.ts
│   │   │   ├── workflow-states.controller.ts
│   │   │   ├── workflow-states.module.ts
│   │   │   ├── workflow-states.service.spec.ts
│   │   │   └── workflow-states.service.ts
│   │   ├── workflows/
│   │   │   ├── dto/
│   │   │   │   ├── create-workflow.dto.ts
│   │   │   │   ├── update-workflow.dto.ts
│   │   │   │   └── workflow-id.dto.ts
│   │   │   ├── workflows.controller.spec.ts
│   │   │   ├── workflows.controller.ts
│   │   │   ├── workflows.module.ts
│   │   │   ├── workflows.service.spec.ts
│   │   │   └── workflows.service.ts
│   │   └── ...
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── tsconfig.build.json
│   ├── tsconfig.build.tsbuildinfo
│   ├── tsconfig.json
│   ├── vitest.config.e2e.ts
│   └── vitest.config.ts
└── ...
```

## Updated project structure

- `backend/src/auth/` – authentication and JWT support
- `backend/src/organizations/` – organization, department, member, permission, and role modules
- `backend/src/projects/` – project module and service
- `backend/src/tasks/` – task module and service
- `backend/src/workflows/` – workflow module, controller, service, and DTOs
- `backend/src/workflow-states/` – workflow state tracking module
- `backend/src/prisma/` – Prisma integration
- `backend/prisma/schema.prisma` – main database schema

