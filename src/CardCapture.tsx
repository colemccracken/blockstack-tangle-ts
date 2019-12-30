// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Types
interface Props extends RouteComponentProps<{}> {
  captureId: string;
  startingHtml: string;
  authorName: string | null;
}

interface State {
  isMouseOver: boolean;
}

class CardCapture extends React.Component<Props, State> {
  focus;

  constructor(nextProps: Props) {
    super(nextProps);
    console.log("HERE CARD CAPTURE COMPONENT");
    this.state = {
      isMouseOver: false
    };
  }

  render() {
    const { captureId, authorName, startingHtml } = this.props;
    const { isMouseOver } = this.state;
    const { title, id } = { id: "", title: "" };

    return (
      <div
        className={`pa3 bg-editor-gray dark-gray bw1 br3 ba b--light-gray lh-copy center`}
        style={{
          maxWidth: "20em",
          width: "20em"
        }}
        onMouseOver={() => {
          this.setState({
            isMouseOver: true
          });
        }}
        onMouseOut={() => {
          this.setState({
            isMouseOver: false
          });
        }}
      >
        <div
          className={`f7`}
          dangerouslySetInnerHTML={{
            __html: startingHtml
          }}
          style={{
            cursor: "default"
          }}
        />
      </div>
    );
  }
}

export default withRouter(CardCapture);
