import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import {render, replace} from '../framework/render.js';
import dayjs from 'dayjs';

const SortType = {
  DAY: 'sort-day',
  PRICE: 'sort-price',
};

const sortPointByDay = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
const sortPointByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderPoints();
  };

  #currentSortType = SortType.DAY;

  #sortComponent = new SortView({
    currentSortType: this.#currentSortType,
    onSortTypeChange: this.#handleSortTypeChange,
  });

  #eventListComponent = new EventListView();

  #listEmptyComponent = new ListEmptyView();

  #boardPoints = [];

  #destinations = [];

  #offers = [];
  #pointPresenters = new Map();

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.getPoints()];
    this.#destinations = this.#pointsModel.getDestinations();
    this.#offers = this.#pointsModel.getOffers();
    this.#pointPresenters = new Map();

    this.#renderBoard();
  }

  #renderBoard() {
    if (this.#boardPoints.length === 0) {
      render(this.#listEmptyComponent, this.#boardContainer);
      return;
    }

    render(this.#sortComponent, this.#boardContainer);
    render(this.#eventListComponent, this.#boardContainer);

    this.#renderPoints();
  }

  #renderPoints() {
    this.#eventListComponent.element.innerHTML = '';

    for (const point of this.#getSortedPoints()) {
      this.#renderPoint(point);
    }

    render(pointComponent, this.#eventListComponent.element);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointContainer: this.#eventListComponent.element,
      point: point,
      destinations: this.#destinations,
      offers: this.#offers,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handlePointModeChange,
    });

    this.#pointPresenters.set(point.id, pointPresenter);
    pointPresenter.init(point);
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#boardPoints = this.#boardPoints.map((point) => (point.id === updatedPoint.id ? updatedPoint : point));

    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);
    pointPresenter.init(updatedPoint);
  };

  #handlePointModeChange = () => {
    this.#resetPointPresenters();
  };

  #resetPointPresenters() {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  }

  #getSortedPoints() {
    const sortedPoints = [...this.#boardPoints];

    switch (this.#currentSortType) {
      case SortType.PRICE:
        return sortedPoints.sort(sortPointByPrice);
      case SortType.DAY:
      default:
        return sortedPoints.sort(sortPointByDay);
    }
  }
}
