/**
 * ActivityFeedController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    getActivityFeed: (req, res, next) => {
        Activityfeed.find({
                ownerId: req.params.id
            })
            .populate('userId')
            .populate('prototypeRefId')
            .populate('playlistRefId')
            .populate('followerId')            

        .then((activityFeed) => {
                res.json(activityFeed)
            })
            .catch((error) => {
                console.log(error)
                res.sendStatus(400).json(error)
            })
    },

};