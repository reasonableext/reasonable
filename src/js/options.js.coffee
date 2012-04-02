class Options
  @load: ->
    @background = chrome.extension.getBackgroundPage()
    @settings   = @background.Settings

    for own key, value of @settings.all()
      switch key
        when "filters"
          for own type, targets of value
            for own target, texts of targets
              id = "#{type}_#{target}"
              textArray = (text for own text of texts)
              document.getElementById(id).value = textArray.sort().join("\n")
        when "username"
          document.getElementById("username").value = value
        else
          node = document.getElementById(key)
          node.checked = value if node?

    @addEvents()

  @save: =>
    try
      for own key, value of @settings.all()
        switch key
          when "filters"
            types   = [ "string", "regex" ]
            targets = [ "name", "link", "content" ]
            for type in types
              for target in targets
                id    = "#{type}_#{target}"
                value = document.getElementById(id).value

                # Prevent blank textareas from introducing blank keys
                texts = if value is "" then [] else value.split("\n")

                # Remove deleted keys from background settings
                for own key of @settings.filters[type][target]
                  if texts.indexOf(key) is -1
                    delete @settings.filters[type][target][key]
                  else
                    delete texts[key]

                # Add new keys to background settings
                for key in texts
                  @settings.filters[type][target][key] = @settings.timestamp()
          when "username"
            @settings.username = document.getElementById(key).value
          else
            node = document.getElementById(key)
            @settings[key] = node.checked if node?
      @settings.save()
    catch error
      alert error.message
      return no

    alert "Successfully saved!"

  @addEvents: ->
    document.getElementById("options_form").onsubmit = @save

Options.load()
