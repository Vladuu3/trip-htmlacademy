import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class PointsModel extends Observable {
  points = [];
  destinations = [];
  offers = [];
  isLoading = true;
  hasLoadingError = false;
  #apiService = null;

  constructor({apiService}) {
    super();
    this.#apiService = apiService;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiService.points(),
        this.#apiService.destinations(),
        this.#apiService.offers(),
      ]);

      this.points = points;
      this.destinations = destinations;
      this.offers = offers;
      this.hasLoadingError = false;
    } catch {
      this.points = [];
      this.destinations = [];
      this.offers = [];
      this.hasLoadingError = true;
    }

    this.isLoading = false;
    this._notify(UpdateType.INIT);
  }

  getPoints() {
    return this.points;
  }

  setPoints(updateType, points) {
    this.points = [...points];
    this._notify(updateType);
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }

  async updatePoint(updateType, updatedPoint) {
    try {
      const responsePoint = await this.#apiService.updatePoint(updatedPoint);
      const index = this.points.findIndex((point) => point.id === responsePoint.id);

      if (index === -1) {
        throw new Error('Can\'t update unexisting point');
      }

      this.points = [
        ...this.points.slice(0, index),
        responsePoint,
        ...this.points.slice(index + 1),
      ];

      this._notify(updateType, responsePoint);
    } catch {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, newPoint) {
    try {
      const createdPoint = await this.#apiService.createPoint(newPoint);
      this.points = [createdPoint, ...this.points];
      this._notify(updateType, createdPoint);
    } catch {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, pointToDelete) {
    try {
      await this.#apiService.deletePoint(pointToDelete);
      this.points = this.points.filter((point) => point.id !== pointToDelete.id);
      this._notify(updateType);
    } catch {
      throw new Error('Can\'t delete point');
    }
  }
}
