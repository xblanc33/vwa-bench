const { chromium } = require('playwright');
const evaluateAll = require('./validation-function');

const URL = 'http://127.0.0.1:9980/';

(async () => {
    // read task-id and path number from the command line
    const taskId = process.argv[2];
    const pathNumber = process.argv[3];

    // read the validations from the file
    const fs = require('fs');
    const ACTION_VALIDATION = 'action_validation.json';
    var dataValidations = fs.readFileSync(ACTION_VALIDATION);
    var validations = JSON.parse(dataValidations);

    const CLASSIFIEDS = 'test_classifieds.raw.json';
    var dataClassifieds = fs.readFileSync(CLASSIFIEDS);
    var classifieds = JSON.parse(dataClassifieds);

    // find the validation for the task
    let validation = validations.find((v) => v.task_id == taskId);
    if (!validation) {
        console.log('Validation not found for task', taskId);
        return;
    }

    // find the path
    let path = validation.paths[pathNumber];

    if (!path) {
        console.log('Path not found for task', taskId, 'and path', pathNumber);
        return;
    }

    // Create a new Playwright instance
    const browser = await chromium.launch({ headless: false, slowMo: 500});

    // Create a new browser context
    const context = await browser.newContext();

    // Create a new page
    const page = await context.newPage();

    await page.goto(URL);

    await log(page);

    // Perform your tests or automation tasks here
    await executePath(page, path);

    // Evaluate the results
    let task = classifieds.find((c) => c.task_id == taskId);
    if (!task) {
        console.log('Task not found in classifieds', taskId);
        return;
    }
    let result = await evaluateAll(task.eval, page, URL);

    console.log('Validation result:', result);


    // Close the browser
    await browser.close();
})();


async function log(page) {
    const USERNAME = 'blake.sullivan@gmail.com';
    const PASSWORD = 'Password.123';
    await page.goto(URL + 'index.php?page=login');
    await page.locator("#email").fill(USERNAME)
    await page.locator("#password").fill(PASSWORD)
    await page.getByRole("button", name="Log in").click()
    await page.goto(URL);
}

async function executePath(page, path) {
    for (let step of path) {
        console.log('Step:', step);
        await validationTestStep(page, step);
    }
    console.log('Path completed');
}

async function validationTestStep(page, step) {
    if (step.kind === 'goto') {
        await page.goto(step.target);
    } else if (step.kind === 'click') {
        await page.click(step.target);
    } else if (step.kind === 'fill') {
        await page.fill(step.target, step.value);
    } else if (step.kind === 'select') {
        await page.select(step.target, step.value);
    }
}