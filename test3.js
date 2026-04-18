// Import the check function for assertions, and sleep to pause execution
import { check, sleep } from "k6";
// Import the http module to make HTTP requests (GET, POST, etc.)
import http from "k6/http";

export const options = {
   stages : [
    {duration : '4s'  , target :2}, //Ramp Up to 2 VUs in 4 seconds
    {duration : '5s' , target :5}, //Stay at 5 VUs for 5 seconds
    {duration : '3s'  , target :0} //Ramp Down to 0 VUs in 3 seconds

   ],

    thresholds: {
        http_req_duration: ["p(95)<500"],
        http_req_failed: ["rate<0.1"],
        'http_req_duration{name:api}': ["p(95)<500"]
    }
};



// The default function acts as the lifecycle for each Virtual User (VU)
export default function () {
    // Send an HTTP GET request and save the server's response into a variable
    const response = http.get("https://quickpizza.grafana.com/");
    
    // Validate the HTTP response to ensure our application is behaving correctly
    check(response, {
        // Assert that the HTTP status code is exactly 200 (OK)
        'is status 200': (response) => response.status === 200,
        // Assert that the response body text actually contains the word "pizza"
        'page contain pizza text': (response) => response.body.includes("pizza")
    });
    
    // Pause for 1 second to simulate a real user's "think time"
    sleep(1);

}



