import ApiService from '../framework/api-service.js';

const Method = {
  DELETE: 'DELETE',
  POST: 'POST',
  PUT: 'PUT',
};

const adaptPointToClient = (point) => ({
  ...point,
  id: String(point.id),
  basePrice: point.base_price,
  dateFrom: point.date_from,
  dateTo: point.date_to,
  isFavorite: point.is_favorite,
  destination: String(point.destination),
  offers: point.offers.map((offerId) => String(offerId)),
});

const adaptPointToServer = (point, includeId = true) => {
  const adaptedPoint = {
    'base_price': point.basePrice,
    'date_from': point.dateFrom,
    'date_to': point.dateTo,
    'destination': point.destination,
    'is_favorite': point.isFavorite,
    'offers': point.offers,
    'type': point.type,
  };

  if (includeId) {
    adaptedPoint.id = point.id;
  }

  return adaptedPoint;
};

export default class BigTripApiService extends ApiService {
  async points() {
    const response = await this._load({url: 'points'});
    const points = await ApiService.parseResponse(response);

    return points.map((point) => adaptPointToClient(point));
  }

  async destinations() {
    const response = await this._load({url: 'destinations'});
    return ApiService.parseResponse(response);
  }

  async offers() {
    const response = await this._load({url: 'offers'});
    return ApiService.parseResponse(response);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const updatedPoint = await ApiService.parseResponse(response);
    return adaptPointToClient(updatedPoint);
  }

  async createPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(adaptPointToServer(point, false)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const createdPoint = await ApiService.parseResponse(response);
    return adaptPointToClient(createdPoint);
  }

  async deletePoint(point) {
    await this._load({
      url: `points/${point.id}`,
      method: Method.DELETE,
    });
  }
}
