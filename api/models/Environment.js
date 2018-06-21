// /**
//  * Environment.js
//  *
//  * @description :: A model definition.  Represents a database table/collection/etc.
//  * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
//  */

// module.exports = {

//   attributes: {


//     OperatingSystemField: { type: 'string', required: false },
//     PrototypePlatformField: { type: 'string', required: false },
//     InstanceNeededField: { type: 'string', required: false },
//     DurationNeededField: { type: 'string', required: false },

//     //associations
//     serviceInstanceId: {
//       collection: 'serviceinstances',
//       via: 'env_id'
//     },
//     service_id: { model: 'service' },
//     user_id: { model: 'user' },
//   },

// };