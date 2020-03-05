import React from "react";
import { render } from "@testing-library/react";

import Sut from "./index";

describe("Index", () => {
  test("Should display user agent text", () => {
    // Arrange
    // Act
    const { getByTestId } = render(<Sut />);
    // Assert
    expect(getByTestId("message")).toHaveTextContent(
      "environment: test user agent:"
    );
  });
});
