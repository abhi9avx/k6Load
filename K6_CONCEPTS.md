# 📖 k6 Concepts & Advanced Performance Glossary

This comprehensive guide covers the core architecture, execution logic, and performance metrics used in `k6Load`.

---

## 🏗️ Core Architecture

### 👥 VU (Virtual User)
A simulated user that executes your test script in a loop. Each VU is separate and runs in its own JavaScript runtime (GoJA), meaning they don't share memory or state directly.

### 🔄 Iteration
One complete execution of the `default` function (or the entry point function of a scenario). If a test has 10 VUs and each runs for 5 iterations, there will be 50 total iterations.

### 🎭 Scenarios
Advanced configurations that allow you to model diverse traffic patterns in a single test. You can run multiple scenarios in parallel or sequentially, each with its own executor and VU profile.

### ⚙️ Executors
The "engines" that control how VUs are scheduled. Common types include:
*   **`constant-vus`**: Maintains a fixed number of VUs for a specific duration.
*   **`ramping-vus`**: Dynamically ramps the number of VUs up or down over time (using `stages`).
*   **`per-vu-iterations`**: Each VU runs exactly N iterations.
*   **`constant-arrival-rate`**: Focuses on achieving a specific number of requests per second (RPS), starting new VUs as needed.

---

## 📅 Test Lifecycle & Data

### 🏗️ Setup & Teardown
Lifecycle hooks used to manage test state:
*   **`setup()`**: Runs once at the very beginning. Useful for getting tokens or seeding databases. Data returned here is passed to the `default` function.
*   **`teardown()`**: Runs once at the very end. Use this for cleaning up test data or closing connections.

### 📂 SharedArray
A read-only memory structure designed to share large datasets (like `user.json`) across all VUs without duplicating memory. Essential for high-load tests using massive CSV/JSON files.

### 🧠 Think Time (Sleep)
A pause between actions (`sleep(2)`) used to simulate real human behavior. Without sleep, VUs would "hammer" the server at impossible speeds, leading to unrealistic results.

---

## 🧪 Metrics & Telemetry

### 🛑 Thresholds
Assertive rules that define the SLO (Service Level Objective) of your test. If a threshold is not met (e.g., error rate > 1%), k6 exits with a non-zero status code, signaling a failure to CI/CD.

### ✅ Checks
Non-halting assertions that validate the correctness of responses (status codes, body content, headers). Unlike thresholds, a failed check does not stop the test; it only increments a "failed" metric.

### ⏱️ Percentiles (p95, p99)
Statistical measures that help identify long-tail latency:
*   **p95**: 95% of users had an experience faster than this value.
*   **p99**: The "worst-case" scenario representing the top 1% of users. Focus on p99 to find the most severe bottlenecks.

### 📊 Metric Types
*   **Trend**: Calculates min, max, avg, and percentiles for numeric values (e.g., `http_req_duration`).
*   **Counter**: A cumulative sum (e.g., `successful_orders`).
*   **Rate**: Tracks the percentage of successful events (e.g., `authentication_success`).
*   **Gauge**: Stores only the latest value (e.g., current memory usage).

---

## 🌐 HTTP & Browser Metrics

### 🔌 http_req_duration (Latency)
The total time the request took. It is the sum of:
*   **`http_req_sending`**: Time spent sending data.
*   **`http_req_waiting`**: Time spent waiting for the server's first byte (TTFB).
*   **`http_req_receiving`**: Time spent downloading the response.

### 🛰️ http_req_failed
The percentage of requests that resulted in an error (typically any status code that isn't `2xx` or `3xx`).

### 🌐 k6/browser (Web Vitals)
When using the browser module, k6 automatically captures Chrome's performance metrics:
*   **LCP (Largest Contentful Paint)**: Meaures loading performance.
*   **CLS (Cumulative Layout Shift)**: Measures visual stability.
*   **FID (First Input Delay)**: Measures interactivity.

---

## 🌪️ Traffic Profiles

### 💨 Smoke Test
A minimal load (1 VU) to verify that the script is bug-free and the target environment is reachable.

### 📈 Load Test
Simulates expected normal traffic levels to ensure the system meets performance SLAs.

### 🔥 Stress Test
Pushes the system to its limits and beyond to observe how it behaves under extreme pressure and where it eventually breaks.

### ⚡ Spike Test
A sudden, violent increase in traffic to test the system's ability to scale quickly and handle unexpected bursts (e.g., flash sales).

### ⏳ Soak Test
A steady load maintained over hours or days to identify resource leaks (memory, DB connections) that only appear over time.

---
🚀 Master the load with k6.
