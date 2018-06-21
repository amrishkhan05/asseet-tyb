/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const request = require("request");
const qs = require("qs");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const config = require('../../config/database');
const moment = require('moment');
const path = require('path');
const bcrypt = require('bcrypt');
var uploadedDp;
const cred = {
    username: 'guacadmin',
    password: 'guacadmin'
}
var guaData = {};
var pass;

function getguatoken() {
    return new Promise((resolve, reject) => {
        request({
            url: "http://ec2-52-70-168-206.compute-1.amazonaws.com:8080/guacamole/api/tokens",
            method: 'POST',
            header: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: qs.stringify(cred)
        }, (err, response, body) => {
            var data = JSON.parse(body);
            resolve(data);
        });
    });
}

function pwdBcrypt(){

}

function sendEmail(
    mailOptions
) {
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
            if (error) {
                return console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
            // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
}
module.exports = {

    authenticate: function(req, res) {
        const emailId = req.body.email;
        // const email = req.body.email.split('/')[1];
        //sails.log("authenticate method under userController",emailId);
        const email = req.body.email;
        const password = req.body.password;
        var flag = 1;
        var userDetails = {
            empid: email,
            password: password,
            tocken: "TOYBOXAPP533BSRF07112017",
            appname: "TOYBOXAPP",
            fields: 0
        };
        //sails.log(userDetails);
        User.getUserByUsername(emailId, (err, user) => {
            //sails.log("Into the function...");
            if (err) throw err;

            if (user[0] === undefined) {
                flag = 0;
                //sails.log("flag = ",flag);
                request({
                    url: "https://oneci.cognizant.com/LDAPService/serviceauth.php",
                    method: "POST",
                    rejectUnauthorized: false,
                    headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    body: qs.stringify(userDetails)
                }, function(error, response, body) {
                    if (error) {
                        console.log("before", error)
                        return res.json({
                            success: false,
                            msg: 'Invalid Credentials!'
                        });
                    } else {
                        var data = JSON.parse(body);
                        var givenName;
                        if (data.USER_STATUS == true) {
                            var managerArr = data.USER_DETAILS_ALL[0].manager[0].split('=')[1].split(',')[0];
                            sails.log("here", managerArr);
                            givenName = data.USER_DETAILS.GIVENNAME.split(' ')[0];
                            var token = jwt.sign({
                                data: user
                            }, config.secret, {
                                expiresIn: 60480 // expires in 15 minutes
                            });
                            var ldapuser_id = "";
                            let newUser = {
                                email: data.USER_DETAILS.EMAIL,
                                password: "dummy12345",
                                admin: false,
                                ldap: true,
                                name: givenName,
                                employeeId: data.USER_DETAILS.INT_EMPID,
                                location: data.USER_DETAILS.LOCATION,
                                title: data.USER_DETAILS.TITLE,
                                department: data.USER_DETAILS.DEPT,
                                userGroup: 'CUSTOMER',
                                firstlogin: true,
                                user_verification: true,
                                skillScore: Math.floor(Math.random() * Math.floor(50)) + 50,
                                experience: Math.floor(Math.random() * Math.floor(10)) + 1,
                                manager: managerArr
                            };
                            async function create() {
                                //sails.log('creating')
                                var createdUser = await User.create(newUser).fetch()
                                return createdUser;
                            }

                            //create a LDAP User10
                            async function guaToken() {
                                var guaData = await getguatoken();
                                if (guaData !== {})
                                    return guaData;
                                else
                                    return 'error token obj empty';
                            }
                            guaToken().then((fromResolve) => {
                                    // console.log('in guaca then', fromResolve)
                                    guaData = fromResolve;
                                    create().then((user) => {
                                            console.log('in create then')

                                            //sails.log(user);
                                            ldapuser_id = user.id;
                                            ldapuser_id = ldapuser_id.toString();
                                            let mailOptions = {
                                                from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                                                to: user.email, // list of receivers
                                                subject: 'Successfully Registered with Toybox..!!', // Subject line
                                                text: '', // plain text body
                                                html: "Hi " + (user.email) + ",<br><p>We're so glad you decided to try out Toybox. Toybox is Cognizant's rapid digital prototyping platform that helps you innovate with ease.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p>Enjoy your new account and explore the world of new possibilities at toyox.cognizant.com.</p><p>Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                                            };
                                            sendEmail(
                                                mailOptions
                                            );
                                            console.log("inside called", guaData);
                                            res.json({
                                                success: true,
                                                msg: 'Enjoy your token!',
                                                token: token,
                                                user: {
                                                    empid: data.USER_DETAILS.INT_EMPID,
                                                    name: givenName,
                                                    email: data.USER_DETAILS.EMAIL,
                                                    department: data.USER_DETAILS.DEPT,
                                                    rememberMe: req.body.rememberMe,
                                                    id: ldapuser_id,
                                                    ldap: true,
                                                    userGroup: user.userGroup,
                                                    admin: 'false',
                                                    firstlogin: true,
                                                    rewardPoints: user.totalPoints,
                                                    userStream: user.userStream,
                                                    manager: user.manager
                                                },
                                                guaData: guaData
                                            });
                                        })
                                        .catch((error) => {
                                            console.log('in create reject', error)

                                            User.getUserByUsername(data.USER_DETAILS.EMAIL, (err, result) => {
                                                if (err) {
                                                    sails.log(err);
                                                }
                                                // console.log(guaData);
                                                ldapuser_id = result[0].id;
                                                ldapuser_id = ldapuser_id.toString();
                                                res.json({
                                                    success: true,
                                                    msg: 'Enjoy your token!',
                                                    token: token,
                                                    user: {
                                                        empid: data.USER_DETAILS.INT_EMPID,
                                                        name: givenName,
                                                        email: data.USER_DETAILS.EMAIL,
                                                        department: data.USER_DETAILS.DEPT,
                                                        id: ldapuser_id,
                                                        ldap: true,
                                                        rememberMe: req.body.rememberMe,
                                                        admin: 'false',
                                                        firstlogin: false,
                                                        userGroup: result[0].userGroup,
                                                        rewardPoints: result[0].totalPoints,
                                                        userStream: result[0].userStream,
                                                        manager: result[0].manager
                                                    },
                                                    guaData: guaData
                                                });
                                            });
                                            //sails.log(result[0])
                                        })
                                }

                            ).catch((fromReject) => {
                                console.log('in guaca reject')
                                guaData = fromReject;
                                create().then((user) => {
                                        console.log('in create then')

                                        //sails.log(user);
                                        ldapuser_id = user.id;
                                        ldapuser_id = ldapuser_id.toString();
                                        let mailOptions = {
                                            from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                                            to: user.email, // list of receivers
                                            subject: 'Successfully Registered with Toybox..!!', // Subject line
                                            text: '', // plain text body
                                            html: "Hi " + (user.email) + ",<br><p>We're so glad you decided to try out Toybox. Toybox is Cognizant's rapid digital prototyping platform that helps you innovate with ease.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p>Enjoy your new account and explore the world of new possibilities at toyox.cognizant.com.</p><p>Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                                        };
                                        sendEmail(
                                            mailOptions
                                        );
                                        res.json({
                                            success: true,
                                            msg: 'Enjoy your token!',
                                            token: token,

                                            user: {
                                                empid: data.USER_DETAILS.INT_EMPID,
                                                name: givenName,
                                                email: data.USER_DETAILS.EMAIL,
                                                department: data.USER_DETAILS.DEPT,
                                                rememberMe: req.body.rememberMe,
                                                id: ldapuser_id,
                                                ldap: true,
                                                userGroup: user.userGroup,
                                                admin: 'false',
                                                firstlogin: true,
                                                rewardPoints: user.totalPoints,
                                                userStream: user.userStream,
                                                manager: user.manager
                                            },
                                            guaData: guaData
                                        });
                                    })
                                    .catch((error) => {
                                        console.log('in create reject')

                                        User.getUserByUsername(data.USER_DETAILS.EMAIL, (err, result) => {
                                            if (err) {
                                                sails.log(err);
                                            }

                                            ldapuser_id = result[0].id;
                                            ldapuser_id = ldapuser_id.toString();
                                            res.json({
                                                success: true,
                                                msg: 'Enjoy your token!',
                                                token: token,
                                                user: {
                                                    empid: data.USER_DETAILS.INT_EMPID,
                                                    name: givenName,
                                                    email: data.USER_DETAILS.EMAIL,
                                                    department: data.USER_DETAILS.DEPT,
                                                    id: ldapuser_id,
                                                    ldap: true,
                                                    rememberMe: req.body.rememberMe,
                                                    admin: 'false',
                                                    firstlogin: false,
                                                    userGroup: result[0].userGroup,
                                                    rewardPoints: result[0].totalPoints,
                                                    userStream: result[0].userStream,
                                                    manager: result[0].manager
                                                },
                                                guaData: guaData
                                            });
                                        });
                                        //sails.log(result[0])
                                    })
                            })


                            //     End of creating LDAP User
                        } else {
                            return res.json({
                                success: false,
                                msg: 'Invalid Credentials!'
                            });
                        }
                    }
                });
            }
            if (flag == 1 && user[0].user_verification === true) {
                //sails.log("here");
                User.isPasswordMatch(password, user[0].password, (err, isMatch) => {
                    if (!isMatch) {
                        return res.send({
                            success: false,
                            msg: "Error, Invalid Password"
                        });
                    }

                    var token = jwt.sign({
                        data: user[0]
                    }, config.secret, {
                        expiresIn: 60480 // expires in 15 minutes
                    });

                    //gua part
                    async function guaToken() {
                        var guaData = await getguatoken();
                        if (guaData !== {})
                            return guaData;
                        else
                            return 'error token obj empty';
                    }
                    guaToken().then((fromResolve) => {
                        guaData = fromResolve;
                        res.json({
                            success: true,
                            msg: 'Enjoy your token!',
                            token: token,
                            user: {
                                id: user[0].id,
                                email: user[0].email,
                                name: user[0].name,
                                admin: user[0].admin,
                                ldap: false,
                                rememberMe: req.body.rememberMe,
                                department: "others",
                                userGroup: user[0].userGroup,
                                rewardPoints: user[0].totalPoints,
                                firstlogin: user[0].firstlogin,
                                userStream: user[0].userStream,
                                manager: user[0].manager
                            },
                            guaData: guaData

                        });
                    }).catch((fromReject) => {
                        guaData = fromReject;
                        res.json({
                            success: true,
                            msg: 'Enjoy your token!',
                            token: token,
                            user: {
                                id: user[0].id,
                                email: user[0].email,
                                name: user[0].name,
                                admin: user[0].admin,
                                ldap: false,
                                rememberMe: req.body.rememberMe,
                                department: "others",
                                userGroup: user[0].userGroup,
                                firstlogin: user[0].firstlogin,
                                rewardPoints: user[0].totalPoints,
                                userStream: user[0].userStream,
                                manager: user[0].manager
                            },
                            guaData: guaData
                        });
                    })

                });
            } else if (flag == 1 && user[0].user_verification === false) {
                res.json({
                    msg: "Please verify your email Id",
                    success: false

                })
            }
        });
    },

    register: function(req, res) {
        let newUser = {
            email: req.body.emailRegister,
            password: req.body.passwordRegister,
            confirm: req.body.confirm,
            admin: false,
            ldap: false,
            skillScore: Math.floor(Math.random() * Math.floor(50)) + 50,
            experience: 0,
            userGroup: 'CUSTOMER',
            user_verification: false
        };
        async function createUser() {
            var createdUser = await User.create(newUser).fetch()
            return createdUser;
        }
        createUser().then((user) => {
                // var url = "http://toy-boxpro.com:8011/#/verification/?token=" + (user.usertoken)
                var url = "http://localhost:4200/#/verification/?token=" + (user.usertoken);
                let mailOptions = {
                    from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                    to: newUser.email, // list of receivers
                    subject: 'Successfully Registered with Toybox..!!', // Subject line
                    text: '', // plain text body
                    html: "Hi " + (newUser.email) + ",<br><a target='_blank' href=" + (url) + ">Click here to verify</a><p>We\'re so glad you decided to try out Toybox. Toybox is Cognizant\'s rapid digital prototyping platform that helps you innovate with ease.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p>Enjoy your new account and explore the world of new possibilities at toyox.cognizant.com.</p><p>Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                };
                sendEmail(
                    mailOptions
                );
                //sails.log('before res')
                res.json({
                    success: true,
                    msg: 'User regitered !'
                });
            })
            .catch((error) => {
                console.log(error);
                res.json(error)
            })
    },
    forgotPassword : function (req,res,next) {
        console.log('in forgot')
        async function forgotUser() {
            User.find({
                email: req.body.email
            }, function(err, users) {
                res.json(users);
                console.log("user",users);
                // var data = JSON.parse(users);
                // console.log("data",data);
                console.log(users[0].usertoken);
                return users
            })
        }

        forgotUser().then((users) => {
            // console.log(req.body.email);
            console.log(users[0].usertoken)
            // var url = "http://toy-boxpro.com:8011/#/verification/?token=" + (user.usertoken)
            var url = "http://localhost:4200/#/login/?token=" + (users[0]._id);
            let mailOptions = {
                from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Successfully Registered with Toybox..!!', // Subject line
                text: '', // plain text body
                html: "Hi " + (newUser.email) + ",<br><a target='_blank' href=" + (url) + ">Click here to verify</a><p>We\'re so glad you decided to try out Toybox. Toybox is Cognizant\'s rapid digital prototyping platform that helps you innovate with ease.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p>Enjoy your new account and explore the world of new possibilities at toyox.cognizant.com.</p><p>Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
            };
            sendEmail(
                mailOptions
            );
            //sails.log('before res')
            res.json({
                success: true,
                msg: 'User regitered !'
            });
        })
        // .catch((error) => {
        //     console.log(error);
        //     res.json(error)
        // })
            // console.log('in first method')
            // bcrypt.hash(req.body.password, 10, function(err, hash) {
            //     if (err) return cb(err);
            //     req.body.password = hash;
            //     console.log("bcrypt",req.body.password)
            //     async function updatedPassword() {
            //         var updatedPassword = await User.update({
            //             email: req.body.email
            //           }).set({
            //             password: req.body.password
            //           })
            //           console.log("without bcrypt",req.body.password)
                      
            //           return updatedPassword;
            //         }
                
            //     updatedPassword()
            //       .then((updatedPrototype) => {
            //           res.json({
            //                       success: true,
            //                       msg: 'User regitered !'
            //                   });
            //       })
            //       .catch((err) => {
            //         console.log(err);
            //       })
                
            // });
        
            // updatePasswords();
    
    // }
},
changePassword : function (req,res,next) {
    console.log('in first method',JSON.stringify(req.body.usertoken));
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) return cb(err);
        req.body.password = hash;
        console.log("bcrypt",req.body.password,"token",req.body.usertoken)
        async function updatedPassword() {
            console.log("works");
            var updatedPasswords = await User.update({
                id: req.body.usertoken
              }).set({
                password: req.body.password
              }).fetch();
              console.log("up", updatedPasswords);
              return updatedPasswords;
              
            }
        
        updatedPassword()
          .then((updatedPasswd) => {
              console.log("gggg",updatedPasswd);
              if(updatedPasswd.length>0){
                res.json({
                     success: true,
                });
              }
              else{
                  res.json({
                      failure: true,
                });
              }
              User.findOne({id: req.body.usertoken})
              .then((done)=> {
                  console.log('in done',done);
              }).catch((error)=> {
                  console.log('in error',error);
              })
          
          })
          .catch((err) => {
            console.log(err);
          })
        
    });

    // updatePasswords();
},
    getSuggested: function(req, res) {
        async function findPrototypes() {
            var getSuggested = await Prototypes.find().limit(6)
            return getSuggested;
        }
        findPrototypes()
            .then((prototypes) => {
                res.json(prototypes)
            })
            .catch((error) => {
                //sails.log(error)
                res.json(error)
            })
    },

    Firstlogin: (req, res, next) => {
        User.update({
                "email": req.body.email
            })
            .set({
                'firstlogin': false
            })
            .then((results) => {
                //console.log(results.result);
                var firstLoginRewardsPoints = 250 + req.body.rewardPoints;
                async function updateUser() {

                    var updatedUser = await User.update({
                            "email": req.body.email
                        })
                        .set({
                            'firstlogin': false,
                            'totalPoints': firstLoginRewardsPoints
                        }).fetch();

                    return updatedUser;
                }
                updateUser()
                    .then((user) => {
                        console.log(user);
                        let newRewards = {
                            userId: req.body.id,
                            points: 250,
                            type: 'firstLogin'
                        };
                        async function rewards() {
                            createRewards = await Rewards.create(newRewards).fetch();
                            return createRewards;
                        }
                        rewards().then((response) => {
                                console.log(user, "dgd")
                                res.json({
                                    name: user[0].name,
                                    email: user[0].email,
                                    department: user[0].department,
                                    id: user[0].id,
                                    ldap: user[0].ldap,
                                    userGroup: user[0].userGroup,
                                    admin: 'false',
                                    firstlogin: false,
                                    rewardPoints: user[0].totalPoints,
                                    userStream: user[0].userStream,
                                    manager: user[0].manager
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                            });

                    })
                    .catch((err) => {
                        console.log(err)
                    })




            });
    },


    profile: function(req, res, next) {
        console.log(req.body, "asdasdasd");
        // User.getUserByUsername(req.body.emailId, (err, user) => {
        async function updateUser() {
            console.log("user", req.body.emailId);
            var updatedUser = await User.update({
                    "email": req.body.emailId
                })
                .set({
                    "role": req.body.user.role,
                    "name": req.body.user.ProfileName,
                    "InterestArray": req.body.user.interestArray,
                    "department": req.body.user.department,
                    "skillsArray": req.body.user.skillsArray,
                    crowdSourcing: req.body.user.crowdSourcing,
                    "enterrole": req.body.user.enterrole,
                    experience: req.body.user.experience,
                    "description_urself": req.body.user.description_urself,
                    Profileprogress: req.body.user.profileProgress
                }).fetch();
            return updatedUser
        }
        updateUser()
            .then((results) => {
                console.log("hgjhgjh", results);
                if (results[0].Profileprogress === 100) {
                    Notification.update({
                            and: [{
                                "email": req.body.emailId
                            }, {
                                status: "pending"
                            }, {
                                notificationtag: "profile"
                            }]
                        }).set({
                            "status": "completed"
                        })
                        .then((res) => {
                            console.log("updated!!!");
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                    console.log("compleeeeeeeeeeeeeeeeeeeeeted");
                }
                if (!results[0].profile && req.body.user.section === 'profile' && results[0].role !== '' && results[0].name !== '' && results[0].department !== '' && results[0].description_urself !== '' && results[0].InterestArray.length !== 0) {
                    async function updateProfile() {
                        console.log("user", req.body.emailId);
                        var updatedUser = await User.update({
                                "email": req.body.emailId
                            })
                            .set({
                                profile: true
                            }).fetch();
                        return updatedUser
                    }
                    updateProfile().then((response) => {

                        })
                        .catch((error) => {

                        })
                }
                if (!results[0].skillSet && req.body.user.section === 'skillSet' && results[0].crowdSourcing && results[0].skillsArray.length != 0) {
                    async function updateSkillSet() {
                        console.log("user", req.body.emailId);
                        var updatedUser = await User.update({
                                "email": req.body.emailId
                            })
                            .set({
                                skillSet: true
                            }).fetch();
                        return updatedUser
                    }
                    updateSkillSet().then((response) => {

                        })
                        .catch((error) => {

                        })
                }
                res.json(results)
            })
            .catch((err) => {
                console.log(err)
            })
    },
    getFirstLogin: (req, res, next) => {
        User.getUserByUsername(req.body.email, (err, user) => {
            if (err) throw err;
            else {
                loginFlag = user.firstlogin
                res.json(loginFlag);
            }
        });

    },
    getSuggested: (req, res, next) => {
        Prototypes.find(function(err, prototypes) {
            var youMayLike = [];
            for (var i = 0; i < 8; i++) {
                youMayLike[i] = prototypes[i];
            }
            res.json(youMayLike);
        })
    },
    registerUser: (req, res, next) => {
        User.find({})
            .then((users) => {
                res.json(users)
            })
            .catch((err) => {
                console.log(err);
            })
    },
    ViewProfile: function(req, res, next) {
        User.getUserByUsername(req.body.email, (err, user) => {
            User.findOne({
                "email": req.body.email
            }).exec(
                function(err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.json(results);
                    }
                }
            );
        });
    },
    activityFeed: (req, res, next) => {
        console.log(req.body.profileProgress, "asdasdasd");
        console.log(req.body)
        async function updateUser() {
            var updatedUser = await User.update({ id: req.body.userId })
                .set({
                    'comment': req.body.comment,
                    'featuredPlaylist': req.body.playlist,
                    'peopleEvent': req.body.peopleEvent,
                    'rating': req.body.rating,
                    Profileprogress: req.body.profileProgress
                }).fetch();
            return updatedUser;
        }
        updateUser()
            .then((result) => {
                console.log("fdfgdfgdfgdf", result)
                if (result[0].Profileprogress === 100) {
                    Notification.update({ and: [{ "email": req.body.emailId }, { status: "pending" }, { notificationtag: "profile" }] }).set({
                            "status": "completed"
                        })
                        .then((res) => {
                            console.log("updated!!!");
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                    console.log("compleeeeeeeeeeeeeeeeeeeeeted");
                }
                if (req.body.userStream) {
                    async function updateUser() {
                        var updatedUser = await User.update({ id: req.body.userId })
                            .set({
                                userStream: true
                            }).fetch();
                        return updatedUser;
                    }
                    updateUser()
                        .then((resp) => {
                            User.findOne({
                                id: req.body.userId
                            }).populate('following').then(doc => {
                                console.log("dfdshgf", doc.following[0].name);
                                var id = doc.following[0].id;
                                const activity = {
                                    activityType: 'Comment',
                                    userId: id,
                                    ownerId: req.body.userId,
                                    timeStamp: new Date(),
                                    commentMessage: 'Prototype is really Awesome..'

                                }
                                async function createActivityFeed() {
                                    var createdActivityFeed = await Activityfeed.create(activity).fetch();
                                    return createdActivityFeed;
                                }
                                createActivityFeed()
                                    .then((activityFeed) => {
                                        const activity = {
                                            activityType: 'Rating',
                                            userId: id,
                                            ownerId: req.body.userId,
                                            timeStamp: new Date(),
                                            rating: '4.5'
                                        }

                                        async function createActivityFeed() {
                                            var createdActivityFeed = await Activityfeed.create(activity).fetch();
                                            return createdActivityFeed;
                                        }
                                        createActivityFeed()
                                            .then((activityFeed) => {

                                                const activity = {
                                                    activityType: 'Comment',
                                                    userId: id,
                                                    ownerId: req.body.userId,
                                                    timeStamp: new Date(),
                                                    commentMessage: 'Really cool work. Am downloading this.'

                                                }
                                                async function createActivityFeed() {
                                                    var createdActivityFeed = await Activityfeed.create(activity).fetch();
                                                    return createdActivityFeed;
                                                }
                                                createActivityFeed()
                                                    .then((activityFeed) => {
                                                        res.json({
                                                            name: result[0].name,
                                                            email: result[0].email,
                                                            department: result[0].department,
                                                            id: result[0].id,
                                                            ldap: result[0].ldap,
                                                            userGroup: result[0].userGroup,
                                                            admin: 'false',
                                                            firstlogin: false,
                                                            rewardPoints: result[0].totalPoints,
                                                            userStream: resp[0].userStream,
                                                            manager: resp[0].manager
                                                        });
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

                            }).catch((error) => {
                                console.log(error)
                                res.sendStatus(400).json(error)
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                }
                if (!req.body.userStream) {
                    res.json(result)
                }
            })
            .catch((error) => {
                console.log(error)
                res.sendStatus(400).json(error)
            })
    },
    getUsers: (req, res, next) => {
        User.find({
            userGroup: {
                'in': ['CUSTOMER', 'ADMIN']
            }
        }, (err, result) => {
            res.json(result);
        })
    },
    updateUserGroup: (req, res, next) => {
        for (var i = 0; i < req.body.query.email.length; i++) {
            async function updateUser() {
                var updatedUser = await User.update({
                        'email': req.body.query.email[i]
                    })
                    .set({
                        userGroup: req.body.query.group
                    }).fetch();
                return updatedUser;
            }
            updateUser()
                .then((results) => {

                })
                .catch((err) => {

                })
        }
        res.json({
            status: 'ok'
        });

    },
    getFavorite: function(req, res) {
        console.log("1")
        async function findUserFavorite() {
            //sails.log(req.body.mail);
            var getFav = await User.findOne({
                email: req.body.mail
            }).populate('favorites')
            return getFav;
        }
        findUserFavorite()
            .then((prototypes) => {
                console.log("2", prototypes)
                res.json(prototypes)

            })
            .catch((error) => {
                sails.log(error)
                res.json(error)
            })
    },
    createFavorite: function(req, res) {
        User.addToCollection(req.body.userId, 'favorites', req.body.protoId).exec(function(err, data) {
            if (err) {
                sails.log(err)
            } else {
                var totalLikes = req.body.likesCount + 1;
                async function updatePrototype() {
                    var updatedPrototypes = await Prototypes.update({
                        id: req.body.protoId
                    }).set({
                        likesCount: totalLikes
                    }).fetch();
                    return updatedPrototypes;
                }
                updatePrototype()
                    .then((result) => {
                        res.json(result[0])
                    })
                    .catch((error) => {
                        console.log(error);
                    })

            }
        });
    },
    deleteFavorite: function(req, res) {
        User.removeFromCollection(req.body.userId, 'favorites', req.body.protoId).exec(function(err, data) {
            if (err) {
                sails.log(err)
            } else {
                var totalLikes = req.body.likesCount - 1;
                async function updatePrototype() {
                    var updatedPrototypes = await Prototypes.update({
                        id: req.body.protoId
                    }).set({
                        likesCount: totalLikes
                    }).fetch();
                    return updatedPrototypes;
                }
                updatePrototype()
                    .then((result) => {
                        res.json(result[0])
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }
        });
    },

    getCampaign: (req, res, next) => {
        console.log('datehere', new Date((new Date().getTime() - (2 * 24 * 60 * 60 * 1000))));
        Service.find({
            // "campaignDate": {
            //   '>=': new Date((new Date().getTime() - (2 * 24 * 60 * 60 * 1000))),
            //   '<=': new Date()
            // },
            "campaign": true
        }).then((services) => {
            for (let i = 0; i < services.length; i++) {
                console.log('campaignDate', services[i].campaignDate);
            }

            res.json(services);
        }).catch((err) => {
            console.log(err);
        });
    },

    campaign: (req, res, next) => {
        async function updateService() {
            var updatedService = await Service.update({
                    id: req.params.id
                })
                .set({
                    campaign: true,
                    campaignDate: new Date(),
                    skillsetneeded: req.body.roleentered.enteredrole,
                }).fetch();
            return updatedService;
        }
        updateService()
            .then((doc) => {
                Service.findOne({
                        id: req.params.id
                    })
                    .populate('assigned_users')
                    .populate('serviceInstance')
                    .populate('enrollments')
                    .populate('nominees')
                    .then((services) => {
                        sails.log("service", services)
                        res.json(services)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                    //res.json(doc);
            })
            .catch((err) => {
                console.log("error in cmapign", err)
                res.send(400).json(err)
            })
            // Service.findOneAndUpdate({ id: req.params.id }, {
            //   $set: {
            //     campaign: true,
            //     skillsetneeded: req.body.enteredrole
            //   }
            // }, { new: true }, function(err, doc) {
            //   if (err) {
            //     res.send(400).json(err)

        //   } else {
        //     res.json(doc);
        //   }
        // });
    },

    sendMailVd: (req, res, next) => {
        //  console.log("req ",req.body.query.role);
        console.log("req ", req.body.query);
        console.log("req p", req.body.params.Fidelity);
        //   console.log("req params",req.body)
        // var skills = [];
        // if (req.body.query === 'UX') {
        //     skills.push('UX Designers');
        // } else if (req.body.query === 'VD') {
        //     skills.push(' Visual Designers');
        // } else if (req.body.query === 'DEVELOPER') {
        //     skills.push(' Full stack developers');
        // }
        // var skilltext = [];
        // console.log('skilltext', skills);
        // if (skills.length === 1) {
        //     skilltext.push(skills[0]);
        // } else {
        //     for (j = 0; j < skills.length - 1; j++) {
        //         skilltext = skilltext + "," + skills[j];
        //     }
        //     skilltext = skilltext + skills[skills.length];
        // }
        User.find(function(err, users) {
            for (i = 0; i < users.length; i++) {
                // console.log('service-details', req.body.params.Preferredplatform)
                // console.log("sending mail to ", users[i].email, req.body.params._id);
                var dueDate = moment(req.body.params.dueDate).format('DD MMM YYYY');
                var tilldate = moment(req.body.params.tilldate).format('DD MMM YYYY');
                var url = "http://toy-boxpro.com:8009/#/campaign/" + (req.body.params._id);
                let mailOptions = {
                    from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                    to: 'GaneshRaj.Chandrasekaran@cognizant.com', // list of receivers
                    subject: 'Crowdsourcing Campiagn', // Subject line
                    text: req.body.text, // plain text body
                    html: '<table cellpadding="0" cellspacing="0" border="0" style="height: 336px;background-color: #2550bc;width:100%"><tr><td style="height:25px;"></td></tr><tr><td><span style="display: inline-block;width:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><img src="https://s3.amazonaws.com/braas-monier/logo_new.png" /></td></tr><tr style="width: 100%"><td><p style="margin: 65px 0 0 100px;font-size: 57px;font-family:Open Sans;color:white;">Hi ' + (users[i].name) + '</p></td></tr></table><div style="height: 495px;background-color: white;font-family:Open Sans "><table cellpadding="0" cellspacing="0" border="0" style="padding:0px;margin:0px;width:100%;font-family:Open Sans"><tr><td style="height: 72px;width: 100%;padding:0px;margin:0px;"></td></tr><tr><td style="padding:0px;margin:0px;" width="560"><table cellpadding="0" cellspacing="0" border="0" style="float:left;width: 401px;height: 416px;padding: 62px 0 0 0;"><tr style="padding:0px;margin:0px;"><td style="background-color: #2550bc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/client.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Client Name</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;font-family:Open Sans">' + req.body.params.Clientname + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2a5ad4;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/tech.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Tech Category</p><p style="color: black;font-size: 20px;test-overflow:ellipses;overflow:hidden;white-space: nowrap;margin: 0;">' + req.body.params.Preferredplatform + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2e67f7;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/calendra.png"></td><td style="display: inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Project Time Line</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + dueDate + '-' + tilldate + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #467afc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/roles.png"></td> <td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Required Roles</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + req.body.query + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #6490fd;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/poc.png "></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Project POC</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">Purushotham</p></td></tr></table></td><td style="display: inline-block; width: 888px;margin: 72px 0 0 0;height: 420px;float: right;border-left: 1px #a2a2a2 solid;"><table><tr><p style="font-size: 36px;display: inline-block;margin: 0 0 0 40px;padding: 0 0 0 10px;border-left: 2px #2550bc solid;color: black;margin-bottom: 15px;">About</p><p style="margin: 0 0 0 40px;color: black;font-family: Open Sans ; font-size:20px;"> Toybox brings to you an exciting opportunity to work for ' + req.body.params.Clientname + ', a Fortune-500 company. There is an active campaign for building a/an ' + req.body.params.Preferredplatform + '  based ' + req.body.params.Fidelity + ' prototype for ' + req.body.params.Clientname + '. We would be needing <span *ngIf="' + req.body.query + ' == UX">UX Designers </span><span *ngIf="' + req.body.query + ' == VD">Visual Designers </span><span *ngIf="' + req.body.query + ' == DEVELOPER">Full stack developers</span></p><p style="margin: 23px 0 8px 40px;color: #9f9e9e; font-size:20px;font-family:Open Sans">To learn more about the campaign and nominate yourself </p></tr></table><table><tr><td style="width:35px;">&nbsp;</td> <td><a target="_blank" href=' + (url) + ' style="padding: 0;margin:0;"><img src="https://s3.amazonaws.com/braas-monier/email_template/enroll.png"></a></td></tr></table><hr style="margin: 44px 0 0 0;width: 895px;border-top:1px #a2a2a2;"><p style="margin: 0 0 0 40px;color: black; font-size:20px;">Kindly ensure your profile information is completed in toybox. This will help in selection process.</p><p style="margin: 23px 0 0 40px;color: #9f9e9e; font-size:20px;">You will receive confirmation mail if your nomination is accepted.</p></td></tr><tr><td colspan="3" style="padding:0px;margin:0px;font-size:20px;height:20px;margin: 70px 0 0 0;" height="20">&nbsp;</td></tr></table></div><div style="text-align: center;"><p style="font-family:Open Sans ;font-size: 20px;color: black;">For any <span style="color: #2550bc;font-size: 36px;">Queries</span>, reach out to us at <a style="text-decoration: none;color: #2550bc !important;">Toyboxsupport@cognizant.com</a></p></div>'
                };
                // console.log(mailOptions.html, "mail content");
                // sendEmail(
                //   mailOptions
                // );
            }
            res.json({
                success: true,
                msg: 'Crowdsourcing mail sent!'
            });
        })




    },


    getCrowdSourcingData: (req, res, next) => {
        User.find({
            enterrole: req.body.query
        }, function(err, users) {
            res.json(users);
        })
    },

    revertCampaign: (req, res, next) => {
        console.log("campaign", req.params.id);
        Service.update({
                id: req.params.id
            })
            .set({
                campaign: false
            })


        .then((results) => {
                res.json({
                    success: false,
                    msg: 'Successfull'
                });
                // console.log(results.result);
            })
            .catch((err) => {
                console.log(err)
            })
    },
    crowdSourcEmail: (req, res, next) => {

        User.update({
                'usertoken': req.body.usertoken
            })
            .set({
                crowdsource: true
            })
            .unset({
                usertoken: true
            })
            .then((results) => {
                res.json({
                    success: false,
                    msg: 'Successfull'
                });
            })
            .catch((err) => {
                console.log(err)
            })



    },

    InstanceassignDate: (req, res, next) => {
        var usersInstanceDate = req.body;
        res.json("instance assigned");
        // usersInstanceDate.forEach(function(i){
        //     User.find({email: i.email},{$set:{assignStartDate: i.startDate}}, function (err, results) {
        //         if (err) {
        //             console.log("user instance date asssign error",err)
        //         } else {

        //             res.json("working user date assign")
        //         }

        //     })
        // });
    },
    enrolluser: (req, res, next) => {

        let newenrollment = {
            service_id: req.body.service_id,
            user_id: req.body.user_id,
            enrollment_date: req.body.enrollment_date,
            role: req.body.role
        };
        async function newEnrollment() {
            createEnrollment = await Enrollments.create(newenrollment).fetch()
            return createEnrollment;
        }
        newEnrollment().then((enrollment) => {
                res.json(enrollment);
            })
            .catch((error) => {
                res.sendStatus(400).json(error);
            });

    },
    shareUsers: (req, res, next) => {
        User.find(function(err, users) {
            if (err) {
                console.log(err);
                //res.json({msg:'failed to add form'});
            } else {
                // console.log(users, "testetste");
                res.json(users);
            }
        })
    },
    getrate: (req, res, next) => {
        User.getUserByUsername(req.body.mail, (err, user) => {
            if (err) {
                console.log(err);
            }
            return res.json(user);
        });
    },

    sendContact: (req, res, next) => {
        //  console.log("req ",req.body.query.role);
        console.log("req ", req.body.query);
        console.log("req p", req.body.params);
        //   console.log("req params",req.body)


        var mail = 'arunraj.k@cognizant.com';
        console.log("sending mail to ", req.body.query);
        let mailOptions = {
            from: '"TOY BOX" <no-reply@toybox.com>', // sender address
            to: mail, // list of receivers                        subject: 'Toybox-support', // Subject line
            text: req.body.params, // plain text body
            html: "Hi " + ",<br><p>" + req.body.params + "<p>Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='https://s3.amazonaws.com/braas-monier/toyboximg.png' style='width:117px;height:51px'/> " // html body
        };
        console.log(mailOptions.html, "mail content");
        sendEmail(
            mailOptions
        );
        res.json({
            success: true,
            msg: 'Contact mail sent!'
        });

    },
    getRewardsPoints: (req, res, next) => {

        User.findOne({
                id: req.body.id
            })
            .populate('rewards')
            .then((users) => {
                res.json(users);
            })
            .catch((err) => {
                console.log(err);
            })
    },
    coreteam: function(req, res) {
        var userObj = req.body.user
        async function findcoreteam() {
            var foundUser = await User.find({
                coreTeam: true
            }).populate('followers').populate('following').populate('addedPrototypes')
            return foundUser;
        }
        findcoreteam()
            .then((foundUser) => {
                console.log(foundUser)
                var follow = [];
                var userItem = 0;
                var followItem = 0;
                foundUser.forEach((user) => {
                    userItem++;
                    followItem = 0;
                    user.followers.forEach((data) => {
                        if (data.id == userObj.id) {
                            followItem++;
                        }
                    })
                    if (followItem == 0) {
                        follow.push(user);

                    }
                    if (foundUser.length == userItem) {
                        if (follow.length == 0) {
                            User.find({
                                    and: [{
                                        id: {
                                            '!=': userObj.id
                                        }
                                    }]
                                }).populate('followers').populate('following').populate('addedPrototypes').limit(5)
                                .then((follow) => {
                                    res.json(follow);
                                })
                        } else {
                            res.json(follow);
                        }
                    }
                })
            })
            .catch((err) => {
                console.log(err)
            })
    },
    follow: function(req, res) {
        // var resdata = req.body.department;

        var userObj = req.body.user
        console.log("userObj", userObj)
        var a = userObj.department;
        var b = userObj.manager;
        var department = new RegExp(a, 'i');
        var finalquery = {
            and: [{
                or: [{
                        department: {
                            'contains': a
                        }
                    },
                    {
                        manager: {
                            'contains': b
                        }
                    }
                ]
            }, {
                id: {
                    '!=': userObj.id
                }
            }]
        }

        if (userObj.ldap) {
            console.log("getting");
            async function findUser() {
                var foundUser = await User.find(finalquery).populate('followers').populate('following').populate('addedPrototypes').populate('playlist')
                return foundUser;
            }
            findUser()
                .then((foundUser) => {
                    var follow = [];
                    var userItem = 0;
                    var followItem = 0;
                    foundUser.forEach((user) => {
                        userItem++;
                        followItem = 0;
                        user.followers.forEach((data) => {
                            if (data.id == userObj.id) {
                                followItem++;
                            }
                        })
                        if (followItem == 0) {
                            follow.push(user);

                        }
                        if (foundUser.length == userItem) {
                            if (follow.length == 0) {
                                User.find({
                                        and: [{
                                            id: {
                                                '!=': userObj.id
                                            }
                                        }]
                                    }).populate('followers').populate('following').populate('addedPrototypes').populate('playlist').limit(5)
                                    .then((follow) => {
                                        res.json(follow);
                                    })
                            } else {
                                res.json(follow);
                            }
                        }
                    })

                })
                .catch((error) => {
                    sails.log(error);
                })
        } else {
            User.find({
                    and: [{
                        id: {
                            '!=': userObj.id
                        }
                    }, { coreTeam: false }]
                }).populate('followers').populate('following').populate('addedPrototypes').populate('playlist')
                .then((foundUser) => {

                    var follow = [];
                    var userItem = 0;
                    var followItem = 0;
                    foundUser.forEach((user) => {
                            userItem++;
                            followItem = 0;
                            user.followers.forEach((data) => {
                                if (data.id == userObj.id) {
                                    followItem++;
                                }
                            })
                            if (followItem == 0) {
                                follow.push(user);

                            }
                            if (foundUser.length == userItem) {
                                if (follow.length == 0) {
                                    User.find({
                                            and: [{
                                                id: {
                                                    '!=': userObj.id
                                                }
                                            }]
                                        }).populate('followers').populate('following').populate('addedPrototypes').populate('playlist').limit(5)
                                        .then((follow) => {
                                            res.json(follow);
                                        })
                                } else {
                                    res.json(follow);
                                }
                            }
                        })
                        // res.json(entireuserscollection)

                })
                .catch((err) => {
                    console.log(err);
                })
        }
        // User.find({ department: { $in: resdata } }, function(err, users) {
        //     followerslist = users;
        //     // console.log("users", users);
        //     console.log("followerslist", followerslist)
        //     res.json(followerslist)
        // })
    },
    followerAndFollowingUpdate: (req, res, next) => {

        console.log("sample", req.body);
        const activity = {
            activityType: 'Follow Event',
            userId: req.body.id,
            ownerId: req.params.id,
            followerId: null,
            timeStamp: new Date(),
        }
        async function createActivityFeed() {
            var createdActivityFeed = await Activityfeed.create(activity).fetch();
            return createdActivityFeed;
        }
        createActivityFeed()
        .then((activityFeed) => {

        })
        .catch((error)=> {
            console.log(error)
        })

        async function updateUserFollowers() {
            var updatedUser = await User.addToCollection(req.params.id, 'followers', req.body.id)
            return updatedUser;
        }
        updateUserFollowers()
            .then((follower) => {
                async function updateUserFollowing() {
                    var updatedUser = await User.addToCollection(req.body.id, 'following', req.params.id)
                    return updatedUser;
                }
                updateUserFollowing()
                    .then((following) => {
                        User.findOne({id:req.body.id}).populate('followers').then((user)=>{
                            var followers = user.followers;
                            for(let i = 0;i<followers.length;i++) {
                                if(followers[i].id !== req.params.id && followers[i].peopleEvent) {
                                    const activity = {
                                        activityType: 'Follow Event',
                                        userId: req.body.id,
                                        ownerId: followers[i].id,
                                        followerId: req.params.id,
                                        timeStamp: new Date(),
                                    }
                                    async function createActivityFeed() {
                                        var createdActivityFeed = await Activityfeed.create(activity).fetch();
                                        return createdActivityFeed;
                                    }
                                    createActivityFeed()
                                    .then((activityFeed) => {

                                    })
                                    .catch((error)=> {
                                        console.log(error)
                                    })
                                }
                            }
                        res.json({
                            follower,
                            following
                        })
                    })
                    .catch((error) => {
                            console.log(error)
                        })
                    })
                    .catch((error) => {
                        console.log(error);

                        res.sendStatus(400).json(error)
                    })

            })
            .catch((error) => {
                console.log(error);

                res.sendStatus(400).json(error)
            })
    },
    profileRewardPoints: (req, res, next) => {
        var points = 500 + req.body.points
        console.log(req.body)
        let newRewards = {
            userId: req.body.id,
            points: 500,
            type: 'profileCompletion'
        };
        async function rewards() {
            createRewards = await Rewards.create(newRewards).fetch();
            return createRewards;
        }
        rewards().then((response) => {
                async function updateUser() {

                    var updatedUser = await User.update({
                            "id": req.body.id
                        })
                        .set({
                            'totalPoints': points
                        }).fetch();

                    return updatedUser;
                }
                updateUser()
                    .then((user) => {
                        res.json({
                            name: user[0].name,
                            email: user[0].email,
                            department: user[0].department,
                            id: user[0].id,
                            ldap: user[0].ldap,
                            userGroup: user[0].userGroup,
                            admin: 'false',
                            firstlogin: false,
                            rewardPoints: user[0].totalPoints,
                            userStream: user[0].userStream,
                            manager: user[0].manager
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });


            })
            .catch((err) => {
                console.log(err);
            });

    },

    uploadDP: (req, res) => {
        var uploadpath = path.join(__dirname, '../../assets/assets/images');
        //  sails.log(user.email)
        req.file('dp').upload({
            dirname: uploadpath
        }, function(err, uploadedFiles) {
            uploadedDp = './assets/images/' + path.basename(uploadedFiles[0].fd);
            if (err) return res.serverError(err);
            return res.json({
                status: "ok"
            });
        });
    },
    updateDpInfo: (req, res) => {
        async function updateUserDP() {
            var updatedUser = await User.update({
                    id: req.body.id
                })
                .set({
                    displayPicture: uploadedDp
                })
                .fetch();
            return updatedUser
        }
        updateUserDP().then((updatedUser) => {
                sails.log(updatedUser)
                User.findOne({
                        id: req.body.id
                    })
                    .then((users) => {
                        res.json(users);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(400).json(error)
            })
    },
    pendingVerification: (req, res) => {

        async function updateUser() {
            var updatedUser = await User.update({
                    'email': req.body.email
                })
                .set({
                    user_verification: "Pending"
                }).fetch();
            return updatedUser;
        }
        updateUser()
            .then((results) => {

            })
            .catch((err) => {

            })

        res.json({
            status: 'ok'
        });

    },
    Verifyuser: (req, res) => {
        async function updateUser() {
            var updatedUser = await User.update({
                    'email': req.body.email
                })
                .set({
                    user_verification: true
                }).fetch();
            return updatedUser;
        }
        updateUser()
            .then((results) => {

            })
            .catch((err) => {

            })

        res.json({
            status: 'ok'
        });
    },
    getCrowdSourcingData: (req, res, next) => {
        console.log("coming", req.body.fromDate, req.body.toDate, req.body.skillset)
        var saved_crowd = [];
        var filteredusersarr = [];
        Service.find({}).populate('saved_Resources')
            .then((savedResources) => {
                savedResources.forEach((service) => {
                    service.saved_Resources.forEach((resource) => {
                        saved_crowd.push(resource);
                    })
                })
                var a = _.uniq(saved_crowd);
                a.forEach((r) => {
                    filteredusersarr = filteredusersarr.concat(r.email);
                })
                console.log("a", a, filteredusersarr)
                Serviceinstances.find({ and: [{ provision_date_from: { '<': new Date(req.body.toDate).toISOString() } }, { provision_date_to: { '>': req.body.fromDate } }] }, function(err, filteredpersons) {
                    if (err) {
                        // console.log(err);
                        return {
                            success: false,
                            message: "failed"
                        };
                    } else {
                        filteredpersons.forEach((e) => {
                            filteredusersarr.push(e.assignedto)
                        })
                        console.log("filtereduserarr", filteredusersarr)
                        User.find({ and: [{ email: { '!': filteredusersarr } }, { enterrole: req.body.skillset.query }] })
                            .then((users) => {
                                console.log("isers", users)
                                res.json(users);
                            })
                            .catch((err) => {
                                console.log("err", err)
                            })
                    }
                })
            })
    },
    unfollow: (req,res,next)=> {
        console.log('in unfollow')
        async function updateUserFollowers() {
            var updatedUser = await User.removeFromCollection(req.params.id, 'followers', req.body.id)
            return updatedUser;
        }
        updateUserFollowers()
            .then((follower) => {
                async function updateUserFollowing() {
                    var updatedUser = await User.removeFromCollection(req.body.id, 'following', req.params.id)
                    return updatedUser;
                }
                updateUserFollowing()
                    .then((following) => {
                        res.json({
                            follower,
                            following
                        })
                    })
                    .catch((error) => {
                        console.log(error);

                        res.sendStatus(400).json(error)
                    })

            })
            .catch((error) => {
                console.log(error);

                res.sendStatus(400).json(error)
            })
    }
};
