/**
 * SharedUsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  savesharedUsers: (req, res, next) => {
    console.log(req.body, 'asxdasdas');
    console.log(req.body.GroupName, 'GroupName');

    const sharedusers = {
      userGroupName: req.body.GroupName,
      emailID: req.body.array,
      Type: req.body.type,
      TypeID: req.body.protoid
    }
    console.log('sahadfad1', sharedusers);
    async function createSharedUser() {
      var createdSharedUser = await SharedUsers.create(sharedusers).fetch();
      return createdSharedUser;

    }
    createSharedUser()
      .then((sharedusers) => {
        console.log('sahadfad', sharedusers);
        var totalCount = req.body.shareCount + 1;
        async function shareProtoCount() {
          var sharedCount = await Prototypes.update({ id: req.body.protoid }).set({ shareCount: totalCount }).fetch();
          return sharedCount;
        }
        shareProtoCount()
          .then((sharedCount) => {
            res.json(sharedusers)
          })
          .catch((err) => {
            console.log('error', err);
          })

      })
      .catch((err) => {
        console.log('error', err);
      })

  },

  shareUsersDL: (req, res, next) => {
    SharedUsers.find(function(err, users) {
      if (err) {
        console.log(err);
        //res.json({msg:'failed to add form'});
      } else {
        // console.log(users, "testetste");
        res.json(users);
      }
    })
  },
  dlnameshare: (req, res, next) => {
    console.log(req.body, 'asxdasdas');
    async function updateSharedUsers() {
      var sharedUsers = await SharedUsers.update({ id: req.body.shareduserID })
        .set({
          userGroupName: req.body.usergroupname
        })
        .fetch()
      return sharedUsers
    }
    updateSharedUsers()
      .then((response) => {
        res.json(response)
      })
      .catch((error) => {
        console.log(error)
        res.sendStatus(400).json(error)
      })
  },
};