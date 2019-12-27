// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Components
import ButtonSurface from "./../buttons/button-surface";

// Utils
import { trim } from "lodash";

// Types
interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {}

interface State {
  text: string;
}

const MAX_LENGTH_SEARCH = 100; // characters

class InputSurface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const query = "";

    this.state = {
      text: query
    };
  }

  handleOnChange = e => {
    const text: string = e.target.value;

    if (text.length >= MAX_LENGTH_SEARCH) {
      return;
    }

    this.setState({
      text: e.target.value
    });
  };

  handleExit = () => {
    this.setState({
      text: ""
    });
  };

  handleSearch = query => {
    if (!query) {
      this.handleExit();
      return;
    }
  };

  render() {
    let isSearching = false;

    const query = trim(this.state.text);

    return (
      <div
        className={`flex ph2 bg-editor-gray br4 ba ${
          isSearching ? "b--accent" : "b--white"
        }`}
      >
        <div
          className={`flex-column pa2 justify-around gray`}
          onClick={() => {
            this.handleSearch(query);
          }}
        >
          <ButtonSurface />
        </div>
        <input
          onKeyDown={e => {
            if (e.key !== "Enter") {
              return;
            }
            this.handleSearch(query);
          }}
          value={this.state.text}
          className={`flex-grow pv2 f6`}
          placeholder={"Search your tangle"}
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

export default withRouter(InputSurface);
