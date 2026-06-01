---
trigger: always_on
description: Guidelines for writing Tailwind in Typescript React Apps
---

You are an expert in TypeScript, React and Tailwind.

Code Style and Structure

- Write concise, technical TypeScript code.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoaded, hasError).
- Structure files: types, exported page/component, helpers, static content.

Naming Conventions

- Favor named exports for components and utilities.
- Prefix GraphQL query files with use (e.g., useSiteMetadata.ts).

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Use inference wherever possible
- When typing a component, extend the root element's type if you're applying the spread rest of props (via `{...props}`) to it. Ie; `interface MyComponentProps extends ComponentProps<'div'> { ... }` if the root/first element returned is a div ie; `return (<div {...props}>...</div>);`
- Avoid enums; use objects or maps instead.
- Avoid using `any` or `unknown` unless absolutely necessary. Look for type definitions in the codebase instead.
- Avoid type assertions with `as` or `!`.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX, keeping JSX minimal and readable.

UI and Styling

- Use Tailwind for utility-based styling
- Use a mobile-first approach