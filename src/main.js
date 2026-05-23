import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';

const siteHeaderElement = document.querySelector('.trip-main');
const siteFilterElement = siteHeaderElement.querySelector('.trip-controls__filters');
const siteEventsElement = document.querySelector('.trip-events');
const newPointButtonComponent = siteHeaderElement.querySelector('.trip-main__event-add-btn');
const pointsModel = new PointsModel();
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer: siteFilterElement,
  pointsModel,
  filterModel,
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
boardPresenter.init();
