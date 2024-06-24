const { chromium } = require('playwright');

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
    const browser = await chromium.launch({ headless: false});

    // Create a new browser context
    const context = await browser.newContext();

    // Create a new page
    const page = await context.newPage();

    await page.goto(URL);

    // Perform your tests or automation tasks here
    await validationTestPath(page, path);

    // Close the browser
    await browser.close();
})();


async function validationTestPath(page, path) {
    for (let step of path) {
        console.log('Step:', step);
        await validationTestStep(page, step);
    }
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