// React
import * as React from "react";

// Router
import { withRouter, RouteComponentProps } from "react-router";

// Components
import ReactEchartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/lib/echarts";
import "echarts/lib/component/tooltip";
import "echarts/lib/chart/graph";

// Config / Utils
import { isEqual, uniqBy, findIndex } from "lodash";
import windowSize from "react-window-size";
import { Trash } from "react-feather";

// Types
import { GraphNode, NodeType } from "./data/models/node";
import { Edge } from "./data/models/edge";
import CardCapture from "./CardCapture";
import { GraphEvent } from "./data/models/graph-event";
import { UserSession } from "blockstack";
import CaptureInput from "./components/inputs/input-capture";
import { deleteCapture } from "./data/store/store";

const TAG_COLOR = "#333333";
const CAPTURE_COLOR = "#FF9E37";
const OTHER_COLOR = "#F4F4F4";

const TEXT_COLOR = "#777777";

const WIDTH = "30em";

interface Props extends RouteComponentProps<{}> {
  refEChart?: (eChart: ReactEchartsCore) => void;
  nodes: Array<GraphNode>;
  edges: Array<Edge>;
  userSession: UserSession;
  refreshData: (userSession: UserSession) => Promise<any>;
  headerHeight: number;
  // Window Size
  windowWidth: number;
  windowHeight: number; //ssad
}

interface State {
  focusNode: GraphNode | null;
  nodes: Array<GraphNode>;
  edges: Array<Edge>;
}

class GraphVisualization extends React.Component<Props, State> {
  eChart: ReactEchartsCore | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      focusNode: null,
      nodes: props.nodes,
      edges: props.edges
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { focusNode } = this.state;
    let focusNodeIndex = -1;
    if (focusNode !== null) {
      focusNodeIndex = findIndex(
        nextProps.nodes,
        node => node.id === focusNode.id
      );
    }

    this.setState({
      focusNode: focusNodeIndex === -1 ? null : focusNode,
      nodes: nextProps.nodes,
      edges: nextProps.edges
    });
  }

  getNodes() {
    return this.state.nodes.map(node => {
      switch (node.type) {
        // Tags
        case NodeType.Tag:
          return {
            id: node.id,
            name: `#${node.text}`,
            category: node.type,
            symbolSize: 36,
            label: {
              show: true,
              color: TAG_COLOR,
              fontSize: 12,
              fontWeight: "bold",
              emphasis: {
                show: true
              }
            }
          };

        // Captures
        default:
          return {
            id: node.id,
            name:
              node.text.length > 40
                ? `${node.text.substring(0, 30)}...`
                : node.text,
            category: node.type,
            symbolSize: 24,
            // label: {
            //   show: true,
            //   emphasis: {
            //     show: false
            //   }
            // }
            label: {
              show: true,
              color: TAG_COLOR,
              fontSize: 12,
              fontWeight: "bold",
              emphasis: {
                show: true
              }
            }
          };
      }
    });
  }

  getEdges() {
    return this.state.edges.map(edge => {
      return {
        source: edge.source,
        target: edge.destination,
        label: {
          show: false,
          emphasis: {
            show: false
          }
        }
      };
    });
  }

  getCategories() {
    return [
      {
        name: NodeType.Tag,
        itemStyle: {
          normal: {
            color: OTHER_COLOR
          }
        }
      },
      {
        name: NodeType.Capture,
        itemStyle: {
          normal: {
            color: CAPTURE_COLOR
          }
        }
      }
    ];
  }

  search = (e: GraphEvent) => {
    // const query = e.data.name;
    // const path = this.props.location.pathname;
    // const splitPath = path.split("/");
    // splitPath.pop();
    // splitPath.push(`search?query=${encodeURIComponent(query)}`);
    // this.props.history.push(`${splitPath.join("/")}`);
  };

  setFocusNode = (e: GraphEvent) => {
    const nextFocusNode = this.props.nodes.find(node => node.id === e.data.id);
    this.setState({
      focusNode: nextFocusNode ? nextFocusNode : null
    });
  };

  getEvents() {
    return {
      click: (e: GraphEvent) => {
        switch (e.data.category) {
          case NodeType.Tag:
            this.search(e);
            return;
          case NodeType.Capture:
            this.setFocusNode(e);
            return;
          default:
            return;
        }
      }
      // mouseover: this.props.onMouseOver,
      // mouseout: this.props.onMouseOut
    };
  }

  renderTooltip = (e: GraphEvent) => {
    const text = e.data.name.replace(/<[^>]*>/g, "");
    let lines = text.match(/.{1,67}/g);
    if (!lines) {
      lines = [text];
    }
    let preview = lines[0].replace(/\r?\n|\r/g, "");
    if (lines.length > 1) {
      preview = preview + "...";
    }
    return `
  <div class="pa3 shadow-1 br4 bg-white f6 dark-gray">
    ${preview}
  </div>`;
  };

  getOption() {
    return {
      title: {
        show: false
      },
      legend: {
        show: false
      },
      toolbox: {
        show: false
      },
      tooltip: {
        show: true,
        trigger: "item",
        showContent: true,
        confine: true,
        position: "top",
        formatter: (e: GraphEvent) => {
          switch (e.data.category) {
            default:
              return "";
          }
        },
        backgroundColor: CAPTURE_COLOR,
        textStyle: {
          color: TEXT_COLOR
        }
      },
      series: [
        {
          type: "graph",
          id: "tangle-visualization",
          name: "tangle",
          legendHoverLink: false,
          coordinateSystem: null,
          xAxisIndex: 0,
          yAxisIndex: 0,
          polarIndex: 0,
          geoIndex: 0,
          calendarIndex: 0,
          hoverAnimation: true,
          layout: "force",
          circular: {
            rotateLabel: false
          },
          force: {
            edgeLength: 50,
            repulsion: 600,
            gravity: 0.2,
            layoutAnimation: true
          },
          roam: "move",
          draggable: false,
          focusNodeAdjacency: false,
          cursor: "pointer",
          lineStyle: {
            curveness: 0.3,
            opacity: 0.3,
            type: "solid"
          },
          categories: this.getCategories(),
          nodes: this.getNodes(),
          edges: this.getEdges(),
          animation: false,
          notMerge: false
        }
      ]
    };
  }

  render() {
    const { focusNode } = this.state;

    return (
      <div>
        <div
          className={`relative vh-100`}
          style={
            {
              // minHeight: `${this.props.windowHeight - this.props.headerHeight}px`
            }
          }
        >
          <ReactEchartsCore
            echarts={echarts}
            ref={this.props.refEChart}
            style={{ height: "100%", width: "100%" }}
            option={this.getOption()}
            opts={{ renderer: "canvas" }}
            onEvents={this.getEvents()}
          />
          {focusNode && (
            <div className={`absolute relative top-1 left-1 z-5`}>
              <div
                className={`absolute top-0 right-0 pa1 pointer ba br4 f7 bg-white b--accent accent`}
                style={{ userSelect: "none" }}
                onClick={async () => {
                  await deleteCapture(this.props.userSession, focusNode.id);
                  await this.props.refreshData(this.props.userSession);
                }}
              >
                <Trash size={16} />
              </div>

              <CardCapture
                captureId={focusNode.id}
                startingHtml={focusNode.text || ""}
                authorName={null}
              />
            </div>
          )}
          <div className={`absolute relative top-1 right-1 z-5`}>
            <CaptureInput
              userSession={this.props.userSession}
              refreshData={this.props.refreshData}
            />
          </div>
        </div>
      </div>
    );
  }
}
const GraphWithData = withRouter(GraphVisualization);

export default GraphWithData;
