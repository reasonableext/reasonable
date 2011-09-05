(function() {
  window.defaultSettings = {
    autohideActivity: false,
    autohideHistory: true,
    blockIframes: false,
    hideAuto: true,
    highlightMe: true,
    history: [],
    keepHistory: true,
    name: "",
    shareTrolls: true,
    showAltText: true,
    showActivity: true,
    showGravatar: false,
    showPictures: true,
    showQuickInsert: true,
    showUnignore: true,
    showYouTube: true,
    trolls: {},
    updatePosts: false
  };
  window.GET_URL = "http://www.brymck.com/reasonable/get";
  window.GIVE_URL = "http://www.brymck.com/reasonable/give";
  window.QUICKLOAD_MAX_ITEMS = 20;
  window.actions = {
    black: {
      label: "hide",
      value: "black"
    },
    white: {
      label: "show",
      value: "white"
    },
    auto: {
      label: "auto",
      value: "auto"
    }
  };
}).call(this);
