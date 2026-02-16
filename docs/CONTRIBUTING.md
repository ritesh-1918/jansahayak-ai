# Contributing to JanSahayak AI

## Branch Strategy

We follow a strict branching strategy to ensure code quality and stability.

*   **`main`**: Production branch. deployable code only. **Protected.**
*   **`dev`**: Integration branch. All features merge here first. **Protected.**
*   **`asna-dev`**: Backend development (FastAPI, Database).
*   **`ritesh-dev`**: AI & UI development (React Native, LLM).

## Branch Protection Rules (Manual Setup Required)

Since this is a new repository, please configure the following rules in **Settings -> Branches**:

### For `main` and `dev` branches:
1.  **Require a pull request before merging**
2.  **Require approvals** (at least 1 reviewer)
3.  **Do not allow bypassing the above settings**

## Workflow

1.  **Checkout** your feature branch (`asna-dev` or `ritesh-dev`).
2.  **Commit** your changes.
3.  **Push** to origin.
4.  Create a **Pull Request (PR)** to `dev`.
5.  Get it **reviewed and merged**.
6.  Periodically, `dev` will be merged into `main` for releases.
