Filter.dialog = (type = "string", target = "content", text = null) ->
  ESCAPE_KEY = 27

  if @dialog_box?
    @dialog_box.style.removeProperty "display"
  else
    @dialog_box           = document.createElement("div")
    @dialog_box.id        = "filter_dialog"
    @dialog_box.innerHTML = """
      <form id="filter_form">
        <div>
          <input type="radio" name="type" id="filter_string" value="string">
          <label for="filter_string">String</label>
          <input type="radio" name="type" id="filter_regex" value="regex">
          <label for="filter_regex">Regular expression</label>
        </div>
        <div>
          <input type="radio" name="target" id="filter_name" value="name">
          <label for="filter_name">Name</label>
          <input type="radio" name="target" id="filter_link" value="link">
          <label for="filter_link">Link</label>
          <input type="radio" name="target" id="filter_content" value="content">
          <label for="filter_content">Content</label>
        </div>
        <input type="text" id="filter_text" placeholder="Text" size="50"><br>
        <input type="button" id="filter_cancel" value="Cancel">
        <input type="submit" id="filter_submit" value="Submit">
      </form>
      """

    document.body.appendChild @dialog_box
    @dialog_box.onkeydown = (e) =>
      @dialog_box.style.display = "none" if e.keyCode is ESCAPE_KEY
    form = document.getElementById("filter_form")

    form.onsubmit = =>
      XBrowser.sendRequest method: "add", filter: Filter.serialize_form(), (response) ->
        Filter.load response.filters
        Post.filters = Filter.all
        for comment in Post.comments
          comment.hide() if comment.isTroll()
      @dialog_box.style.display = "none"
      return false
    
    document.getElementById("filter_cancel").onclick = =>
      @dialog_box.style.display = "none"
      return false

  # Check defaults and select 
  document.getElementById("filter_#{type}").checked = yes
  document.getElementById("filter_#{target}").checked = yes
  if text?
    document.getElementById("filter_text").value = text
    document.getElementById("filter_submit").focus()
  else
    document.getElementById("filter_text").value = ""
    document.getElementById("filter_text").focus()

Filter.serialize_form = ->
  @form = document.getElementById("filter_form")
  extract_radio_value = (key) =>
    for radio in @form.elements[key]
      return radio.value if radio.checked
  
  type:   extract_radio_value("type")
  target: extract_radio_value("target")
  text:   @form.filter_text.value
