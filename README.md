# k6Load

This repository contains k6 protocol tests and one browser test for learning and running load, smoke, end-to-end, and browser-based checks.

## Prerequisites

Install k6:

- macOS: `brew install k6`
- Windows: `winget install k6`
- Linux: see the official k6 install docs

Optional for editor support:

```bash
npm install
```

That installs `@types/k6` for autocomplete and type hints. It is not required to execute the tests.

## Project Files

### Core test files

- `test1.js`: Basic smoke test against `https://quickpizza.grafana.com/` using fixed VUs and duration.
- `test2.js`: Basic staged load test with ramp-up, hold, and ramp-down.
- `test3.js`: Adds `check()` assertions to validate status code and page content.
- `test4.js`: Adds custom `Trend` metrics for total response time and waiting time.
- `e2e.js`: End-to-end flow for user registration and login.
- `e2e_1.js`: Same registration/login flow with more comments and thresholds.
- `e2e_2.js`: Full API E2E flow: register, login, generate pizza, retrieve pizza.
- `e2e_3.js`: E2E flow with custom metrics like `Rate` and `Counter`, plus cloud metadata.
- `e2e_k6.js`: Main configurable E2E script driven by `test-config.json`. This is the best file to use for smoke/load/stress/spike/soak runs.
- `browserTest.js`: Hybrid browser + backend test using `k6/browser` and HTTP requests.

### Config and data files

- `test-config.json`: Load profiles used by `e2e_k6.js` for `smoke`, `load`, `stress`, `spike`, and `soak`.
- `user.json`: Sample user credentials data file. Right now the active test scripts generate users dynamically and do not consume this file directly.
- `package.json`: Project metadata and local dev dependency definitions.

## Quick Start

Run a basic smoke test:

```bash
k6 run test1.js
```

Run the main configurable E2E test:

```bash
TEST_TYPE=smoke k6 run e2e_k6.js
```

Run one exact iteration of the E2E flow:

```bash
TEST_TYPE=smoke k6 run --vus 1 --iterations 1 e2e_k6.js
```

Avoid the local k6 API port warning by letting k6 choose a free port:

```bash
TEST_TYPE=smoke k6 run --address 127.0.0.1:0 e2e_k6.js
```

## Commands For Each File

### Protocol tests

`test1.js`

Purpose: Basic smoke test for the QuickPizza home page.

```bash
k6 run test1.js
```

`test2.js`

Purpose: Basic load test with ramping stages.

```bash
k6 run test2.js
```

`test3.js`

Purpose: Load test with response validation checks.

```bash
k6 run test3.js
```

`test4.js`

Purpose: Load test with custom `Trend` metrics.

```bash
k6 run test4.js
```

`e2e.js`

Purpose: Simple register + login end-to-end API flow.

```bash
k6 run e2e.js
```

`e2e_1.js`

Purpose: Register + login E2E flow with thresholds and more explanation in code comments.

```bash
k6 run e2e_1.js
```

`e2e_2.js`

Purpose: Full E2E API flow including pizza generation and retrieval.

```bash
k6 run e2e_2.js
```

`e2e_3.js`

Purpose: Full E2E API flow with custom metrics and Grafana Cloud metadata.

```bash
k6 run e2e_3.js
```

`e2e_k6.js`

Purpose: Main configurable E2E script that reads its stages and thresholds from `test-config.json`.

Smoke:

```bash
TEST_TYPE=smoke k6 run e2e_k6.js
```

Load:

```bash
TEST_TYPE=load k6 run e2e_k6.js
```

Stress:

```bash
TEST_TYPE=stress k6 run e2e_k6.js
```

Spike:

```bash
TEST_TYPE=spike k6 run e2e_k6.js
```

Soak:

```bash
TEST_TYPE=soak k6 run e2e_k6.js
```

Single iteration:

```bash
TEST_TYPE=smoke k6 run --vus 1 --iterations 1 e2e_k6.js
```

### Browser test

`browserTest.js`

Purpose: Browser-based login flow against Rahul Shetty Academy plus simultaneous backend HTTP load.

Requirements:

- a Chromium-based browser installed locally
- `K6_BROWSER_EXECUTABLE_PATH` set to the browser binary

Example on macOS with Brave:

```bash
K6_BROWSER_EXECUTABLE_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" K6_BROWSER_HEADLESS=false k6 run browserTest.js
```

Example on macOS with Google Chrome:

```bash
K6_BROWSER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" K6_BROWSER_HEADLESS=false k6 run browserTest.js
```

If you want headless mode:

```bash
K6_BROWSER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" K6_BROWSER_HEADLESS=true k6 run browserTest.js
```

## Running In Grafana Cloud

Your repository already includes a cloud block in `e2e_3.js` and `e2e_k6.js`.

### 1. Log in to Grafana Cloud k6

```bash
k6 cloud login --token YOUR_API_TOKEN --stack YOUR_STACK
```

### 2. Run in the cloud

For the main configurable test:

```bash
TEST_TYPE=smoke k6 cloud run e2e_k6.js
```

Other profiles:

```bash
TEST_TYPE=load k6 cloud run e2e_k6.js
TEST_TYPE=stress k6 cloud run e2e_k6.js
TEST_TYPE=spike k6 cloud run e2e_k6.js
TEST_TYPE=soak k6 cloud run e2e_k6.js
```

Run `e2e_3.js` in cloud:

```bash
k6 cloud run e2e_3.js
```

Stream results to Grafana Cloud while executing locally:

```bash
TEST_TYPE=smoke k6 cloud run --local-execution e2e_k6.js
```

## Test Profiles In `test-config.json`

These profiles are used only by `e2e_k6.js`.

- `smoke`: Minimal load to verify the script and target system.
- `load`: Normal expected traffic.
- `stress`: Higher traffic to find limits and bottlenecks.
- `spike`: Sudden traffic jumps.
- `soak`: Long-running endurance test.

## Useful Commands

Check k6 version:

```bash
k6 version
```

See whether port `6565` is in use:

```bash
lsof -i :6565
```

Run k6 without binding to the default API port:

```bash
k6 run --address 127.0.0.1:0 test1.js
```

## Notes

- `e2e_k6.js` reads `./test-config.json`. Make sure the file name stays exactly `test-config.json`.
- `user.json` is currently reference data only; the active E2E scripts create unique usernames dynamically.
- If you pass `--vus` and `--iterations`, those CLI options override the staged execution behavior from the script.
