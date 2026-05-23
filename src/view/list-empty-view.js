import AbstractView from '../framework/view/abstract-view.js';
import {FilterType} from '../const.js';

const ListEmptyTextByFilterType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

function createListEmptyTemplate(filterType) {
  return (
    `<p class="trip-events__msg">${ListEmptyTextByFilterType[filterType]}</p>`
  );
}

export default class ListEmptyView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createListEmptyTemplate(this.#filterType);
  }
}
