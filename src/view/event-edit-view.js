import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {EventType} from '../const.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const DATE_FORMAT = 'DD/MM/YY HH:mm';
const FLATPICKR_DATE_FORMAT = 'd/m/y H:i';

const BLANK_POINT = {
  id: '',
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: 'flight'
};

const createBlankPoint = () => ({
  ...BLANK_POINT,
});

const normalizeDestinationName = (name) => String(name ?? '').trim().toLowerCase();

const findDestinationByName = (destinations, name) => destinations
  .find((destination) => normalizeDestinationName(destination.name) === normalizeDestinationName(name))
  ?? destinations.find((destination) => normalizeDestinationName(destination.name).includes(normalizeDestinationName(name)))
  ?? destinations.find((destination) => normalizeDestinationName(name).includes(normalizeDestinationName(destination.name)));

const findDestinationById = (destinations, destinationId) => destinations
  .find((destination) => String(destination.id) === String(destinationId));

function createEventEditOffersTemplate(type, offers, pointOffers, isDisabled = false) {
  const currentTypeOffers = offers.find((offer) => offer.type === type)?.offers;
  if (!currentTypeOffers || currentTypeOffers.length === 0) {
    return '';
  }

  const offersTemplate = currentTypeOffers.map((offer) => {
    const isChecked = pointOffers.includes(offer.id) ? 'checked' : '';
    return (
      `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${isChecked} ${isDisabled ? 'disabled' : ''}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`
    );
  }).join('');

  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersTemplate}
      </div>
    </section>`
  );
}

function createEventEditDestinationTemplate(destination) {
  if (!destination) {
    return '';
  }

  const hasDescription = Boolean(destination.description?.trim());
  const hasPictures = Array.isArray(destination.pictures) && destination.pictures.length > 0;

  if (!hasDescription && !hasPictures) {
    return '';
  }

  const picturesTemplate = (destination.pictures || []).map((picture) => (
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
  )).join('');

  const descriptionTemplate = hasDescription
    ? `<p class="event__destination-description">${destination.description}</p>`
    : '';

  const photosTemplate = hasPictures
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${picturesTemplate}
        </div>
      </div>`
    : '';

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      ${descriptionTemplate}
      ${photosTemplate}
    </section>`
  );
}

function createEventEditTemplate(point, allDestinations, allOffers) {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers,
    isDisabled = false,
    submitButtonText = 'Save',
    resetButtonText,
  } = point;

  const typeListTemplate = EventType.map((item) => (
    `<div class="event__type-item">
      <input id="event-type-${item}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${item}" ${item === type ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
      <label class="event__type-label  event__type-label--${item}" for="event-type-${item}-1">${item.charAt(0).toUpperCase() + item.slice(1)}</label>
    </div>`
  )).join('');

  const destinationListTemplate = allDestinations.map((dest) => (
    `<option value="${dest.name}"></option>`
  )).join('');

  const pointDestination = findDestinationById(allDestinations, destination);
  const destinationInputValue = point.destinationName ?? (pointDestination ? pointDestination.name : '');
  const defaultResetButtonText = pointDestination ? 'Delete' : 'Cancel';
  const currentResetButtonText = resetButtonText ?? defaultResetButtonText;

  const startTime = dateFrom ? dayjs(dateFrom).format(DATE_FORMAT) : '';
  const endTime = dateTo ? dayjs(dateTo).format(DATE_FORMAT) : '';

  const offersTemplate = createEventEditOffersTemplate(type, allOffers, offers, isDisabled);
  const destinationTemplate = createEventEditDestinationTemplate(pointDestination);

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event ${type} icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typeListTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationInputValue}" list="destination-list-1" required ${isDisabled ? 'disabled' : ''}>
            <datalist id="destination-list-1">
              ${destinationListTemplate}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startTime}" ${isDisabled ? 'disabled' : ''}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endTime}" ${isDisabled ? 'disabled' : ''}>
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" step="1" required ${isDisabled ? 'disabled' : ''}>
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${submitButtonText}</button>
          <button class="event__reset-btn" type="reset">${currentResetButtonText}</button>
          ${pointDestination ? `<button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
            <span class="visually-hidden">Open event</span>
          </button>` : ''}
        </header>
        <section class="event__details">
          ${offersTemplate}
          ${destinationTemplate}
        </section>
      </form>
    </li>`
  );
}

export default class EventEditView extends AbstractStatefulView {
  #pointDestinations = null;
  #pointOffers = null;
  #handleFormSubmit = null;
  #handleCloseClick = null;
  #handleDeleteClick = null;
  #startDatepicker = null;
  #endDatepicker = null;

  constructor({point = BLANK_POINT, pointDestinations, pointOffers, onFormSubmit, onCloseClick, onDeleteClick}) {
    super();
    this._setState(point);
    this.#pointDestinations = pointDestinations;
    this.#pointOffers = pointOffers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleCloseClick = onCloseClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  setSaving() {
    this.updateElement({
      submitButtonText: 'Saving...',
    });
  }

  setDeleting() {
    this.updateElement({
      resetButtonText: 'Deleting...',
    });
  }

