import React from "react";
import { NextPage } from "next";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import getConfig from "next/config";

import { User } from "../apollo/types";
import { withApollo } from "../apollo/client";

const { publicRuntimeConfig } = getConfig();

interface Props {
  userAgent?: string;
}

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      name
      status
    }
  }
`;

export const Index: NextPage<Props> = ({ userAgent }) => {
  const { loading, data } = useQuery<{ viewer: User }>(ViewerQuery);

  let viewer = "Loading...";
  if (!loading && data && data.viewer && data.viewer.name) {
    viewer = data.viewer.name;
  }

  return (
    <>
      <div data-testid="message">
        environment: {publicRuntimeConfig.environment} user agent: {userAgent}
      </div>
      <div data-testid="viewer">{viewer}</div>
    </>
  );
};

Index.getInitialProps = async ({ req }): Promise<Props> => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  return { userAgent };
};

export default withApollo(Index);
