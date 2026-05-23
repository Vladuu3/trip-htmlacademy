import {getMockPoints} from '../mock/points.js';
import {mockDestinations} from '../mock/destinations.js';
import {mockOffers} from '../mock/offers.js';
import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  points = getMockPoints();
  destinations = mockDestinations;
  offers = mockOffers;

  constructor() {
    super();
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

  updatePoint(updateType, updatedPoint) {
    this.points = this.points.map((point) => (point.id === updatedPoint.id ? updatedPoint : point));
    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, newPoint) {
    this.points = [newPoint, ...this.points];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, pointToDelete) {
    this.points = this.points.filter((point) => point.id !== pointToDelete.id);
    this._notify(updateType);
  }
}
