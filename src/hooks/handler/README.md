# Hooks (State & Action Management)

This module contains all custom React hooks responsible for handling state, side effects, and state-related actions across the application.

Its goal is to centralize reusable logic, keep components clean, and provide a consistent way to manage state transitions and behaviors.

## Scope

This component is responsible for:

- Managing local and shared state logic
- Encapsulating state-related actions and handlers
- Handling side effects (e.g. data syncing, subscriptions)
- Reusing complex logic across multiple components
- Improving separation between UI and business logic

## Usage

All application layers should interact only with the exposed interfaces from this module, never directly with state management libraries.

This enforces clear boundaries, improves maintainability, and simplifies future state management changes.
