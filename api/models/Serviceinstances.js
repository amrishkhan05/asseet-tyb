/**
 * Serviceinstances.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {


    assignedto: {
      type: 'string',
      required: false
    },
    provision_date_from: {
      type: 'ref',
      columnType: 'Date',
      required: false
    },
    provision_date_to: {
      type: 'ref',
      columnType: 'Date',
      required: false
    },
    OperatingSystemField: { 
      type: 'string',
      required: false 
    },
    PrototypePlatformField: { 
      type: 'string', 
      required: false 
    },
    DurationNeededField: { 
      type: 'string', 
      required: false 
    },

    //associations
    services_id: {
      model: 'service'
    },
    user_id: {
      model: 'user'
    },
    instance_id: {
      model: 'instances'
    }

  },

};