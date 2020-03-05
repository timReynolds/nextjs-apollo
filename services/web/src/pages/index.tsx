import React from "react";
import { NextPage } from "next";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

interface Props {
  userAgent?: string;
}

const Page: NextPage<Props> = ({ userAgent }) => (
  <main data-testid="message">
    environment: {publicRuntimeConfig.environment} user agent: {userAgent}
  </main>
);

Page.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  return { userAgent };
};

export default Page;
