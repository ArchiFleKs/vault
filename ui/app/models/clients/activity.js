import Model, { attr } from '@ember-data/model';
// TODO CMB, remember to update
export default class Activity extends Model {
  @attr('array') byMonth;
  @attr('array') byNamespace;
  @attr('object') total;
  @attr('string') startTime;
  @attr('string') endTime;
  @attr('string') responseTimestamp;
}
