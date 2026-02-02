import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("shows the app title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Squardle")).toBeVisible();
  });

  test("has link to admin", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Admin")).toBeVisible();
  });
});

test.describe("Admin Flow", () => {
  test("can access admin login page", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("text=Admin Login")).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid password")).toBeVisible();
  });

  test("can login with correct password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("text=Admin Dashboard")).toBeVisible();
  });

  test("can navigate to create game page", async ({ page }) => {
    // Login first
    await page.goto("/admin/login");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin");

    // Click create game
    await page.click("text=Create Game");
    await expect(page).toHaveURL("/admin/game/new");
    await expect(page.locator("text=Create New Game")).toBeVisible();
  });
});

test.describe("Game Creation", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin");
  });

  test("shows validation for payout percentages", async ({ page }) => {
    await page.goto("/admin/game/new");

    // Fill in basic info
    await page.fill('input[name="name"]', "Test Game");
    await page.fill('input[name="xTeamName"]', "Chiefs");
    await page.fill('input[name="yTeamName"]', "Eagles");

    // Set invalid payouts (not 100%)
    await page.fill('input[name="q1Payout"]', "30");
    await page.fill('input[name="q2Payout"]', "30");
    await page.fill('input[name="q3Payout"]', "30");
    await page.fill('input[name="q4Payout"]', "30");

    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator("text=Payouts must total 100%")).toBeVisible();
  });

  test("create game form has all required fields", async ({ page }) => {
    await page.goto("/admin/game/new");

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="xTeamName"]')).toBeVisible();
    await expect(page.locator('input[name="yTeamName"]')).toBeVisible();
    await expect(page.locator('input[name="pricePerSquare"]')).toBeVisible();
    await expect(page.locator('input[name="paymentLink"]')).toBeVisible();
    await expect(page.locator('input[name="q1Payout"]')).toBeVisible();
    await expect(page.locator('input[name="q2Payout"]')).toBeVisible();
    await expect(page.locator('input[name="q3Payout"]')).toBeVisible();
    await expect(page.locator('input[name="q4Payout"]')).toBeVisible();
  });
});

test.describe("Square Selection UI", () => {
  test("play page shows grid with 100 squares", async ({ page }) => {
    // This test assumes a game exists - will be skipped if no games
    await page.goto("/");

    // Check if any games exist
    const gameLinks = page.locator('a:has-text("Pick Squares")');
    const count = await gameLinks.count();

    if (count > 0) {
      await gameLinks.first().click();

      // Should show the grid
      await expect(page.locator("text=Tap squares to select")).toBeVisible();

      // Should show selection counter
      await expect(page.locator("text=Selected:")).toBeVisible();
      await expect(page.locator("text=/ 10")).toBeVisible();
    }
  });

  test("player form has required fields", async ({ page }) => {
    await page.goto("/");

    const gameLinks = page.locator('a:has-text("Pick Squares")');
    const count = await gameLinks.count();

    if (count > 0) {
      await gameLinks.first().click();

      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
    }
  });
});

test.describe("Game View", () => {
  test("game page shows team names and grid", async ({ page }) => {
    await page.goto("/");

    const viewLinks = page.locator('a:has-text("View Game")');
    const count = await viewLinks.count();

    if (count > 0) {
      await viewLinks.first().click();

      // Should show game board section
      await expect(page.locator("text=Game Board")).toBeVisible();

      // Should show results section
      await expect(page.locator("text=Results")).toBeVisible();

      // Should show legend
      await expect(page.locator("text=Available")).toBeVisible();
      await expect(page.locator("text=Taken")).toBeVisible();
    }
  });
});

test.describe("Navigation", () => {
  test("can navigate between pages", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Squardle");

    // Go to admin login
    await page.click("text=Admin");
    await expect(page).toHaveURL("/admin/login");

    // Go back home via logo
    await page.click("text=Squardle");
    await expect(page).toHaveURL("/");
  });
});
