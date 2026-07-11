# Contributing to PromptDesk

Thank you for your interest in contributing to PromptDesk! We follow professional guidelines to keep our codebase clean, maintainable, and robust.

## How to Set Up Locally

For quick start, environment configurations, and database setups, please refer directly to the [Quick Start section in the README.md](README.md#quick-start).

## Development Guidelines

### Branch Naming Conventions
When starting on a new feature or fix, please branch off `main` and name your branch based on the following pattern:
- Features: `feat/your-feature-name`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/documentation-update`
- Refactoring: `refactor/refactor-name`

### Commit Message Guidelines
We use **Conventional Commits** style to automate our changelogs and version bumps. Ensure your commit message is structured as:

```
<type>: <short summary of changes>

[optional body describing detailed reason/context]
```

#### Valid Types:
- `feat`: A new feature (e.g., `feat: add word count constraint check to LLM compiler`)
- `fix`: A bug fix (e.g., `fix: resolve hydration overlap in 404 router redirect`)
- `docs`: Documentation-only updates (e.g., `docs: add DB ERD diagram to architecture note`)
- `style`: Changes that do not affect code logic (formatting, spacing)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding missing tests or correcting existing tests

## Pull Request Checklist
Before opening a Pull Request, ensure that:
1. All linting rules pass. Run:
   ```bash
   npm run lint
   ```
2. The TypeScript compiler verifies all types are strict and clean. Run:
   ```bash
   npx tsc --noEmit
   ```
3. The production build generates successfully without any errors:
   ```bash
   npm run build
   ```
