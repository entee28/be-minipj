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

/** Define GraphQL Order type and its fields */
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

/** Custom Order related return types, which will return 'errors' field if error occurs, else return 'order'/'orders' field */
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

/** Order field resolver */
@Resolver()
export class OrderResolver {
  /** create new order mutation */
  @Mutation(() => OrderResponse)
  async createOrder(
    @Arg("user") user: string,
    @Arg("amount") amount: number,
    @Arg("interest_rate") interest_rate: number
  ): Promise<OrderResponse> {
    /** check if user, amount and interest_rate is valid, if not return error */
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

    let order: OrderObject | null = null;
    try {
      /** create new order and save it */
      const newOrder = await new Order({
        user,
        amount,
        interest_rate,
      }).save();

      const accrued_amount: Array<number> = calAccrued(amount, interest_rate);

      order = {
        _id: newOrder._id.toString(),
        code: newOrder.code,
        user: newOrder.user,
        amount: newOrder.amount,
        interest_rate: newOrder.interest_rate,
        accrued_amount,
      };
    } catch (err) {
      /** handle duplicate unique field duplicated and other errors */
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

  /** get one order query */
  @Query(() => OrderResponse, { nullable: true })
  async getOneOrder(@Arg("_id") _id: string): Promise<OrderResponse> {
    const queryOrder = await Order.findById(_id);
    /** check if order id is valid, if not return error */
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

    /** calculate accrued amount */
    const accrued_amount: Array<number> = calAccrued(
      queryOrder.amount,
      queryOrder.interest_rate
    );

    const order = {
      _id: queryOrder._id.toString(),
      code: queryOrder.code,
      user: queryOrder.user,
      amount: queryOrder.amount,
      interest_rate: queryOrder.interest_rate,
      accrued_amount,
    };
    return { order };
  }
  /** get many orders query */
  @Query(() => OrdersResponse, { nullable: true })
  async getManyOrders(@Arg("user") user: string): Promise<OrdersResponse> {
    const queryUser = await User.findById(user);
    /** check if user is available, if not return error */
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

    const queryOrders = await Order.find({ user }).exec();

    /** check if user has any order */
    if (queryOrders.length < 1) {
      return {
        errors: [
          {
            field: "user",
            message: "No order found",
          },
        ],
      };
    }

    /** an array stores all queried orders */
    let orders: OrderObject[] = [];

    /** calculate accrued amount for every order */
    queryOrders.forEach((order) => {
      const accrued_amount: Array<number> = calAccrued(
        order.amount,
        order.interest_rate
      );
      orders.push({
        _id: order._id.toString(),
        code: order.code,
        user: order.user,
        amount: order.amount,
        interest_rate: order.interest_rate,
        accrued_amount,
      });
    });

    return { orders };
  }
}
