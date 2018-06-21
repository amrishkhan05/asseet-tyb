/**
 * Instances.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    url: { type: 'string', required: true },
    flag: { type: 'boolean', required: true },
    instance_type: { type: 'string', required: true },
    operating_system: { type: 'string', required: true },
    serviceInstance: {
      model: 'serviceinstances'
    }
  },

};