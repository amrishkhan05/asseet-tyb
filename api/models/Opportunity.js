/**
 * Opportunity.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    clientname: { type: 'string', required: false },
    opportunity_status: { type: 'string', required: false },
    opportunity_id: { type: 'string', required: false },
    created_date: { type: 'ref', required: false,columnType : 'date' },
    opportunity_owner: { type: 'string', required: false },
    opportunity_description: { type: 'string', required: false },
    assets: { type: 'json', required: false, columnType: 'array' },    
    // opportunity_attachments: { type: 'json', required: false, columnType: 'array'},
    communicationCenter:{
      collection:'communicationcenter',
      via:'opportunities'
    }
  },

};