  setAborting() {
    this.shake(() => {
      this.updateElement({
        isDisabled: false,
        submitButtonText: 'Save',
        resetButtonText: undefined,
      });
    });
  }

  get template() {
    return createEventEditTemplate(this._state, this.#pointDestinations, this.#pointOffers);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('change', this.#destinationChangeHandler);
    destinationInput.addEventListener('input', this.#destinationInputHandler);

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('change', this.#priceChangeHandler);

    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);

    this.element.querySelectorAll('.event__offer-checkbox').forEach((input) => {
      input.addEventListener('change', this.#offerChangeHandler);
    });

    // Only if it's edit point will the button exist
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#closeClickHandler);
    }

    this.#setDatepickers();
  }

  removeElement() {
    this.#destroyDatepickers();
    super.removeElement();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const destinationInput = this.element.querySelector('.event__input--destination');
    const selectedDestination = findDestinationByName(this.#pointDestinations, destinationInput.value);

    // Keep model data in sync with the latest text before validation/submission.
    this._setState({
      destination: selectedDestination ? selectedDestination.id : null,
      destinationName: destinationInput.value,
    });

    if (!this.#isFormValid()) {
      return;
    }

    this.#handleFormSubmit(this.#parseStateToPoint());
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = findDestinationByName(this.#pointDestinations, evt.target.value);

    evt.target.setCustomValidity(selectedDestination ? '' : 'Please choose a destination from the list');
    evt.target.reportValidity();

    this.updateElement({
      destination: selectedDestination ? selectedDestination.id : null,
      destinationName: evt.target.value,
    });
  };

  #destinationInputHandler = (evt) => {
    const selectedDestination = findDestinationByName(this.#pointDestinations, evt.target.value);
    evt.target.setCustomValidity(selectedDestination ? '' : 'Please choose a destination from the list');

    // Avoid losing destination after datepicker-triggered rerenders before blur/change fires.
    this._setState({
      destination: selectedDestination ? selectedDestination.id : null,
      destinationName: evt.target.value,
    });
  };

  #offerChangeHandler = (evt) => {
    const offerId = evt.target.name.replace('event-offer-', '');
    const offers = [...this._state.offers];

    if (evt.target.checked) {
      offers.push(offerId);
    } else {
      const offerIndex = offers.indexOf(offerId);
      if (offerIndex !== -1) {
        offers.splice(offerIndex, 1);
      }
    }

    this.updateElement({offers});
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(this.#parseStateToPoint());
  };

  #priceChangeHandler = (evt) => {
    const numericValue = Number(evt.target.value);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      evt.target.setCustomValidity('Price should be a positive number');
      evt.target.reportValidity();
      return;
    }

    evt.target.setCustomValidity('');

    this._setState({
      basePrice: numericValue,
    });
  };

  #isFormValid() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    const priceInput = this.element.querySelector('.event__input--price');

    const selectedDestination = findDestinationByName(this.#pointDestinations, destinationInput.value);
    destinationInput.setCustomValidity(selectedDestination ? '' : 'Please choose a destination from the list');

    const isDestinationValid = destinationInput.reportValidity();
    const isPriceValid = priceInput.reportValidity();

    return isDestinationValid && isPriceValid;
  }

  #parseStateToPoint() {
    const point = structuredClone(this._state);

    delete point.isDisabled;
    delete point.submitButtonText;
    delete point.resetButtonText;
    delete point.destinationName;

    return {
      ...point,
      basePrice: Number(point.basePrice),
    };
  }

  #setDatepickers() {
    const startTimeInput = this.element.querySelector('#event-start-time-1');
    const endTimeInput = this.element.querySelector('#event-end-time-1');

    this.#startDatepicker = flatpickr(startTimeInput, {
      dateFormat: FLATPICKR_DATE_FORMAT,
      enableTime: true,
      'time_24hr': true,
      defaultDate: this._state.dateFrom ? dayjs(this._state.dateFrom).toDate() : undefined,
      maxDate: this._state.dateTo ? dayjs(this._state.dateTo).toDate() : null,
      onChange: ([selectedDate]) => {
        this._setState({
          dateFrom: selectedDate ? selectedDate.toISOString() : null,
        });

        this.#endDatepicker?.set('minDate', selectedDate ?? null);
      },
    });

    this.#endDatepicker = flatpickr(endTimeInput, {
      dateFormat: FLATPICKR_DATE_FORMAT,
      enableTime: true,
      'time_24hr': true,
      defaultDate: this._state.dateTo ? dayjs(this._state.dateTo).toDate() : undefined,
      minDate: this._state.dateFrom ? dayjs(this._state.dateFrom).toDate() : null,
      onChange: ([selectedDate]) => {
        this._setState({
          dateTo: selectedDate ? selectedDate.toISOString() : null,
        });

        this.#startDatepicker?.set('maxDate', selectedDate ?? null);
      },
    });
  }

  #destroyDatepickers() {
    this.#startDatepicker?.destroy();
    this.#endDatepicker?.destroy();
    this.#startDatepicker = null;
    this.#endDatepicker = null;
  }
}

export {createBlankPoint};
