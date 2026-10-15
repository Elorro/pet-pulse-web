import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its accessible label", () => {
    render(<Button>Join Pet Pulse</Button>);
    expect(
      screen.getByRole("button", { name: "Join Pet Pulse" }),
    ).toBeInTheDocument();
  });
});
