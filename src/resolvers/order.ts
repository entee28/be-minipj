import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import Order from "../models/Order";
import User from "../models/User";
import calAccrued from "../util/calAccrued";
import { FieldError } from "./user";

@ObjectType()
class OrderObject {
  @Field()
  _id: string;

  @Field()
  user: string;

  @Field()
  code: string;

  @Field()
  amount: number;

  @Field()
  interest_rate: number;

  @Field(() => [Number])
  accrued_amount: number[];
}

@ObjectType()
class OrderResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => OrderObject, { nullable: true })
  order?: OrderObject;
}

@ObjectType()
class OrdersResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => [OrderObject], { nullable: true })
  orders?: OrderObject[];
}

@Resolver()
export class OrderResolver {
  @Mutation(() => OrderResponse)
  async createOrder(
    @Arg("user") user: string,
    @Arg("amount") amount: number,
    @Arg("interest_rate") interest_rate: number
  ): Promise<OrderResponse> {
    const queryUser = await User.findById(user);

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
      const newOrder = await new Order({
        user,
        amount,
        interest_rate,
      }).save();

      const accrued_amount: Array<number> = calAccrued(amount, interest_rate);

      order = { ...newOrder._doc, accrued_amount };
    } catch (err) {
      if (err.code === 11000) {
        return {
          errors: [
            {
              field: "code",
              message: "duplicated code",
            },
          ],
        };
      } else {
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

  @Query(() => OrderResponse, { nullable: true })
  async getOneOrder(@Arg("_id") _id: string): Promise<OrderResponse> {
    const queryOrder = await Order.findById(_id);

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

    const accrued_amount: Array<number> = calAccrued(
      queryOrder.amount,
      queryOrder.interest_rate
    );

    const order = { ...queryOrder._doc, accrued_amount };
    return { order };
  }

  @Query(() => OrdersResponse, { nullable: true })
  async getManyOrders(@Arg("user") user: string): Promise<OrdersResponse> {
    const queryOrders = await Order.find({ user }).exec();

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

    let orders: OrderObject[] = [];
    queryOrders.forEach((order) => {
      const accrued_amount: Array<number> = calAccrued(
        order.amount,
        order.interest_rate
      );
      orders.push({ ...order._doc, accrued_amount });
    });

    return { orders };
  }
}
