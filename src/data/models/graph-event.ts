import { NodeType } from "./node";

export interface GraphEvent {
  dataType: string;
  data: {
    id: string;
    category: NodeType;
    name: string;
    level: number;
  };
}
