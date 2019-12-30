import { UserSession } from "blockstack";
import { Node, NodeType } from "../models/node";
import { Edge } from "../models/edge";

let cachedCaptures = null;

const fetchCaptures = userSession => {
  const options = { decrypt: false };
  return userSession.getFile("statuses.json", options).then(file => {
    const statuses = JSON.parse(file || "[]");
    cachedCaptures = statuses;
    return statuses.map(status => {
      return {
        id: status.id,
        type: "Capture",
        text: status.text
      };
    });
  });
};

const createCapture = (userSession, capture) => {
  cachedCaptures.push(capture);
  const options = { encrypt: false };
  return userSession.putFile(
    "statuses.json",
    JSON.stringify(cachedCaptures),
    options
  );
};

const clearAll = userSession => {
  const options = { encrypt: false };
  return userSession.putFile("statuses.json", JSON.stringify([]), options);
};

export { fetchCaptures, createCapture, clearAll };
