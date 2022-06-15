import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import Order from "../models/Order";
import User from "../models/User";

/** Define GraphQL User type and its fields */
@ObjectType()
class UserObject {
  @Field()
  _id!: string;

  @Field()
  full_name!: string;

  @Field()
  phone!: string;

  @Field()
  age?: number;

  @Field()
  gender?: string;

  @Field()
  total_amount: number;
}

/** Define user input fragment */
@InputType()
class UserInput {
  @Field()
  full_name!: string;

  @Field()
  phone!: string;

  @Field()
  age!: number;

  @Field()
  gender!: "Male" | "Female" | "Other";
}

/** Define custom FieldError type */
@ObjectType()
export class FieldError {
  /** the field that occurs the error */
  @Field()
  field: string;

  @Field()
  message: string;
}

/** Custom User related return type, which will return 'errors' field if error occurs, else return 'user' field */
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserObject, { nullable: true })
  user?: UserObject;
}

/** Create User field resolvers */
@Resolver()
export class UserResolver {
  /** create user mutation */
  /** return UserResponse */
  @Mutation(() => UserResponse)
  async createUser(
    @Arg("user_input") user_input: UserInput
  ): Promise<UserResponse> {
    const { full_name, phone, age, gender } = user_input;
    /** check if phone number is valid, if not return error */
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
      /** create and save new user */
      const newUser = await new User({
        full_name,
        phone,
        age,
        gender,
      }).save();

      user = {
        _id: newUser._id.toString(),
        full_name: newUser.full_name,
        phone: newUser.phone,
        age: newUser.age,
        gender: newUser.gender,
        total_amount: 0,
      };
    } catch (err) {
      /** handle duplicate unique value error and other errors */
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

    return { user };
  }

  /** update user mutation */
  @Mutation(() => UserResponse)
  async updateUser(
    @Arg("_id") _id: string,
    @Arg("user_input") user_input: UserInput
  ): Promise<UserResponse> {
    const { full_name, phone, age, gender } = user_input;
    /** check if phone number is valid, if not return error */
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

    /** check if user id is available, if not return error */
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

    /** update user */
    user.full_name = full_name;
    user.age = age;
    user.phone = phone;
    user.gender = gender;

    try {
      await user.save();
    } catch (err) {
      /** handle duplicate unique value error and other errors */
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

    /** find all orders that have the user ID, then calculate total amount */
    const orders = await Order.find({ user: _id }).exec();
    let total_amount = 0;
    orders.forEach((order) => {
      total_amount += order.amount;
    });

    return {
      user: {
        _id: user._id.toString(),
        full_name: user.full_name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        total_amount,
      },
    };
  }

  /** get user query */
  @Query(() => UserResponse, { nullable: true })
  async getUser(@Arg("_id") _id: string): Promise<UserResponse> {
    /** find if user id is available, if not return error */
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

    /** find all orders that have the user ID, then calculate total amount */
    const orders = await Order.find({ user: _id }).exec();
    let total_amount = 0;
    orders.forEach((order) => {
      total_amount += order.amount;
    });

    return {
      user: {
        _id: user._id.toString(),
        full_name: user.full_name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        total_amount,
      },
    };
  }
}
