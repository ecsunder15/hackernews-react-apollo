import gql from 'graphql-tag';

export const AUTH_TOKEN = 'auth-token'
export const LINKS_PER_PAGE = 5

/////// BEGIN GRAPHQL TAGS ///////
/* 
FEED_QUERY
  This is the data scheme we are querying our server with for our newsfeed information

  Accepts arguments for pagination:
  - skip defines the offset where the query starts
  - first defines the limit per load (aka "page")
  - orderBy how the returned list should be sorted
*/
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`
// instantiates the subscription to Link component interactions
export const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      node {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`
//subscription for whenever we have a new vote. updates on the server.
export const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`

//this is our mutation, and how we query the graphQL server to give us what we want!
export const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`