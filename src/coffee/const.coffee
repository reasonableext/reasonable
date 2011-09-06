# Can't be set as constants, but should not be modified
window.defaultSettings =
  admin:            ""
  autohideActivity: false
  autohideHistory:  true
  blockIframes:     false
  hideAuto:         true
  highlightMe:      true
  history:          []
  keepHistory:      true
  lookupFrequency:  15
  name:             ""
  shareTrolls:      true
  showAltText:      true
  showActivity:     true
  showGravatar:     false
  showPictures:     true
  showQuickInsert:  true
  showUnignore:     true
  showYouTube:      true
  submitted:        0
  trolls:           {}
  updatePosts:      false

# Attach to window, otherwise won't be accessible to other scripts
window.GET_URL  = "http://www.brymck.com/reasonable/get"
window.GIVE_URL = "http://www.brymck.com/reasonable/give"
window.QUICKLOAD_MAX_ITEMS = 20
window.actions =
  black:
    label: "hide"
    value: "black"
  white:
    label: "show"
    value: "white"
  auto:
    label: "auto"
    value: "auto"
