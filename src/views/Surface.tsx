// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Components
import HeaderSurface from "../components/headers/header-surface";
import DataWrapper from "../DataWrapper";
import { UserSession } from "blockstack";
// import ReactResizeDetector from "react-resize-detector";

interface Props extends RouteComponentProps {
  userSession: UserSession;
}

interface State {
  headerHeight: number;
}

// Class
class Surface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      headerHeight: 0
    };
  }

  render() {
    return (
      <div className={`flex-grow bg-near-white bt bl br b--light-gray`}>
        <div className={`flex-column`}>
          <div>
            <HeaderSurface userSession={this.props.userSession} />
          </div>
          <div className={`flex-grow`}>
            <DataWrapper userSession={this.props.userSession} />
          </div>
        </div>
      </div>
    );
  }
}

// Export
export default withRouter(Surface);
