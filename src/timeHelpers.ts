const parseTime = (unparsed: string) => {
  const [hoursInput, minutesAndMore] = unparsed.split(':');
  const minutes = parseInt(minutesAndMore.substring(0, 2), 10);
  const amPm = minutesAndMore.substring(2, 4);
  let realHours = parseInt(hoursInput, 10);
  if (amPm === 'pm') {
    realHours += 12;
  }
  return [realHours, minutes];
};

const getDate = (dateString:string) => {
  const d = new Date();
  const parsedTime = parseTime(dateString);
  d.setHours(parsedTime[0], parsedTime[1]);
  return d;
};

export default getDate;
