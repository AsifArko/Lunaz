# Lunaz E-Commerce — Documentation Index

This directory contains the detailed specification and design documents for the Lunaz lifestyle and home décor online store.

## Documents

| Document                                                                 | Description                                                                                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [SPECIFICATION.md](./SPECIFICATION.md)                                   | **Main specification** — Architecture, tech stack, and feature requirements for Web, Manage, and Backend |
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)                               | Monorepo layout, shared packages, and system boundaries                                                  |
| [02-BACKEND.md](./02-BACKEND.md)                                         | Backend API, services, auth, and integrations (MongoDB, S3)                                              |
| [03-DATABASE.md](./03-DATABASE.md)                                       | MongoDB collections, schemas, and indexes                                                                |
| [04-WEB-APP.md](./04-WEB-APP.md)                                         | Customer-facing Web app — pages, flows, and UX                                                           |
| [05-MANAGE-APP.md](./05-MANAGE-APP.md)                                   | Admin/Manage app — CMS, orders, and reporting                                                            |
| [06-SHARED-PACKAGES.md](./06-SHARED-PACKAGES.md)                         | Shared TypeScript types, interfaces, and reusable React components                                       |
| [07-DOCKER-DEPLOYMENT.md](./07-DOCKER-DEPLOYMENT.md)                     | Docker setup and deployment configuration                                                                |
| [08-FEATURES-MATRIX.md](./08-FEATURES-MATRIX.md)                         | Feature checklist, priorities, and phases                                                                |
| [09-ANALYTICS-AND-LOGGING.md](./09-ANALYTICS-AND-LOGGING.md)             | Analytics tracking, server logging, and monitoring                                                       |
| [10-CI-CD-INTEGRATION.md](./10-CI-CD-INTEGRATION.md)                     | CI/CD pipeline, secure workflow, and deployment automation                                               |
| [15-AWS-EC2-DEPLOYMENT-PIPELINE.md](./15-AWS-EC2-DEPLOYMENT-PIPELINE.md) | AWS EC2 deployment, GitHub build pipeline, build tags, ESLint/Prettier/Husky                             |
| [EC2-SETUP.md](./EC2-SETUP.md)                                           | Step-by-step EC2 provisioning and deployment guide                                                       |
| [14-AUTHENTICATION.md](./14-AUTHENTICATION.md)                           | Authentication — JWT, refresh tokens, OAuth, sessions, auth logs, and security                           |

## Quick Reference

- **Web**: TypeScript + React — customer storefront (products, cart, checkout, profile, orders).
- **Manage**: TypeScript + React — admin CMS (products, images, prices, orders, sales, transactions).
- **Backend**: TypeScript + Node.js — single API for Web and Manage; MongoDB + S3.
- **Shared**: Strict typing; shared interfaces and reusable components across Web and Manage.

Start with [SPECIFICATION.md](./SPECIFICATION.md) for the full high-level spec, then use the numbered documents for implementation details.
