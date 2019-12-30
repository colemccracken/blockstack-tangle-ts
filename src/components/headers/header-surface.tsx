// React
import * as React from "react";

// Router
import { RouteComponentProps, withRouter } from "react-router";

// Components
import SearchInput from "../inputs/input-surface";
import Header from "./header";
import { UserSession } from "blockstack";

// Utils

// Types
interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  isGraphView: boolean;
  userSession: UserSession;
}

interface State {
  showLegend: boolean;
}

class HeaderSurface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLegend: true
    };
  }

  render() {
    return (
      <Header
        left={
          <React.Fragment>
            <div className={`flex`}>
              <div className={`flex-column justify-around`}>
                <div
                  className={"pa2 pointer dim br4 bg-accent light-gray"}
                  onClick={() => {
                    this.props.userSession.signUserOut();
                  }}
                >
                  <div className={`bb b--accent`}>Logout</div>
                </div>
              </div>
            </div>
            <div
              className={`pl2 flex-column justify-around`}
              style={{
                minWidth: "20em"
              }}
            ></div>
          </React.Fragment>
        }
        right={
          <React.Fragment>
            <div
              className={`pl2 flex-column justify-around`}
              style={{
                minWidth: "20em"
              }}
            >
              <SearchInput />
            </div>
          </React.Fragment>
          /* tslint:disable-next-line */
        }
      />
    );
  }
}
export default withRouter(HeaderSurface);
