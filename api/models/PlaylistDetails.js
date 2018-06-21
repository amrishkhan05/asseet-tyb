/**
 * PlaylistDetails.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    prototype_id : { 
      type: 'string', required:true 
    },
    name : { 
      type: 'string',required:true 
    },
    category :{
      type:'string',required:true
    },
    tags :{
      type:'string',required:true
    },
    uploadDate :{
      type:'string',required:true
    },
    rating :{
      type:'string',required:true
    },
    ratingUrl :{
      type:'string',required:true
    },
    accronym :{
      type:'string',required:true
    },
    category_name :{
      type:'string',required:true
    },
    categoryUrl :{
      type:'string',required:true
    },
    app_icon :{
      type:'string',required:true
    },
    popularity :{
      type:'string',required:true
    },
    title :{
      type:'string',required:true
    },
    Domain :{
      type:'string',required:true
    },
    Technology :{
      type:'string',required:true
    },
    shortDescription :{
      type:'string',required:true
    },
    description :{
      type:'string',required:true
    },
    thumbnail_url :{
      type:'string',required:true
    },
    playstore_url :{
      type:'string'
    },
    ios_url :{
      type: 'string'
    },
    platform :{
      type: 'string'
    },
    prototype_type :{
      type:'string',required:true
    },
    screenshots :{
      type:'json',
      columnType: 'array'
    },
    review :{
      type: 'json',
      columnType: 'array'
    },
    user_id :{
      type:'string'
    },
    user_email :{
      type:'string'
    },

  },

};

