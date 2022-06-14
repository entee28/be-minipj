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

@ObjectType()
class UserObject {
  @Field()
  _id!: string;

  @Field()
  full_name!: string;

  @Field()
  phone!: string;

  @Field()
  age: number;

  @Field()
  gender: string;

  @Field()
  total_amount: number;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserObject, { nullable: true })
  user?: UserObject;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async createUser(
    @Arg("full_name") full_name: string,
    @Arg("phone") phone: string,
    @Arg("age") age: number,
    @Arg("gender") gender: "Male" | "Female" | "Other"
  ): Promise<UserResponse> {
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
      const newUser = await new User({
        full_name,
        phone,
        age,
        gender,
      }).save();

      user = { ...newUser, total_amount: 0 };
    } catch (err) {
      if (err.code === 11000) {
        return {
          errors: [
            {
              field: "phone",
              message: "Phone number has been used!",
            },
          ],
        };
      } else {
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

  @Mutation(() => UserResponse)
  async updateUser(
    @Arg("_id") _id: string,
    @Arg("full_name") full_name: string,
    @Arg("phone") phone: string,
    @Arg("age") age: number,
    @Arg("gender") gender: "Male" | "Female" | "Other"
  ): Promise<UserResponse | null> {
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

    const user = await User.findById(_id);

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
    } catch (err) {
      if (err.code === 11000) {
        return {
          errors: [
            {
              field: "phone",
              message: "Phone number has been used!",
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

    const orders = await Order.find({ user: _id }).exec();
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

  @Query(() => UserResponse, { nullable: true })
  async getUser(@Arg("_id") _id: string): Promise<UserResponse> {
    const user = await User.findById(_id);

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

    const orders = await Order.find({ user: _id }).exec();
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
}
