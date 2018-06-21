/**
 * Activityfeed.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        activityType: {
            type: 'string',
        },

        message: {
            type: 'string'
        },
        timeStamp: {
            type: 'ref',
            columnType: 'date'
        },

        commentMessage: {
            type: 'string'
        },
        rating: {
            type: 'number',
            defaultsTo: undefined
        },
        //associations
        ownerId: {
            model: 'user'
        },
        prototypeRefId: {
            model: 'prototypes',
        },
        playlistRefId: {
            model: 'playlist',
        },
        userId: {
            model: 'user'
        },
        followerId: {
            model: 'user'
        }
    },

};