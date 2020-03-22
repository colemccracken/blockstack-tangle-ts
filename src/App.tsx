import React, { Component } from "react";
import Profile from "./Profile.js";
import Signin from "./Signin.js";
import { UserSession, AppConfig } from "blockstack";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Surface from "./views/Surface";
import { withRouter, RouteComponentProps } from "react-router";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig: appConfig });

export default class App extends Component {
  handleSignIn(e) {
    e.preventDefault();
    userSession.redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    userSession.signUserOut();
  }

  render() {
    return (
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
          {!userSession.isUserSignedIn() ? (
            <Signin
              userSession={userSession}
              handleSignIn={this.handleSignIn}
            />
          ) : (
            <BrowserRouter>
              <div>
                <Route
                  path="/profiles/:username"
                  render={routeProps => (
                    <Profile
                      userSession={userSession}
                      handleSignOut={this.handleSignOut}
                      {...routeProps}
                    />
                  )}
                />
                <Route
                  path="/tangle/:username/:tangleId"
                  render={routeProps => (
                    <Surface userSession={userSession} match={routeProps} />
                  )}
                />
                <Route
                  exact
                  path="/"
                  render={routeProps => <Surface userSession={userSession} />}
                />
              </div>
            </BrowserRouter>
          )}
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        window.history.replaceState({}, document.title, "/");
        this.setState({ userData: userData });
      });
    }
  }
}
