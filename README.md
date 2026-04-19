# k6Load

A load and performance testing suite using [k6](https://k6.io/).

## Types of Performance Testing

Understanding the different types of performance testing is crucial for designing the right k6 scenarios. 

- **Smoke Testing:** A basic test with minimal load (e.g., 2-3 Virtual Users for a short duration like 10s) to verify that your script works, the system is up, and there are no immediate errors.
- **Load Testing:** Tests the system's performance under expected normal or peak load conditions. The goal is to ensure the system meets performance expectations (like response times) under typical usage.
- **Stress Testing:** Pushes the system beyond normal conditions to find its breaking point. This helps identify bottlenecks and how the system behaves when it fails under extreme load.
- **Spike Testing:** A type of stress test where the load suddenly and massively increases. It checks how the system handles immediate, massive surges in traffic.
- **Soak Testing (Endurance Testing):** Runs a steady, moderate load over a long period of time (e.g., hours or days) to uncover issues like memory leaks or database connection exhaustion.

---

## Lecture 1: What we learned in `test1.js`

In our first script (`test1.js`), we covered the fundamentals of writing a **Smoke Test** in k6 and understanding the results output:

1. **Basic Script Structure:**
   - Imported `http` from `k6/http` to make HTTP requests.
   - Imported `sleep` from `k6` to pace the requests.
   - Defined `options` to control the test run (3 Virtual Users for 10 seconds).
   - Created the `default function()` which represents the lifecycle of an individual Virtual User.

2. **Making Requests:**
   - Sent a basic HTTP GET request to `https://quickpizza.grafana.com/`.
   - Used `sleep(1)` to pause execution for 1 second between iterations, simulating realistic user think-time.

3. **Understanding k6 Metrics:**
   - `http_req_duration`: The total time taken for the request to be sent and the response to be fully received.
   - `http_req_failed`: The percentage of requests that failed.
   - `http_reqs`: Total number of HTTP requests made during the test.
   - `iteration_duration`: The time taken to complete one full iteration of the `default function()`.
   - `vus` / `vus_max`: The current and maximum number of Virtual Users actively running.
   - **Percentiles (`p50`, `p90`, `p95`):** Important metrics that show response times for a given percentage of requests. For example, a `p95` of 361ms means 95% of your requests were completed in 361ms or less.

4. **Using Thresholds (Pass/Fail Criteria):**
   - Added a `thresholds` object in `options` to automatically fail the test if performance metrics do not meet SLA expectations.
   - Used `http_req_duration: ["p(95)<400"]` to ensure 95% of requests complete in under 400ms.
   - Used `http_req_failed: ["rate<0.5"]` to ensure the error rate remains below 50%.

---

## Lecture 2: What we learned in `test2.js`

In `test2.js`, we evolved our script from a simple static load into a structured **Load Test** by implementing **Stages** (Ramping Users):

1. **Ramping with Stages:**
   - Instead of a fixed number of VUs for a fixed duration, we passed an array of `stages` inside our `options`.
   - **Ramp-Up:** `{ duration: '4s', target: 2 }` gradually increases the traffic up to 2 Virtual Users over 4 seconds.
   - **Hold/Peak:** `{ duration: '5s', target: 5 }` pushes the traffic to 5 VUs and holds that peak load for 5 seconds.
   - **Ramp-Down:** `{ duration: '3s', target: 0 }` gracefully scales the users back down to 0 over 3 seconds.
   
2. **Why Use Stages?**
   - Gently ramping user traffic mimics real-world human behavior much better than instantly dropping maximum load (which is more like a Spike test). It allows system components (like load balancers and auto-scalers) time to react and warm up appropriately.

3. **Combining Features:**
   - We successfully combined our new `stages` with tight `thresholds` to ensure that our system didn't just survive the load curve, but that its latency (`p(95)`) remained within our SLA boundaries the entire time.

---

## Lecture 3: What we learned in `test3.js`

In `test3.js`, we focused on **Assertions** and **Granular Thresholds**:

1. **Adding Checks (Assertions):**
   - We imported `check` from `k6` to validate that the server's responses were actually successful.
   - We added `check(response, { ... })` and verified two things:
     - The HTTP status code was exactly 200 (`response.status === 200`).
     - The HTML response body successfully contained the exact word "pizza" (`response.body.includes("pizza")`).
   - *Note:* Unlike thresholds, a failed `check` does **not** fail or stop the load test, but it does report the failure rate in the final metrics!

2. **Tag-Specific Thresholds:**
   - We added a specialized threshold: `'http_req_duration{name:api}': ["p(95)<500"]`.
   - Instead of tracking the duration of *all* HTTP requests globally, this applies a threshold strictly to requests that possess the specific tag `name:api`.
   - This allows you to set different performance SLA rules for different endpoints (e.g., your `/login` API might need to be `<200ms`, while your `/search` API only needs to be `<800ms`).

---

## Lecture 4: What we learned in `test4.js`

In `test4.js`, we introduced **Custom Metrics**:

1. **Creating a Trend Metric:**
   - We imported `Trend` from `k6/metrics`.
   - We instantiated a new custom metric at the top of our script: `const apiRequestTime = new Trend('pizza_response_time');`.
   - Custom metrics allow us to track specific data points (like processing time or business logic steps) during our load test, separately from the built-in HTTP metrics.

2. **Populating the Metric:**
   - Inside our test loop, after making the HTTP request, we captured the precise internal response duration and sent it to our metric:
   - `apiRequestTime.add(response.timings.duration);`
   - By adding to this `Trend`, k6 automatically tracks the min, max, average, and percentiles for this exact value over the life of the test!

3. **Evaluating Custom Metrics:**
   - When the test finished, a brand new `CUSTOM` metrics block appeared in the terminal output, displaying our `pizza_response_time` cleanly alongside standard HTTP metrics.
   - We also successfully ran thresholds directly onto our custom metric: `'pizza_response_time': ["p(95)<500"]`, showing that custom metrics are a first-class citizen in k6.

---

## Lecture 5: End-to-End Testing (`e2e.js`)

In `e2e.js`, we combined everything we learned to build a multi-stage **End-to-End (E2E) Workflow**:

1. **Organizing with Groups:**
   - We imported `group` from `k6` to bundle our logical stages together (e.g., separating Registration from Login).
   - Groups natively structure your code and aggregate k6 terminal metrics cleanly by feature.

2. **Dynamic Data Generation:**
   - Instead of hardcoding a username (which inevitably causes "User Already Exists" database errors over long durations), we dynamically generated variables: `const USERNAME = "abhinav" + Date.now() + Math.random();`.
   - By putting this logic *inside* the `default function()`, every Virtual User iteration successfully gets a fresh identity on the fly!

3. **Parsing JSON & Deep Property Validation:**
   - Because HTTP load bodies are pure strings over the network, trying to access `response.body.token` fails natively.
   - We used `response.json()` to parse that string into a proper JavaScript Object, allowing us to perform deep, advanced verification checks like `jsonBody.token.length > 4`.

4. **Passing Variables Between Transactions:**
   - We cleverly declared `let authToken = "";` globally *outside* of our groups.
   - Once the login group succeeded, we extracted the token dynamically via `loginresponse.json("token")` and stored it directly in `authToken`.
   - This exact architecture is heavily used by performance engineers to capture Session IDs or JWT tokens and pass them dynamically downstream to test secure API endpoints!

---

## Lecture 6: End-to-End User Flow Refinement (`e2e_1.js`)

This script refines the **End-to-End (E2E)** flow focusing on the essential preliminary steps of a user's journey: account registration followed immediately by logging in.

### What the script does:
1. **Unique Identity Generation**: To prevent database collision errors during parallel running, every Virtual User generates a mathematically randomized username using timestamps and `Math.random()`.
2. **User Registration (`/api/users`)**: The VU performs an HTTP POST request to the registration API to create a new user account.
3. **Login & Auth (`/api/users/token/login`)**: Immediately after registration, the VU logs in using the exact same credentials.
4. **Token Extraction**: The script robustly verifies the presence of an authentication token in the login response, extracts it, and saves it in a variable. This makes the script easily extensible; any future endpoint testing (like fetching a profile or submitting an order) can utilize this stored token.

### Why is it built this way?
- **Load Profile (Stages)**: Using stages, we gradually ramp up to 4 VUs over 10 seconds and ramp back down. This prevents "shocking" the server and mimics a more realistic staggered surge of traffic.
- **`groups`**: The script uses k6 `groups` to categorize requests into "user registration" and "user login". When reviewing the test results, metrics are automatically organized by these groups resulting in much clearer insights and distinct response times for each step.
- **Error Handling & `checks() `**: We meticulously validate the HTTP response statuses and data types before declaring an operation successful. If validations fail, `console.error` provides visibility instead of failing silently.
- **Thresholds**: We've set clear SLA limitations:
  - 95% of HTTP requests must respond in `< 400ms`.
  - The script asserts a 90%+ pass rate on all `checks`.
  - The entire test loop duration per Virtual User must complete in `< 8000ms`.
- **`sleep(1)`**: A deliberate 1-second pause at the end of each iteration simulates the "think time" of a real user reading the screen before navigating away or continuing.
