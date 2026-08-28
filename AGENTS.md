# Tak Makker project guidelines

## Architecture

- This is a Next.js App Router application written in strict TypeScript.
- `app/layout.tsx` owns the document shell, metadata, fonts, and global stylesheet.
- `app/page.tsx` is the client-side coordinator for the single-page project conversation workflow.
- UI components live under `app/components/`. Prefer focused components with clear responsibilities. Presentational components should receive data through props and report user actions through callbacks.
- Client-side project state and domain mutations belong in `hooks/useProject.ts`.
- Shared domain types and runtime contracts belong in `schemas/project.ts`.
- Browser-to-server AI requests go through `lib/ai/requestProjectUpdate.ts` and the `app/api/project/route.ts` Route Handler. Never expose the OpenAI API key or server-only SDK setup to client code.
- AI instructions and context builders live in `lib/ai/`; keep distinct prompt concerns in separate modules and compose them in `lib/ai/instructions.ts`.
- The application currently has no database or persistent store. Do not introduce persistence implicitly.

## React conventions

- Use function components and hooks.
- Add `"use client"` only where browser state, event handlers, or client-only APIs require it. Keep client boundaries as narrow as practical.
- Keep page-level orchestration in `app/page.tsx`: conversation state, active-tab state, request coordination, and composition of the project hook.
- Keep `app/page.tsx` primarily as an orchestration/composition layer. When functions or domain logic grow, prefer moving them into focused hooks or library modules rather than allowing `page.tsx` to become a large implementation file.
- Prefer controlled form elements. Pass values and callbacks through explicitly typed props.
- Keep presentational components free of request logic and unrelated domain state.
- Treat data as immutable. Update arrays with `map`, `filter`, and object spreads rather than mutating existing objects.
- Use stable domain IDs as React keys when available. Do not use an array index for mutable domain collections.
- Preserve the current precedence rule: explicit user choices and user-entered estimates override later AI suggestions.
- Derive calculated values, such as total labor price, from current state instead of storing duplicate state.
- When calling `useProject()`, use `projectManagerHook` as the local variable name rather than destructuring its return value. Access project state and actions through `projectManagerHook.*`.

## Project state

- `useProject` is the source of truth for the in-memory `ProjectDraft`.
- Keep work-item and material status values limited to `suggested`, `accepted`, and `rejected`.
- Match AI-generated work items and materials by stable `id` when merging responses.
- Preserve accepted or rejected statuses across AI responses.
- Preserve `estimatedHours` when `estimatedHoursSource` is `user`; AI estimates may only replace estimates whose source is `ai`.
- Labor totals include accepted work items only and use `(estimatedHours ?? 0) * hourlyRate`.
- Conversation messages and project draft state are separate concerns: messages provide AI context, while the project draft drives the structured tabs and calculations.

## Zod and domain contracts

- Define shared data shapes as Zod schemas in `schemas/`, then derive TypeScript types with `z.infer`. Do not maintain a separate handwritten interface for the same shape.
- Use `ProjectResponseSchema` as the contract between the OpenAI response, the Route Handler, and the browser.
- Keep structured model output constrained with `zodTextFormat` on the server.
- Validate untrusted data at runtime before placing it in application state. Browser responses should continue to use `safeParse` and handle validation failure explicitly.
- When changing a domain shape, update the schema first, then update producers, merge behavior, consumers, and prompt instructions together.
- Keep request and response types explicit; avoid `any`.

## Styling

- The project intentionally combines Tailwind utilities, global SCSS, and CSS Modules.
- Use Tailwind utility classes for small, local layout and typography rules directly visible in JSX.
- Put reusable application-wide primitives in `app/styling/`, following the existing partials for inputs, cards, headings, and buttons. Import global partials through `app/styling/globals.scss`.
- Use CSS Modules for page- or component-specific styles, responsive layouts, transitions, and selectors that benefit from local scoping.
- Import a CSS Module as `styles` and use its named classes through `styles.className`.
- Do not move component-specific rules into the global stylesheet without a reuse case.
- Reuse existing global classes such as `card`, `card-stack`, `card-row`, `card-title`, `section-heading`, and `primary-button` before creating equivalent styles.
- Preserve the existing responsive behavior: the workspace begins as a single-column input and reveals the tabbed area after the conversation starts, returning to one column on narrow screens.
- Prefer Tailwind for simple layout and positioning such as `flex`, spacing, width, `self-start`, and `self-end`.
- If the same visual pattern is repeated across components, promote it to a reusable global SCSS primitive instead of repeating the same Tailwind classes.
- Do not dynamically construct Tailwind class names such as `self-${value}`. Use complete class names so Tailwind can detect them at build time.

## API and AI behavior

- Keep the OpenAI call in the server Route Handler and read `OPENAI_API_KEY` only from the server environment.
- Send the full conversation plus current work-item and material context so the model can refine the same project over multiple turns.
- Keep prompt instructions conservative about project facts: the model may make professional suggestions but must not invent customer details, measurements, quantities, brands, prices, or other project-specific facts.
- Ask no more than three follow-up questions per response.
- Maintain stable IDs in AI output because client-side merging depends on them.
- Return meaningful non-2xx responses for server failures, and validate successful responses before use.

## File and code conventions

- Use the `@/` path alias for cross-project imports and relative imports for nearby colocated modules when that is clearer.
- Use `import type` for type-only imports.
- Follow the repository's existing formatting: double quotes, semicolons, trailing commas in multiline constructs, and readable multiline JSX props.
- Keep Danish user-facing copy and AI instructions in Danish. Keep identifiers and implementation comments in English.
- Do not add dependencies, persistence, authentication, routes, or broad abstractions unless the task requires them.

## Verification

- After code changes, run the narrowest relevant checks, followed by `npm run lint` for changes that affect TypeScript, React, or styling.
- Run `npm run build` when changing routing, server/client boundaries, schemas shared across boundaries, or production behavior.
- Never expose values from `.env.local` in logs, documentation, client code, or test output.
