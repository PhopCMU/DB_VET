# GEMINI.md

## Project Overview

This is a Next.js application that serves as an admin dashboard for the Faculty of Veterinary Medicine at Chiang Mai University. It uses CMU IT ACCOUNT for authentication and provides a user interface for managing and monitoring the system.

The application is built with the following technologies:

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Custom components, with animations from Framer Motion
*   **State Management:** Zustand
*   **HTTP Client:** Axios
*   **Authentication:** CMU IT ACCOUNT (OAuth 2.0)
*   **Device Identification:** FingerprintJS Pro

The project is structured as a standard Next.js application with the `app` directory. The main pages are the login page (`app/page.tsx`) and the dashboard page (`app/dashboard/page.tsx`). The application's UI and text are primarily in Thai.

## Building and Running

To run the application in a development environment, use the following command:

```bash
bun install
bun run dev
```

This will start the development server at `http://localhost:4040`.

To build the application for production, use the following command:

```bash
bun run build
```

This will create an optimized production build in the `.next` directory.

To start the production server, use the following command:

```bash
bun run start
```

This will start the application on the port specified in the `start` script in `package.json`.

**Note:** The `next.config.ts` file disables ESLint and TypeScript checks during the build process. It is recommended to run these checks manually before committing code.

## Development Conventions

*   **Package Manager:** The project uses `bun` as the package manager.
*   **Code Style:** The project uses the default Next.js ESLint and Prettier configurations.
*   **Branching:** The repository does not provide information about the branching strategy. It is recommended to use a standard branching model like GitFlow or GitHub Flow.
*   **Commits:** The repository does not provide information about commit message conventions. It is recommended to use a standard like Conventional Commits.
*   **Testing:** The project does not include any tests. It is recommended to add a testing framework like Jest or Playwright to ensure code quality.
*   **Localization:** The application is primarily in Thai. Any new UI components or pages should be created with Thai text.
