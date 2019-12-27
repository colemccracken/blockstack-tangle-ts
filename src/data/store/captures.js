import { UserSession } from "blockstack";
import { Node, NodeType } from "../models/node";
import { Edge } from "../models/edge";

const fetchCaptures = userSession => {
  const options = { decrypt: false };
  return userSession.getFile("statuses.json", options).then(file => {
    const statuses = JSON.parse(file || "[]");
    return statuses.map(status => {
      return {
        id: status.id,
        type: "Capture",
        text: status.text
      };
    });
  });
};

export { fetchCaptures };
