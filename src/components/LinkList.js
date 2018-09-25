import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo';
import Link from './Link'
import { 
  FEED_QUERY,
  NEW_LINKS_SUBSCRIPTION,
  NEW_VOTES_SUBSCRIPTION,
  LINKS_PER_PAGE,
} from '../constants';

/* 
This component uses the react-apollo query component to user render props to get a graphQL query
  - loading, error, and data are built in props in that query component that we destructure
  - now our linksToRender will be fetched from the server! 
  - important to note that our links have positions (index prop).

We need to open a subscription to the GraphQL server for when we create, update, or delete a Link.
*/
class LinkList extends Component {
  /* 
    updateCacheAfterVote: enables component to show live upvotes.
    1. reads current state of our FEED_QUERY from the "store"
    2. manipulate Link component's votes to the new # of votes
    3. write modified data back to the "store"
  */
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    })

    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({ query: FEED_QUERY, data })
  }

  // this function gathers all the variables to pass as the prop to the Query component
  // This is also what is passing our new FEED_QUERY the right params
  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  //calculates the list of links to be rendered
  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new')
    if (isNewPage) {
      return data.feed.links
    }
    const rankedLinks = data.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  //gets next page of links
  _nextPage = data => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  //gets previous page of links
  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  // this function is what will actually open up the subscription to the server
  _subscribeToNewLinks = subscribeToMore => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink.node

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  //this applies the same logic as the links subscription, but we do it for votes.
  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    })
  }

  render() {
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
        {
          ({ loading, error, data, subscribeToMore }) => {
            if (loading) return <div>Fetching</div>;
            if (error) return <div>Error</div>;
            
            this._subscribeToNewLinks(subscribeToMore)
            this._subscribeToNewVotes(subscribeToMore)

            const linksToRender = this._getLinksToRender(data)
            const isNewPage = this.props.location.pathname.includes('new')
            const pageIndex = this.props.match.params.page
              ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
              : 0

            return (
              <Fragment>
                {linksToRender.map((link, index) => (
                  <Link
                    key={link.id}
                    link={link}
                    index={index + pageIndex}
                    updateStoreAfterVote={this._updateCacheAfterVote}
                  />
                ))}
                {isNewPage && (
                  <div className="flex ml4 mv3 gray">
                    <div className="pointer mr2" onClick={this._previousPage}>
                      Previous
                    </div>
                    <div className="pointer" onClick={() => this._nextPage(data)}>
                      Next
                    </div>
                  </div>
                )}
              </Fragment>
            )
          }
        }
      </Query>
    );
  }
}

export default LinkList