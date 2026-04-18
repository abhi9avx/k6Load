import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE_URL = "https://quickpizza.grafana.com";
const password = "secureabhinav123"

export const options = {
    vus : 1,
    duration : '3s'
}

export default function (){
    // Generate a unique username for each Virtual User loop iteration to prevent "Already Exists" database errors!
    const USERNAME = "abhinav" + Date.now() + Math.floor(Math.random() * 100);

    let userRegisterCheck = false;
    let loginCheck = false;
    let authToken = ""; // Store the token here so future API endpoints can use it!

group('user registration', function(){
    
const registerPayload = {
    "username": USERNAME,
    "password" : password
};

const params ={
    headers : {'content-type' : 'application/json'}
};


    const regresponse = http.post(`${BASE_URL}/api/users`,JSON.stringify(registerPayload),params)

   userRegisterCheck = check (regresponse, {
        'is status 201' : (regresponse) => regresponse.status === 201
    })

    if(!userRegisterCheck){
        console.error(`User Registration Failed ${regresponse.body}` )
    }
}); // <-- Closed your group function here


group('user login', function(){
    

    const loginPayload = {
    "username": USERNAME,
    "password" : password
};

    const params ={
    headers : {'content-type' : 'application/json'} 
};

    const loginresponse = http.post(`${BASE_URL}/api/users/token/login`,JSON.stringify(loginPayload),params)

    let loginCheck = check(loginresponse, {
        'is status 200' : (loginresponse) => loginresponse.status === 200,
        "login response contains token " : (loginresponse) => loginresponse.body.includes("token"),
        "token is valid string " : (loginresponse) => {
            // Because loginresponse.body is a raw String, we must parse it to JSON first!
            try {
                const jsonBody = loginresponse.json();
                return typeof jsonBody.token === "string" && jsonBody.token.length > 4;
            } catch (error) {
                return false;
            }
        }
    })

    if(loginCheck){
        // Grab the literal token string from the JSON response
        authToken = loginresponse.json("token");
        console.log(`[SUCCESS] Extracted Auth Token: ${authToken}`);
    } else {
        console.error(`User Login Failed ${loginresponse.body}` )
    }
}); // <-- Properly closing the login group

    sleep(1);
} // <-- Properly closing the export default function()
