(function() {
  var EST_OFFSET, MS_PER_HOUR, createUTC, dstStartEnd, dstTest;
  MS_PER_HOUR = 60 * 60 * 1000;
  EST_OFFSET = -5;
  createUTC = function(year, month, day, hour, minute, second, millisecond) {
    var utc;
    if (hour == null) hour = 0;
    if (minute == null) minute = 0;
    if (second == null) second = 0;
    if (millisecond == null) millisecond = 0;
    utc = new Date();
    utc.setUTCFullYear(year);
    utc.setUTCMonth(month - 1);
    utc.setUTCDate(day);
    utc.setUTCHours(hour);
    utc.setUTCMinutes(minute);
    utc.setUTCSeconds(second);
    utc.setUTCMilliseconds(millisecond);
    return utc;
  };
  dstStartEnd = function(year, offset) {
    var march, marchDay, november, novemberDay;
    if (offset == null) offset = 0;
    march = createUTC(year, 3, 1, 7 + offset);
    november = createUTC(year, 11, 1, 6 + offset);
    marchDay = march.getUTCDay();
    novemberDay = november.getUTCDay();
    if (marchDay === 0) marchDay = 7;
    if (novemberDay === 0) novemberDay = 7;
    march.setUTCDate(marchDay);
    november.setUTCDate(novemberDay);
    return {
      start: march,
      end: november
    };
  };
  dstTest = function(date, offset) {
    var startEnd;
    if (offset == null) offset = 0;
    startEnd = dstStartEnd(date.getUTCFullYear(), offset);
    return date >= startEnd.start && date <= startEnd.end;
  };
  window.createFromET = function(year, month, day, hour, minute, second, millisecond) {
    var utc;
    if (hour == null) hour = 0;
    if (minute == null) minute = 0;
    if (second == null) second = 0;
    if (millisecond == null) millisecond = 0;
    utc = createUTC(year, month, day, hour, minute, second, millisecond);
    utc.setUTCHours(utc.getUTCHours() - EST_OFFSET - (dstTest(utc, EST_OFFSET) ? 1 : 0));
    return utc;
  };
}).call(this);
