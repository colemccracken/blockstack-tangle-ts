import { UserSession } from "blockstack";
import { GraphNode } from "../models/node";
import { Edge } from "../models/edge";
import { Capture } from "../models/capture";
import { Tag } from "../models/tag";
import { GraphData } from "../models/graph-data";
import Fuse from "fuse.js";

let cachedCaptures: Capture[] = [];
let cachedTags: Map<string, Tag> = new Map();

const SEARCH_OPTIONS = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["text"]
};

const CAPTURE_KEY = "captures.json";
const TAGS_KEY = "tags.json";

function search(query): GraphData {
  if (query === "") {
    return formatGraphData(cachedCaptures, cachedTags);
  }
  var fuse = new Fuse(cachedCaptures, SEARCH_OPTIONS);
  const captureHits = fuse.search(query);
  const captureSet = new Set(captureHits.map(capture => capture.id));
  const tagHits: Map<string, Tag> = new Map();
  cachedTags.forEach(tag => {
    tag.captures.forEach(captureId => {
      if (captureSet.has(captureId)) {
        tagHits.set(tag.name, tag);
        return;
      }
    });
  });
  return formatGraphData(captureHits, tagHits);
}

function formatGraphData(captures: Capture[], tags: Map<string, Tag>) {
  const captureNodes = formatCaptures(captures);
  const tagArray = Array.from(tags.values());
  const tagNodes = formatTags(tagArray);
  const edges = buildEdges(captures, tagArray);
  return {
    nodes: captureNodes.concat(tagNodes),
    edges: edges
  } as GraphData;
}

async function deleteCapture(
  userSession: UserSession,
  id: string
): Promise<void> {
  const remainingCaptures = cachedCaptures.filter(capture => capture.id !== id);
  if (cachedCaptures.length - remainingCaptures.length !== 1) {
    return Promise.resolve();
  }
  const newTags = new Map();
  cachedTags.forEach(tag => {
    const newCaptures = tag.captures.filter(captureId => captureId !== id);
    if (newCaptures.length !== 0) {
      newTags.set(tag.name, { name: tag.name, captures: newCaptures });
    }
  });
  await write(userSession, TAGS_KEY, Array.from(newTags.values()));
  await write(userSession, CAPTURE_KEY, remainingCaptures);
  cachedTags = newTags;
  cachedCaptures = remainingCaptures;
  return;
}

async function fetchData(userSession): Promise<GraphData> {
  const captures = await fetchCaptures(userSession);
  const tags = await fetchTags(userSession);
  return formatGraphData(captures, tags);
}

function buildEdges(captures: Capture[], tags: Tag[]): Edge[] {
  const captureSet = new Set(captures.map(capture => capture.id));
  const edges: Edge[] = [];
  tags.forEach(tag => {
    tag.captures.forEach(captureId => {
      if (captureSet.has(captureId)) {
        edges.push({
          source: captureId,
          destination: tag.name
        } as Edge);
      }
    });
  });
  return edges;
}

async function fetchTags(userSession): Promise<Map<string, Tag>> {
  cachedTags = new Map();
  const options = { decrypt: false };
  const file = await userSession.getFile(TAGS_KEY, options);
  const untypedTags = JSON.parse((file as string) || "[]");
  untypedTags.forEach(tag => {
    cachedTags.set(tag.name, tag as Tag);
  });
  return cachedTags;
}

function formatTags(tags: Tag[]): GraphNode[] {
  return tags.map(tag => {
    return {
      id: tag.name,
      type: "Tag",
      text: tag.name
    } as GraphNode;
  });
}

async function fetchCaptures(userSession: UserSession): Promise<Capture[]> {
  const options = { decrypt: false };
  const file = await userSession.getFile(CAPTURE_KEY, options);
  const untypedCaptures = JSON.parse((file as string) || "[]");
  cachedCaptures = Array.from(untypedCaptures);
  return cachedCaptures;
}

function formatCaptures(captures: Capture[]): GraphNode[] {
  return captures.map(capture => {
    return {
      id: capture.id,
      type: "Capture",
      text: capture.text
    } as GraphNode;
  });
}

async function createCapture(userSession: UserSession, capture: Capture) {
  await updateTags(userSession, capture);
  cachedCaptures.push(capture);
  return write(userSession, CAPTURE_KEY, cachedCaptures);
}

async function updateTags(
  userSession: UserSession,
  capture: Capture
): Promise<string> {
  const captureTags = parseTags(capture.text);
  captureTags.forEach(tagName => {
    if (cachedTags.has(tagName)) {
      // update pointers
      const tag = cachedTags.get(tagName);
      (tag!.captures || []).push(capture.id);
    } else {
      cachedTags.set(tagName, {
        name: tagName,
        captures: [capture.id]
      } as Tag);
    }
  });
  return await write(userSession, TAGS_KEY, Array.from(cachedTags.values()));
}

async function clearAll(userSession): Promise<void> {
  await write(userSession, CAPTURE_KEY, []);
  await write(userSession, TAGS_KEY, []);
  return;
}

const hashtagRegex = new RegExp("#([^\\s<]*)", "g");

function parseTags(str: string): string[] {
  const ret: Set<string> = new Set();
  let match;
  while ((match = hashtagRegex.exec(str))) {
    ret.add(match[1]);
  }
  return Array.from(ret);
}

async function write(
  userSession: UserSession,
  key: string,
  data: any[]
): Promise<string> {
  const options = { encrypt: false };
  return userSession.putFile(key, JSON.stringify(data), options);
}

export { search, deleteCapture, fetchData, createCapture, clearAll };
