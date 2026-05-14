# Security: Frontend XSS Safety (Next.js)

## When to use
- Rendering any user-generated or remote HTML/text (comments, descriptions, titles)
- Rendering URLs from API (links, images)
- Using markdown/html renderers
- Building Client Components (`"use client"`) that render remote content

## Steps
1) Default to React escaping:
    - Render strings normally: `{text}` is escaped by React
2) Avoid `dangerouslySetInnerHTML`:
    - If absolutely needed, sanitize HTML with a proven sanitizer and document why
3) Validate/normalize URLs:
    - Allow only http/https for external links
    - Prefer `next/link` for internal links
4) Treat “HTML-like” input as untrusted:
    - Never trust server-provided HTML unless contract explicitly guarantees sanitization

## Pitfalls
- Using `dangerouslySetInnerHTML` without sanitization
- Constructing URLs with user input without validation (javascript: URLs)
- Injecting raw SVG/HTML from API responses
- Passing unsanitized HTML from Server Components into Client Components

## Minimal snippet (safe text rendering)
```tsx
type Props = { title: string; description: string };

export function SafeCard({ title, description }: Props) {
   return (
      <article className="rounded border bg-white p-4">
         <h2 className="font-semibold">{title}</h2>
         <p className="text-slate-600">{description}</p>
      </article>
   );
}
```

## Minimal snippet (safe external link validation)
```ts
export function safeExternalUrl(raw: string): string | null {
   try {
      const u = new URL(raw);
      if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
      return null;
   } catch {
      return null;
   }
}
```

## Update notes
- (append new learnings here)
