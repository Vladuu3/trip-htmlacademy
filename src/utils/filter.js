import dayjs from 'dayjs';
import {FilterType} from '../const.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => dayjs().isBefore(dayjs(point.dateFrom))),
  [FilterType.PRESENT]: (points) => points.filter((point) => dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo))),
  [FilterType.PAST]: (points) => points.filter((point) => dayjs().isAfter(dayjs(point.dateTo))),
};

export {filter};
