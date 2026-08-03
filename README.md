# Paylocity STE Assessment - QA Automation

Automated test suite for the Benefits Dashboard bug-finding and automation challenge, implemented in both **Cypress** and **Playwright** to demonstrate a working migration path between the two frameworks.

## Submission Contents

- **Bug reports**: see the [Notion bug tracker](https://app.notion.com/p/Paylocity-Bug-Finding-Challenge-3ae3d6e9d6f7806eb275da2cff12d413?source=copy_link) (16 findings, categorized as UI, API, or Both, with severity, steps to reproduce, and expected/actual results)
- **API test automation**: `cypress/e2e/api/` and `playwright/e2e/tests/api/`
- **UI test automation**: `cypress/e2e/ui/` and `playwright/e2e/tests/ui/`
- **Instructions for running the tests**: below

## Why both frameworks

This repo intentionally implements the same test coverage in Cypress and Playwright side by side, rather than picking one. The intent is to demonstrate that a Cypress-to-Playwright migration is low-risk: every test case, page object pattern, and piece of test logic has a working, verified Playwright equivalent.

A few deliberate framework differences are called out inline where relevant (see "Framework Notes" below) rather than hidden, since understanding _why_ something differs is more useful than pretending the two frameworks are identical under the hood.

## Setup

```bash
yarn install
npx playwright install --with-deps
```

Copy `.env.example` to `.env` and fill in the real credentials (provided separately):

```dotenv
BASE_URL=https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/
UI_LOGIN_URL=https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Account/Login
TEST_USERNAME=
TEST_PASSWORD=
TEST_AUTH_TOKEN=
```

Note the trailing slash on `BASE_URL`, required for Playwright's URL resolution to correctly preserve the `/Prod` path segment.

## Running the tests

### Cypress

```bash
npx cypress open                                    # interactive
npx cypress run                                     # headless, all tests
npx cypress run --env grepTags=@smoke                # smoke only
npx cypress run --env grepTags=@regression            # regression only
```

### Playwright

```bash
npx playwright test --ui                              # interactive
npx playwright test                                    # headless, all browsers, all tests
npx playwright test --grep @smoke --project=chromium   # smoke only, single browser
npx playwright test --grep @regression                # regression only, all browsers
```

Playwright is configured for **Chromium, Firefox, and WebKit**. Cypress runs on Chrome. Both are wired into GitHub Actions (`.github/workflows/`) with a smoke/regression matrix, a nightly scheduled run, and manual dispatch with tag selection.

## Project Structure

```
cypress/
  e2e/
    api/          API test specs (includes crudCoverage.spec.ts)
    ui/            UI test specs
    security/      Auth/session-related specs
  support/
    pages/         Page Object selectors
    utils/         Shared test logic (API auth, employee CRUD helpers, drift logging)
  results/         Generated evidence (rounding-drift.json)

playwright/
  e2e/tests/
    api/           API test specs (includes crudCoverage.spec.ts)
    ui/            UI test specs
    security/      Auth/session-related specs
  support/
    pages/         Page Object classes
    utils/         Shared test logic (mirrors Cypress structure)
  .auth/           Generated storage state (gitignored)
  results/         Generated evidence (rounding-drift.json)
```

## Framework Notes

A few places where the two implementations differ by design, not oversight:

- **Auth caching**: Cypress uses `cy.session()` with a `validate()` callback; Playwright uses a one-time `auth.setup.ts` project that writes `storageState`, restored automatically by every other test. Different mechanism, same goal (log in once, reuse the session).
- **API auth header injection**: Cypress scopes this via `cy.intercept('/Prod/api/**', ...)`; Playwright uses `page.route('**/api/**', ...)`. Both attach the required `Authorization: Basic` header only to API calls, not page navigations.
- **Cross-browser support**: Playwright runs the same suite against Chromium, Firefox, and WebKit natively via its `projects` config. Cypress requires separate browser launchers/configuration per engine to achieve the same coverage.
- **Concurrent-safe result logging**: the rounding-drift test suite writes evidence to disk from multiple tests. Cypress's command queue made a straightforward read-modify-write approach safe by default (Cypress executes commands sequentially within a spec). Playwright's default parallelism required a different approach: each test appends one line to a `.jsonl` file (safe under concurrent writers), merged into a clean `.json` array once all tests complete.

## Key Findings

A few findings worth highlighting beyond the full list in the bug tracker:

- **Annual deduction rounding shortfall (High)**: the Benefits Dashboard rounds each paycheck's deduction to the nearest cent before that rounded value is used as the actual per-paycheck deduction, rather than calculating the true annual cost first. This causes the sum of 26 paychecks to differ from the documented annual cost formula ($1000/year base + $500/year per dependent), with drift (in one case, an overcharge; in others, a shortfall) ranging from a few cents to over ten cents per employee per year depending on dependent count. At scale, across a real client's employee base, this compounds into a real financial discrepancy. Full evidence, including exact drift figures for six dependent counts and automated proof in both frameworks, is reproducible via `confirmAnnualDeductionAccuracy.spec.ts`.
- **Unprotected salary field on update (High)**: `POST` correctly treats `salary` as a read-only, server-generated field, but `PUT` does not enforce the same protection, allowing an arbitrary salary to be submitted and persisted, with all dependent calculations (`gross`, `benefitsCost`, `net`) recomputing from that unvalidated input. Confirmed via a follow-up `GET` that the corrupted values persist server-side, not just in the `PUT` response.
- **Misleading status codes, a recurring pattern**: three separate cases were found where the API returns an incorrect or misleading HTTP status for invalid input rather than a clear 400/401, an unrecognized login username returns 405, invalid `dependants` values return 405, and a malformed auth token returns 500 instead of 401. Documented as a cross-cutting pattern rather than three unrelated bugs, since it points to a shared gap in how invalid input is handled across the API.

## Author

Jennifer Ward
