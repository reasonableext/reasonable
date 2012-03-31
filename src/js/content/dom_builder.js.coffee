class DOMBuilder
  @create: (array) ->
    isArray = (array instanceof Array)
    array    = [array] unless isArray

    result = for item in array
      if item instanceof Object
        node = document.createElement(item.tag)
        for key, value of item
          switch key
            when "tag"
              break
            when "events"
              for eventKey, callback of value
                node.addEventListener eventKey, callback
            when "children"
              # Recursively build child nodes
              children = DOMBuilder.create(value)
              if children instanceof Array
                for child in DOMBuilder.create value
                  node.appendChild child
              else
                node.appendChild children
            when "text"
              node.appendChild document.createTextNode(value)
            else
              node.setAttribute key, value
        node
      else
        document.createTextNode(item)
    if isArray then result else result[0]
