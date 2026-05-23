import dayjs from 'dayjs';

const humanizePointDate = (date) => date ? dayjs(date).format('MMM DD') : '';
const humanizePointTime = (date) => date ? dayjs(date).format('HH:mm') : '';

const formatDurationValue = (value) => value.toString().padStart(2, '0');

const getPointDuration = (dateFrom, dateTo) => {
  const from = dayjs(dateFrom);
  const to = dayjs(dateTo);
  const diffMinutes = to.diff(from, 'minute');

  const days = Math.floor(diffMinutes / 1440);
  const hours = Math.floor((diffMinutes % 1440) / 60);
  const minutes = diffMinutes % 60;

  if (days > 0) {
    return `${formatDurationValue(days)}D ${formatDurationValue(hours)}H ${formatDurationValue(minutes)}M`;
  }
  return `${formatDurationValue(hours)}H ${formatDurationValue(minutes)}M`;
};

export {humanizePointDate, humanizePointTime, getPointDuration};
