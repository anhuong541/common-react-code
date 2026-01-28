# Hooks (Libraries)

This module contains all custom React hooks responsible for handling libraries across the application.

Its goal is to centralize reusable logic, keep components clean, and provide a consistent way to manage libraries.

## Scope

This component is responsible for:

- Handling libraries across the application
- Reusing complex logic across multiple components
- Improving separation between UI and business logic

## Usage

All application layers should interact only with the exposed interfaces from this module, never directly with libraries.

This enforces clear boundaries, improves maintainability, and simplifies future library changes.
