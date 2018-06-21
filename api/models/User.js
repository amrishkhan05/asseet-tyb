/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const bcrypt = require('bcrypt');
module.exports = {

    attributes: {

        email: {
            type: 'string',
            unique: true,
            required: true,
        },
        password: {
            type: 'string',
            //minLength: 6,
            required: true,
        },
        admin: {
            type: 'boolean',
            required: false
        },
        ldap: {
            type: 'boolean',
            required: false
        },
        employeeId: {
            type: 'string',
            required: false
        },
        location: {
            type: 'string',
            required: false
        },
        playlist: {
            type: 'json',
            columnType: 'array',
            required: false,
            unique: false
        },
        title: {
            type: 'string',
            required: false
        },
        department: {
            type: 'string',
            required: false
        },

        firstlogin: {
            type: 'boolean',
            required: false,
            defaultsTo: true
        },
        role: {
            type: 'string',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        description_urself: {
            type: 'string',
            required: false
        },
        Interests: {
            type: 'string',
            required: false
        },
        InterestArray: {
            type: 'json',
            columnType: 'array',
            required: false,
            defaultsTo: [],
        },
        skillsArray: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            required: false
        },
        Initial: {
            type: 'string',
            required: false
        },
        userGroup: {
            type: 'string',
            required: true
        },
        user_verification: {
            type: 'boolean',
            required: true
        },
        usertoken: {
            type: 'string',
            required: false
        },
        experience: {
            type: 'number',
            // required: true,
            defaultsTo: 0
        },
        skillScore: {
            type: 'string',
            required: true
        },
        crowdSourcing: {
            type: 'boolean',
            required: false
        },
        enterrole: {
            type: 'string',
            required: false
        },
        crowdsource: {
            type: 'boolean',
            required: false
        },
        displayPicture: {
            type: 'string',
            required: false
        },
        comment: {
            type: 'boolean',
            defaultsTo: false
        },
        like: {
            type: 'boolean',
            defaultsTo: false
        },
        rating: {
            type: 'boolean',
            defaultsTo: false
        },
        featuredPlaylist: {
            type: 'boolean',
            defaultsTo: false
        },

        peopleEvent: {
            type: 'boolean',
            defaultsTo: false
        },

        rateReview: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            required: false
                //unique: false
        },



        assignStartDate: {
            type: 'ref',
            columnType: 'date',
            required: false
        },
        assignEndDate: {
            type: 'ref',
            columnType: 'date',
            required: false
        },
        totalPoints: {
            type: 'number',
            defaultsTo: 0
        },
        Profileprogress: {
            type: 'number',
            defaultsTo: 20
        },
        userStream: {
            type: 'boolean',
            defaultsTo: false
        },
        coreTeam: {
            type: 'boolean',
            defaultsTo: false
        },
        profile: {
            type: 'boolean',
            defaultsTo: false
        },
        skillSet: {
            type: 'boolean',
            defaultsTo: false
        },
        manager: {
            type: 'string'
        },


        //Association
        favorites: {
            collection: 'prototypes',
            via: 'userFavorite'
        },
        services: {
            collection: 'service',
            via: 'user'
        },
        servicesNominated: {
            collection: 'service',
            via: 'nominees'
        },
        assignedServices: {
            collection: 'service',
            via: 'assigned_users'
        },
        serviceInstanceId: {
            collection: 'serviceinstances',
            via: 'user_id'
        },
        enrollments: {
            collection: 'enrollments',
            via: 'user_id',
        },
        playlist: {
            collection: 'playlist',
            via: 'userId'
        },
        ownerFeed: {
            collection: 'activityfeed',
            via: 'ownerId'
        },
        following: {
            collection: 'user'
        },
        followers: {
            collection: 'user'
        },
        rewards: {
            collection: 'rewards',
            via: 'userId'
        },
        userFeed: {
            collection: 'activityfeed',
            via: 'userId'
        },
        savedService: {
            collection: 'service',
            via: 'saved_Resources'
        },
        addedPrototypes: {
            collection: 'prototypes',
            via: 'user_id'
        }



    },

    beforeCreate: function(values, cb) {
        console.log('in before create')

        //       // if(this.isModified('password')) {
        //       //     return next();
        //       // }
        //       //generate salt value
        //       bcrypt.genSalt(10, (err, salt) => {
        //           if(err) {
        //               return (err);
        //           }
        //           //hashing
        //           bcrypt.hash(this.password, salt, (err, hash) => {
        //               if(err) {
        //                   return (err);
        //               }
        //               this.password = hash;
        //               sails.log(this.password);

        //       })

        //           bcrypt.hash(this.confirm, salt, (err, hash) => {
        //             if(err) {
        //                 return (err);
        //             }
        //             this.confirm = hash;

        //       })

        //       });
        // if(!values.password || values.password != values.confirm) {
        //     return next({err : "Passwords doesnot match"})
        // }

        // beforeCreate: function (values, cb) {
        // Hash password
        bcrypt.hash(values.password, 10, function(err, hash) {
            console.log("bc", values);
            if (err) return cb(err);
            values.password = hash;
            bcrypt.hash(values.email, 10, function(err, hash) {
                console.log("bc", values);
                if (err) return cb(err);
                values.usertoken = hash;
                cb();
            });
        });
    },
    // afterUpdate: function(values, cb) {
    //     bcrypt.hash(values.password, 10, function(err, hash) {
    //         if (err) return cb(err);
    //         values.password = hash;
    //         cb();
    //     });
    //     console.log("cdfd",values.password);
    // },
    getUserByUsername: function(email, callback) {
        const query = {
            email: email
        };
        //sails.log(query);
        User.find(query, callback)
    },
    isPasswordMatch: function(plainPassword, hashed, cb) {
        bcrypt.compare(plainPassword, hashed, (err, isMatch) => {
            if (err) {
                return (err);
            }

            cb(null, isMatch);
        })
    },




}


// tokenGenerate : function(req,res) {    
//           // if(this.isModified('password')) {
//           //     return next();
//           // }
//           //generate salt value
//           bcrypt.genSalt(10, (err, salt) => {
//               if(err) {
//                   return next(err);
//               }
//               //hashing
//               bcrypt.hash(this.email, salt, (err, hash) => {
//                   if(err) {
//                       console.log("errror")
//                       return next(err);
//                   }
//                   this.usertoken = hash;

//                   next();
//               })

//           });

// },


//  getUserById : function(id,callback){
//     User.findById(id,callback);
//   },

// addUser : function(newUser , callback){
//       User.create(newUser).exec(function (err , user) {
//           sails.log("usersss",user)
//       });
//   }
// }