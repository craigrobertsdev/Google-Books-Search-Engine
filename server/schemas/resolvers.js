const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // finds the logged in user based on the passed token's user _id if it exists
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user.id }).populate("savedBooks");
      }
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookId, authors, description, title, image, link }, context) => {
      console.log(bookId, authors, description, title, image, link);
      if (!context?.user) {
        throw new AuthenticationError("You need to be logged in to save books");
      }

      if (!description) {
        description = " ";
      }

      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: { authors, description, bookId, title, image, link } } },
        { new: true, runValidators: true }
      );
    },
    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to delete books");
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;
