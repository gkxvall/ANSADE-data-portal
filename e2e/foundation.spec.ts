import { expect, test } from "@playwright/test";

test("shows the Stage 1 foundation without fabricated statistics", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Une base claire",
  );
  await expect(
    page.getByText("Aucune donnée statistique chargée"),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
});

test("opens the navigation drawer on a mobile viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile-only shell behavior",
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(
    page.getByRole("complementary", { name: "Navigation mobile" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fermer le menu" }).click();
  await expect(
    page.getByRole("complementary", { name: "Navigation mobile" }),
  ).toBeHidden();
});
