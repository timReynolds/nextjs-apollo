// https://github.com/zeit/next.js/tree/canary/examples/api-routes-apollo-server-and-client
import { ApolloServer } from "apollo-server-micro";
import { schema } from "../../apollo/schema";

const apolloServer = new ApolloServer({ schema });

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
