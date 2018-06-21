/**
 * PrototypesController
 *
 * @description :: Server-side logic for managing prototypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require("request");
var qs = require('querystring');
const nodemailer = require('nodemailer');
var schedule = require('node-schedule');
const moment = require('moment');
var j = schedule.scheduleJob({
    hour: 23,
    minute: 55,
    dayOfWeek: 0
}, function() {
    Prototypes.find({}).then((allProto) => {
            var likeData = [];
            var shareData = [];
            var viewData = [];
            var previewData = [];
            var likeCount = 0;
            var shareCount = 0;
            var previewCount = 0;
            var viewCount = 0;
            allProto.forEach((proto) => {
                console.log("----------------------proto---------------", proto)
                likeData = proto.graphLikesData;
                shareData = proto.graphShareData;
                viewData = proto.graphViewsData;
                previewData = proto.graphPreviewData;
                proto.graphViewsData.forEach((pro) => {
                    likeCount = pro.data + likeCount;
                })
                likeCount = proto.likesCount - likeCount;
                proto.graphShareData.forEach((pro) => {
                    shareCount = pro.data + shareCount;
                })
                shareCount = proto.shareCount - shareCount;
                proto.graphViewsData.forEach((pro) => {
                    viewCount = pro.data + viewCount;
                })
                viewCount = proto.viewsCount - viewCount;
                proto.graphPreviewData.forEach((pro) => {
                    previewCount = pro.data + previewCount;
                })
                previewCount = proto.previewCount - previewCount;
                likeData.push({
                    "data": likeCount,
                    "date": moment().format("MMM D")
                });
                shareData.push({
                    "data": shareCount,
                    "date": moment().format("MMM D")
                });
                viewData.push({
                    "data": viewCount,
                    "date": moment().format("MMM D")
                });
                previewData.push({
                    "data": previewCount,
                    "date": moment().format("MMM D")
                });
                console.log("==============", viewData);
                async function updateViewProto() {
                    var updatedViewProto = await Prototypes.update({
                        id: proto.id
                    }).set({
                        graphViewsData: viewData
                    }).fetch();
                    return updatedViewProto;
                }
                updateViewProto()
                    .then((updatedViewProto) => {
                        console.log("fgjhgjh===", updatedViewProto)
                        async function updateLikeProto() {
                            var updatedLikeProto = await Prototypes.update({
                                id: proto.id
                            }).set({
                                graphLikesData: likeData
                            }).fetch();
                            return updatedLikeProto;
                        }
                        updateLikeProto()
                            .then((updatedLikeProto) => {
                                async function updateShareProto() {
                                    var updatedShareProto = await Prototypes.update({
                                        id: proto.id
                                    }).set({
                                        graphShareData: shareData
                                    });
                                    return updatedShareProto;
                                }
                                updateShareProto()
                                    .then((updatedShareProto) => {
                                        async function updatePreviewProto() {
                                            var updatedShareProto = await Prototypes.update({
                                                id: proto.id
                                            }).set({
                                                graphPreviewData: previewData
                                            });
                                            return updatedShareProto;
                                        }
                                        updatePreviewProto()
                                            .then((updatedShareProto) => {
                                                // async function updateLikesCount() {
                                                //     var updatedLikesCount = await Prototypes.update({ id: proto.id }).set({ likesCount: 0 }).fetch();
                                                //     return updatedLikesCount;
                                                // }
                                                // updateLikesCount()
                                                //     .then((updatedLikesCount) => {
                                                //         async function uniqueViewsCount() {
                                                //             var updateViewsCount = await Prototypes.update({ id: proto.id }).set({ uniqueViewsCount: 0 }).fetch();
                                                //             return updateViewsCount;
                                                //         }
                                                //         uniqueViewsCount()
                                                //             .then((updateViewsCount) => {
                                                //                 async function uniqueShareCount() {
                                                //                     var updateShareCount = await Prototypes.update({ id: proto.id }).set({ shareCount: 0 }).fetch();
                                                //                     return updateShareCount;
                                                //                 }
                                                //                 uniqueViewsCount()
                                                //                     .then((updateShareCount) => {

                                                //                     })
                                                //                     .catch((error) => {
                                                //                         console.log(error)
                                                //                     })
                                                //             })
                                                //             .catch((error) => {
                                                //                 console.log(error)
                                                //             })
                                                //     })
                                                //     .catch((error) => {
                                                //         console.log(error)
                                                //     })
                                            })
                                            .catch((error) => {
                                                console.log(error)
                                            })

                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })
                            })
                            .catch((error) => {
                                console.log(error)
                            })




                    })
                    .catch((error) => {
                        console.log(error)
                    })


            })
        })
        .catch((err) => {
            console.log(err);
        })
    console.log('The world is going to end today.');
});

function sendEmail(mailOptions) {
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: {
                rejectUnauthorized: false
            }
        });
        transporter.sendMail(mailOptions, (error, info) => {
            sails.log('mail is sent');
            if (error) {
                return sails.log(error);
            }
            sails.log('Message sent: %s', info.messageId);
            sails.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
}
module.exports = {

    generateToken: function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var token = req.body.token;
        if (req.body.token === undefined) {
            var credentials = {
                username,
                password
            };
            request({
                url: "http://ec2-34-201-9-173.compute-1.amazonaws.com:8080/guacamole/api/tokens",
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: qs.stringify(credentials)
            }, function(error, response, body) {
                var data = JSON.parse(body);
                token = data.authToken;
                res.json(token);
            })

        } else {
            res.json(token);
        }
    },

    similarprototypes: function(req, res) {
        var resdata = req.body.fileName;
        var currentProto = req.body.currentFile;
        var filteredValue;
        Prototypes.find(function(err, prototypes) {
            if (currentProto.toLowerCase() == 'all categories') {
                filteredValue = prototypes.filter(function(el) {
                    return el.prototype_id !== resdata
                });
            } else {
                filteredValue = prototypes.filter(function(el) {
                    if (el.category_name == currentProto) {
                        return el.prototype_id !== resdata;
                    }
                });
            }
            res.json(filteredValue);
            filteredValue = '';
        })
    },


    relateapi: function(req, res) {
        let p_id = req.param('p_id'),
            c_id = req.param('c_id');
        Prototypes.addToCollection(p_id, 'categories', c_id).exec(function(err) {
            if (err) {
                // handle error
            }
        });
    },

    //   prototypes.forEach((el) => {
    //     sails.log(el.accessRestriction)
    //     if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction == null) {
    //         filteredProto.push(el);
    //     }
    // })
    // res.json(filteredProto);


    prototypesFilter: function(req, res) {
        var resdata = req.body.fileName;
        var filteredprotos = [];
        Prototypes.find({
            status: 'Approved'
        }, function(err, prototypes) {
            if (resdata.toLowerCase() == 'all categories') {
                prototypes.forEach((el) => {
                    if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction.length == 0) {
                        sails.log(true)
                        filteredprotos.push(el);
                    }
                })
                sails.log(filteredprotos)
                res.json(filteredprotos);
            } else {
                var logvalue = prototypes.filter(function(el) {
                    return el.category_name == resdata
                });
                res.json(logvalue);
            }
        });
    },

    getFilterPrototypes: function(req, res) {
        var resdata = req.body[0];
        var resdata2 = req.body[1];
        var Query = {
            and: [{
                'status': 'Approved'
            }]
        }

        if (resdata2.length > 0 && resdata2 != "All Categories") {
            Query.and.push({
                category_name: resdata2
            });
        }
        if (resdata.domain.length > 0) {
            Query.and.push({
                Domain: { in: resdata.domain
                }
            });
        }

        if (resdata.Technology.length > 0) {
            Query.and.push({
                Technology: { in: resdata.Technology
                }
            });
        }

        if (resdata.prototype_type.length > 0) {
            Query.and.push({
                prototype_type: { in: resdata.prototype_type
                }
            });
        }

        Prototypes.find(Query, function(err, prototypes) {
            res.json(prototypes);
        });

    },

    searchData: function(req, res) {
        var a = req.body.query;
        var finalarr = [];
        var filteredprotos = [];
        var filteredplaylist = [];
        Categories.find({}, function(err, results) {
            var data = JSON.stringify(results);
            var jsonData = JSON.parse(data);
            var val;
            var searcharr1 = [];
            for (let i in jsonData) {
                var key = jsonData[i].name;
                val = key.toLowerCase().includes(a.toLowerCase());
                if (val) {
                    searcharr1.push(jsonData[i]);
                }
            }
            finalarr.push(searcharr1)
        })
        Prototypes.find({}, function(err, results) {
            var data = JSON.stringify(results);
            var jsonData = JSON.parse(data);
            var val, j;
            var flag = 0;
            var searcharr2 = [];
            var searchfields = ['title', 'Domain', 'Technology', 'prototype_type'];
            if (a === "") {
                finalarr.push(jsonData);
            }

            for (let i = 0; i <= jsonData.length - 1; i++) {
                for (j = 0; j <= searchfields.length - 1; j++) {
                    var keyyer = searchfields[j];
                    if (jsonData[i][keyyer] != undefined) {
                        val = jsonData[i][keyyer].toLowerCase().includes(a.toLowerCase());

                    }
                    if (val) {
                        searcharr2.push(jsonData[i]);
                    }
                }
            }

            finalarr.push(searcharr2);
            finalarr[1].forEach((el) => {
                if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction.length == 0) {
                    sails.log(true)
                    filteredprotos.push(el);
                }
            })
            sails.log(filteredprotos, "ssssssssssssssssssssssssssssssssssssssssssssssss");
            let i = 0;
            //for (i = 0; i < filteredprotos.length;) {
            if (filteredprotos.length === 0) {
                res.json({ filteredprotos, filteredplaylist })
            } else {
                filteredprotos.forEach((proto) => {
                    let j = 0;
                    async function findProto() {
                        var protos = await Prototypes.findOne({ id: proto.id }).populate('playlist')
                        return protos;
                    }
                    findProto().then((prototype) => {
                            i++;
                            if (prototype.playlist.length > 0) {
                                prototype.playlist.forEach((play) => {
                                    async function findPlaylist() {
                                        var playlist = await Playlist.findOne({ id: play.id }).populate('prototypes').populate('userId');
                                        return playlist;
                                    }
                                    findPlaylist()
                                        .then((playlist) => {
                                            j++;
                                            playlist.userId.forEach((user) => {
                                                console.log(user.email, "vairu vali", req.body.curuser);
                                                if (user.email == req.body.curuser) {
                                                    flag++;

                                                }
                                                if (flag > 0) {
                                                    filteredplaylist.push(playlist);
                                                    flag = 0;
                                                    // console.log('play1', filteredplaylist)
                                                    // console.log('play', filteredplaylist)
                                                    // console.log(i, 'i value')

                                                    // console.log(i, 'i value', filteredprotos.length)
                                                    // console.log(j, 'j value', prototype.playlist.length)
                                                    console.log(i, 'i value', j)


                                                }
                                                if (i === (filteredprotos.length) && j === (prototype.playlist.length)) {
                                                    console.log(i, 'i value', j)
                                                    res.json({ filteredprotos, filteredplaylist })
                                                }
                                            })



                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        })

                                })
                            } else {
                                if (i === (filteredprotos.length) && j === (prototype.playlist.length)) {
                                    console.log(i, 'i value')
                                    res.json({ filteredprotos, filteredplaylist })
                                }
                            }



                        })
                        .catch((error) => {
                            console.log(error);
                        })
                })
            }



            //}



            //   finalarr = [];
            //   filteredprotos = [];
            //   filteredplaylist = [];
        })

    },

    prototypesSearch: function(req, res) {
        var resdata = req.body.query;
        var resultArr = [];
        var filteredprotos = [];
        var logvalue;
        Categories.find(function(err, categories) {
            resultArr.push(categories);
        })
        if (req.body.userGroup === 'SUPERADMIN') {
            Prototypes.find(function(err, prototypes) {
                if (resdata.toLowerCase() == 'all categories') {
                    logvalue = prototypes;
                } else {
                    logvalue = prototypes.filter(function(el) {
                        return el.category_name == resdata
                    });
                }

                resultArr.push(logvalue);
                resultArr[1].forEach((el) => {

                    if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction.length == 0) {
                        sails.log(true)
                        filteredprotos.push(el);
                    }
                })
                sails.log(filteredprotos, "----------------------------------------");
                res.json({ filteredprotos });
                resultArr = [];
            })
        } else {
            Prototypes.find({
                    status: 'Approved'
                }, function(err, prototypes) {
                    if (resdata.toLowerCase() == 'all categories') {
                        logvalue = prototypes;
                        logvalue.forEach((el) => {

                            if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction.length == 0) {
                                sails.log(true)
                                filteredprotos.push(el);
                            }
                        })
                        sails.log(filteredprotos, "----------------------------------------");
                    } else {
                        logvalue = prototypes.filter(function(el) {
                            return el.category_name == resdata
                        });
                        logvalue.forEach((el) => {

                            if (el.accessRestriction.includes(req.body.curuser) || el.accessRestriction.length == 0) {
                                sails.log(true)
                                filteredprotos.push(el);
                            }
                        })
                        sails.log(filteredprotos, "----------------------------------------");
                    }

                    resultArr.push(logvalue);
                    res.json({ filteredprotos });

                    resultArr = [];
                })
                //}

        }

    },

    loadPendingPrototypes: function(req, res) {
        var resdata = req.body.fileName;
        var newProtocontent;
        Prototypes.find({
            'or': [{
                status: 'Pending'
            }, {
                status: 'ReSubmit'
            }]
        }, function(err, prototypes) {
            newProtocontent = prototypes.filter(function(el) {
                if (el.user_id != null) {
                    //   console.log("element",el);
                    return el
                }


            })
            res.json(newProtocontent)
            newProtocontent = '';
        });
    },
    editPrototype: (req, res, next) => {
        var id = req.body.query;
        Prototypes.findOne({
                id: id
            }).populate('user_id')
            .then((prototypes) => {
                res.json(prototypes);

            })
            .catch(error => {
                console.log(error)
            })
    },

    loadApprovedPrototypes: function(req, res) {
        // var resdata = req.body.fileName;
        var newProtocontent;
        Prototypes.find({
            status: 'Approved'

        }, function(err, prototypes) {
            newProtocontent = prototypes;
            res.json(newProtocontent)
            newProtocontent = '';
        });
    },
    approvePrototype: (req, res) => {
        async function approvethePrototype() {
            var approvedPrototype = await Prototypes.update({
                    id: req.params.id
                })
                .set({
                    view: req.body.view,
                    status: 'Approved',
                    approvedDate: req.body.approvedDate,
                }).fetch();
            console.log()
            return approvedPrototype;
        }
        approvethePrototype().then((proto) => {
            console.log('protot', proto[0].user_id)
            var protoUploadRewardPoints = 500 + req.body.rewardPoints;
            console.log("add pts", req.body.rewardPoints)
            async function updateUser() {
                var updatedUser = await User.update({
                        "email": req.body.approvedUser
                    })
                    .set({
                        'totalPoints': protoUploadRewardPoints
                    }).fetch();
                return updatedUser;
            }
            updateUser()
                .then((user) => {
                    console.log(user);
                    let newRewards = {
                        userId: req.body.id,
                        points: 500,
                        type: 'prototypeUpload',
                        count: 0,
                        prototypeId: req.params.id
                    };
                    async function rewards() {
                        createRewards = await Rewards.create(newRewards).fetch();
                        return createRewards;
                    }
                    rewards().then((response) => {
                            // res.json({
                            //     name: user[0].name,
                            //     email: user[0].email,
                            //     department: user[0].department,
                            //     id: user[0].id,
                            //     ldap: user[0].ldap,
                            //     userGroup: user[0].userGroup,
                            //     admin: 'false',
                            //     firstlogin: false,
                            //     rewardPoints: user[0].totalPoints
                            // });
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                })
                .catch((err) => {
                    console.log(err)
                })
            let mailOptions = {
                from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                to: req.body.approvedUser, // list of receivers
                subject: 'Your Prototype is Approved..!!', // Subject line
                text: '', // plain text body
                html: "Hi " + (req.body.approvedUser) + ",<br><p>Your Prototype is Approved..!!</p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
            };
            sendEmail(mailOptions);
            sails.log('approve Prototype proto', proto)
            res.json(proto);
        })

        .catch((error) => {
            sails.log('updated proto error', error)
            res.json(error)
        })

    },
    rejectPrototype: (req, res) => {
        sails.log("---------------------------------------------rejectPrototype-------------------------")

        async function rejectThePrototype() {
            var rejectedPrototype = await Prototypes.update({
                    id: req.params.id
                })
                .set({
                    status: req.body.status,
                    rejectFeedback: req.body.rejectComment
                }).fetch();
            return rejectedPrototype;
        }
        rejectThePrototype().then((proto) => {
                let mailOptions = {
                    from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                    to: req.body.rejectedUser, // list of receivers
                    subject: 'Your Prototype is Rejected..!!', // Subject line
                    text: '', // plain text body
                    html: "Hi " + (req.body.rejectedUser) + ",<br><p>Your request has been rejected for below mentioned reasons.</p><br><p>" + (req.body.rejectComment) + "</p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                };
                sendEmail(mailOptions);
                sails.log('approve Prototype proto', proto)
                res.json(proto);
            })
            .catch((error) => {
                sails.log('updated proto error', error)
                res.json(error)
            })

    },
    changeApprovedViewStatus: (req, res, next) => {
        async function changeApprovedView() {
            var changeview = await Prototypes.update({
                id: req.params.id
            }).set({
                view: req.body.view
            }).fetch();
            return changeview;
        }
        changeApprovedView().then((data) => {
            res.json(data)
        }).catch((error) => {
            res.json(error)
        })
    },
    getReview: (req, res) => {
        // console.log("wrokd",req.body.prototypeID);
        Prototypes.find({
            id: req.body.prototypeID
        }, function(err, prototypes) {
            if (err) {
                console.log(err)
                    // res.json(prototypes);
            } else {

                res.json(prototypes);
            }
        });
    },

    avgRatingStore: (req, res) => {
        console.log("working");
        console.log(req.body.id, req.body.avgrating);
        async function updatePrototype() {
            var updatedPrototype = await Prototypes.update({
                id: req.body.id
            }).set({
                rating: req.body.avgrating
            })
            return updatedPrototype;
        }
        updatePrototype()
            .then((updatedPrototype) => {
                res.json(updatedPrototype)
            })
            .catch((err) => {
                console.log(err);
            })

    },

    ratePopup: (req, res, next) => {
        console.log("works");
        // User.find({ "email": req.body.mail})
        // .then((user)=>{
        //  User.
        // })
        // .catch(()=>{

        // })

        // User.findOneAndUpdate({
        //         "email": req.body.mail
        //     }, {
        //         $push: {
        //             rateReview: req.body.id
        //         }
        //     }, { new: true },
        //     function(err, results) {
        //         if (err) {
        //             console.log(err)
        //         } else {
        //             res.json(results);
        //         }
        //     }
        // );
    },

    storeRating: (req, res) => {
        var userObj;
        User.findOne({ id: req.body.userId }).populate('followers').then((user) => {
            var followers = user.followers;
            console.log("checkfollow", followers);
            followers.forEach((follower) => {
                if (follower.peopleEvent) {
                    if (req.body.userrating !== 0) {
                        const activity = {
                            activityType: 'Rate Event',
                            prototypeRefId: req.body.id,
                            userId: req.body.userId,
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
                    if (req.body.comment !== '') {
                        const activity = {
                            activityType: 'Comment Event',
                            prototypeRefId: req.body.id,
                            userId: req.body.userId,
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
                }
            })

        }).catch((error) => {
            console.log("saavu", error)
        })
        req.body.oldReview.push({
            'username': req.body.username,
            'userrating': req.body.userrating,
            'date': req.body.date,
            'comment': req.body.comment,
            'ProfilePicUrl': "./assets/images/profile-image.png"
        })
        async function updatePrototype() {
            var updatedPrototype = await Prototypes.update({
                    "id": req.body.id
                })
                .set({
                    review: req.body.oldReview
                })
                .fetch()
            return updatedPrototype;
        }


        updatePrototype().then((results) => {
                var starCount = 0;

                function search(nameKey, myArray) {
                    for (var i = 0; i < myArray.length; i++) {
                        if (myArray[i].userrating === nameKey) {
                            starCount++;
                            if (i == myArray.length - 1) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                if (req.body.userrating == 5 && results[0].user_id != null) {
                    User.findOne({
                            id: results[0].user_id
                        })
                        .then(data => {
                            var protoUploadRewardPoints = 10 + data.totalPoints;
                            async function updateUser() {
                                var updatedUser = await User.update({
                                        "id": results[0].user_id
                                    })
                                    .set({
                                        'totalPoints': protoUploadRewardPoints
                                    }).fetch();
                                return updatedUser;
                            }
                            updateUser().then(users => {
                                    console.log(users[0].totalPoints);
                                })
                                .catch(error => {
                                    console.log(error)
                                })
                        })
                        .catch(error => {
                            console.log(error)
                        })

                    if (search(5, results[0].review) || req.body.userrating == 5) {
                        console.log('starcount', starCount);
                        if (starCount === 1) {
                            let newRewards = {
                                userId: results[0].user_id,
                                points: 10,
                                type: 'Rating',
                                count: starCount,
                                prototypeId: results[0].id
                            }
                            async function createRewards() {
                                var RewardsCreated = await Rewards.create(newRewards).fetch()
                            }
                            createRewards().then((response) => {
                                    starCount = 0;
                                    console.log("Rewards Created");
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        } else {
                            console.log("star-->", starCount)
                            async function updateRewards() {
                                var updatedRewards = await Rewards.update({
                                    and: [{
                                        prototypeId: results[0].id
                                    }, {
                                        userId: results[0].user_id
                                    }, {
                                        type: 'Rating'
                                    }]
                                }).set({
                                    count: starCount
                                }).fetch();
                                return updatedRewards;
                            }
                            updateRewards()
                                .then((updatedRewards) => {
                                    starCount = 0;
                                    console.log("Star Count", updatedRewards);
                                })
                                .catch((error) => {
                                    console.log("error", error);
                                })

                        }
                        // })
                        // .catch((error)=>{
                        //     console.log("error",error);
                        // })


                    }
                }
                if (results[0].user_id != null) {
                    console.log('one')
                    User.findOne({
                            id: (results[0].user_id)
                        })
                        .then((user) => {
                            console.log(user);
                            let activity;
                            async function createActivityFeed() {
                                var newFeed = await Activityfeed.create(activity).fetch()
                                return newFeed;
                            }
                            if (req.body.userrating !== '' && user.rating) {
                                console.log('two')
                                activity = {
                                    activityType: 'Rating',
                                    prototypeRefId: results[0].id,
                                    message: req.body.username + ' rated your prototype ',
                                    userId: req.body.userId,
                                    ownerId: results[0].user_id,
                                    timeStamp: new Date(),
                                    rating: req.body.userrating
                                }

                                createActivityFeed().then((activityFeed) => {}).catch((error) => {
                                    console.log(error);
                                })
                            }
                            if (req.body.comment !== '' && user.comment) {
                                console.log('three')
                                activity = {
                                    activityType: 'Comment',
                                    prototypeRefId: results[0].id,
                                    message: req.body.username + ' commented on your prototype ',
                                    userId: req.body.userId,
                                    ownerId: results[0].user_id,
                                    timeStamp: new Date(),
                                    commentMessage: req.body.comment
                                }
                                createActivityFeed().then((activityFeed) => {
                                    res.json(results[0]);
                                }).catch((error) => {
                                    console.log(error);
                                })
                            } else {
                                res.json(results[0]);
                            }
                        })
                        .catch((userFindError) => {
                            console.log(userFindError)
                        })
                } else {
                    res.json(results[0]);
                }
            })
            .catch((error) => {
                console.log(error)
            })
            // Prototypes.findOneAndUpdate({
            //         "prototype_id": req.body.id
            //     }, {
            //         push: {
            //             review: { username: req.body.username, userrating: req.body.userrating, date: req.body.date, comment: req.body.comment, ProfilePicUrl: "./assets/images/profile-image.png" }
            //         }
            //     }, { new: true },
            //     function(err, results) {
            // if (err) {
            //     console.log(err)
            // } else {

    },
    //     }
    // );

    // console.log("query", req.body.comment)
    // async function updatePrototype() {
    //   var updatedPrototype = await Prototypes.update({
    //     id: req.body.id
    //   }).set({
    //     rating: req.body.avgrating
    //   })
    //   return updatedPrototype;
    // }
    // Prototypes.findOne({
    //   id: req.body.id
    // }).then((proto) => {
    //   proto.review.push({
    //       username: req.body.username,
    //       userrating: req.body.userrating,
    //       date: req.body.date,
    //       comment: req.body.comment,
    //       ProfilePicUrl: "./assets/images/profile-image.png"
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     })
    // })



    // Prototypes.update({
    //     id: req.body.id
    //   }, {
    //     push: {
    //       review: { username: req.body.username, userrating: req.body.userrating, date: req.body.date, comment: req.body.comment, ProfilePicUrl: "./assets/images/profile-image.png" }
    //     }
    //   }, { new: true },
    //   function(err, results) {
    //     if (err) {
    //       console.log(err)
    //     } else {
    //       res.json(results);
    //     }
    //   }
    // );



    updateViewCount: (req, res) => {
        async function findProto() {
            var foundProto = Prototypes.findOne({ id: req.params.id });
            return foundProto;
        }
        findProto()
            .then((proto) => {
                var totalViews = proto.uniqueViewsCount + 1;
                async function updateViews() {
                    var viewedProto = Prototypes.update({
                        id: req.params.id
                    }).set({
                        uniqueViewsCount: totalViews
                    }).fetch()
                    return viewedProto;
                }
                updateViews()
                    .then((prototype) => {
                        res.json(prototype[0])
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
            .catch(() => {

            })

    },

    getUserDynamicData: (req, res) => {
        console.log("userdynamic called");
        var dynamicData = [];
        async function getLikes() {
            var likedProto = Prototypes.find({
                user_id: req.body.userId
            }).sort('likesCount DESC').limit(1);
            return likedProto;
        }
        getLikes()
            .then((likedProto) => {
                dynamicData = dynamicData.concat(likedProto);
                async function getShare() {
                    var sharedProto = Prototypes.find({
                        user_id: req.body.userId
                    }).sort('shareCount DESC').limit(1);
                    return sharedProto;
                }
                getShare()
                    .then((sharedProto) => {
                        dynamicData = dynamicData.concat(sharedProto);
                        async function getViews() {
                            var viewsProto = Prototypes.find({
                                user_id: req.body.userId
                            }).sort('uniqueViewsCount DESC').limit(1);
                            return viewsProto;
                        }
                        getViews()
                            .then((viewsProto) => {
                                dynamicData = dynamicData.concat(viewsProto);
                                async function getPreviews() {
                                    var previewProto = Prototypes.find({
                                        user_id: req.body.userId
                                    }).sort('previewCount DESC').limit(1);
                                    return previewProto;
                                }
                                getPreviews()
                                    .then((previewProto) => {
                                        dynamicData = dynamicData.concat(previewProto);

                                        res.json(dynamicData);
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            })
            .catch((error) => {
                console.log(error);
            })

    },
    getDynamicData: (req, res) => {
        console.log("dynamic called");
        var dynamicData = [];
        async function getLikes() {
            var likedProto = Prototypes.find({}).sort('likesCount DESC').limit(1);
            return likedProto;
        }
        getLikes()
            .then((likedProto) => {
                dynamicData = dynamicData.concat(likedProto);
                async function getShare() {
                    var sharedProto = Prototypes.find({}).sort('shareCount DESC').limit(1);
                    return sharedProto;
                }
                getShare()
                    .then((sharedProto) => {
                        dynamicData = dynamicData.concat(sharedProto);
                        async function getViews() {
                            var viewsProto = Prototypes.find({}).sort('uniqueViewsCount DESC').limit(1);
                            return viewsProto;
                        }
                        getViews()
                            .then((viewsProto) => {
                                dynamicData = dynamicData.concat(viewsProto);
                                async function getPreviews() {
                                    var previewProto = Prototypes.find({}).sort('previewCount DESC').limit(1);
                                    return previewProto;
                                }
                                getPreviews()
                                    .then((previewProto) => {
                                        dynamicData = dynamicData.concat(previewProto);

                                        res.json(dynamicData);
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })

                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            })
            .catch((error) => {
                console.log(error);
            })

    },

    updatePreviewCount: (req, res) => {
        console.log("------------preview>", req.body.preview);
        var totalViews = req.body.preview + 1
        async function updatePreview() {
            var previewProto = Prototypes.update({
                id: req.params.id
            }).set({
                previewCount: totalViews
            }).fetch()
            return previewProto;
        }
        updatePreview()
            .then((prototype) => {

            })
            .catch((error) => {
                console.log(error)
            })
    }
};
