class Filter
  @by_type: (type, target, text) ->
    switch type
      when "string"
        switch target
          when "name"    then new NameFilter(text)
          when "url"     then new URLFilter(text)
          when "comment" then new CommentFilter(text)
      when "regex"
        switch target
          when "name"    then new NameRegexFilter(text)
          when "url"     then new URLRegexFilter(text)
          when "comment" then new CommentRegexFilter(text)

# String filters
class StringFilter
  constructor: (@text) ->

class NameFilter extends StringFilter
  is_troll: (comment) ->
    comment.name is @text

class URLFilter extends StringFilter
  is_troll: (comment) ->
    comment.email is @text

class ContentFilter extends StringFilter
  is_troll: (comment) ->
    comment.content.indexOf(@text) isnt -1

# Regular expression filters
class RegexFilter extends Filter
  constructor: (text) ->
    split_text = text.split("/")
    @regex = new RegExp(split_text[1], split_text[2])

class NameRegexFilter extends RegexFilter
  is_troll: (comment) ->
    @regex.test comment.name

class URLRegexFilter extends RegexFilter
  is_troll: (comment) ->
    @regex.test comment.email

class NameRegexFilter extends RegexFilter
  is_troll: (comment) ->
    @regex.test comment.comment
