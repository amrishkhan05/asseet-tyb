/**
 * PlaylistController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {


  playlist: (req, res, next) => {
    // console.log("123", req.body);
    async function findUser() {
      var foundUser = await User.findOne({
          id: req.body.user
        })
        .populate('playlist')
      return foundUser;
    }
    findUser()
      .then((result) => {
        // console.log("345", result);
        res.json(result);
      })
      .catch((err) => {
        console.log(err)
      })
      // Playlist.find({
      //   userId: req.body.user
      // }, (err, data) => {
      //   if (err) {
      //     console.log(err)
      //   } else {
      //     res.json(data);
      //   }
      // });
  },


  createPlaylist: function(req, res, next) {
    // console.log(req.body, 'req');
    Playlist.find({
      name: req.body.playlistName

    }, (err, response) => {
      if (err) {
        console.log(err)
      } else {
        console.log(response[0], 'response')
        if (response[0] === undefined) {
          sails.log("In else part")

          const playlist = {
            name: req.body.playlistName,
            userId: req.body.userId,
            uploadDate: req.body.uploadDate,
            vipPlaylist: req.body.vipPlaylist,
            comments: req.body.comments,
            Requestername: req.body.userName,
            playlistDescription: req.body.playlistDescription,
            req_id: req.body.request_id,
            dueDate: req.body.dueDate
          }
          if (req.body.userRole === 'CUSTOMER' && req.body.vipPlaylist) {
            playlist.status = 'Pending'
          }
          async function create() {
            var createdPlaylist = await Playlist.create(playlist).fetch();
            return createdPlaylist;
          }
          create()
            .then((playlist) => {
              // Playlist.find()
              // .populate('Prototypes')
              // .exec(function(err, playlists) {
              // sails.log("cfbch",playlists)
              // });
              sails.log(playlist.id)
              Playlist.addToCollection(playlist.id, 'prototypes', req.body.prototypeId).exec(function(err, data) {
                if (err) {
                  sails.log(err)
                } else {}
              });

              res.json(playlist)
            })
            .catch((error) => {
              res.json(error)
            })

        } else {
          res.json("already added")
        }
      }

    })
  },

  getPlaylist: function(req, res) {
    var playlist = [];
    var id = [];
    var vipPlaylists = [];
    if (req.body.notificationplaylist === 'notification') {
      Playlist.find({
          id: req.body.playlistid
        })
        .sort('id DESC')
        .populate('prototypes')
        .then((playlist) => {
          res.json(playlist)
        })
        .catch((error) => {
          console.log(error);
        })
    } else {
      async function findUser() {
        var foundUser = await User.findOne({
            where: { id: req.body.userId },
          })
          .populate('playlist', { select: ['id'] })
        return foundUser;
      }
      findUser()
        .then((result) => {
          sails.log("result", result)
          async function filterPlaylist() {
            var response = await searchPlaylist();
            console.log("response", response)
            return response
          }

          function searchPlaylist() {
            return new Promise(resolve => {
              for (i = 0; i < result.playlist.length; i++) {
                id.push(result.playlist[i].id)
              }
              Playlist.find({
                  and: [{ 'id': { 'in': id } }]
                })
                .populate('prototypes')
                .sort('id DESC')
                .then((re) => {
                  playlist = playlist.concat(re);
                  Playlist.find({
                      and: [{ status: "Approved" }, { vipPlaylist: true }]
                    })
                    .populate('prototypes')
                    .then((res) => {
                      vipPlaylists = vipPlaylists.concat(res);
                      resolve(playlist, vipPlaylists)
                    })
                })
            })
          }

          filterPlaylist()
            .then((playlists) => {
              res.json({
                playlist,
                vipPlaylists
              })
            })

        })
        .catch((error) => {
          console.log(error);
        })

    }

  },

  deletePlaylist: function(req, res) {
    Playlist.destroy({
      id: req.params.id
    }, function(err, result) {
      if (err) {
        res.json(err);
      } else {
        res.json({
          status: 'ok'
        })
      };

    });
  },

  updatePlaylist: function(req, res, next) {
    var len = 0;
    // console.log(req.body.playlistId, req.body.id, "asdasdfasdfasdfsadf=-====");
    Playlist.findOne({
        where: { "id": req.body.playlistId },
      })
      .populate('prototypes', { select: ['id'] })
      .then((data) => {
        // console.log(req.body,"req.body")
        var playlistData = data.prototypes;
        playlistData.forEach((playdata) => {
          if (req.body.id == playdata.id) {
            len = 1;
            res.json("already added")
          }
        })
        if (len != 1) {

          async function updatePlaylist() {
            var updatedPlaylist = await Playlist.addToCollection(req.body.playlistId, 'prototypes', req.body.id)

            return updatedPlaylist;
          }
          updatePlaylist()
            .then((updatedPlaylist) => {
              // Playlist.findOne({ "id": req.body.playlistId })
              // .populate('prototypes',{ select: ['id'] })
              //   .then((response) => {
              var protoId = []
                // response.prototypes.forEach((resp) => {
                //     protoId.push(resp.id);
                //   })
                // console.log("res", data)
                // console.log()
              if (data.vipPlaylist) {
                // console.log("here")
                Prototypes.findOne({ id: req.body.id })
                  .then((prototype) => {
                    // prototypes.forEach(prototype => {
                    //   itemsProcessed++;
                    User.findOne({ id: prototype.user_id })
                      .then((user) => {
                        if (user.featuredPlaylist) {
                          const activity = {
                            activityType: 'Playlist',
                            prototypeRefId: prototype.id,
                            playlistRefId: req.body.playlistId,
                            userId: req.body.userId,
                            ownerId: user.id,
                            timeStamp: new Date(),
                          }
                          async function createActivityFeed() {
                            var createdActivityFeed = await Activityfeed.create(activity).fetch();
                            return createdActivityFeed;
                          }
                          createActivityFeed()
                            .then((activityFeed) => {
                              res.json(data)
                            })
                            .catch((error) => {
                              console.log(error)
                            })

                        } else {
                          res.json(data)
                        }
                      })
                      .catch(error => {
                        console.log(error)
                      })
                  })
                  // })
                  .catch((error) => {
                    console.log(error)
                  })
              } else {
                console.log("there")
                res.json(data)
              }
              // })
              // .catch((error) => {
              //   console.log(error)
              // })
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
      .catch((err) => {
        console.log(err)
      })

  },
  getPlaylistDetails: function(req, res) {
    Playlist.findOne({ 'id': req.params.id })
      .populate('prototypes')
      .exec(function(err, playlists) {
        sails.log("cfbch", playlists)
        res.json(playlists)
      });

  },
  deleteProtoFromPlaylist: function(req, res) {
    Playlist.removeFromCollection(req.params.id, 'prototypes', req.body.prototype_id).exec(function(err, data) {
      if (err) {
        sails.log(err)
      } else {
        Playlist.findOne({ 'id': req.params.id })
          .populate('prototypes')
          .exec(function(err, playlists) {
            sails.log("cfbch", playlists)
            res.json(playlists)
          });
      }
    });
  },

  playlistDescription: (req, res, next) => {
    console.log("req.bodylayljlflghloguiisrghserugs", req.body)
    async function playlistUpdate() {
      var updatedPlaylist = await Playlist.update({
        id: req.body.playlistId
      }).set({
        "playlistDescription": req.body.playlistDescription,
        "vipPlaylist": req.body.vipPlaylist,
        "name": req.body.plname

      }).fetch();
      return updatedPlaylist;
    }
    playlistUpdate().then((updatedPlaylist) => {
      async function statusUpdate() {
        var statusUpdatedPlaylist = await Playlist.update({
          id: req.body.playlistId
        }).set({
          'status': 'Pending',
          'Requestername': req.body.requesterName
        }).fetch();
        return statusUpdatedPlaylist;
      }
      if (req.body.vipPlaylist && req.body.userGroup != 'SUPERADMIN') {
        statusUpdate().then((response) => {
            sails.log(response)
          })
          .catch((error) => {
            sails.log(error)
          })
      }
      Playlist.findOne({
          id: req.body.playlistId
        }).then((results) => {
          res.json(results)
        })
        .catch((err) => {
          console.log(err)

        })


    }).catch((err) => {
      console.log(err)

    })



  },
  approvePlaylist: (req, res, next) => {
    async function playlistUpdate() {
      var updatedPlaylist = await Playlist.update({
          id: req.params.id
        }).set({
          "status": 'Approved'
        })
        .fetch();
      return updatedPlaylist;
    }
    playlistUpdate().then((results) => {
        console.log("lllllllllllll")
        Playlist.findOne({ id: req.params.id }).populate('userId').populate('prototypes')
          .then((playlistData) => {
            console.log(playlistData, 'data')
            var users = playlistData.userId;
            var user_id;
            var itemsProcessed = 0
            var prototypes = playlistData.prototypes;
            users.forEach((user) => {
              itemsProcessed++
              if (playlistData.Requestername.includes('@') && user.email === playlistData.Requestername) {
                user_id = user.id;
              } else if (user.name === playlistData.Requestername) {
                user_id = user.id;
              }
              if (itemsProcessed === users.length) {
                User.findOne({ id: user_id }).populate('followers').then((user) => {
                  var followers = user.followers;
                  console.log("checkfollow", followers);
                  followers.forEach((follower) => {
                    if (follower.peopleEvent) {
                      const activity = {
                        activityType: 'Feature Playlist Event',
                        playlistRefId: req.params.id,
                        userId: user_id,
                        ownerId: follower.id,
                        timeStamp: new Date(),
                      }
                      async function createActivityFeed() {
                        var createdActivityFeed = await Activityfeed.create(activity).fetch();
                        return createdActivityFeed;
                      }
                      createActivityFeed().then((activityFeed) => {

                        })
                        .catch((error) => {
                          console.log()
                        })
                    }
                  })

                }).catch((error) => {
                  console.log("saavu", error)
                })

                if (playlistData.vipPlaylist) {
                  var prototypesProcessed = 0
                  if (prototypes.length === 0) {
                    res.json(results)
                  }
                  prototypes.forEach(prototype => {
                    prototypesProcessed++;
                    if (prototype.user_id !== null) {
                      User.findOne({
                          id: prototype.user_id
                        })
                        .then((user) => {
                          if (user.featuredPlaylist) {
                            const activity = {
                              activityType: 'Playlist',
                              prototypeRefId: prototype.id,
                              playlistRefId: req.params.id,
                              userId: user_id,
                              ownerId: user.id,
                              timeStamp: new Date(),
                            }
                            async function createActivityFeed() {
                              var createdActivityFeed = await Activityfeed.create(activity).fetch();
                              return createdActivityFeed;
                            }
                            createActivityFeed().then((activityFeed) => {
                                if (prototypesProcessed === prototypes.length)
                                  res.json(results)
                              })
                              .catch((error) => {
                                console.log()
                              })

                          } else {
                            if (prototypesProcessed === prototypes.length)
                              res.json(results)
                          }
                        })
                        .catch(error => {
                          console.log(error)
                        })
                    } else {
                      if (prototypesProcessed === prototypes.length)
                        res.json(results)
                    }
                  })
                }
              }
            });
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        console.log(err)
      })

  },
  rejectPlaylist: (req, res, next) => {
    async function playlistUpdate() {
      var updatedPlaylist = await Playlist.update({
        id: req.params.id
      }).set({

        "status": 'Rejected'
      }).fetch();
      return updatedPlaylist;
    }
    playlistUpdate().then((results) => {
        res.json(results);
      })
      .catch((err) => {
        console.log(err)
      })

  },
  getvipPlaylist: (req, res, next) => {

    Playlist.find({
        id: req.body.playlistId
      })
      // .sort({ '_id': -1 })
      .populate('prototypes')
      .then((playlist) => {
        // Playlist.find({ vipPlaylist: true })
        console.log("Asdasd", playlist)
        res.json(playlist)
      })
      .catch((error) => {
        console.log("error");
      })
  },
  playlistPrototypes: (req, res, next) => {
    console.log("working", req.params.id);

    // Playlist.find({
    //     _id: ObjectId(req.params.id)
    // }, function(err, playlist) {
    //     console.log("playlist proto",playlist[0].Prototypes);
    //     Prototype.find({
    //         _id:{
    //             $in:playlist[0].Prototypes
    //         } 
    //     }, function(err, Prototype){
    //         console.log("value", Prototype);
    //         res.json(Prototype);
    //     })

    // })
    Playlist.find({
        id: req.params.id
      })
      .populate('prototypes')
      .then((prototypes) => {
        console.log("prototypes");
        res.json(prototypes)
      })
      .catch((error) => {
        res.json(error)
      })
  },

  deletePrototype: (req, res, next) => {
    // console.log("del", req.body.prototype_id);
    Playlist.removeFromCollection(req.params.id, 'prototypes', req.body.prototype_id)
      .then((result) => {
        Playlist.find({
            id: req.params.id
          })
          .populate('prototypes')
          .then((prototypes) => {
            // console.log("newd", prototypes);
            res.json(prototypes)
          })
          .catch((error) => {
            //res.send(400).json(error)
            console.log("error del1", error);
          })
      })
      .catch((error) => {
        //res.send(400).json(error)
        console.log("error del2", error);
      })
  },


  loadPendingPlaylists: (req, res, next) => {
    Playlist.find({
        status: 'Pending'
      })
      .populate('prototypes')
      .populate('userId')
      .then((playlist) => {
        // Playlist.find({ vipPlaylist: true })
        // console.log("Asdasd", playlist)
        res.json(playlist)
      })
      .catch((error) => {
        // console.log(error);
      })
  },

  pushUsers: (req, res, next) => {
    // console.log(req.body, 'asxdasdas');
    // console.log(req.body.array, 'array');
    async function updatePlaylist() {
      var updatedPlaylist = await Playlist.addToCollection(req.body.playlistid, 'userId', req.body.array)
      return updatedPlaylist;
    }
    updatePlaylist()
      .then((results) => {
        // console.log("results :", results)
        res.json(results)
      })
      .catch((err) => {
        console.log(err)
      })

  },
};