Filter.dialog = (type = "string", target = "content") ->
  if @dialog_box?
    @dialog_box.style.removeProperty "display"
  else
    radioLabel = (type, label) ->
      lowerLabel = label.toLowerCase()
      [{
        tag: "input"
        type: "radio"
        name: type
        id: "filter_#{lowerLabel}"
        value: lowerLabel
      }, {
        tag: "label"
        for: "filter_#{lowerLabel}"
        text: label
      }]

    types = targets = []
    types.push.apply types, radioLabel("type", text) for text in ["String", "Regex"]
    targets.push.apply targets, radioLabel("target", text) for text in ["Name", "Link", "Content"]

    @dialog_box = DOMBuilder.create(
      tag: "div"
      id: "filter_dialog"
      children:
        tag: "form"
        children: [{
          tag: "div"
          children: [{
            tag: "input"
            type: "radio"
            name: "type"
            id: "filter_string"
            value: "string"
          }, {
            tag: "label"
            for: "filter_string"
            text: "String"
          }, {
            tag: "input"
            type: "radio"
            name: "type"
            id: "filter_regex"
            value: "regex"
          }, {
            tag: "label"
            for: "filter_regex"
            text: "Regular expression"
          }]
        }, {
          tag: "div"
          children: [{
            tag: "input"
            type: "radio"
            name: "target"
            id: "filter_name"
            value: "name"
          }, {
            tag: "label"
            for: "filter_name"
            text: "Name"
          }, {
            tag: "input"
            type: "radio"
            name: "target"
            id: "filter_link"
            value: "link"
          }, {
            tag: "label"
            for: "filter_link"
            text: "Link"
          }, {
            tag: "input"
            type: "radio"
            name: "target"
            id: "filter_content"
            value: "content"
          }, {
            tag: "label"
            for: "filter_content"
            text: "Content"
          }]
        }, {
          tag: "input"
          type: "text"
          id: "filter_text"
          placeholder: "Text"
        }, {
          tag: "input"
          type: "submit"
          events:
            submit: ->
              alert "hi"
              return false
        }]
    )
    document.body.appendChild @dialog_box

  # Check defaults and select 
  document.getElementById("filter_#{type}").checked = yes
  document.getElementById("filter_#{target}").checked = yes
  document.getElementById("filter_text").focus()
