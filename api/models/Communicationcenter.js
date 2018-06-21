/**
 * Communicationcenter.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: { type: 'string', required: false },
    message: { type: 'string', required: false },
    timestamp:{type: 'ref', required:false , columnType: 'date'},
    opportunities:{
      model:'opportunity'
    }
  },

};

