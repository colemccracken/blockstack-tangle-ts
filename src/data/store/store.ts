import { UserSession, makeUUID4 } from "blockstack";
import { GraphNode } from "../models/node";
import { Edge } from "../models/edge";
import { Capture } from "../models/capture";
import { Tag } from "../models/tag";
import { GraphData } from "../models/graph-data";
import Fuse from "fuse.js";
import nlp from "compromise";
import { Entity } from "../models/entity";
import { Friend } from "../models/friend";

let cachedCaptures: Capture[];
let cachedFriends: Friend[];

const SEARCH_OPTIONS = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 10000,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["text"]
};

const PRIVATE_CAPTURE_KEY = "private_captures.json";
const FRIEND_KEY = "friends.json";

function search(query): GraphData {
  if (query === "") {
    return formatGraphData(cachedCaptures);
  }
  var fuse = new Fuse(cachedCaptures, SEARCH_OPTIONS);
  const captureHits = fuse.search(query);
  return formatGraphData(captureHits);
}

async function deleteCapture(
  userSession: UserSession,
  id: string
): Promise<void> {
  const remainingCaptures = cachedCaptures.filter(capture => capture.id !== id);
  if (cachedCaptures.length - remainingCaptures.length !== 1) {
    return Promise.resolve();
  }

  cachedCaptures = remainingCaptures;
  syncCapturesToStorage(userSession);
  return;
}

async function fetchFriends(userSession): Promise<Friend[]> {
  const options = { decrypt: false };
  const file = await userSession.getFile(FRIEND_KEY, options);
  const friends = JSON.parse(file || "[]");
  cachedFriends = friends;
  return friends;
}

async function fetchData(userSession: UserSession): Promise<GraphData> {
  if (cachedCaptures) {
    return Promise.resolve(formatGraphData(cachedCaptures));
  } else {
    const captures = await fetchCaptures(userSession);
    cachedCaptures = captures;
    return formatGraphData(captures);
  }
}

async function publish(userSession: UserSession): Promise<string> {
  const username = userSession.loadUserData().username;
  const uuid = makeUUID4();
  const myCaptures = cachedCaptures.filter(capture => capture.owner);
  const p = write(userSession, uuid, myCaptures, false);
  return p;
}

function formatGraphData(captures: Capture[]) {
  const limitedCaptures = captures; // TODO limit this somehow in future
  const captureNodes = formatCaptures(limitedCaptures);
  const tags = buildTags(limitedCaptures);
  const tagNodes = formatTags(tags);
  const entities = buildEntities(limitedCaptures);
  const entityNodes = formatEntities(entities);
  const edges = buildEdges(limitedCaptures, tags, entities);
  return {
    nodes: captureNodes.concat(tagNodes).concat(entityNodes),
    edges: edges
  } as GraphData;
}

function buildEdges(
  captures: Capture[],
  tags: Map<string, Tag>,
  entities: Map<string, Entity>
): Edge[] {
  const captureSet = new Set(captures.map(capture => capture.id));
  const edges: Edge[] = [];
  const tagArray = Array.from(tags.values());
  tagArray.forEach(tag => {
    tag.captures.forEach(captureId => {
      if (captureSet.has(captureId)) {
        edges.push({
          source: captureId,
          destination: tag.id
        } as Edge);
      }
    });
  });
  const entityArray = Array.from(entities.values());
  entityArray.forEach(entity => {
    entity.captures.forEach(captureId => {
      if (captureSet.has(captureId)) {
        edges.push({
          source: captureId,
          destination: entity.id
        } as Edge);
      }
    });
  });
  return edges;
}

function buildTags(captures: Capture[]): Map<string, Tag> {
  const tags: Map<string, Tag> = new Map();
  captures.map(capture => {
    const captureTags = parseTags(capture.text);
    captureTags.forEach(tagName => {
      const name = tagName.toLowerCase();
      if (tags.has(name)) {
        // update pointers
        const tag = tags.get(name);
        tag!.captures.push(capture.id);
      } else {
        tags.set(name, {
          id: `Tag|${name}`,
          name: name,
          captures: [capture.id]
        } as Tag);
      }
    });
  });
  return tags;
}

