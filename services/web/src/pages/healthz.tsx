import React from "react";
import { NextPage } from "next";

const Health: NextPage = () => <div />;

Health.getInitialProps = async ({ res }) => {
  if (res) {
    res.end("OK");
  }
};

export default Health;
