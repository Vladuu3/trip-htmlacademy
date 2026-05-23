import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventEditView from '../view/event-edit-view.js';
import PointView from '../view/point-view.js';
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

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.getPoints()];
    this.#destinations = this.#pointsModel.getDestinations();
    this.#offers = this.#pointsModel.getOffers();

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
  }

  #renderPoint(point) {
    const pointDestination = this.#destinations.find((d) => d.id === point.destination);
    const pointOffers = this.#offers.find((o) => o.type === point.type).offers.filter((o) => point.offers.includes(o.id));

    const escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const pointComponent = new PointView({
      point: point,
      pointDestination: pointDestination,
      pointOffers: pointOffers,
      onEditClick: () => {
        replacePointToForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const eventEditComponent = new EventEditView({
      point: point,
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onFormSubmit: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onCloseClick: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    function replacePointToForm() {
      replace(eventEditComponent, pointComponent);
    }

    function replaceFormToPoint() {
      replace(pointComponent, eventEditComponent);
    }

    render(pointComponent, this.#eventListComponent.element);
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
