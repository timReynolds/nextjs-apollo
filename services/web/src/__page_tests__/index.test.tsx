import React from "react";
import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/react-testing";

import { Index, GET_VIEWER_QUERY } from "../pages/index";

interface SutProps {
  mocks: any[];
}

const Sut: React.FC<SutProps> = ({ mocks }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Index />
  </MockedProvider>
);

describe("Index", () => {
  test("Should display user agent text and user name", async () => {
    // Arrange
    const mocks = [
      {
        request: {
          query: GET_VIEWER_QUERY
        },
        result: {
          data: {
            viewer: { id: 1, name: "John Smith", status: "cached" }
          }
        }
      }
    ];

    // Act

    const { findByTestId } = render(<Sut mocks={mocks} />);
    // Assert
    expect(await findByTestId("message")).toHaveTextContent(
      "environment: test user agent:"
    );
    expect(await findByTestId("viewer")).toHaveTextContent("John Smith");
  });

  test("When loading should display user agent and loading message", async () => {
    // Arrange
    const mocks: any[] = [];

    // Act
    const { findByTestId } = render(<Sut mocks={mocks} />);

    // Assert
    expect(await findByTestId("message")).toHaveTextContent(
      "environment: test user agent:"
    );
    expect(await findByTestId("viewer")).toHaveTextContent("Loading...");
  });
});
