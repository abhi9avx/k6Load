import http from "k6/http";
import { check, sleep, group } from "k6";

// Configuration for test run
const BASE_URL = "https://quickpizza.grafana.com";
const password = "secureabhinav123";

// Defines user ramp-up and threshold targets (pass/fail criteria)
export const options = {
    stages: [
        { duration: '5s', target: 2 }, 
        { duration: '5s', target: 4 }, 
        { duration: '3s', target: 0 }  
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'],
        'checks': ['rate>0.90'],
        'iteration_duration': ['p(95)<8000']
    }
};

export default function () {
    // Generate unique username to prevent database collision
    const USERNAME = "abhinav" + Date.now() + Math.floor(Math.random() * 100);

    let userRegisterCheck = false;
    let loginCheck = false;
    let authToken = ""; 
    let generatedPizzaId = "";

    // Step 1: User Registration
    group('user registration', function() {
        const registerPayload = { "username": USERNAME, "password": password };
        const params = { headers: { 'content-type': 'application/json' } };

        const regResponse = http.post(`${BASE_URL}/api/users`, JSON.stringify(registerPayload), params);

        userRegisterCheck = check(regResponse, {
            'is status 201': (r) => r.status === 201
        });

        if (!userRegisterCheck) {
            console.error(`User Registration Failed: ${regResponse.body}`);
        }
    });

    // Step 2: User Login
    group('user login', function() {
        const loginPayload = { "username": USERNAME, "password": password };
        const params = { headers: { 'content-type': 'application/json' } };

        const loginResponse = http.post(`${BASE_URL}/api/users/token/login`, JSON.stringify(loginPayload), params);

        loginCheck = check(loginResponse, {
            'is status 200': (r) => r.status === 200,
            'response contains token': (r) => r.body.includes("token"),
            'token is valid string': (r) => {
                try {
                    return typeof r.json("token") === "string" && r.json("token").length > 4;
                } catch (e) { return false; }
            }
        });

        if (loginCheck) {
            authToken = loginResponse.json("token");
        } else {
            console.error(`User Login Failed: ${loginResponse.body}`);
        }
    });

    // Step 3: Pizza Generation
    group('pizza generation', function() {
        const params = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        };

        const pizzaPayload = {
            "maxCaloriesPerSlice": 500,
            "mustBeVegetarian": true
        };

        const pizzaResponse = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(pizzaPayload), params);

        let pizzaGenerated = check(pizzaResponse, {
            'is status 200': (r) => r.status === 200,
            'response contains pizza object': (r) => {
                try {
                    return r.json() !== undefined && r.json("pizza") !== undefined;
                } catch (e) { return false; }
            }
        });

        if (pizzaGenerated) {
            generatedPizzaId = pizzaResponse.json("pizza.id") || pizzaResponse.json("id");
            console.log(`[SUCCESS] Generated Pizza ID: ${generatedPizzaId}`);
        } else {
            console.error(`[PIZZA ERROR] Generation Failed: ${pizzaResponse.body}`);
        }
    });

    // Step 4: Retrieve Generated Pizza
    group('retrieve generated pizza', function() {
        const params = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        };

        const retrievedPizzaResponse = http.get(`${BASE_URL}/api/pizza/${generatedPizzaId}`, params);

        let retrievedPizzaCheck = check(retrievedPizzaResponse, {
            'is status 200': (r) => r.status === 200,
            'retrieved ID matches': (r) => {
                try {
                    const block = r.json() || {};
                    const id = block.pizza ? block.pizza.id : block.id;
                    return id === generatedPizzaId;
                } catch (e) { return false; }
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
