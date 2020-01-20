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
import { Trash, Minimize2 } from "react-feather";

// Types
import { GraphNode, NodeType } from "./data/models/node";
import { Edge } from "./data/models/edge";
import CardCapture from "./CardCapture";
import { GraphEvent } from "./data/models/graph-event";
import { UserSession } from "blockstack";
import CaptureInput from "./components/inputs/input-capture";
import { deleteCapture } from "./data/store/store";
import MyDropzone from "./components/inputs/file-upload";
import { notDeepEqual } from "assert";

const TAG_COLOR = "#333333";
const CAPTURE_COLOR = "#FF9E37";
const FRIEND_COLOR = "#45b6fe";
const OTHER_COLOR = "#F4F4F4";

const TEXT_COLOR = "#777777";

const WIDTH = "30em";

interface Props extends RouteComponentProps<{}> {
  refEChart?: (eChart: ReactEchartsCore) => void;
  nodes: Array<GraphNode>;
  edges: Array<Edge>;
  userSession: UserSession;
  refreshData: (userSession: UserSession) => Promise<any>;
  handleSearch: (query: string) => void;
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
        // Entity
        case NodeType.Entity:
          return {
            id: node.id,
            name: `${node.text}`,
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
            symbolSize: 18,
            itemStyle: {
              normal: {
                color: node.author === "" ? CAPTURE_COLOR : FRIEND_COLOR
              }
            },
            label: {
              show: true,
              color: TAG_COLOR,
              fontSize: 12,
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
        name: NodeType.Entity,
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

  graphSearch = (e: GraphEvent) => {
    const query = e.data.name;
    this.props.handleSearch(query);
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
            this.graphSearch(e);
            return;
          case NodeType.Entity:
            this.graphSearch(e);
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
            <div className={`absolute relative top-1 left-1 z-5 pa2`}>
              <div
                className={`absolute top-0 right-2 pa1 pointer ba br4 f7 bg-white b--accent accent`}
                style={{ userSelect: "none" }}
                onClick={() => {
                  this.setState({
                    focusNode: null
                  });
                }}
              >
                <Minimize2 size={16} />
              </div>

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
          <div className={`absolute top-1 left-1 ph2 ma2 ba br2 bg-white`}>
            <MyDropzone
              userSession={this.props.userSession}
              refreshData={this.props.refreshData}
            />
          </div>

          <div>
            <div className={`absolute top-1 right-1 pa2 ma2`}>
              <CaptureInput
                userSession={this.props.userSession}
                refreshData={this.props.refreshData}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const GraphWithData = withRouter(GraphVisualization);

export default GraphWithData;
