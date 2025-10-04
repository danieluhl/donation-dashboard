import { expect, test } from "@playwright/test";

test("has basic page elements", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await expect(page).toHaveTitle(/Donations Dashboard/);
});

test("displays the campaign goal", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await page.waitForFunction(
		() =>
			!document
				.querySelector('[data-testid="goal"]')
				?.textContent?.includes("Loading..."),
	);
	const goal = await page.getByTestId("goal").innerText();
	expect(goal).toMatch(/^\$[\d,]+(\.\d{2})?$/);
});

test("displays the total raised amount", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await page.waitForFunction(
		() =>
			!document
				.querySelector('[data-testid="total-raised"]')
				?.textContent?.includes("Loading..."),
	);
	const totalRaised = await page.getByTestId("total-raised").innerText();
	expect(totalRaised).toMatch(/^\$[\d,]+(\.\d{2})?$/);
});

test("displays the progress bar", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	const progressBar = page.getByRole("progressbar", {
		name: "Donation progress towards goal",
	});
	await expect(progressBar).toBeVisible();
});

test("displays a list of donations", async ({ page }) => {
	await page.goto("http://localhost:5173/", { waitUntil: "load" });
	await page.waitForFunction(
		() => document.querySelectorAll('[data-testid="donation-card"]').length > 0,
	);
	const donations = await page.getByTestId("donation-card").all();
	expect(donations.length).toBeGreaterThan(0);

	for (const donation of donations) {
		const donor = await donation.getByTestId("user-name").innerText();
		const amount = await donation.getByTestId("donation-amount").innerText();
		expect(donor).not.toBeNull();
		expect(amount).toMatch(/^\$[\d,]+(\.\d{2})?$/);
	}
});
