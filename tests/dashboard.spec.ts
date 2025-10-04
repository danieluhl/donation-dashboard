import { expect, test } from "@playwright/test";

test("has basic page elements", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await expect(page).toHaveTitle(/Donations Dashboard/);
});

test("displays the campaign goal", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	const goal = await page.getByTestId("goal").innerText();
	expect(goal).toMatch(/^\$[\d,]+(\.\d{2})?$/);
});

test("displays the total raised amount", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	const totalRaised = await page.getByTestId("total-raised").innerText();
	expect(totalRaised).toMatch(/^\$[\d,]+(\.\d{2})?$/);
});

test("displays the progress bar", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	const progressBar = page.getByTestId("progress-bar");
	await expect(progressBar).toBeVisible();
});

test("displays a list of donations", async ({ page }) => {
	await page.goto("http://localhost:5173/", { waitUntil: "load" });
	await page.waitForSelector('[data-testid="donation-card"]');
	const donations = await page.getByTestId("donation-card").all();
	expect(donations.length).toBeGreaterThan(0);

	for (const donation of donations) {
		const userName = await donation.getByTestId("user-name").innerText();
		const amount = await donation.getByTestId("donation-amount").innerText();

		expect(userName).not.toBeNull();
		expect(amount).toMatch(/^\$[\d,]+(\.\d{2})?$/);
	}
});
