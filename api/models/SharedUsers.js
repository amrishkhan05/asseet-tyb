/**
 * SharedUsers.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    userGroupName: { type: 'string', required: false },
    emailID: { type: 'json', columnType: 'array', required: false },
    Type: { type: 'string', required: false },
    TypeID: { type: 'string', required: false },
  },

};