export interface Entity {
  __typename: "Entity";
  name: string;
  captures: Set<string>;
}
