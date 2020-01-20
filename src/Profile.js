import React, { Component } from "react";
import { Person, lookupProfile } from "blockstack";
const avatarFallbackImage =
  "https://s3.amazonaws.com/onename/avatar-placeholder.png";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {
        name() {
          return "Anonymous";
        },
        avatarUrl() {
          return avatarFallbackImage;
        }
      },
      friends: [],
      newFriend: "",
      publicUrl: "",
      isLoading: false
    };
  }

  componentWillMount() {
    this.fetchData();
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username
    });
  }

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    const { username } = this.state;

    return !userSession.isSignInPending() && person ? (
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={
                    person.avatarUrl()
                      ? person.avatarUrl()
                      : avatarFallbackImage
                  }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">
                      {person.name() ? person.name() : "Nameless Person"}
                    </span>
                  </h1>
                  <span>{username}</span>
                  {this.isLocal() && (
                    <span>
                      &nbsp;|&nbsp;
                      <a onClick={handleSignOut.bind(this)}>(Logout)</a>
                    </span>
                  )}
                </div>
                <div className="col-md-12">
                  {this.state.isLoading && <span>Loading...</span>}
                  <div className="status" key={"public url"}>
                    Public Url For Sharing: {this.state.publicUrl}
                  </div>
                </div>
              </div>
            </div>
            {this.isLocal() && (
              <div className="new-status">
                <div className="col-md-12">
                  <textarea
                    className="input-status"
                    value={this.state.newFriend}
                    onChange={e => this.handleNewStatusChange(e)}
                    placeholder="Who would you like to befriend?"
                  />
                </div>
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewStatusSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
            <div className="col-md-12 statuses">
              {this.state.isLoading && <span>Loading...</span>}
              Friends Urls:
              {this.state.friends.map(friend => (
                <div className="status" key={friend}>
                  {friend}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  handleNewStatusChange(event) {
    this.setState({ newFriend: event.target.value });
  }

  handleNewStatusSubmit(event) {
    this.saveNewStatus(this.state.newFriend);
    this.setState({
      newFriend: ""
    });
  }

  saveNewStatus(newFriend) {
    const { userSession } = this.props;
    this.state.friends.unshift(newFriend);
    const options = { encrypt: false };
    userSession.putFile(
      "friends.json",
      JSON.stringify(this.state.friends),
      options
    );
  }
  fetchData() {
    const { userSession } = this.props;
    this.setState({ isLoading: true });
    if (this.isLocal()) {
      const options = { decrypt: false };
      userSession
        .getFileUrl("captures.json", options)
        .then(publicUrl => {
          this.setState({
            person: new Person(userSession.loadUserData().profile),
            publicUrl: publicUrl
          });
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
      userSession
        .getFile("friends.json", options)
        .then(file => {
          let friends = JSON.parse(file || "[]");
          this.setState({
            friends: friends
          });
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    } else {
      const username = this.props.match.params.username;

      lookupProfile(username)
        .then(profile => {
          this.setState({
            person: new Person(profile),
            username: username
          });
        })
        .catch(error => {
          console.log("could not resolve profile");
          console.log(error);
        });
    }
  }
  isLocal() {
    return this.props.match.params.username === "me";
  }
}
