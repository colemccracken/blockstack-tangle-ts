import React, { Component } from "react";

export default class Input extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <form>
          <label>Capture</label>
          <input type="input" name="capture-input" />
          <button type="submit" className="btn btn-success">
            Submit
          </button>
        </form>
      </div>
    );
  }
}
