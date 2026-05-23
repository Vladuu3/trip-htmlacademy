import {getMockPoints} from '../mock/points.js';
import {mockDestinations} from '../mock/destinations.js';
import {mockOffers} from '../mock/offers.js';

export default class PointsModel {
  points = getMockPoints();
  destinations = mockDestinations;
  offers = mockOffers;

  getPoints() {
    return this.points;
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }

  updatePoint(updatedPoint) {
    this.points = this.points.map((point) => (point.id === updatedPoint.id ? updatedPoint : point));
  }
}
