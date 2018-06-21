/**
 * ShareduserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  savesharedUser: (req, res, next) => {
    console.log(req.body, 'asxdasdas');
    console.log(req.body.GroupName, 'GroupName');

    const shareduser = {
      userGroupName: req.body.GroupName,
      emailID: req.body.array,
      Type: req.body.type,
      TypeID: req.body.protoid
    }
    console.log('sahadfad1', shareduser);
    async function createSharedUser() {
      var createdSharedUser = await Shareduser.create(shareduser).fetch();
      return createdSharedUser;

    }
    createSharedUser()
      .then((sharedusers) => {
        console.log('sahadfad', sharedusers);
        res.json(sharedusers)
      })
      .catch((err) => {
        console.log('error', err);
      })

  },

};