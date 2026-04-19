# k6Load

`k6Load` is a hands-on performance testing repository built with [k6](https://k6.io/). It includes beginner-friendly HTTP tests, staged load tests, end-to-end API flows, custom metrics, browser automation, and Grafana Cloud execution examples.

This project is meant to help you:

- understand what performance testing is
- learn core k6 concepts through small scripts
- run smoke, load, stress, spike, and soak tests
- validate business flows, not just raw HTTP calls
- visualize and analyze results locally or in Grafana Cloud

## Why This Project Matters

Modern applications can work perfectly for one user and still fail badly under real traffic. Performance testing helps us answer questions like:

- Is the application still fast when multiple users hit it at the same time?
- Does login still work under load?
- How does the system behave during traffic spikes?
- Where do failures begin to appear?
- Are key business transactions succeeding consistently?

This repository uses k6 to answer those questions with repeatable scripts.

## What Is k6?

k6 is an open-source performance testing tool used to run:

- smoke tests
- load tests
- stress tests
- spike tests
- soak tests
- browser-based performance tests

It lets you write test scripts in JavaScript and execute them locally, in CI/CD, or in Grafana Cloud.

Why teams use k6:

- simple JavaScript-based test scripts
- easy local execution
- strong built-in metrics
- good support for thresholds and assertions
- direct integration with Grafana Cloud for dashboards and analysis

## What Is Grafana Cloud k6?

Grafana Cloud k6 is the cloud execution and reporting platform for k6 tests. It allows you to:

- run tests from the cloud instead of only from your laptop
- centralize test history
- compare runs over time
- visualize latency, errors, throughput, and custom metrics
- share results with teams more easily

In short:

- `k6 run ...` runs locally
- `k6 cloud run ...` runs in Grafana Cloud
- `k6 cloud run --local-execution ...` runs locally but streams results to Grafana Cloud

## Key Performance Testing Types

### Smoke Test

A very small test used to confirm that the script works and the target system is reachable.

Example use:

- confirm the endpoint is up
- validate the script before running larger tests

### Load Test

Tests how the system behaves under expected normal traffic.

Example use:

- simulate normal daily user load
- verify response times stay within SLA

### Stress Test

Pushes the system above expected traffic to find bottlenecks or failure points.

Example use:

- discover max capacity
- observe graceful failure behavior

### Spike Test

Applies sudden sharp traffic increases.

Example use:

- simulate flash sales
- simulate unexpected bursts

### Soak Test

Runs for a long time at a steady load.

Example use:

- detect memory leaks
- detect connection exhaustion
- validate long-duration stability

## Core k6 Concepts

These are the most important terms you’ll see in this repository.

### VU

`VU` means Virtual User.

A VU is a simulated user running your script. If a test uses `10` VUs, k6 behaves as if 10 users are interacting with your application at the same time.

### Iteration

An iteration is one full execution of the `default` function in a script.

If your `default` function performs:

1. register user
2. login
3. generate pizza
4. fetch pizza

then one iteration means that entire flow happened once.

### Stages

`stages` control how load ramps up and down over time.

Example:

```js
stages: [
  { duration: "5s", target: 2 },
  { duration: "10s", target: 5 },
  { duration: "5s", target: 0 }
]
```

Meaning:

- ramp to 2 users in 5 seconds
- ramp to 5 users in 10 seconds
- ramp back to 0 users in 5 seconds

### Checks

`check()` is used to validate whether a response is correct.

Example:

```js
check(response, {
  "is status 200": (r) => r.status === 200
});
```

Why it matters:

- confirms application correctness under load
- ensures performance is measured on successful behavior, not only on request timing

### Thresholds

Thresholds define pass/fail rules for the test.

Example:

```js
thresholds: {
  http_req_duration: ["p(95)<500"],
  checks: ["rate>0.95"]
}
```

Meaning:

- 95% of requests must complete in under 500 ms
- at least 95% of checks must pass

Thresholds turn a test into an automated quality gate.

### Group

`group()` organizes related requests into named business steps.

Example:

- `user registration`
- `user login`
- `pizza generation`

Why it matters:

- improves readability
- makes test reports easier to understand
- supports group-level analysis

### Sleep

`sleep()` pauses execution between actions.

Why it matters:

- simulates real user think time
- avoids unrealistic hammering of the server

### Metrics

k6 automatically captures built-in metrics and also supports custom metrics.

Important built-in metrics:

- `http_req_duration`: total request time
- `http_req_failed`: failed request rate
- `http_reqs`: total number of HTTP requests
- `iteration_duration`: time for one full script iteration
- `checks`: pass/fail rate for `check()`
- `vus`: active virtual users
- `vus_max`: maximum virtual users reached

## Custom Metrics You Should Know

This repository demonstrates three important custom metric types.

### Trend

`Trend` stores numeric values over time and calculates statistics like:

- average
- min
- max
- percentiles such as `p(90)` and `p(95)`

Use `Trend` when you want to track timings or other numeric measurements.

Example from this repo:

- API response time
- API waiting time

### Rate

`Rate` tracks how often something succeeds or fails.

You usually add:

- `1` for success
- `0` for failure

Use `Rate` when you want a success percentage for a specific business event.

Example from this repo:

- `authentication_rate`

### Counter

`Counter` keeps a running total.

Use it when you want to count how many times something happened.

Example from this repo:

- `successful_orders`

## Repository Structure

### Core test files

- `test1.js`: Basic smoke test against `https://quickpizza.grafana.com/` using fixed VUs and duration.
- `test2.js`: Basic staged load test with ramp-up, hold, and ramp-down.
- `test3.js`: Adds `check()` assertions to validate status code and page content.
- `test4.js`: Adds custom `Trend` metrics for total response time and waiting time.
- `e2e.js`: End-to-end flow for user registration and login.
- `e2e_1.js`: Same registration/login flow with more comments and thresholds.
- `e2e_2.js`: Full API E2E flow: register, login, generate pizza, retrieve pizza.
- `e2e_3.js`: E2E flow with custom metrics like `Rate` and `Counter`, plus cloud metadata.
- `e2e_k6.js`: Main configurable E2E script driven by `test-config.json`. This is the main script for smoke, load, stress, spike, and soak profiles.
- `browserTest.js`: Hybrid browser + backend test using `k6/browser` and HTTP requests.

### Config and data files

- `test-config.json`: Load profiles used by `e2e_k6.js`.
- `user.json`: Sample credential dataset. Current E2E scripts generate unique users dynamically instead of reading from this file.
- `package.json`: Project metadata and local dev dependencies.

## Prerequisites

Install k6:

- macOS: `brew install k6`
- Windows: `winget install k6`
- Linux: see the official k6 install docs

Optional for editor support:

```bash
npm install
```

This installs `@types/k6` for autocomplete and type hints. It is not required to run tests.

## Quick Start

Run a basic smoke test:

```bash
k6 run test1.js
```

Run the main configurable E2E smoke test:

```bash
TEST_TYPE=smoke k6 run e2e_k6.js
```

Run exactly one E2E iteration:

```bash
TEST_TYPE=smoke k6 run --vus 1 --iterations 1 e2e_k6.js
```

Avoid the default local k6 API port warning:

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

Purpose: Register + login E2E flow with thresholds and more detailed inline learning comments.

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

Purpose: Main configurable E2E script that reads profiles from `test-config.json`.

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

Headless:

```bash
K6_BROWSER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" K6_BROWSER_HEADLESS=true k6 run browserTest.js
```

## Main Script Profiles

`e2e_k6.js` reads from `test-config.json` and supports these profiles:

- `smoke`: minimal validation run
- `load`: normal expected traffic
- `stress`: heavier load to find limits
- `spike`: sudden traffic increase
- `soak`: long-duration stability testing

## Running In Grafana Cloud

The repository already includes cloud metadata in `e2e_3.js` and `e2e_k6.js`.

### 1. Authenticate once

```bash
k6 cloud login --token YOUR_API_TOKEN --stack YOUR_STACK
```

### 2. Run in the cloud

Main configurable test:

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

## GitHub Actions Manual Trigger

This repository now includes a manual workflow at:

- `.github/workflows/k6-manual-run.yml`

You can trigger it from the GitHub Actions tab and choose:

- which file to run
- which `TEST_TYPE` profile to use
- whether to run locally on the GitHub runner or in Grafana Cloud
- whether browser mode should be headless
- any extra k6 flags such as `--vus 1 --iterations 1`

### How to use it

1. Open the repository in GitHub.
2. Go to the `Actions` tab.
3. Open the workflow named `Manual k6 Run`.
4. Click `Run workflow`.
5. Select the script, profile, and execution mode.
6. Start the workflow.

### Recommended choices

- Use `e2e_k6.js` if you want to choose `smoke`, `load`, `stress`, `spike`, or `soak`.
- Use `local` execution if you just want the test to run on GitHub-hosted runners.
- Use `cloud` or `cloud-local-execution` if you want results in Grafana Cloud.

### Required GitHub secrets for cloud runs

If you select `cloud` or `cloud-local-execution`, add this repository secret in GitHub:

- `K6_CLOUD_TOKEN`: your Grafana Cloud k6 token

Optional secret:

- `K6_CLOUD_STACK_ID`: your Grafana Cloud stack ID

You can add secrets in:

- `GitHub repo > Settings > Secrets and variables > Actions`

### Notes about the workflow

- `TEST_TYPE` is mainly used by `e2e_k6.js`.
- Other scripts will ignore the `TEST_TYPE` input safely.
- The workflow uses `grafana/setup-k6-action@v1`, which is Grafana’s official GitHub Action for setting up k6.
- For local GitHub Actions runs, the workflow uses `--address 127.0.0.1:0` to avoid the default `6565` port warning.

## How To Read Results

When a k6 run finishes, focus on these sections:

- `checks`: tells you whether validations passed
- `http_req_failed`: shows request failure rate
- `http_req_duration`: shows latency distribution
- `iteration_duration`: tells you how long one business flow takes
- custom metrics like `authentication_rate` and `successful_orders`: show business-level health

Useful percentile examples:

- `p(90)`: 90% of requests finished within this time
- `p(95)`: 95% of requests finished within this time

If your thresholds all pass, the run is considered successful by the rules you defined.

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

Kill a process using port `6565`:

```bash
kill -9 <PID>
```

## Notes

- `e2e_k6.js` reads `./test-config.json`, so the file name must stay exactly `test-config.json`.
- `user.json` is currently reference data only.
- If you pass `--vus` and `--iterations`, those CLI flags override staged execution from the script.
- `e2e_k6.js` is the best starting point if you want one script that can scale from smoke to soak testing.
