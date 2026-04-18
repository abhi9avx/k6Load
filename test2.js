// Import the sleep function to pause execution and simulate user think-time
import { sleep } from "k6";
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
        http_req_failed: ["rate<0.1"]
    }
};



// The default function acts as the lifecycle for each Virtual User (VU)
// Every VU continuously executes this function over and over during the test
export default function () {
    // Send an HTTP GET request to the target URL
    http.get("https://quickpizza.grafana.com/");
    // Pause for 1 second to simulate a real user's "think time" before the next request
    sleep(1);
}



