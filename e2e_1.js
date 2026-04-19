// Import k6 HTTP module for making HTTP requests (e.g., POST, GET)
import http from "k6/http";
// Import k6 core utilities:
// `check` for asserting response conditions (like HTTP status codes)
// `sleep` for adding realistic delays between iterations
// `group` for organizing related requests into logical business steps (e.g., "login", "register")
import { check, sleep, group } from "k6";

// Base URL of the application we are load testing. Centralizing this makes it easy to switch environments.
const BASE_URL = "https://quickpizza.grafana.com";
// Hardcoded password for testing purposes. In a real-world scenario, this might come from environment variables.
const password = "secureabhinav123"

// The options object tells k6 how to run the test (load profile and success criteria)
export const options = {
    // Stages define the ramping up and down of Virtual Users (VUs) over time
    stages : [
        {duration : '5s'  , target :2}, // Ramp up: gradually increase to 2 VUs over 5 seconds to simulate incoming traffic
        {duration :'5s' , target :4},   // Peak load: increase to 4 VUs to hold peak traffic for 5 seconds
        {duration : '3s' , target :0}   // Ramp down: gradually drop to 0 VUs over 3 seconds to cleanly wind down the test
    ],

    // Thresholds define the pass/fail criteria for the entire load test
    thresholds: {
        // 95% of all HTTP requests must complete in under 400 milliseconds to meet SLA
        'http_req_duration' : ['p(95)<400'],
        // At least 90% of all `check()` assertions must pass (allowing up to 10% failure rate under load)
        'checks' : ['rate>0.90'],
        // 95% of full VU iterations (the entire export default function) must finish in under 8 seconds
        'iteration_duration' : ['p(95)<8000']
    }
};

// The default function represents a single iteration of a Virtual User (VU). Every VU runs this constantly until the test ends.
export default function (){
    // Generate a unique username using a timestamp and random number for each iteration!
    // Purpose: To prevent "User Already Exists" (409 Conflict) database errors when running multiple VUs concurrently.
    const USERNAME = "abhinav" + Date.now() + Math.floor(Math.random() * 100);

    let userRegisterCheck = false;
    let loginCheck = false;
    // Store the token here so future API endpoints in the user journey can use it (e.g., fetching profile data)!
    let authToken = ""; 

// Group logical steps: Part 1 - User Registration
group('user registration', function(){
    
    // Construct the JSON payload required by the Registration API
    const registerPayload = {
        "username": USERNAME,
        "password" : password
    };

    // Define headers to tell the server we are sending JSON data
    const params ={
        headers : {'content-type' : 'application/json'}
    };

    // Make an HTTP POST request to create the user
    const regresponse = http.post(`${BASE_URL}/api/users`, JSON.stringify(registerPayload), params)

    // Verify the API returns a 201 Created status, which implies successful account creation
    userRegisterCheck = check (regresponse, {
        'is status 201' : (regresponse) => regresponse.status === 201
    })

    // If the check fails, log the server's error response body to the terminal for debugging
    if(!userRegisterCheck){
        console.error(`User Registration Failed ${regresponse.body}` )
    }
}); // <-- Closed your group function here


// Group logical steps: Part 2 - User Login
group('user login', function(){
    
    // Construct the payload for logging in. We use the exact same username we just registered.
    const loginPayload = {
        "username": USERNAME,
        "password" : password
    };

    // Define headers as JSON again
    const params ={
        headers : {'content-type' : 'application/json'} 
    };

    // Make an HTTP POST request to the login endpoint to fetch an authentication token
    const loginresponse = http.post(`${BASE_URL}/api/users/token/login`,JSON.stringify(loginPayload),params)

    // Run multiple checks to ensure the login was not only successful, but returned valid data
    loginCheck = check(loginresponse, {
        'is status 200' : (loginresponse) => loginresponse.status === 200, // Status ok
        "login response contains token " : (loginresponse) => loginresponse.body.includes("token"), // Minimal structural check
        "token is valid string " : (loginresponse) => {
            // Because loginresponse.body is a raw String, we must parse it to JSON first to inspect its fields!
            try {
                const jsonBody = loginresponse.json();
                // Ensure the token field exists, is a string, and is sufficiently long
                return typeof jsonBody.token === "string" && jsonBody.token.length > 4;
            } catch (error) {
                // If it fails to parse as JSON, the check fails
                return false;
            }
        }
    })

    // If all login checks passed, extract the token for real so we can use it!
    if(loginCheck){
        // Grab the literal token string from the JSON response
        authToken = loginresponse.json("token");
        console.log(`[SUCCESS] Extracted Auth Token: ${authToken}`);
    } else {
        // Print the error out to help us debug why login failed
        console.error(`User Login Failed ${loginresponse.body}` )
    }
}); // <-- Properly closing the login group

    // Pause for 1 second at the end of the script before the VU restarts.
    // Purpose: To simulate realistic human wait time / pacing between actions, avoiding infinitely fast looping.
    sleep(1);
} // <-- Properly closing the export default function()
