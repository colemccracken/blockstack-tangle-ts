// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Components
import HeaderSurface from "../components/headers/header-surface";
import { UserSession } from "blockstack";
import { GraphNode } from "../data/models/node";
import { Edge } from "../data/models/edge";
import { fetchData, search } from "../data/store/store";
import Graph from "../Graph";

// import ReactResizeDetector from "react-resize-detector";

interface Props extends RouteComponentProps {
  userSession: UserSession;
}

interface State {
  nodes: GraphNode[];
  edges: Edge[];
  query: string;
}

// Class
class Surface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.refreshData = this.refreshData.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.state = {
      nodes: [],
      edges: [],
      query: ""
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
      edges: graph.edges,
      query: ""
    });
    return;
  }

  handleSearch(query: string) {
    const graph = search(query);
    this.setState({
      nodes: graph.nodes,
      edges: graph.edges,
      query: query
    });
  }

  render() {
    return (
      <div className={`flex-grow bg-near-white bt bl br b--light-gray`}>
        <div className={`flex-column`}>
          <div>
            <HeaderSurface
              userSession={this.props.userSession}
              handleSearch={this.handleSearch}
              query={this.state.query}
            />
          </div>
          <div>
            <Graph
              userSession={this.props.userSession}
              refreshData={this.refreshData}
              handleSearch={this.handleSearch}
              nodes={this.state.nodes}
              edges={this.state.edges}
              {...this.props}
            />
          </div>
          );
        </div>
      </div>
    );
  }
}

// Export
export default withRouter(Surface);
