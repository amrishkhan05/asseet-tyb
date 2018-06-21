/**
 * NotificationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    notification: (req, res, next) => {
        Notification.find({})
            .then((notifications) => {
                sails.log("nnnnnnnnnnnnnnnnnn", notifications);
                res.json(notifications);
            })
            .catch((error) => {
                sails.log(error)
            })


    },
    getNotification: (req, res, next) => {
        console.log("noti", req.params.id)
        Notification.find({
            email: req.params.id
        }, function(err, notifications) {
            res.json(notifications);
        })
    },
    notificationView: (req, res, next) => {
        Prototypes.find({
                id: req.params.id
            },
            function(err, results) {
                res.json(results);

            })
    },
    createNotification: (req, res, next) => {
        console.log(req.body, "req.body")
        let newNotificaiton = {
            email: req.body.email,
            ref_id: req.body.ref_id,
            notificationtag: req.body.notificationtag,
            prototypeName: req.body.prototypeName,
            message: req.body.message,
            action: req.body.action,
            status: req.body.status,
            notificationDate: req.body.notificationDate,
            serviceRequest: req.body.serviceRequest,
            timestamp: req.body.timestamp

        }
        async function createNotification() {
            var createdNotification = await Notification.create(newNotificaiton).fetch();
            return createdNotification;
        }
        createNotification()
            .then((notifications) => {
                res.json(notifications);
            })
            .catch((err) => {
                console.log(err);
                return res.send();
                //res.json({msg:'failed to add form'});
            })

    },

    updateNotification: (req, res, next) => {

        if (req.body.action === 'Reject') {
            async function updateNotification() {
                var updatedNotification = Notification.update({
                    "ref_id": req.body.ref_id
                        // "notificationtag":req.body.notificationtag
                }).set({ "status": req.body.status }).fetch();
                return updatedNotification;
                updateNotification()
                    .then(() => {})
                    .catch(() => {})
            }

        } else if (req.body.action === 'Approve') {
            console.log("nnnnn", req.body)
            async function updateNotification() {
                var updatedNotification = Notification.update({
                    "ref_id": req.body.ref_id
                        // "notificationtag":req.body.notificationtag
                }).set({ "status": req.body.status }).fetch();
                return updatedNotification;
                updateNotification()
                    .then(() => {})
                    .catch(() => {})
            }
        } else {
            async function updateNotification() {
                var updatedNotification = Notification.update({
                    id: req.params.id
                        // "notificationtag":req.body.notificationtag
                }).set({
                    "status": req.body.status,
                    "prototypeName": req.body.prototypeName
                }).fetch();
                return updatedNotification;
                updateNotification()
                    .then(() => {})
                    .catch(() => {})
            }
        }
        res.json(req.body.status);
    },

};