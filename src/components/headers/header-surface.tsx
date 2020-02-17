// React
import * as React from "react";

// Router
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import Modal from "react-modal";

// Components
import SearchInput from "../inputs/input-surface";
import Header from "./header";
import { UserSession } from "blockstack";
import { clearAll } from "../../data/store/store";

// Utils

// Types
interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  isGraphView: boolean;
  userSession: UserSession;
  handleSearch: (query: string) => void;
  refreshData: (userSession: UserSession) => Promise<any>;
  query: string;
  numNodes: number;
}

interface State {
  showLegend: boolean;
  deleteAllModalIsOpen: boolean;
}

class HeaderSurface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLegend: true,
      deleteAllModalIsOpen: false
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.deteleData = this.deteleData.bind(this);
  }

  openModal() {
    this.setState({ deleteAllModalIsOpen: true });
  }

  afterOpenModal() {}

  closeModal() {
    this.setState({ deleteAllModalIsOpen: false });
  }
  deteleData() {
    clearAll(this.props.userSession).then(() => {
      window.location.reload();
    });
    this.closeModal();
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
                    this.props.refreshData(this.props.userSession);
                  }}
                >
                  <div className={`bb b--accent`}>Refresh</div>
                </div>
              </div>
            </div>
            <div className={`flex`}>
              <div className={`flex-column justify-around`}>
                <div
                  className={"mh2 pa2 pointer dim br4 bg-accent light-gray"}
                  onClick={() => {
                    this.openModal();
                  }}
                >
                  <div className={`bb b--accent`}>Delete All</div>
                </div>
              </div>
              <div className={"flex"}>
                <Modal
                  isOpen={this.state.deleteAllModalIsOpen}
                  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  contentLabel="Delete Data"
                  ariaHideApp={false}
                >
                  <div className={"tc"}>
                    <p className={"fw6"}>
                      Are you sure you want to delete all your data?
                    </p>
                    <button
                      className={
                        "f4 pa2 ma2 br4 pointer dim bg-accent light-gray"
                      }
                      onClick={this.closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      className={
                        "f4 pa2 ma2 br4 pointer dim bg-accent light-gray"
                      }
                      onClick={this.deteleData}
                    >
                      Delete Everything
                    </button>
                  </div>
                </Modal>
              </div>
            </div>
          </React.Fragment>
        }
        right={
          <React.Fragment>
            <div className={`pl2 flex-column justify-around`}>
              {`Node Count: ${this.props.numNodes}`}
            </div>

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
