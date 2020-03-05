import React from "react";
import { NextPage } from "next";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import getConfig from "next/config";

import { withApollo } from "../apollo/client";
import { User } from "../apollo/types";

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

const Index: NextPage<Props> = ({ userAgent }) => {
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
