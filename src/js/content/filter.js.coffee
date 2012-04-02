class Filter
  @add: (type, target, text) ->
    @all ?= []
    @all.push @createByType(type, target, text)

  @createByType: (type, target, text) ->
    switch type
      when "string"
        switch target
          when "name"    then new NameFilter(text)
          when "link"    then new LinkFilter(text)
          when "content" then new ContentFilter(text)
      when "regex"
        switch target
          when "name"    then new NameRegexFilter(text)
          when "link"    then new LinkRegexFilter(text)
          when "content" then new ContentRegexFilter(text)

  @load: (json) =>
    @all = []
    for own type, targets of json
      for own target, texts of targets
        for own text of texts
          @add type, target, text

  remove: ->
    chrome.extension.sendRequest method: "delete", filter: @serialize(), (response) ->
      Filter.load response.filters
      Post.reload().runFilters()

  serialize: ->
    type:   @type
    target: @target
    text:   @text

# String filters
class StringFilter extends Filter
  constructor: (@text) ->
  type: "string"

class NameFilter extends StringFilter
  target: "name"
  isTroll: (comment) ->
    comment.name is @text

class LinkFilter extends StringFilter
  target: "link"
  isTroll: (comment) ->
    comment.link is @text

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
    @regex.test comment.link

class ContentRegexFilter extends RegexFilter
  target: "content"
  isTroll: (comment) ->
    @regex.test comment.content
