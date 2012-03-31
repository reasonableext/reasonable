class DOMBuilder
  @create: (array) ->
    is_array = (array instanceof Array)
    array    = [array] unless is_array

    result = for item in array
      node = document.createElement(item.tag)
      for key, value of item
        switch key
          when "tag"
            break
          when "events"
            for event_key, callback of value
              node.addEventListener event_key, callback
          when "children"
            # Recursively build child nodes
            for child in DOMBuilder.create value
              node.appendChild child
          when "text"
            node.appendChild document.createTextNode(value)
          else
            node.setAttribute key, value
      node
    if is_array then result else result[0]
