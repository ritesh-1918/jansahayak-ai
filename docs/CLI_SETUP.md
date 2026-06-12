# GitHub CLI Setup Guide

We have initiated the installation of the **GitHub CLI (`gh`)** on your system. This tool allows you to perform GitHub actions (like creating PRs, managing releases, and configuring branch protection) directly from your terminal.

## 1. Verify Installation
The installation runs in the background. Once completed, you **must restart your terminal** (or VS Code) for the `gh` command to be recognized.

To verify, run:
```powershell
gh --version
```
*Expected output: `gh version 2.x.x (202x-xx-xx)`*

## 2. Authenticate
Before you can use the CLI, you must log in. Run:
```powershell
gh auth login
```
Follow the interactive prompts:
1.  **What account do you want to log into?** -> `GitHub.com`
2.  **What is your preferred protocol for Git operations?** -> `HTTPS` (or `SSH` if you have it set up)
3.  **Authenticate Git with your GitHub credentials?** -> `Yes`
4.  **How would you like to authenticate GitHub CLI?** -> `Login with a web browser`

Copy the **one-time code** provided, press `Enter`, and paste it into the browser window that opens.

## 3. Configure Branch Protection (Automated)
Once logged in, you can automate branch protection rules by running this command in your terminal:

```powershell
# Protect 'main' branch
gh api -X PUT "repos/:owner/:repo/branches/main/protection" `
  -f required_status_checks=null `
  -f enforce_admins=true `
  -f required_pull_request_reviews[dismiss_stale_reviews]=true `
  -f required_pull_request_reviews[require_code_owner_reviews]=false `
  -f required_pull_request_reviews[required_approving_review_count]=1 `
  -f restrictions=null

# Protect 'dev' branch
gh api -X PUT "repos/:owner/:repo/branches/dev/protection" `
  -f required_status_checks=null `
  -f enforce_admins=true `
  -f required_pull_request_reviews[dismiss_stale_reviews]=true `
  -f required_pull_request_reviews[require_code_owner_reviews]=false `
  -f required_pull_request_reviews[required_approving_review_count]=1 `
  -f restrictions=null
```
*(Note: Replace `:owner` and `:repo` with your actual username and repository name if not auto-detected contextually)*
