import React, { ReactElement } from "react";
import { NextPage, NextPageContext, NextComponentType } from "next";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";

// TODO: Types are first parse, could be made better
type TCacheShape = {
  [x: string]: unknown;
  [x: number]: unknown;
};

let globalApolloClient: ApolloClient<TCacheShape> | null = null;

interface WithApolloOptions {
  ssr?: boolean;
}

interface WithApolloProps {
  apolloClient?: ApolloClient<TCacheShape> | null;
  apolloState?: {};
  [x: string]: unknown;
}

interface NextPageContextWithApolloClient extends NextPageContext {
  apolloClient: ApolloClient<TCacheShape>;
}

function createIsomorphLink(): ApolloLink {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SchemaLink } = require("apollo-link-schema");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { schema } = require("./schema");
    return new SchemaLink({ schema });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HttpLink } = require("apollo-link-http");
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin"
    });
  }
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(initialState = {}): ApolloClient<TCacheShape> {
  const ssrMode = typeof window === "undefined";
  const cache = new InMemoryCache().restore(initialState);

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    ssrMode,
    link: createIsomorphLink(),
    cache
  });
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
function initApolloClient(initialState?: {}): ApolloClient<TCacheShape> {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState);
  }

  return globalApolloClient;
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApollo<P>(
  PageComponent: NextPage,
  { ssr = true }: WithApolloOptions = {}
): ReactElement | NextPage<WithApolloProps> {
  const WithApollo: ReactElement | NextPage<WithApolloProps> = ({
    apolloClient,
    apolloState,
    ...pageProps
  }) => {
    const client = apolloClient || initApolloClient(apolloState);
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    (WithApollo as NextComponentType<
      NextPageContextWithApolloClient,
      WithApolloProps,
      WithApolloProps
    >).getInitialProps = async (ctx): Promise<WithApolloProps> => {
      const { AppTree } = ctx;

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient());

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient
                }}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState
      };
    };
  }

  return WithApollo;
}
