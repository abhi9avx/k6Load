# 🚀 k6Load: The Ultimate Performance Testing Suite

![k6 Performance Suite Hero Banner](assets/hero_banner.png)

[![k6](https://img.shields.io/badge/k6-Performance-purple.svg)](https://k6.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Cloud-orange.svg)](https://grafana.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Ready-blue.svg)](https://github.com/features/actions)

`k6Load` is a modern, hands-on repository designed to master performance testing. From simple API pings to complex, browser-driven end-to-end flows, this suite covers everything you need to build resilient applications.

> [!IMPORTANT]
> **New to Performance Testing?** Check out our [**K6 Concepts & Glossary Guide**](K6_CONCEPTS.md) to understand all the technical terms!

---

## 🌟 The Mission: Why Performance Testing?

### 🚀 The Purpose
The primary goal of `k6Load` is to bridge the gap between **"It works on my machine"** and **"It works for everyone."** We don't just test if the code is correct; we test if the architecture is durable.

### ❓ Why We Built This
In modern software, a 1-second delay in page load can lead to a **7% drop in conversions**. We created this project to provide a code-first, reproducible environment where developers can:
- **Shift Left**: Move performance testing into the development phase, not just the "pre-release" phase.
- **Automate Confidence**: Ensure every deployment is backed by data-driven performance metrics.

### 📈 What Performance is Needed?
In a world of microservices and high-scale APIs, "fast enough" is a moving target. We focus on three critical pillars:
1. **Predictability**: Do response times stay consistent under load?
2. **Reliability**: Can the system handle sudden traffic spikes without crashing?
3. **Efficiency**: Are we utilizing server resources (CPU/Memory) optimally for every request?

---

## 🎯 Why k6Load?

Performance is a feature. A single user might see a fast app, but **1,000 users** might see a crash. This project helps you answer:
- **Scalability**: Can we handle peak traffic?
- **Stability**: Does the app leak memory over time?
- **Correctness**: Does login still work under heavy load?
- **Resilience**: How does the system recover from spikes?

---

## 🛠️ Core Capabilities

- **⚡ Protocol Testing**: High-performance HTTP/API testing.
- **🌐 Browser Testing**: Real user interaction simulation using `k6/browser`.
- **📊 Custom Metrics**: Track `Rate`, `Trend`, and `Counter` for business-critical KPIs.
- **☁️ Cloud Integrated**: Seamless execution in **Grafana Cloud**.
- **🤖 CI/CD Ready**: Fully automated via GitHub Actions.

---

## 🌐 Hybrid Testing: The "Real User" Experience

Most tools only test the **Backend (API)** or the **Frontend (UI)**. `browserTest.js` does **both at the same time.**

### 🔄 Parallel Power
In `browserTest.js`, we run two independent scenarios simultaneously:
1. **The Backend Stress**: Thousands of HTTP requests (simulated users) hammer the server to create high load.
2. **The UI Journey**: Real browser instances (Chromium) navigate the website, click buttons, and log in while the backend is under stress.

### 🧪 Why this matters
This approach lets you measure **Web Vitals** (LCP, FID, CLS) in a worst-case scenario. You can answer:
- *"Does the UI become unresponsive when the API is slow?"*
- *"Is our First Input Delay (FID) still under 100ms when 1000 users are hitting the server?"*

### 📁 How it works in this repo
- Uses the `k6/browser` module (Playwright-compatible).
- Tracks **LCP (Largest Contentful Paint)** and **CLS (Layout Shift)** automatically.
- Allows you to simulate real human interactions (typing, clicking, waiting) alongside raw protocol traffic.

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
brew install k6  # macOS
npm install      # For autocomplete/types
```

### 2. Run Your First Test
```bash
# Basic smoke test
k6 run test1.js

# Main E2E suite (choose: smoke, load, stress, spike, soak)
TEST_TYPE=smoke k6 run e2e_k6.js
```

---

## 📂 Repository Structure

| File | Purpose | Key Feature |
| :--- | :--- | :--- |
| `test1.js` | Smoke Test | Basic home page ping |
| `test3.js` | Validation | Uses `check()` for status codes |
| `test4.js` | Analytics | Custom `Trend` metrics |
| `e2e_k6.js` | **Main Suite** | Swappable profiles via `test-config.json` |
| `browserTest.js`| Hybrid Test | API + Real Chrome Browser automation |

---

## 📊 Test Profiles (`e2e_k6.js`)

Configure these in `test-config.json`:

1. **Smoke**: 💨 Quick validation (1 VU, short duration).
2. **Load**: 📈 Normal expected traffic.
3. **Stress**: 🔥 Find the breaking point.
4. **Spike**: ⚡ Sudden traffic bursts.
5. **Soak**: ⏳ Long-duration reliability.

---

## 🤖 GitHub Actions Automation

This repo includes a **Manual Trigger** workflow.
1. Go to **Actions** tab.
2. Select **Manual k6 Run**.
3. Pick your script, profile (smoke/load/etc.), and execution environment (Local/Cloud).

> [!TIP]
> Add `K6_CLOUD_TOKEN` to your repo secrets to stream results directly to Grafana Cloud dashboards!

---

## 📈 Visualizing Results

When the test finishes, keep an eye on:
- **Checks**: ✅ Pass/Fail rate of business logic.
- **http_req_duration**: ⏱️ Latency (p90, p95).
- **VUs**: 👥 Active simulated users.

---

---
Built with ❤️ by [Abhinav](https://github.com/abhinav)
