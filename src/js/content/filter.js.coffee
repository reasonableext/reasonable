class Filter
  @add: (type, target, text) ->
    @all ?= []
    @all.push @createByType(type, target, text)

  @createByType: (type, target, text) ->
    switch type
      when "string"
        switch target
          when "name"    then new NameFilter(text)
          when "url"     then new LinkFilter(text)
          when "content" then new ContentFilter(text)
      when "regex"
        switch target
          when "name"    then new NameRegexFilter(text)
          when "url"     then new LinkRegexFilter(text)
          when "content" then new ContentRegexFilter(text)

  @serialize: ->
    result = {
      string: { name: [], url: [], content: [] }
      regex:  { name: [], url: [], content: [] }
    }
    for filter in @all
      result[filter.type]
      result[filter.type][filter.target] = filter.text
    return result

# String filters
class StringFilter
  constructor: (@text) ->
  type: "string"

class NameFilter extends StringFilter
  target: "name"
  isTroll: (comment) ->
    comment.name is @text

class LinkFilter extends StringFilter
  target: "link"
  isTroll: (comment) ->
    comment.email is @text

class ContentFilter extends StringFilter
  target: "content"
  isTroll: (comment) ->
    comment.content.indexOf(@text) isnt -1

# Regular expression filters
class RegexFilter extends Filter
  constructor: (@text) ->
    @regex = new RegExp(text, if text is text.toLowerCase() then "i" else "")
  type: "regex"

class NameRegexFilter extends RegexFilter
  target: "name"
  isTroll: (comment) ->
    @regex.test comment.name

class LinkRegexFilter extends RegexFilter
  target: "link"
  isTroll: (comment) ->
    @regex.test comment.email

class ContentRegexFilter extends RegexFilter
  target: "content"
  isTroll: (comment) ->
    @regex.test comment.comment
