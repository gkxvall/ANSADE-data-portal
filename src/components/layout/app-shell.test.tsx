import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the application landmark and stage-aware navigation", () => {
    render(
      <AppShell appName="ANSADE Statistical Data Explorer">
        <p>Contenu de test</p>
      </AppShell>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("Contenu de test");
    expect(
      screen.getAllByRole("navigation", { name: "Navigation principale" }),
    ).toHaveLength(1);
    expect(
      screen.getByText("Catalogue").closest("[aria-disabled='true']"),
    ).toBeInTheDocument();
  });

  it("opens and closes the mobile navigation", () => {
    render(
      <AppShell appName="ANSADE Statistical Data Explorer">
        <p>Contenu de test</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    expect(
      screen.getByRole("complementary", { name: "Navigation mobile" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fermer le menu" }));
    expect(
      screen.queryByRole("complementary", { name: "Navigation mobile" }),
    ).not.toBeInTheDocument();
  });
});