function buildEntities(captures: Capture[]): Map<string, Entity> {
  const entities: Map<string, Entity> = new Map();
  captures.map(capture => {
    const doc = nlp(capture.text);
    const json = doc.topics().json() as any[];
    json.forEach(hit => {
      const name = hit.text.toLowerCase();
      if (name.startsWith("#")) {
        return;
      }
      if (entities.has(name)) {
        entities.get(name)!.captures.add(capture.id);
      } else {
        entities.set(name, {
          id: `Entity|${name}`,
          name: name,
          captures: new Set([capture.id])
        } as Entity);
      }
    });
  });
  return entities;
}

function formatEntities(entities: Map<string, Entity>): GraphNode[] {
  return Array.from(entities.values()).map(entity => {
    return {
      id: entity.id,
      type: "Entity",
      text: entity.name
    } as GraphNode;
  });
}

function formatTags(tags: Map<string, Tag>): GraphNode[] {
  const tagArray = Array.from(tags.values());
  return tagArray.map(tag => {
    return {
      id: tag.id,
      type: "Tag",
      text: tag.name
    } as GraphNode;
  });
}

async function fetchCaptures(userSession: UserSession): Promise<Capture[]> {
  if (!cachedFriends) {
    fetchFriends(userSession);
  }
  const myCaptures = await fetchMyCaptures(userSession);
  const otherCaptures = await fetchFriendCaptures(cachedFriends);
  const allCaptures = myCaptures.concat(otherCaptures);
  const sorted = allCaptures.sort((o1: Capture, o2: Capture) => {
    if (o1.createdAt < o2.createdAt) {
      return 1;
    } else if (o1.createdAt > o2.createdAt) {
      return -1;
    }
    return 0;
  });
  return sorted;
}

async function fetchMyCaptures(userSession: UserSession): Promise<Capture[]> {
  const options = { decrypt: true };
  const file = await userSession.getFile(PRIVATE_CAPTURE_KEY, options);
  const myCaptures = JSON.parse((file as string) || "[]");
  return myCaptures.map(capture => {
    capture.owner = true;
    return capture;
  });
}

async function fetchFriendCaptures(friends: Friend[]): Promise<Capture[]> {
  // TODO call axios
  return Promise.resolve([]);
}

function formatCaptures(captures: Capture[]): GraphNode[] {
  return captures.map(capture => {
    return {
      id: capture.id,
      type: "Capture",
      text: capture.text,
      author: capture.owner ? "" : "friend"
    } as GraphNode;
  });
}

async function SyncCaptures(userSession) {
  return await syncCapturesToStorage(userSession);
}

async function createCaptures(captures: Capture[]) {
  if (!cachedCaptures) {
    cachedCaptures = [];
  }
  captures.forEach(capture => {
    cachedCaptures.unshift(capture);
  });
}

async function createCapture(userSession: UserSession, capture: Capture) {
  if (!cachedCaptures) {
    cachedCaptures = [];
  }
  cachedCaptures.unshift(capture);
  syncCapturesToStorage(userSession);
  return;
}

async function clearAll(userSession): Promise<void> {
  cachedCaptures = [];
  await syncCapturesToStorage(userSession);
  return;
}

const hashtagRegex = new RegExp("#([^\\s<]*)", "g");

function parseTags(str: string): string[] {
  const ret: Set<string> = new Set();
  let match;
  while ((match = hashtagRegex.exec(str))) {
    if (match[1].length > 0) {
      ret.add(match[1]);
    }
  }
  return Array.from(ret);
}

async function syncCapturesToStorage(userSession) {
  const myCaptures = cachedCaptures.filter(capture => capture.owner);
  return write(userSession, PRIVATE_CAPTURE_KEY, myCaptures);
}

async function write(
  userSession: UserSession,
  key: string,
  data: any[],
  shouldEncrypt: boolean = true
): Promise<string> {
  const options = { encrypt: shouldEncrypt };
  const str = JSON.stringify(data);
  return userSession.putFile(key, str, options);
}

export {
  search,
  publish,
  deleteCapture,
  fetchData,
  createCaptures,
  createCapture,
  clearAll,
  SyncCaptures
};
