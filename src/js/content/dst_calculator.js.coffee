class DSTCalculator
  constructor: (@offset) ->
    @ranges = {}

  isDST: (date) ->
    date = new Date(date)
    year = date.getFullYear()
    @range[year] = @calculate_range(year) unless year of @ranges
    (date >= @ranges[year].from) and (date <= @ranges[year].to)

  addRange: (year) ->
    # Get second Sunday in March
    marchOffset  = new Date(year, 2, 1).getDay()
    marchOffset += 7 if marchOffset is 0
    secondSundayOfMarch = 15 - marchOffset

    # Get first Sunday in November
    novemberOffset  = new Date(year, 10, 1).getDay()
    novemberOffset += 7 if novemberOffset is 0
    firstSundayOfNovember = 8 - novemberOffset

    from: new Date(Date.UTC(year,  2, secondSundayOfMarch,   2 - @offset))
    to:   new Date(Date.UTC(year, 10, firstSundayOfNovember, 1 - @offset))
