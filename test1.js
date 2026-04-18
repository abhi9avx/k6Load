import { sleep } from "k6";
import http from "k6/http";

export const options = {
   //smoke Test 
    vus: 3,
    duration: "10s",
};


export default function () {
    http.get("https://quickpizza.grafana.com/");
    sleep(1);
}


//http_res_duration -> Time taken for request  + time taken for response -> 300 ms
//http_req_failed -> Number of failed requests -> 0%
//http_reqs -> Number of requests -> 24
//iteration_duration -> Time taken for iteration -> 1.41s
//vus -> Number of virtual users -> 3
//vus_max -> Maximum number of virtual users -> 3
//data_received -> Data received -> 94 kB
//data_sent -> Data sent -> 6.5 kB
//p95 -> 95th percentile -> 361.92ms
//p90 -> 90th percentile -> 354.8ms
//p50 -> 50th percentile -> 315.99ms
//p10 -> 10th percentile -> 290.54ms
