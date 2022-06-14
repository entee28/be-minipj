import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import mongoose from "mongoose";
import { UserResolver } from "./resolvers/user";
import { buildSchema } from "type-graphql";
import { OrderResolver } from "./resolvers/order";

const main = async () => {
  const app = express();

  mongoose //@ts-ignore
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, OrderResolver],
      validate: false,
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
