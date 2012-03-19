class DSTCalculator
  constructor: (@offset) ->
    @ranges = {}

  is_dst: (date) ->
    year = date.getFullYear()
    @add_range(year) unless year of @ranges
    (date >= @ranges[year].from) and (date <= @ranges[year].to)

  add_range: (year) ->
    # Get second Sunday in March
    march_offset  = new Date(year, 2, 1).getDay()
    march_offset += 7 if march_offset is 0
    second_sunday_of_march = 15 - march_offset

    # Get first Sunday in November
    november_offset  = new Date(year, 10, 1).getDay()
    november_offset += 7 if november_offset is 0
    first_sunday_of_november = 8 - november_offset

    @ranges[year] =
      from: new Date(Date.UTC(year,  2, second_sunday_of_march,   2 - @offset))
      to:   new Date(Date.UTC(year, 10, first_sunday_of_november, 1 - @offset))
