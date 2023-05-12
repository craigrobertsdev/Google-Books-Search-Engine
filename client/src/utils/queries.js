import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    me {
      _id
      name
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;
