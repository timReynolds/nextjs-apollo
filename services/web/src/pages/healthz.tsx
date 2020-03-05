import React from "react";
import { NextPage } from "next";

const Health: NextPage = () => <div />;

Health.getInitialProps = async ({ res }): Promise<void> => {
  if (res) {
    res.end("OK");
  }
};

export default Health;
