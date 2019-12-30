import React, { Component } from "react";
import { fetchData } from "./data/store/captures";
import { UserSession } from "blockstack";
import { withRouter, RouteComponentProps } from "react-router";
import Graph from "./Graph";
import Input from "./Input";
import { GraphData } from "./data/models/graph-data";
import { GraphNode } from "./data/models/node";
import { Edge } from "./data/models/edge";

interface Props extends RouteComponentProps<{}> {
  userSession: UserSession;
}

interface State {
  nodes: Array<GraphNode>;
  edges: Array<Edge>;
}

class DataWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.state = {
      nodes: [],
      edges: []
    };
  }

  componentDidMount() {
    // ... that takes care of the subscription...
    this.refreshData(this.props.userSession);
  }

  async refreshData(userSession: UserSession): Promise<void> {
    const graph = await fetchData(userSession);
    this.setState({
      nodes: graph.nodes,
      edges: graph.edges
    });
    return;
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
          edges={this.state.edges}
          {...this.props}
        />
      </div>
    ) : (
      <h1>Loading...</h1>
    );
  }
}

export default withRouter(DataWrapper);
