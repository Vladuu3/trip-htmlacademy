import {render, remove, RenderPosition} from '../framework/render.js';
import EventEditView, {createBlankPoint} from '../view/event-edit-view.js';
import {UserAction, UpdateType} from '../const.js';

export default class NewPointPresenter {
  #pointContainer = null;
  #destinations = null;
  #offers = null;
  #handleDataChange = null;
  #handleDestroy = null;
  #eventEditComponent = null;

  constructor({pointContainer, destinations, offers, onDataChange, onDestroy}) {
    this.#pointContainer = pointContainer;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  setPointContainer(pointContainer) {
    this.#pointContainer = pointContainer;
  }

  setData({destinations, offers}) {
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init() {
    if (this.#eventEditComponent !== null) {
      return;
    }

    const point = {
      ...createBlankPoint(),
      id: Date.now().toString(),
      dateFrom: null,
      dateTo: null,
    };

    this.#eventEditComponent = new EventEditView({
      point,
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onFormSubmit: this.#formSubmitHandler,
      onCloseClick: this.#cancelClickHandler,
      onDeleteClick: this.#cancelClickHandler,
    });

    render(this.#eventEditComponent, this.#pointContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditComponent === null) {
      return;
    }

    remove(this.#eventEditComponent);
    this.#eventEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#handleDestroy();
  }

  #formSubmitHandler = async (point) => {
    this.#eventEditComponent.setSaving();

    try {
      await this.#handleDataChange(UserAction.ADD_POINT, UpdateType.MINOR, point);
      this.destroy();
    } catch {
      this.#eventEditComponent.setAborting();
    }
  };

  #cancelClickHandler = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
