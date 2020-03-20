import { User } from "./types";

export const resolvers = {
  Query: {
    viewer(): User {
      return { id: 1, name: "John Smith", status: "cached" };
    }
  }
};
