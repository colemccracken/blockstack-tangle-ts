import { UserSession } from "blockstack";
import { GraphNode } from "../models/node";
import { Edge } from "../models/edge";
import { Capture } from "../models/capture";
import { Tag } from "../models/tag";
import { GraphData } from "../models/graph-data";
import Fuse from "fuse.js";
import nlp from "compromise";
import { Entity } from "../models/entity";

let cachedCaptures: Capture[] = [];

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

  await write(userSession, CAPTURE_KEY, remainingCaptures);
  cachedCaptures = remainingCaptures;
  return;
}

async function fetchData(userSession): Promise<GraphData> {
  const captures = await fetchCaptures(userSession);
  return formatGraphData(captures);
}

function formatGraphData(captures: Capture[]) {
  const captureNodes = formatCaptures(captures);
  const tags = buildTags(captures);
  const tagNodes = formatTags(tags);
  const entities = buildEntities(captures);
  const entityNodes = formatEntities(entities);
  const edges = buildEdges(captures, tags, entities);
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
      if (tags.has(tagName)) {
        // update pointers
        const tag = tags.get(tagName);
        tag!.captures.push(capture.id);
      } else {
        tags.set(tagName, {
          id: `Tag|${tagName}`,
          name: tagName,
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
      if (entities.has(hit.text)) {
        entities.get(hit.text)!.captures.add(capture.id);
      } else {
        entities.set(hit.text, {
          id: `Entity|${hit.text}`,
          name: hit.text,
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
  cachedCaptures.push(capture);
  return write(userSession, CAPTURE_KEY, cachedCaptures);
}

async function updateEntities(userSession: UserSession, capture: Capture) {
  const doc = nlp(capture.text);
  console.log(doc.topics().json());
  console.log(doc);
}

async function clearAll(userSession): Promise<void> {
  await write(userSession, CAPTURE_KEY, []);
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
