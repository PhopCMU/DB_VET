# Project Facts

## Identity

- Package name: `dashboard_admin` (`package.json`).
- Product description: admin dashboard for the Faculty of Veterinary Medicine, Chiang Mai University (`GEMINI.md`).
- Primary UI language: Thai (`GEMINI.md`; most UI files use Thai comments/text).

## Technology stack

- Next.js `^15.5.9`, App Router; React `^19.0.0`; TypeScript `^5`.
- Tailwind CSS `^4`, PostCSS, local Noto Sans Thai font.
- Axios for HTTP; Zustand is installed for state management.
- Framer Motion, Recharts, Lucide/React Icons, React Modal, Toastify, SweetAlert2 and React Tooltip for UI.
- ExcelJS, jsPDF, jsPDF AutoTable, html2canvas, FileSaver, Mammoth and QRCode for export/document/payment-related UI.
- Vitest is configured in `vitest.config.ts`; scripts include `test`, `test:watch`, and `test:coverage`.
- Runtime scripts use Next on port `4040`; PM2 deployment is described in `README.md` and configured in `ecosystem.config.js`.

## Runtime facts

- `config/config_api.tsx` resolves `NEXT_PUBLIC_API_URL` with fallback `https://vmsanbox.vet.cmu.ac.th`.
- Browser auth token storage key is `authToken`; UI state also uses `localStorage` keys such as `project`, `module`, and `typeTab`.
- `.env` contains public configuration names for CMU auth, API, crypto, and SCB integration. Secret values are intentionally not recorded here.

