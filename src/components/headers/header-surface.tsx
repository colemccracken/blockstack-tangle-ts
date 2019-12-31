// React
import * as React from "react";

// Router
import { RouteComponentProps, withRouter } from "react-router";

// Components
import SearchInput from "../inputs/input-surface";
import Header from "./header";
import { UserSession } from "blockstack";
import { clearAll } from "../../data/store/store";
import MyDropzone from "../inputs/file-upload";

// Utils

// Types
interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  isGraphView: boolean;
  userSession: UserSession;
  handleSearch: (query: string) => void;
  query: string;
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
                  className={"mh2 pa2 pointer dim br4 bg-accent light-gray"}
                  onClick={() => {
                    this.props.userSession.signUserOut();
                    window.location.reload();
                  }}
                >
                  <div className={`bb b--accent`}>Logout</div>
                </div>
              </div>
            </div>
            <div className={`flex`}>
              <div className={`flex-column justify-around`}>
                <div
                  className={"mh2 pa2 pointer dim br4 bg-accent light-gray"}
                  onClick={() => {
                    clearAll(this.props.userSession).then(() => {
                      window.location.reload();
                    });
                  }}
                >
                  <div className={`bb b--accent`}>Nuke</div>
                </div>
              </div>
            </div>
            <div className={`flex`}>
              <div className={`mh2 pa2 flex-column justify-around ba`}>
                <MyDropzone userSession={this.props.userSession} />
              </div>
            </div>
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
              <SearchInput
                handleSearch={this.props.handleSearch}
                query={this.props.query}
              />
            </div>
          </React.Fragment>
          /* tslint:disable-next-line */
        }
      />
    );
  }
}
export default withRouter(HeaderSurface);
