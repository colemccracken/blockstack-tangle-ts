export interface GraphNode {
  __typename: "Node";
  id: string;
  type: NodeType;
  text: string | null;
}

export enum NodeType {
  Capture = "Capture",
  Tag = "Tag"
}
