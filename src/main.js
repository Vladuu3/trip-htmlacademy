import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import BigTripApiService from './api/big-trip-api-service.js';

const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const createAuthorization = () => `Basic ${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

const siteHeaderElement = document.querySelector('.trip-main');
const siteFilterElement = siteHeaderElement.querySelector('.trip-controls__filters');
const siteEventsElement = document.querySelector('.trip-events');
const newPointButtonComponent = siteHeaderElement.querySelector('.trip-main__event-add-btn');
const pointsModel = new PointsModel({
  apiService: new BigTripApiService(END_POINT, createAuthorization()),
});
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer: siteFilterElement,
  pointsModel,
  filterModel,
});

const tripInfoPresenter = new TripInfoPresenter({
  container: siteHeaderElement,
  pointsModel,
});

const boardPresenter = new BoardPresenter({
  boardContainer: siteEventsElement,
  pointsModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose,
});

function handleNewPointButtonClick() {
  boardPresenter.createPoint();
  newPointButtonComponent.disabled = true;
}

function handleNewPointFormClose() {
  newPointButtonComponent.disabled = false;
}

newPointButtonComponent.addEventListener('click', handleNewPointButtonClick);

filterPresenter.init();
tripInfoPresenter.init();
boardPresenter.init();

newPointButtonComponent.disabled = true;
pointsModel.init().finally(() => {
  newPointButtonComponent.disabled = pointsModel.hasLoadingError;
});
