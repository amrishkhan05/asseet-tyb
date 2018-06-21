/**
 * Playlist.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },
    playlistDescription: { type: 'string', required: false },
    comments: { type: 'string', required: false },
    uploadDate: { type: 'ref', columnType: 'date', required: false },
    vipPlaylist: { type: 'boolean', required: false, defaultsTo: false },
    status: { type: 'string', required: false, defaultsTo: 'Approved' },
    Requestername: { type: 'string', required: false },
    req_id: { type: 'string', required: false },
    dueDate: { type: 'ref', columnType: 'date', required: false },
    approvedDate: { type: 'ref', columnType: 'date', required: false },
    // Prototypes :{
    //   type: 'string', columnType:'array'
    // }
    prototypes: { collection: 'prototypes', via: 'playlist' },
    userId: {
      collection: 'user',
      via: 'playlist'
    },
    activityFeed: {
      collection: 'activityfeed',
      via: 'playlistRefId'
    },
    // Prototypes:{
    //   model: 'prototypes'
    // }
  },


};