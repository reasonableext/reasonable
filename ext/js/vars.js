(function() {
  var ACTIVITY_CUTOFFS, ARTICLE_REGEX, ARTICLE_SHORTEN_REGEX, AVATAR_PREFIX, AVATAR_SUFFIX, COLLAPSE, COMMENT_DATE_REGEX, COMMENT_HISTORY, DATE_INDEX, ESCAPE_KEY, FADE_SPEED, FIRST_MATCH, IGNORE, LATEST_COMMENT_COUNT, LIGHTS_OUT_OPACITY, MINIMAL_FADE_SPEED, MINIMAL_OPACITY, MY_MD5, PICTURE_REGEX, QUICKLOAD_MAX_ITEMS, QUICKLOAD_SPEED, TOTAL_OPACITY, UNCOLLAPSE, UNIGNORE, UPDATE_POST_TIMEOUT_LENGTH, URL_REGEX, YOUTUBE_REGEX, defaultSettings, lightsOn, months, settings, trolls;
  QUICKLOAD_MAX_ITEMS = 20;
  URL_REGEX = /^https?:\/\/(www\.)?([^\/]+)?/i;
  PICTURE_REGEX = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|bmp))(?:\?([^#]*))?(?:#(.*))?/i;
  YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)(?:\#t\=[0-9]{2}m[0-9]{2}s)?/i;
  ARTICLE_REGEX = /reason\.com\/(.*?)(?:\#comment)?s?(?:\_[0-9]{6,7})?$/;
  ARTICLE_SHORTEN_REGEX = /^(?:archives|blog)?\/(?:19|20)[0-9]{2}\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[0-1])\/(.*?)(?:\#|$)/;
  COLLAPSE = "show direct";
  UNCOLLAPSE = "show all";
  IGNORE = "ignore";
  UNIGNORE = "unignore";
  DATE_INDEX = 2;
  COMMENT_DATE_REGEX = /(1[0-2]|[1-9])\.(3[0-1]|[1-2][0-9]|[1-9])\.([0-9]{2})\s@\s(1[0-2]|[1-9])\:([0-5][0-9])([AP]M)/;
  ACTIVITY_CUTOFFS = [300000, 900000, 1800000, 3600000, 7200000];
  LATEST_COMMENT_COUNT = 5;
  AVATAR_PREFIX = "http://www.gravatar.com/avatar/";
  AVATAR_SUFFIX = "?s=40&d=identicon";
  MY_MD5 = "b5ce5f2f748ceefff8b6a5531d865a27";
  LIGHTS_OUT_OPACITY = 0.5;
  MINIMAL_OPACITY = 0.01;
  TOTAL_OPACITY = 1;
  FADE_SPEED = 500;
  MINIMAL_FADE_SPEED = 5;
  COMMENT_HISTORY = "Comment History";
  ESCAPE_KEY = 27;
  FIRST_MATCH = 1;
  QUICKLOAD_SPEED = 100;
  UPDATE_POST_TIMEOUT_LENGTH = 60000;
  defaultSettings = {
    name: null,
    history: [],
    hideAuto: true,
    shareTrolls: true,
    showAltText: true,
    showActivity: true,
    showUnignore: true,
    showPictures: true,
    showQuickInsert: true,
    showYouTube: true,
    keepHistory: true,
    highlightMe: true,
    showGravatar: false,
    blockIframes: false,
    name: ""
  };
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  settings = {};
  trolls = [];
  lightsOn = false;
}).call(this);
