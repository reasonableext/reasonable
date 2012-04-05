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
  
  @updateTimestamps: ->
    if @all?
      result = (filter.serialize() for filter in @all when filter.used)
      XBrowser.sendRequest method: "update", filters: result, self

  remove: ->
    XBrowser.sendRequest method: "delete", filter: @serialize(), (response) ->
      Filter.load response.filters
      Post.reload().runFilters()

  serialize: ->
    type:   @type
    target: @target
    text:   @text

# String filters
class StringFilter extends Filter
  constructor: (@text) ->
    @lowerCase = (text is text.toLowerCase())
    @used = no
  type: "string"

class NameFilter extends StringFilter
  target: "name"
  isTroll: (comment) ->
    content = comment.name
    content = content.toLowerCase() if @lowerCase
    if content is @text
      @used = yes
    else
      no

class LinkFilter extends StringFilter
  target: "link"
  isTroll: (comment) ->
    return no unless comment.link?
    content = comment.link
    content = content.toLowerCase() if @lowerCase
    if content is @text
      @used = yes
    else
      no

class ContentFilter extends StringFilter
  target: "content"
  isTroll: (comment) ->
    content = comment.content
    content = content.toLowerCase() if @lowerCase
    if content.indexOf(@text) isnt -1
      @used = yes
    else
      no

# Regular expression filters
class RegexFilter extends Filter
  constructor: (@text) ->
    @regex = new RegExp(text, if text is text.toLowerCase() then "i" else "")
    @used  = no
  type: "regex"

class NameRegexFilter extends RegexFilter
  target: "name"
  isTroll: (comment) ->
    if @regex.test(comment.name)
      @used = yes
    else
      no

class LinkRegexFilter extends RegexFilter
  target: "link"
  isTroll: (comment) ->
    return no unless comment.link?
    if @regex.test(comment.link)
      @used = yes
    else
      no

class ContentRegexFilter extends RegexFilter
  target: "content"
  isTroll: (comment) ->
    if @regex.test(comment.content)
      @used = yes
    else
      no
