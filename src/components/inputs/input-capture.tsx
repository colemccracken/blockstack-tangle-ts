// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Utils
import { trim } from "lodash";
import { UserSession, makeUUID4 } from "blockstack";
import { createCapture, clearAll } from "../../data/store/captures";

// Types
interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  userSession: UserSession;
  refreshData: (userSession: UserSession) => Promise<any>;
}

interface State {
  text: string;
}

class CaptureInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const query = "";

    this.state = {
      text: query
    };
  }

  handleOnChange = e => {
    this.setState({
      text: e.target.value
    });
  };

  handleExit = () => {
    this.setState({
      text: ""
    });
    clearAll(this.props.userSession).then(() => {
      this.props.refreshData(this.props.userSession);
    });
  };

  handleCapture = text => {
    this.createNewCapture(text);
  };

  createNewCapture(text) {
    const { userSession } = this.props;

    let capture = {
      id: makeUUID4(),
      text: text.trim(),
      created_at: Date.now()
    };
    createCapture(userSession, capture).then(() => {
      this.props.refreshData(userSession);
    });
  }

  render() {
    let isSearching = false;

    const query = trim(this.state.text);

    return (
      <div className={`flex ph2 bg-editor-gray br4 ba`}>
        <input
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.handleCapture(query);
            }
          }}
          value={this.state.text}
          className={`flex-grow pv3 f9`}
          placeholder={"Capture a thought"}
          onChange={this.handleOnChange}
        />
        {(isSearching || query) && (
          <div
            className={`flex-column justify-around f7 pointer`}
            onClick={() => {
              this.handleExit();
            }}
          >
            <div className={`ph2`}>Clear</div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(CaptureInput);
