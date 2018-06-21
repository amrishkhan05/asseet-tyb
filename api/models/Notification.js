/**
 * Notification.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    email: {
      type: 'string',
      required: false
    },
    ref_id: {
      type: 'string',
      required: false
    },
    notificationtag: {
      type: 'string',
      required: false
    },
    prototypeName: {
      type: 'string',
      required: false
    },
    message: {
      type: 'string',
      required: false
    },
    action: {
      type: 'string',
      required: false
    },
    status: {
      type: 'string',
      required: false
    },
    notificationDate: {
      type: 'ref',
      columnType: 'date',
      required: false
    },
    serviceRequest: {
      type: 'string',
      required: false
    }

  },

};