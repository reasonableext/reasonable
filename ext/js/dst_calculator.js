var DSTCalculator;

DSTCalculator = (function() {

  function DSTCalculator(offset) {
    this.offset = offset;
    this.ranges = {};
  }

  DSTCalculator.prototype.is_dst = function(date) {
    var year;
    year = date.getFullYear();
    if (!(year in this.ranges)) this.add_range(year);
    return (date >= this.ranges[year].from) && (date <= this.ranges[year].to);
  };

  DSTCalculator.prototype.add_range = function(year) {
    var first_sunday_of_november, march_offset, november_offset, second_sunday_of_march;
    march_offset = new Date(year, 2, 1).getDay();
    if (march_offset === 0) march_offset += 7;
    second_sunday_of_march = 15 - march_offset;
    november_offset = new Date(year, 10, 1).getDay();
    if (november_offset === 0) november_offset += 7;
    first_sunday_of_november = 8 - november_offset;
    return this.ranges[year] = {
      from: new Date(Date.UTC(year, 2, second_sunday_of_march, 2 - this.offset)),
      to: new Date(Date.UTC(year, 10, first_sunday_of_november, 1 - this.offset))
    };
  };

  return DSTCalculator;

})();
