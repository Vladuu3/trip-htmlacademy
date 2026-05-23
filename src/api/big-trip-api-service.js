import ApiService from '../framework/api-service.js';

const Method = {
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

const adaptPointToServer = (point) => ({
  'id': point.id,
  'base_price': point.basePrice,
  'date_from': point.dateFrom,
  'date_to': point.dateTo,
  'is_favorite': point.isFavorite,
  'destination': point.destination,
  'offers': point.offers,
  'type': point.type,
});

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
}
