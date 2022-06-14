"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("./resolvers/user");
const type_graphql_1 = require("type-graphql");
const order_1 = require("./resolvers/order");
const main = async () => {
    const app = (0, express_1.default)();
    mongoose_1.default
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB Connected..."))
        .catch((err) => console.log(err));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, order_1.OrderResolver],
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
//# sourceMappingURL=index.js.map