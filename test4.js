// Import the check function for assertions, and sleep to pause execution
import { check, sleep } from "k6";
// Import the http module to make HTTP requests
import http from "k6/http";
// Import the Trend metric to track custom data points numerically
import {Trend} from "k6/metrics";

// Initialize a new custom Trend metric named 'pizza_response_time'
// This will appear in the k6 output terminal under the CUSTOM metrics block
const apiRequestTime  = new Trend('pizza_response_time'); //Track custom metrics




export const options = {
   stages : [
    {duration : '4s'  , target :2}, //Ramp Up to 2 VUs in 4 seconds
    {duration : '5s' , target :5}, //Stay at 5 VUs for 5 seconds
    {duration : '3s'  , target :0} //Ramp Down to 0 VUs in 3 seconds

   ],

    thresholds: {
        http_req_duration: ["p(95)<500"],
        http_req_failed: ["rate<0.1"],
        'http_req_duration{name:api}': ["p(95)<500"],
        'pizza_response_time': ["p(95)<500"]
    }
};



// The default function acts as the lifecycle for each Virtual User (VU)
export default function () {
    // Send an HTTP GET request to the target URL, and tag it with 'name: api' so our tag-specific threshold catches it
    const response = http.get("https://quickpizza.grafana.com/",{tags : {name : 'api'}});
    
    // Add the specific time it took to complete the request to our custom Trend metric
    apiRequestTime.add(response.timings.duration);
    //response .timing .duration = DNS LOOKUP + tcp connection +tls handshake (id https) +waiting for response ( server processing ) + receiving response (https response download) 
    
    // Validate the HTTP response to ensure correctness
    check(response, {
        // Assert that the HTTP status code is exactly 200 (OK)
        'is status 200': (response) => response.status === 200,
        // Assert that the response HTML contains the text "pizza"
        'page contain pizza text': (response) => response.body.includes("pizza")
    });
    
    // Pause for 1 second to simulate realistic user pace
    sleep(1);

}



