function _valueBasedOnHour(hour, value) {
  // get current hour
  var time = new Date().getHours();
  // check if now was over 'hour'
  var isTimeGreaterThan6 = time >= hour;
  // if over 'hour', the value will be current hour
  return isTimeGreaterThan6 ? time : value;
}

console.log(_valueBasedOnHour(6, 10));
