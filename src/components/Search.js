import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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

/*
  This component is used to filter down the links we have on our page in a search-like manner
  We are simply rendering an input to put a search string in.

  our FEED_SEARCH_QUERY is a query block meant to pull out the post that matches the text.
  We want to lad the data every time the user hits the search button, not on load.
*/
class Search extends Component {

  state = {
    links: [],
    filter: ''
  }

  render() {
    return (
      <div>
        <div>
          <p>Filter Links</p>
          <input
            type='text'
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>Search</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    )
  }

  //execute the FEED_SEARCH_QUERY and retrieve the links from the response from the server.
  _executeSearch = async () => {
    const { filter } = this.state
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    const links = result.data.feed.links
    this.setState({ links });
  }
}

//this injects the ApolloClient instance that we have running, and takes Search as a client prop.
export default withApollo(Search)