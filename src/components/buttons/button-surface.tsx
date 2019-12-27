// React
import * as React from "react";

// Components
import { Search } from "react-feather";

interface Props {}

const ButtonSurface = (props: Props) => {
  return (
    <span className={`flex-column justify-around pointer`}>
      <Search size={16} />
    </span>
  );
};

export default ButtonSurface;
