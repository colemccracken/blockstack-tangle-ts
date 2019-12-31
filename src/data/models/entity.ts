export interface Entity {
  __typename: "Entity";
  id: string;
  name: string;
  captures: Set<string>;
}
