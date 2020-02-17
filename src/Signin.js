import React, { Component } from "react";

export default class Signin extends Component {
  render() {
    const { handleSignIn } = this.props;

    return (
      <div className={`dt vh-100 w-100 bg-near-white`}>
        <div className={`dtc v-mid`}>
          <div className={`center measure pa4 bg-white br4 shadow-1 tc`}>
            <div>
              <h1 className="landing-heading avenir ">Welcome to Tangle!</h1>

              <img
                src="https://cole-public-assets.s3-us-west-2.amazonaws.com/tangle-logo-2048.jpg"
                className={``}
                style={{
                  maxHeight: "15em"
                }}
              />

              {/* <StyledFirebaseAuth
                firebaseAuth={firebaseAuth()}
                uiConfig={{
                  signInOptions: [
                    firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
                    firebaseAuth.EmailAuthProvider.PROVIDER_ID
                  ],
                  signInSuccessUrl: `${
                    this.props.location
                      ? this.props.location.pathname +
                        this.props.location.search
                      : "/"
                  }`
                }}
              /> */}
              <div className="panel-landing" id="section-1">
                <button
                  class="f6 link br-pill ba bw1 ph4 pv2 mb2 black dim pointer"
                  id="signin-button"
                  onClick={handleSignIn.bind(this)}
                >
                  <p>
                    <img
                      class="v-mid"
                      src="https://docs.blockstack.org/assets/img/logo.png"
                    ></img>
                    <div class="di ph2 f3 fw4 v-mid avenir">
                      Sign In with Blockstack
                    </div>
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
