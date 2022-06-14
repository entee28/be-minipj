"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const calAccrued_1 = __importDefault(require("../util/calAccrued"));
const user_1 = require("./user");
let OrderObject = class OrderObject {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], OrderObject.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], OrderObject.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], OrderObject.prototype, "code", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], OrderObject.prototype, "amount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], OrderObject.prototype, "interest_rate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Number]),
    __metadata("design:type", Array)
], OrderObject.prototype, "accrued_amount", void 0);
OrderObject = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrderObject);
let OrderResponse = class OrderResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], OrderResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => OrderObject, { nullable: true }),
    __metadata("design:type", OrderObject)
], OrderResponse.prototype, "order", void 0);
OrderResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrderResponse);
let OrdersResponse = class OrdersResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], OrdersResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [OrderObject], { nullable: true }),
    __metadata("design:type", Array)
], OrdersResponse.prototype, "orders", void 0);
OrdersResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrdersResponse);
let OrderResolver = class OrderResolver {
    async createOrder(user, amount, interest_rate) {
        const queryUser = await User_1.default.findById(user);
        if (!queryUser) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Invalid User",
                    },
                ],
            };
        }
        if (amount <= 0) {
            return {
                errors: [
                    {
                        field: "amount",
                        message: "Invalid amount",
                    },
                ],
            };
        }
        if (interest_rate <= 0) {
            return {
                errors: [
                    {
                        field: "interest_rate",
                        message: "Invalid interest rate",
                    },
                ],
            };
        }
        let order;
        try {
            const newOrder = await new Order_1.default({
                user,
                amount,
                interest_rate,
            }).save();
            const accrued_amount = (0, calAccrued_1.default)(amount, interest_rate);
            order = { ...newOrder._doc, accrued_amount };
        }
        catch (err) {
            if (err.code === 11000) {
                return {
                    errors: [
                        {
                            field: "code",
                            message: "duplicated code",
                        },
                    ],
                };
            }
            else {
                return {
                    errors: [
                        {
                            field: "general",
                            message: err.message,
                        },
                    ],
                };
            }
        }
        return { order };
    }
    async getOneOrder(_id) {
        const queryOrder = await Order_1.default.findById(_id);
        if (!queryOrder) {
            return {
                errors: [
                    {
                        field: "_id",
                        message: "Order not found",
                    },
                ],
            };
        }
        const accrued_amount = (0, calAccrued_1.default)(queryOrder.amount, queryOrder.interest_rate);
        const order = { ...queryOrder._doc, accrued_amount };
        return { order };
    }
    async getManyOrders(user) {
        const queryOrders = await Order_1.default.find({ user }).exec();
        if (queryOrders === []) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "No order found",
                    },
                ],
            };
        }
        let orders = [];
        queryOrders.forEach((order) => {
            const accrued_amount = (0, calAccrued_1.default)(order.amount, order.interest_rate);
            orders.push({ ...order._doc, accrued_amount });
        });
        return { orders };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => OrderResponse),
    __param(0, (0, type_graphql_1.Arg)("user")),
    __param(1, (0, type_graphql_1.Arg)("amount")),
    __param(2, (0, type_graphql_1.Arg)("interest_rate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "createOrder", null);
__decorate([
    (0, type_graphql_1.Query)(() => OrderResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getOneOrder", null);
__decorate([
    (0, type_graphql_1.Query)(() => OrdersResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("user")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getManyOrders", null);
OrderResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], OrderResolver);
exports.OrderResolver = OrderResolver;
//# sourceMappingURL=order.js.map