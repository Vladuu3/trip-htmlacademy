import {render, replace} from '../framework/render.js';
import PointView from '../view/point-view.js';
import EventEditView from '../view/event-edit-view.js';

export default class PointPresenter {
  #pointContainer = null;
  #point = null;
  #destinations = null;
  #offers = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #eventEditComponent = null;
  #mode = 'DEFAULT';

  constructor({pointContainer, point, destinations, offers, onDataChange, onModeChange}) {
    this.#pointContainer = pointContainer;
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point = this.#point) {
    const prevPointComponent = this.#pointComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#point = point;
    this.#pointComponent = this.#createPointComponent();
    this.#eventEditComponent = this.#createEventEditComponent();

    if (!prevPointComponent || !prevEventEditComponent) {
      render(this.#pointComponent, this.#pointContainer);
      return;
    }

    if (this.#mode === 'EDITING') {
      replace(this.#eventEditComponent, prevEventEditComponent);
      return;
    }

    replace(this.#pointComponent, prevPointComponent);
  }

  resetView() {
    if (this.#mode === 'DEFAULT') {
      return;
    }

    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #createPointComponent() {
    const pointDestination = this.#destinations.find((destination) => destination.id === this.#point.destination);
    const pointOffers = this.#offers
      .find((offer) => offer.type === this.#point.type)
      .offers
      .filter((offer) => this.#point.offers.includes(offer.id));

    return new PointView({
      point: this.#point,
      pointDestination,
      pointOffers,
      onEditClick: this.#editClickHandler,
      onFavoriteClick: this.#favoriteClickHandler,
    });
  }

  #createEventEditComponent() {
    return new EventEditView({
      point: this.#point,
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onFormSubmit: this.#formSubmitHandler,
      onCloseClick: this.#closeClickHandler,
    });
  }

  #replacePointToForm() {
    replace(this.#eventEditComponent, this.#pointComponent);
    this.#mode = 'EDITING';
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#eventEditComponent);
    this.#mode = 'DEFAULT';
  }

  #editClickHandler = () => {
    this.#handleModeChange();
    this.#replacePointToForm();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #favoriteClickHandler = (updatedPoint) => {
    this.#handleDataChange(updatedPoint);
  };

  #formSubmitHandler = () => {
    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #closeClickHandler = () => {
    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.resetView();
    }
  };
}
