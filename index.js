const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({
        headless: true,
    });

    const page = await browser.newPage();

    try {

        console.log("Opening form...");

        await page.goto(
            process.env.FORM_URL,
            {
                waitUntil: "networkidle",
                timeout: 60000
            }
        );

        console.log("Click Start Now");

        await page.getByRole("button", {
            name: /start now/i
        }).click();

        await page.waitForSelector('[data-automation-id="textInput"]');

        const inputs = page.locator('[data-automation-id="textInput"]');

        console.log("Fill NIK");

        await inputs.nth(0).fill(process.env.NIK);

        console.log("Fill Name");

        await inputs.nth(1).fill(process.env.NAME);

        console.log("Submit");

        await page.locator('[data-automation-id="submitButton"]').click();

        await page.waitForLoadState("networkidle");

        console.log("Attendance submitted successfully.");

    } catch (err) {

        console.error(err);

        process.exit(1);

    } finally {

        await browser.close();

    }

})();