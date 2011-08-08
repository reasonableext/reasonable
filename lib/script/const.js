// Constants shared by background, content and page scripts
const GET_URL = "http://www.brymck.com/reasonable/get";
const GIVE_URL = "http://www.brymck.com/reasonable/give"

const QUICKLOAD_MAX_ITEMS = 20;

var actions = {
  black: { label: "hide", value: "black" },
  white: { label: "show", value: "white" },
  auto:  { label: "auto", value: "auto"  }
};
