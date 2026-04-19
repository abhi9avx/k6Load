import { browser } from 'k6/browser';
import { check } from 'k6';
import http from 'k6/http';

export const options = {
    //4 or 5 put load on url  get call - 100 user , url browser
    scenarios : {

        ui: {
            executor: 'shared-iterations',
            exec: 'browserTest',
            vus: 2,
            iterations: 3, 
            maxDuration: '1m', // For shared-iterations, use maxDuration instead of duration
            options: {
                browser: {
                    type: 'chromium'
                }
            }
        },
        backendStress: {
            executor: 'constant-vus', // You MUST specify an executor type!
            exec: 'backendStress',
            vus: 10,
            duration: '1m'
        }
    },

    thresholds: {
        checks: ['rate==1.0'],
        browser_web_vital_cls: ['p(90) < 0.1'],   // Cumulative Layout Shift (Lower is better, < 0.1 is Good)
        browser_web_vital_fcp: ['p(90) < 1800'],  // First Contentful Paint (< 1800ms is Good)
        browser_web_vital_lcp: ['p(90) < 2500'],  // Largest Contentful Paint (< 2500ms is Good)
        browser_web_vital_fid: ['p(90) < 100'],   // First Input Delay (< 100ms is Good)
        browser_web_vital_ttfb: ['p(90) < 800']   // Time to First Byte (< 800ms is Good)
    }
}

export  async function browserTest() {

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://rahulshettyacademy.com/locatorspractice/');
    await page.locator("#inputUsername").type("rahul");
    await page.locator("input[type='password']").type("rahulshettyacademy");
    await page.locator("button[type='submit']").click();

    await page.waitForTimeout(2000);

    const headerText = await page.locator("h1").first().textContent();
    console.log(headerText);

    check(headerText,{  
        header  : (text) => 
            {
                return text.includes("Welcome to Rahul Shetty Academy")   
            }
    })

    await page.close();
    await context.close();
}

export async function backendStress() {
    // Making a standard HTTP GET call to simulate API backend load 
    // independently from the UI browser automation!
    const response = http.get('https://rahulshettyacademy.com/locatorspractice/');
    check(response, {
        'status is 200': (r) => r.status === 200
    });
}
    