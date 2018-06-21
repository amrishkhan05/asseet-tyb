/**
 * Enrollments.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    service_id: { model: 'service' },
    user_id: { model: 'user' },
    enrollment_date: { type: 'string', required: false },
    role: { type: 'string', required: false }
  },

};