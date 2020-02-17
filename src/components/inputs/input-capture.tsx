// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Utils
import { trim } from "lodash";
import { UserSession, makeUUID4 } from "blockstack";
import { createCapture, clearAll } from "../../data/store/store";
import { Capture } from "../../data/models/capture";
import { string } from "prop-types";

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
  };

  handleCapture = text => {
    if (!/[^\s]/.test(text)) {
      return;
    }
    this.createNewCapture(text);
    this.setState({
      text: ""
    });
  };

  async createNewCapture(text) {
    const { userSession } = this.props;

    let capture = {
      id: makeUUID4(),
      text: text.trim(),
      createdAt: Date.now(),
      owner: true
    } as Capture;
    await createCapture(userSession, capture);
    await this.props.refreshData(userSession);
    return;
  }

  render() {
    let isSearching = false;

    const capture = this.state.text;

    return (
      <div className={`flex ph4 bg-editor-gray br2 ma1 pv3`}>
        <input
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.handleCapture(capture);
            }
          }}
          value={this.state.text}
          className={`flex-grow f6`}
          placeholder={"Capture a thought"}
          onChange={this.handleOnChange}
        />
        {(isSearching || capture) && (
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
