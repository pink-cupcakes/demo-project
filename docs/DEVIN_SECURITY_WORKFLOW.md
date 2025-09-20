# Devin Security Analysis Workflow

This document explains how to use the automated Devin security analysis workflow for analyzing and fixing CodeQL security vulnerabilities in pull requests.

## Overview

The Devin Security Analysis workflow provides:
- Manual trigger capability for analyzing specific PRs
- Detection of NEW vulnerabilities introduced in PRs (compared to base branch)
- Integration with Devin AI for automated security fix suggestions
- Automatic creation of separate fix PRs grouped by vulnerability type

## Workflows

### 1. `devin-security-analysis.yml`
**Purpose:** Analyze new security vulnerabilities in a PR and create Devin sessions for fix generation.

**Trigger:** Manual (`workflow_dispatch`)

**Inputs:**
- `pr_number` (required): Pull Request number to analyze
- `base_branch` (optional): Base branch to compare against (default: 'main')

### 2. `devin-fix-application.yml`
**Purpose:** Apply Devin's suggested security fixes and create fix PRs.

**Trigger:** Manual (`workflow_dispatch`)

**Inputs:**
- `session_id` (required): Devin session ID with security fixes
- `vulnerability_group` (required): Vulnerability group name (e.g., CWE-78-Command-Injection)
- `target_branch` (required): Target branch to create fix PR against
- `original_pr` (required): Original PR number that triggered the analysis

## Usage Instructions

### Step 1: Analyze a Pull Request

1. Navigate to **Actions** tab in GitHub
2. Select **"Manual Devin Security Analysis"** workflow
3. Click **"Run workflow"**
4. Enter the PR number you want to analyze
5. Optionally specify a different base branch (default is 'main')
6. Click **"Run workflow"**

### Step 2: Review Analysis Results

The workflow will:
1. Compare CodeQL alerts between the base branch and PR branch
2. Identify NEW vulnerabilities introduced in the PR
3. Group vulnerabilities by CWE type
4. Create Devin sessions for each vulnerability group
5. Post a summary comment on the original PR

### Step 3: Apply Security Fixes (Future Enhancement)

Once Devin completes the analysis:
1. Use the **"Apply Devin Security Fixes"** workflow
2. Provide the Devin session ID and vulnerability group
3. Specify the target branch (usually the PR's feature branch)
4. The workflow will create a new PR with suggested fixes

## Vulnerability Grouping

Vulnerabilities are grouped by CWE (Common Weakness Enumeration) types:

- **CWE-78**: Command Injection
- **CWE-22**: Path Traversal
- **CWE-79**: Cross-Site Scripting
- **CWE-89**: SQL Injection
- **CWE-798**: Hardcoded Credentials
- **CWE-338**: Weak Random Number Generator
- **CWE-1321**: Prototype Pollution
- **CWE-1333**: Regular Expression DoS
- **CWE-209**: Information Exposure
- **CWE-502**: Unsafe Deserialization
- **CWE-208**: Timing Attack
- **CWE-614**: Insecure Cookie
- **CWE-327**: Weak Cryptography
- **CWE-918**: Server-Side Request Forgery
- **CWE-362**: Race Condition

## Required Setup

### GitHub Secrets

Add the following secret to your repository:

- `DEVIN_API_TOKEN`: Your Devin API authentication token

### Permissions

The workflows require the following permissions:
- `contents: read/write`
- `security-events: read`
- `pull-requests: write`
- `issues: write`

## Example Workflow

1. **Developer creates PR** with new code changes
2. **Maintainer triggers analysis** using the manual workflow
3. **Workflow detects** 3 new vulnerabilities:
   - 2 × CWE-78 (Command Injection)
   - 1 × CWE-79 (XSS)
4. **Workflow creates** 2 Devin sessions (one per vulnerability group)
5. **Workflow posts** summary comment on original PR
6. **Devin analyzes** vulnerabilities and generates fixes
7. **Maintainer applies fixes** using the fix application workflow
8. **Workflow creates** 2 separate fix PRs against the feature branch
9. **Developer reviews** and merges approved fixes

## Benefits

- **Focused Analysis**: Only analyzes NEW vulnerabilities, not existing ones
- **Automated Grouping**: Organizes fixes by vulnerability type for easier review
- **Separate PRs**: Each vulnerability type gets its own PR for targeted fixes
- **Manual Control**: Triggered only when needed, not on every PR
- **Expert Analysis**: Leverages Devin AI's security expertise for fix suggestions

## Limitations

- Requires manual triggering for each PR analysis
- Devin API integration depends on external service availability
- Fix application workflow is currently a framework (needs enhancement for actual code changes)
- Limited to CodeQL-detected vulnerabilities

## Troubleshooting

### Common Issues

1. **No new vulnerabilities detected**
   - Verify the PR actually introduces new security issues
   - Check that CodeQL analysis has run on both branches
   - Ensure changed files contain the vulnerabilities

2. **Devin API errors**
   - Verify `DEVIN_API_TOKEN` is correctly set in repository secrets
   - Check Devin API service status
   - Review workflow logs for specific error messages

3. **Permission errors**
   - Ensure repository has required permissions enabled
   - Check that the GitHub token has appropriate scopes

### Debug Steps

1. Check workflow run logs in the Actions tab
2. Verify CodeQL analysis results in Security tab
3. Review PR comments for analysis summaries
4. Check repository secrets configuration

## Future Enhancements

- **Automatic fix application**: Direct code changes without manual intervention
- **Integration with existing CI/CD**: Trigger analysis as part of PR checks
- **Custom vulnerability rules**: Support for project-specific security patterns
- **Batch processing**: Analyze multiple PRs simultaneously
- **Notification system**: Slack/email alerts for security findings
