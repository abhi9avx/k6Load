import { check, sleep } from "k6";
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



export default function () {
    const response = http.get("https://quickpizza.grafana.com/");
    check(response, {
        'is status 200': (response) => response.status === 200,
        'page contain pizza text': (response) => response.body.includes("pizza")
    });
    sleep(1);

}



