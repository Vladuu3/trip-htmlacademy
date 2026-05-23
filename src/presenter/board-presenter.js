import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadView from '../view/failed-load-view.js';
import {render, remove} from '../framework/render.js';
import dayjs from 'dayjs';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import {filter} from '../utils/filter.js';
import {FilterType, SortType, UpdateType, UserAction} from '../const.js';

const sortPointByDay = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
const sortPointByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #eventListComponent = new EventListView();
  #listMessageComponent = null;

  #destinations = [];
  #offers = [];
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #onNewPointDestroy = null;

  #currentSortType = SortType.DAY;
  #sortComponent = null;

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointList();
    this.#renderPointList();
  };

  constructor({boardContainer, pointsModel, filterModel, onNewPointDestroy}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#syncModelData();

    this.#newPointPresenter = new NewPointPresenter({
      pointContainer: this.#eventListComponent.element,
      destinations: this.#destinations,
      offers: this.#offers,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#onNewPointDestroy,
    });

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#resetPointPresenters();
    this.#newPointPresenter.init();
  }

  #renderBoard() {
    if (this.#pointsModel.isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.#pointsModel.hasLoadingError) {
      this.#renderFailedLoad();
      return;
    }

    this.#clearListMessage();
    render(this.#eventListComponent, this.#boardContainer);
    this.#renderSort();
    this.#renderPointList();
  }

  #renderSort() {
    if (this.points.length === 0) {
      remove(this.#sortComponent);
      return;
    }

    render(this.#sortComponent, this.#boardContainer);
  }

  #renderPointList() {
    if (this.points.length === 0) {
      this.#renderEmptyList();
      return;
    }

    this.#clearListMessage();

    for (const point of this.points) {
      this.#renderPoint(point);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointContainer: this.#eventListComponent.element,
      point: point,
      destinations: this.#destinations,
      offers: this.#offers,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handlePointModeChange,
    });

    this.#pointPresenters.set(point.id, pointPresenter);
    pointPresenter.init(point);
  }

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch {
          // Will add user feedback for failed requests in the next task.
        }
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
      default:
        throw new Error('Unknown user action');
    }
  };

  #handleModelEvent = (updateType, data) => {
    this.#syncModelData();
    this.#newPointPresenter?.setData({
      destinations: this.#destinations,
      offers: this.#offers,
    });

    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id)?.init(data);
        break;
      case UpdateType.INIT:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        this.#clearBoard();
        this.#renderBoard();
        break;
      default:
        this.#clearBoard();
        this.#renderBoard();
    }
  };

  #clearBoard() {
    this.#clearPointList();
    this.#clearListMessage();
    remove(this.#sortComponent);
    remove(this.#eventListComponent);
  }

  #handlePointModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#resetPointPresenters();
  };

  #resetPointPresenters() {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  }

  #clearPointList() {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.#pointPresenters.clear();
    this.#eventListComponent.element.innerHTML = '';
  }

  #renderEmptyList() {
    this.#clearListMessage();
    this.#listMessageComponent = new ListEmptyView({filterType: this.#filterModel.filter});
    render(this.#listMessageComponent, this.#boardContainer);
  }

  #renderLoading() {
    this.#clearListMessage();
    this.#listMessageComponent = new LoadingView();
    render(this.#listMessageComponent, this.#boardContainer);
  }

  #renderFailedLoad() {
    this.#clearListMessage();
    this.#listMessageComponent = new FailedLoadView();
    render(this.#listMessageComponent, this.#boardContainer);
  }

  #clearListMessage() {
    remove(this.#listMessageComponent);
    this.#listMessageComponent = null;
  }

  #syncModelData() {
    this.#destinations = this.#pointsModel.getDestinations();
    this.#offers = this.#pointsModel.getOffers();
  }

  get points() {
    const points = this.#pointsModel.getPoints();
    const filteredPoints = filter[this.#filterModel.filter](points);
    const sortedPoints = [...filteredPoints];

    switch (this.#currentSortType) {
      case SortType.PRICE:
        return sortedPoints.sort(sortPointByPrice);
      case SortType.DAY:
      default:
        return sortedPoints.sort(sortPointByDay);
    }
  }
}
