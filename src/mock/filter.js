import {filter} from '../utils/filter.js';

function generateFilter(points, currentFilter) {
  return Object.entries(filter).map(
    ([filterType, filterPoints]) => ({
      type: filterType,
      count: filterPoints(points).length,
      isChecked: filterType === currentFilter,
    }),
  );
}

export {generateFilter};
