require("dotenv").config();
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    slowMo: 500,
  });

  const page = await browser.newPage();

  try {
    if (!process.env.FORM_URL || !process.env.NIK || !process.env.NAME) {
      throw new Error("FORM_URL, NIK, atau NAME belum diatur di .env");
    }

    console.log("Opening form...");

    await page.goto(process.env.FORM_URL, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    console.log("Click Start Now");

    await page
      .getByRole("button", {
        name: /start now/i,
      })
      .click();

    await page.waitForSelector('[data-automation-id="textInput"]');

    const inputs = page.locator('[data-automation-id="textInput"]');

    console.log("Fill NIK");
    await inputs.nth(0).fill(process.env.NIK);

    console.log("Fill Name");
    await inputs.nth(1).fill(process.env.NAME);

    console.log("Select Lokasi Bintaro");

    await page.locator('input[type="radio"][value="WFO - BINTARO"]').check();

    console.log("Submit");

    await page.locator('[data-automation-id="submitButton"]').click();

    console.log("Checking submission status...");

    const successMessage = page.locator(
      '[data-automation-id="thankYouMessage"]',
    );

    await successMessage.waitFor({
      state: "visible",
      timeout: 15000,
    });

    const message = (await successMessage.innerText()).trim();

    if (message !== "Your response was submitted.") {
      throw new Error(`Unexpected confirmation message: ${message}`);
    }

    console.log("Attendance submitted successfully!");
    console.log("Confirmation:", message);

    // Biarkan browser terbuka untuk diperiksa.
    await page.pause();
  } catch (err) {
    console.error("Process failed:", err);

    try {
      await page.screenshot({
        path: "submission-error.png",
        fullPage: true,
      });
    } catch (screenshotError) {
      console.error("Screenshot failed:", screenshotError.message);
    }

    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
