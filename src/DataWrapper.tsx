import React, { Component } from "react";
import { fetchCaptures } from "./data/store/captures";
import { UserSession } from "blockstack";
import { withRouter, RouteComponentProps } from "react-router";
import Graph from "./Graph";
import Input from "./Input";

interface Props extends RouteComponentProps<{}> {
  userSession: UserSession;
}

interface State {
  nodes: Array<Node>;
}

class DataWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.state = {
      nodes: []
    };
  }

  componentDidMount() {
    // ... that takes care of the subscription...
    this.refreshData(this.props.userSession);
  }

  async refreshData(userSession: UserSession): Promise<any> {
    const promise = fetchCaptures(userSession) as Promise<any>;
    const nodes = await promise;
    this.setState({
      nodes: nodes
    });
  }

  handleChange() {
    // this.setState({
    //   data: selectData(DataSource, this.props)
    // });
  }

  render() {
    // ... and renders the wrapped component with the fresh data!
    // Notice that we pass through any additional props
    return this.state.nodes ? (
      <div>
        <Graph
          userSession={this.props.userSession}
          refreshData={this.refreshData}
          nodes={this.state.nodes}
          edges={[]}
          {...this.props}
        />
      </div>
    ) : (
      <h1>Loading...</h1>
    );
  }
}

export default withRouter(DataWrapper);
