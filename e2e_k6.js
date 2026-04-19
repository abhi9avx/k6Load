import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate } from "k6/metrics";

const testConfig = JSON.parse(open("./test-config.json"));

function getTestConfig() {
    const testType = __ENV.TEST_TYPE || "smoke";
    const config = testConfig[testType];

    if (!config) {
        throw new Error(`Missing test configuration for TEST_TYPE="${testType}"`);
    }

    console.log(`Using test config: ${testType}`);
    return config;
}

// Configuration for test run
const BASE_URL = "https://quickpizza.grafana.com";
const password = "secureabhinav123";

const authentication_rate = new Rate("authentication_rate");

const successful_orders = new Counter("successful_orders");

const selectedConfig = getTestConfig();

// Defines user ramp-up and threshold targets (pass/fail criteria)
export const options = {
    stages: selectedConfig.stages,
    thresholds: selectedConfig.thresholds,
    cloud: {
        // Project: Default project
        projectID: 7317576,
        // Test runs with the same name groups test runs together.
        name: "Test E2E"
    },
};

export function setup() {
    const apiCheck = http.get(`${BASE_URL}`);
    if (apiCheck.status !== 200) {
        console.error(`API is not reachable: ${apiCheck.body}`);
        throw new Error(`API is not reachable. Status: ${apiCheck.status}`);
    }

    return {
        testStartTime: new Date().toISOString()
    };
}

export default function () {
    // Generate unique username to prevent database collision
    const USERNAME = "abhinav" + Date.now() + Math.floor(Math.random() * 100);

    let userRegisterCheck = false;
    let loginCheck = false;
    let authToken = "";
    let generatedPizzaId = "";

    // Step 1: User Registration
    group("user registration", function () {
        const registerPayload = { "username": USERNAME, "password": password };
        const params = { headers: { "content-type": "application/json" } };

        const regResponse = http.post(`${BASE_URL}/api/users`, JSON.stringify(registerPayload), params);

        userRegisterCheck = check(regResponse, {
            "is status 201": (r) => r.status === 201
        });

        if (!userRegisterCheck) {
            console.error(`User Registration Failed: ${regResponse.body}`);
        }
    });

    if (!userRegisterCheck) {
        sleep(1);
        return;
    }

    // Step 2: User Login
    group("user login", function () {
        const loginPayload = { "username": USERNAME, "password": password };
        const params = { headers: { "content-type": "application/json" } };

        const loginResponse = http.post(`${BASE_URL}/api/users/token/login`, JSON.stringify(loginPayload), params);

        loginCheck = check(loginResponse, {
            "is status 200": (r) => r.status === 200,
            "response contains token": (r) => r.body.includes("token"),
            "token is valid string": (r) => {
                try {
                    return typeof r.json("token") === "string" && r.json("token").length > 4;
                } catch (e) {
                    return false;
                }
            }
        });

        if (loginCheck) {
            authentication_rate.add(1);
            authToken = loginResponse.json("token");
        } else {
            console.error(`User Login Failed: ${loginResponse.body}`);
            authentication_rate.add(0);
        }
    });

    if (!loginCheck || !authToken) {
        sleep(1);
        return;
    }

    // Step 3: Pizza Generation
    group("pizza generation", function () {
        const params = {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        };

        const pizzaPayload = {
            "maxCaloriesPerSlice": 500,
            "mustBeVegetarian": true
        };

        const pizzaResponse = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(pizzaPayload), params);

        let pizzaGenerated = check(pizzaResponse, {
            "is status 200": (r) => r.status === 200,
            "response contains pizza object": (r) => {
                try {
                    return r.json() !== undefined && r.json("pizza") !== undefined;
                } catch (e) {
                    return false;
                }
            }
        });

        if (pizzaGenerated) {
            successful_orders.add(1);
            generatedPizzaId = pizzaResponse.json("pizza.id") || pizzaResponse.json("id");
            console.log(`[SUCCESS] Generated Pizza ID: ${generatedPizzaId}`);
        } else {
            console.error(`[PIZZA ERROR] Generation Failed: ${pizzaResponse.body}`);
        }
    });

    if (!generatedPizzaId) {
        sleep(1);
        return;
    }

    // Step 4: Retrieve Generated Pizza
    group("retrieve generated pizza", function () {
        const params = {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        };

        const retrievedPizzaResponse = http.get(`${BASE_URL}/api/pizza/${generatedPizzaId}`, params);

        let retrievedPizzaCheck = check(retrievedPizzaResponse, {
            "is status 200": (r) => r.status === 200,
            "retrieved ID matches": (r) => {
                try {
                    const block = r.json() || {};
                    const id = block.pizza ? block.pizza.id : block.id;
                    return id === generatedPizzaId;
                } catch (e) {
                    return false;
                }
            }
        });

        if (retrievedPizzaCheck) {
            console.log(`[SUCCESS] Retrieved Pizza ID: ${generatedPizzaId}`);
        } else {
            console.error(`[RETRIEVAL ERROR] Failed fetching Pizza ID: ${generatedPizzaId}`);
        }
    });

    // Think time before next VU iteration
    sleep(1);
}

export function teardown(data) {
    const testEndTime = new Date().toISOString();
    console.log(`Test completed. Started at: ${data.testStartTime}, ended at: ${testEndTime}`);
}
