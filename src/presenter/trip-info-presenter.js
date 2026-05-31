import TripInfoView from '../view/trip-info-view.js';
import {render, replace, remove, RenderPosition} from '../framework/render.js';
import dayjs from 'dayjs';
import {UpdateType} from '../const.js';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({container, pointsModel}) {
    this.#container = container;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const points = this.#pointsModel.getPoints().slice();
    const destinations = this.#pointsModel.getDestinations();
    const offers = this.#pointsModel.getOffers();

    if (points.length === 0) {
      remove(this.#tripInfoComponent);
      this.#tripInfoComponent = null;
      return;
    }

    const title = this.#computeRouteTitle(points, destinations);
    const dates = this.#computeDates(points);
    const cost = this.#computeTotalCost(points, offers);

    const prevComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({title, dates, cost});

    if (prevComponent === null) {
      render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevComponent);
    remove(prevComponent);
  }

  #computeRouteTitle(points, destinations) {
    if (!points || points.length === 0) {
      return '';
    }

    const sorted = points.slice().sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    const cities = sorted.map((p) => {
      const dest = destinations.find((d) => String(d.id) === String(p.destination));
      return dest ? dest.name : '';
    }).filter(Boolean);

    if (cities.length <= 3) {
      return cities.join(' — ');
    }

    return `${cities[0]} — ... — ${cities[cities.length - 1]}`;
  }

  #computeDates(points) {
    if (!points || points.length === 0) {
      return '';
    }

    const sorted = points.slice().sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    const start = dayjs(sorted[0].dateFrom);
    const end = dayjs(sorted[sorted.length - 1].dateTo);

    if (start.isSame(end, 'day')) {
      return start.format('D MMM');
    }

    return `${start.format('D MMM')}&nbsp;&mdash;&nbsp;${end.format('D MMM')}`;
  }

  #computeTotalCost(points, offersData) {
    if (!points || points.length === 0) {
      return 0;
    }

    return points.reduce((sum, point) => {
      const base = Number(point.basePrice) || 0;
      const typeOffers = offersData.find((o) => o.type === point.type);
      const offersList = typeOffers ? typeOffers.offers : [];

      const offersSum = (point.offers || [])
        .map((offerId) => offersList.find((of) => String(of.id) === String(offerId)))
        .filter(Boolean)
        .reduce((s, of) => s + (Number(of.price) || 0), 0);

      return sum + base + offersSum;
    }, 0);
  }

  #handleModelEvent = (updateType) => {
    if (updateType === UpdateType.INIT || updateType === UpdateType.MINOR || updateType === UpdateType.MAJOR || updateType === UpdateType.PATCH) {
      this.init();
    }
  };
}
