export interface GraphNode {
  __typename: "Node";
  id: string;
  type: NodeType;
  text: string;
  author: string;
}

export enum NodeType {
  Capture = "Capture",
  Tag = "Tag",
  Entity = "Entity"
}
