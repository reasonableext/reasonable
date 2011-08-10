MS_PER_HOUR = 60 * 60 * 1000
EST_OFFSET = -5

# Builds a date object entirely from UTC inputs
# Also useful as a proxy for dealing with date objects to
# avoid the ambiguity that comes with local times
createUTC = (year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0) ->
  utc = new Date()
  utc.setUTCFullYear     year
  utc.setUTCMonth        month - 1 # seriously, how ridiculous is JS's getMonth?
  utc.setUTCDate         day
  utc.setUTCHours        hour
  utc.setUTCMinutes      minute
  utc.setUTCSeconds      second
  utc.setUTCMilliseconds millisecond
  utc # the above methods return the date as a number

dstStartEnd = (year, offset = 0) ->
  # Initialize as first of month, with hour set to 2:00 am ET
  march    = createUTC year,  3, 1, 7 + offset
  november = createUTC year, 11, 1, 6 + offset

  # getUTCDay returns 0 - 6, starting on Sunday. We need Sunday to be 7.
  marchDay    = march.getUTCDay()
  novemberDay = november.getUTCDay()
  marchDay    = 7 if marchDay    is 0
  novemberDay = 7 if novemberDay is 0

  march.setUTCDate    marchDay
  november.setUTCDate novemberDay
  { start: march, end: november }

dstTest = (date, offset = 0) ->
  startEnd = dstStartEnd date.getUTCFullYear(), offset
  date >= startEnd.start and date <= startEnd.end

window.createFromET = (year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0) ->
  utc = createUTC year, month, day, hour, minute, second, millisecond
  utc.setUTCHours utc.getUTCHours() - EST_OFFSET - if dstTest(utc, EST_OFFSET) then 1 else 0
  utc
