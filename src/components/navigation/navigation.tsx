// React
import * as React from "react";

// Router
import { RouteComponentProps } from "react-router";

// // GraphQL
// import {
//   createSession as createSessionResponse,
//   createSessionCaptureVariables
// } from "../../__generated__/types";
// import { createSession } from "../../queries";
// import { graphql, MutationFunc } from "react-apollo";

// // Components
// import ButtonHome from "./../buttons/button-home";
// import ButtonImport from "./../buttons/button-import";
// import ButtonCapture from "./../buttons/button-capture";
// import ButtonSettings from "../buttons/button-settings";

interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  // createSession: MutationFunc<
  //   createSessionResponse,
  //   createSessionCaptureVariables
  // >;
}

interface State {}

class Navigation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div
        className={`flex-column pa2 bg-dark-gray light-gray`}
        style={{
          userSelect: "none"
        }}
      >
        <div className={`flex-column flex-grow`}>
          <div
            className={`pa3 bg-animate hover-bg-light-silver bg-accent br-100 pointer`}
            onClick={() => {
              console.log("CREATE SESSION");
            }}
          >
            {/* <ButtonCapture /> */}
          </div>
          <div
            className={`flex-column center justify-around pa3 mt2 bg-animate hover-bg-light-silver br-100 pointer`}
            onClick={() => {
              // TODO
            }}
          >
            {/* <ButtonHome /> */}
          </div>
          <div
            className={`flex-column center justify-around pa3 mt2 bg-animate hover-bg-light-silver br-100 pointer`}
            onClick={() => {
              // TODO
            }}
          >
            {/* <ButtonImport /> */}
          </div>
        </div>
        <div
          className={`flex-column center justify-around pa3 br-100 bg-animate hover-bg-light-silver pointer`}
          onClick={() => {
            // TODO
          }}
        >
          {/* <ButtonSettings /> */}
        </div>
      </div>
    );
  }
}

export default Navigation;
