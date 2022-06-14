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
exports.UserResolver = exports.FieldError = void 0;
const type_graphql_1 = require("type-graphql");
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
let UserObject = class UserObject {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserObject.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserObject.prototype, "full_name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserObject.prototype, "phone", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UserObject.prototype, "age", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserObject.prototype, "gender", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UserObject.prototype, "total_amount", void 0);
UserObject = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserObject);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
exports.FieldError = FieldError;
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => UserObject, { nullable: true }),
    __metadata("design:type", UserObject)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    async createUser(full_name, phone, age, gender) {
        if (!phone.match(/0[35789]\d{8}/) || phone.length !== 10) {
            return {
                errors: [
                    {
                        field: "phone",
                        message: "Invalid phone number",
                    },
                ],
            };
        }
        let user;
        try {
            const newUser = await new User_1.default({
                full_name,
                phone,
                age,
                gender,
            }).save();
            user = { ...newUser, total_amount: 0 };
        }
        catch (err) {
            if (err.code === 11000) {
                return {
                    errors: [
                        {
                            field: "phone",
                            message: "Phone number has been used!",
                        },
                    ],
                };
            }
            else {
                return {
                    errors: [
                        {
                            field: "unknown",
                            message: err.message,
                        },
                    ],
                };
            }
        }
        return { user };
    }
    async updateUser(_id, full_name, phone, age, gender) {
        if (!phone.match(/0[35789]\d{8}/) || phone.length !== 10) {
            return {
                errors: [
                    {
                        field: "phone",
                        message: "Invalid phone number",
                    },
                ],
            };
        }
        const user = await User_1.default.findById(_id);
        if (!user) {
            return {
                errors: [
                    {
                        field: "_id",
                        message: "User not found",
                    },
                ],
            };
        }
        user.full_name = full_name;
        user.age = age;
        user.phone = phone;
        user.gender = gender;
        try {
            await user.save();
        }
        catch (err) {
            if (err.code === 11000) {
                return {
                    errors: [
                        {
                            field: "phone",
                            message: "Phone number has been used!",
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
        const orders = await Order_1.default.find({ user: _id }).exec();
        let total_amount = 0;
        orders.forEach((order) => {
            total_amount += order._doc.amount;
        });
        return {
            user: {
                ...user._doc,
                total_amount,
            },
        };
    }
    async getUser(_id) {
        const user = await User_1.default.findById(_id);
        if (!user) {
            return {
                errors: [
                    {
                        field: "_id",
                        message: "User not found",
                    },
                ],
            };
        }
        const orders = await Order_1.default.find({ user: _id }).exec();
        let total_amount = 0;
        orders.forEach((order) => {
            total_amount += order._doc.amount;
        });
        return {
            user: {
                ...user._doc,
                total_amount,
            },
        };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("full_name")),
    __param(1, (0, type_graphql_1.Arg)("phone")),
    __param(2, (0, type_graphql_1.Arg)("age")),
    __param(3, (0, type_graphql_1.Arg)("gender")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("_id")),
    __param(1, (0, type_graphql_1.Arg)("full_name")),
    __param(2, (0, type_graphql_1.Arg)("phone")),
    __param(3, (0, type_graphql_1.Arg)("age")),
    __param(4, (0, type_graphql_1.Arg)("gender")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => UserResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUser", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map