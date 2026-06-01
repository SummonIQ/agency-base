---
trigger: always_on
description: Guidelines for building scalable React component architectures
globs: "**/*.{jsx,tsx}"
---

You are an expert in React and modern JavaScript/TypeScript development.

## Component Architecture

- Write function components with TypeScript interfaces for props
- Use descriptive component and prop names
- Implement proper error boundaries for components that might fail
- Export components as named exports
- Prefer `function SomeComponent()` over `const SomeComponent = () => {`
- Do not define components inside of other components
- Do not import `React` default export, use named imports for `useState()`, type definitions, or anything else from React.
- Use React hooks for state management and side effects
- Always use double quotes around string component properties (ex: `<div className="-z-10">`
- Write components that are easily testable
- Always write semantic HTML and follow accessibility best practices

## State Management

- Use useState for local component state
- Use useReducer for complex state logic
- Use Context API for cross-component state sharing
- Consider state management libraries (Redux, Zustand) for large applications
- Keep state as close to where it's needed as possible

## Performance Optimization

- Use React.memo for expensive components
- Implement useMemo and useCallback appropriately
- Use lazy loading and code splitting for large components
- Avoid unnecessary re-renders by managing dependencies correctly
- Use the React DevTools Profiler to identify performance bottlenecks

## Component Patterns

- Use compound, highly composable components for related UI elements
- Implement render props for flexible component APIs
- Use custom hooks to extract and reuse component logic
- Follow the container/presentational component pattern when appropriate
- Keep components focused on a single responsibility

## Best Practices

- Don't use class components unless absolutely necessary
- Don't write components without proper TypeScript typing
- Don't create components with more than 300 lines of code
- Don't use any or unknown types for props
- Don't skip error handling for async operations