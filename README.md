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
