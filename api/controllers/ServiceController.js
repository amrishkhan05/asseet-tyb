/**
 * ServiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
var qs = require('qs')
const nodemailer = require('nodemailer');
// var helper = require('sendgrid').mail;
const async = require('async');
const moment = require('moment');
var each = require('async-each-series');
var  AWS  =  require('../../aws/awsInstances');
var schedule = require('node-schedule');
new Date();
const ldap = require('ldapjs');
// var i = 0;
// var j = 1;
// var instancesCount = 0;
var ObjectId = require('mongodb').ObjectID;

var count;
var flag = [];

var find = require('find')
var dateoptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric' ,
};
const path = require('path');
var uploadedAssets;
var uploadedServiceAssets = [];


schedule.scheduleJob('0 0 0 * * *', function() {
  var todayDate = new Date();
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric' ,
  };
  Service.find({
      savednext2days: {
        '>': new Date()
      }
    })
    .then((response) => {
      response.forEach((e) => {
        var startDate = moment((new Date(e.savednext2days).toLocaleString('en-US', options)), "MM/DD/YYYY");
        var endDate = moment((new Date(todayDate).toLocaleString('en-US', options)), "MM/DD/YYYY");
        var diff = startDate.diff(endDate, 'days');
        if (diff === 1) {
          async function createNotification() {
            const notiObj = {
              message: '1 day left',
              notificationtag: 'Crowdsource',
              notificationDate: new Date(),
              status: 'Pending',
              serviceRequest: e.id,
              ref_id: e.req_id,
            }
            var noti = await Notification.create(notiObj).fetch()
            return noti;
          }
          createNotification()
            .then((response) => {
              console.log("response")
            })
            .catch((error) => {
              console.log(error);
            })
        }
      })
    })
    .catch((error) => {
      console.log("find error", error)
    })
});
schedule.scheduleJob('0 0 * * * *', function() {
  var todayDate = new Date();
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric' ,
    hour: 'numeric'
  };

  Service.find({
      savednext2days: {
        '>': new Date()
      }
    })
    .then((response) => {
      response.forEach((e) => {
        var startDate = moment((new Date(e.savednext2days).toLocaleString('en-US', options)), "MM/DD/YYYY HH");
        var endDate = moment((new Date(todayDate).toLocaleString('en-US', options)), "MM/DD/YYYY HH");
        var diff = startDate.diff(endDate, 'hours');
        if (diff === 4) {
          async function createNotification() {
            const notiObj = {
              message: '4 hours left',
              notificationtag: 'Crowdsource',
              notificationDate: new Date(),
              status: 'Pending',
              serviceRequest: e.id,
              ref_id: e.req_id,
            }
            var noti = await Notification.create(notiObj).fetch()
            return noti;
          }
          createNotification()
            .then((response) => {
              console.log("response")
            })
            .catch((error) => {
              console.log(error);
            })
        }
      })
    })
    .catch((error) => {
      console.log("find error", error)
    })

});


function sendEmail(
  parentCallback,
  fromEmail,
  toEmails,
  subject,
  textContent,
  htmlContent
) {

  const errorEmails = [];
  const successfulEmails = [];
  const sg = require('sendgrid')('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');
  async.parallel([
    function(callback) {
      // Add to emails
      for (let i = 0; i < toEmails.length; i += 1) {
        // Add from emails
        const senderEmail = new helper.Email(fromEmail);
        // Add to email
        const toEmail = new helper.Email(toEmails[i]);
        // HTML Content
        const content = new helper.Content('text/html', textContent);
        const mail = new helper.Mail(senderEmail, subject, toEmail, content);
        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON()
        });
        sg.API(request, function(error, response) {
          // console.log('SendGrid');
          if (error) {
            // console.log('Error response received');
          }
          // console.log(response.statusCode);
          // console.log(response.body);
          // console.log(response.headers);
        });
      }
      // return
      callback(null, true);
    }
  ], function(err, results) {
    // console.log('Done');
  });
  parentCallback(null, {
    successfulEmails: successfulEmails,
    errorEmails: errorEmails,
  });
}

module.exports = {
  getServiceRequests: (req, res, next) => {
    // console.log(req.body.view, "asfasdfasdfasdfasdf")
    if (req.body.view) {
      Service.findOne({
          id: req.body.query
        })
        .populate('nominees')
        .populate('assigned_users')
        .populate('serviceInstance')
        .populate('enrollments')
        .then((services) => {
          return res.json(services)
        })
        .catch((error) => {
          res.send(400).json(error)
        })
    } else {
      // console.log("hitting backend2")
      Service.find({
          user: req.body.user_id
        })
        .populate('assigned_users')
        .populate('serviceInstance')
        .populate('enrollments')
        .populate('nominees')
        .then((services) => {
          // sails.log("service", services)
          return res.json(services)
        })
        .catch((error) => {
          //res.send(400).json(error)
        })
    }
  },



  addServiceRequest: (req, res, next) => {

    var reqData = req.body;
    // console.log("chceking user config------------------------------")
    // Service.find((err, services) => {
    // const count_s = services.length + 1;
    // var newServiceId = 'p' + count_s;

    let serviceForm = {
      // id:count_s,
      // cust_name:req.body.cust_name,
      // _id: reqData.id,
      Requestername: reqData.Requestername,
      email_address: reqData.email_address,
      Phonenumber: reqData.Phonenumber,
      Clientname: reqData.Clientname,
      onbehalfemail: reqData.onbehalfemail,
      onbehalfname: reqData.onbehalfname,
      onbehalfphonenumber: reqData.onbehalfphonenumber,
      // Domain: req.body.Domain,
      Role: reqData.Role,
      ServiceRequested: reqData.ServiceRequested,
      RequestType: reqData.RequestType,
      PreferredChannel: reqData.PreferredChannel,
      Preferredplatform: reqData.Preferredplatform,
      Fidelity: reqData.Fidelity,
      techStackArray: reqData.techStackArray,
      tilldate: reqData.tilldate,
      dueDate: reqData.dueDate,
      req_id: reqData.req_id,
      uploadDate: reqData.uploadDate,
      user: reqData.user_id,
      timeStamp: reqData.timeStamp,
      userconfigure: reqData.userconfigure,
      status: reqData.status,
      servicerejectComment: "",
      instance_url: "",
      approvedDate: reqData.approvedDate
    }
    console.log("------------------------------------------------------------------>", serviceForm);
    async function createService() {
      var createdService = await Service.create(serviceForm).fetch();
      return createdService;
    }
    createService().then((data) => {
        console.log("-----------------------------------<--------------------------", data)
        var envlength = 0;
        var instancelength;
        var instancedurationneed;
        if (reqData.userconfigure == true) {

          envlength = 1;
          // console.log("envlength;true", envlength)
        } else if (reqData.userconfigure == false) {

          // console.log(reqData.environments,"reqData.environments")
          each(reqData.environments, function(elem, next) {
            instancedurationneed = elem.DurationNeededField;
            const currentDate = new Date();
            options1 = {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit' ,
            };
            currentDate.setDate(currentDate.getDate() + (instancedurationneed * 7));
            var maxtoDate = currentDate.toLocaleString('en-IN', this.options1);
            // console.log(elem,"elem============================")
            for (var i = 0; i < elem.InstanceNeededField; i++) {
              let serviceinstance = {
                services_id: data.id,
                user_id: data.user,
                instance_id: null,
                assignedto: "",
                OperatingSystemField: elem.OperatingSystemField,
                PrototypePlatformField: elem.PrototypePlatformField,
                DurationNeededField: new Date(maxtoDate).toISOString(),
                provision_date_from: "",
                provision_date_to: ""
              };
              async function createServiceInstance() {
                var createdServiceInstance = await Serviceinstances.create(serviceinstance).fetch();
                return createdServiceInstance;
              }
              createServiceInstance().then((response) =>
                  console.log("successfully raised the request")
                )
                .catch((err) =>
                  console.log("erroe while raising the service request", err)
                )
            }
            next();
          }, function(error) {
            console.log("raising service request is completed")
          })
        }
        if (data.status == "Pending") {
          let mailOptions = {
            from: '"TOY BOX" <no-reply@toybox.com>', // sender address
            to: req.body.email_address, // list of receivers
            subject: 'Service Request has been successfully submitted..!!', // Subject line
            text: '', // plain text body
            html: "Hi " + (req.body.email_address) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID has been successfully submitted for admin review.</p><p>You'll receive an email notification in the event of a status change for your servicerequest.</p><p>You can check the status of your service request <a href='http://toy-boxpro.com:8004/#/servicebox/service-request'>here</a> or by going to 'My service requests' section in Toybox.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
          };
          // sendEmail(
          //   mailOptions
          // );
        }
        // sails.log(data);
        res.json(data);


      }).catch((error) => {
        sails.log('asd', error);
        res.json({
          success: false,
          message: "failed service"
        });
      })
      // });
  },


  deleteServiceRequest: (req, res, next) => {
    // console.log("DeleteInstanceUrl1")
    Service.find({
      id: req.params.id
    }, function(err, services) {
      if (err) {
        console.log("error in service request")
      } else {
        // Environment.destroy({ service_id: req.params.id }).then((envData) => {
        // console.log("env deleted")
        Serviceinstances.destroy({
            services_id: req.params.id
          })
          .then((serviceData) => {
            Service.destroy({
                id: req.params.id
              })
              .then((serviceData) => {
                res.json({
                  status: 'ok'
                })
              })
              .catch((err) => {
                console.log(err)
              })
          })
          .catch((err) => {
            console.log(err)
          })
          // })
          // .catch((err) => {
          //     // console.log("env not deleted")
          //     res.json(err);
          // })

        Notification.destroy({
            "ref_id": req.params.id
          })
          .then((data) => {
            //console.log("notification deleted");
          })
          .catch((err) => {
            console.log(err)
          })
      }
    });
  },


  updateService: (req, res, next) => {
    var reqData = req.body;
    // console.log("hitting the back end")
    //  console.log(req.params.id,"hitting bakc end params id",reqData, "==============================================")
    // Service.find(function(err, services) {
    Instances.find(function(err, instances) {
      //  console.log("validation instances")
      var inst = JSON.stringify(instances);
      //var instances1 = JSON.parse(inst)
      async function updateService() {
        var updatedService = await Service.update({
          id: req.params.id
        }).set({

          "Clientname": req.body.Clientname,
          //"Domain": req.body.query.Domain,
          "user_id": req.body.user_id,
          "req_id": req.body.req_id,
          "onbehalfemail": req.body.onbehalfemail,
          "onbehalfname": req.body.onbehalfname,
          "onbehalfphonenumber": req.body.onbehalfphonenumber,
          "techStackArray": req.body.techStackArray,
          "Role": req.body.Role,
          "ServiceRequested": req.body.ServiceRequested,
          "Fidelity": req.body.Fidelity,
          "InstanceNeededField": req.body.InstanceNeededField,
          "OperatingSystemField": req.body.OperatingSystemField,
          "Phonenumber": req.body.Phonenumber,
          "PreferredChannel": req.body.PreferredChannel,
          "Preferredplatform": req.body.Preferredplatform,
          "PrototypePlatformField": req.body.PrototypePlatformField,
          "RequestType": req.body.RequestType,
          "Requestername": req.body.Requestername,
          "email_address": req.body.email_address,
          "status": req.body.status,
          "timeStamp": req.body.timeStamp,
          "userconfigure": req.body.userconfigure,
          "tilldate": req.body.tilldate,
          "dueDate": req.body.dueDate,
          "approvedDate": req.body.approvedDate
            // "instance_url":instanceurl
        })
        return updatedService;
        console.l0g(updatedService, "updatedServiceupdatedServiceupdatedServiceupdatedServiceupdatedServiceupdatedService")
      }

      updateService().then((data) => {
        // console.log("whoooooooooooooooooooo")
        var envlength = 0;
        var instancelength;
        var instancedurationneed;
        if (reqData.userconfigure == true) {
          envlength = 1;
          // console.log("envlength;true", data.id)
        } else if (reqData.userconfigure == false) {
          // console.log("envlength;true", data)
          // console.log(reqData.environments,"reqData.environments")
          each(reqData.environments, function(elem, next) {
            instancedurationneed = elem.DurationNeededField;
            const currentDate = new Date();
            options1 = {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit' ,
            };
            currentDate.setDate(currentDate.getDate() + (instancedurationneed * 7));
            var maxtoDate = currentDate.toLocaleString('en-IN', this.options1);
            // console.log(elem,"elem============================")
            for (var i = 0; i <= elem.InstanceNeededField; i++) {
              async function updateServiceInstance() {
                var UpdateServiceInstance = await Serviceinstances.update({
                  services_id: req.params.id
                }).set({
                  "user_id": req.body.user_id,
                  "instance_id": null,
                  "assignedto": "",
                  "OperatingSystemField": elem.OperatingSystemField,
                  "PrototypePlatformField": elem.PrototypePlatformField,
                  "DurationNeededField": new Date(maxtoDate).toISOString(),
                  "provision_date_from": "",
                  "provision_date_to": ""
                })
                return UpdateServiceInstance;
              }
              updateServiceInstance().then((response) =>
                  console.log("successfully updated the request")
                )
                .catch((err) =>
                  console.log("erroe while updating the service request", err)
                )
            }
            next();
          }, function(error) {
            console.log("raising service request is completed")
          })
        }

        // for (var i = 0; i < reqData.environments.length; i++) {

        //     // console.log("reqData.environments[i].id ",reqData);
        //     if (reqData.environments[i].id != '') {
        //         async function updateEnv() {
        //             var updatedEnv = await Environment.update({
        //                     id: reqData.environments[i].id
        //                 })
        //                 .set({
        //                     OperatingSystemField: reqData.environments[i].OperatingSystemField,
        //                     PrototypePlatformField: reqData.environments[i].PrototypePlatformField,
        //                     InstanceNeededField: reqData.environments[i].InstanceNeededField,
        //                     DurationNeededField: reqData.environments[i].DurationNeededField
        //                 })
        //         }
        //         updateEnv().then((db) => {}).catch((err) => { console.log("updateenv", err) })

        //     } else {

        //         if (reqData.environments[i].OperatingSystemField != "") {
        //             // console.log("Here ADD" );
        //             let environmentDB = {
        //                 service_id: req.params.id,
        //                 user_id: reqData.user_id,
        //                 OperatingSystemField: reqData.environments[i].OperatingSystemField,
        //                 PrototypePlatformField: reqData.environments[i].PrototypePlatformField,
        //                 InstanceNeededField: reqData.environments[i].InstanceNeededField,
        //                 DurationNeededField: reqData.environments[i].DurationNeededField
        //             };

        //             async function createEnv() {
        //                 var createdEnv = await Environment.create(environmentDB).fetch();
        //                 return createdEnv;
        //             }
        //             createEnv().then((envdata) => {
        //                 return {
        //                     success: false,
        //                     message: "failed"
        //                 };
        //                 // console.log("created env:---",
        //                 //   envdata);
        //             }).catch((err) => {
        //                 console.log("createenv", err);
        //             })
        //         }
        //     }
        // }

        res.json(data);
      }).catch((err) => {
        console.log("last update", err)
        res.json(err);
      })



    });
  },


  ApproveRequest: (req, res, next) => {
    // console.log(req.body, "req.body approcve requwert")
    if (req.body.status === "Resubmitted") {
      // console.log("resubmitted approval")
      Service.update({
          id: req.body.id
        })
        .set({
          status: "Fulfilled"
        })
        .then((instancesAdded) => {
          async function updateNotification() {
            var updatedNotification = await Notification.update({
              "ref_id": req.body.id
            }).set({
              status: "Approved"
            }).fetch();
            return updatedNotification;
          }
          updateNotification()
            .then((results) => {
              let mailOptions = {
                from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Service Request has been Approved..!!', // Subject line
                text: '', // plain text body
                html: "Hi " + (req.body.email) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID : " + (req.body.req_id) + " has been Re-Approved.<p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8010/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
              };
              sendEmail(
                mailOptions
              );
            })
            .catch((err) => {
              // console.log("error in sendingMail")
            })
            //   res.json("success");
        })
        .catch((err) => {
          console.log("error in instances update")
        })
    } else {
      async function instancesAdded() {
        var updatestatus;
        if (req.body.userconfigure == false) {
          updatestatus = "Pending Provisioning"
        } else if (req.body.userconfigure == true) {
          updatestatus = "Pending Resources"
        }
        var instancesAdded = await Service.update({
            id: req.body.id
          })
          .set({
            status: updatestatus,
            approvedDate: req.body.approvedDate
          }).fetch();
        return instancesAdded;
      }
      instancesAdded()
        .then((instancesAdded) => {
          // console.log("update then in createservice instance===", instancesAdded)
          async function updateNotification() {
            var updatedNotification = await Notification.update({
              "ref_id": req.body.id
            }).set({
              status: "Approved"
            }).fetch();
            return updatedNotification;

          }
          updateNotification()
            .then((results) => {
              console.log(req.body.email, " req.body.email")
              let mailOptions = {
                from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Service Request has been Approved..!!', // Subject line
                text: '', // plain text body
                html: "Hi " + (req.body.email) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID : " + (req.body.req_id) + " has been Approved.<p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8010/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
              };
              sendEmail(
                mailOptions
              );
            })
            .catch((err) => {
              console.log("error in sendingMail", err)
            })
          res.json(instancesAdded)
        })
        .catch((err) => {
          console.log("error in instances update", err)
        })
      console.log("no error in backend")
      Serviceinstances.find({
          services_id: req.body.id
        })
        .then((requests) => {
          var instance = [];
          var Response = [];
          var instanceCount = {
            lm: 0,
            wm: 0,
            wa: 0
          }
          console.log("no error in backend1", requests)
          let promise1 = new Promise((resolve, reject) => {
            for (let i = 0; i < requests.length; i++) {
              if (requests[i].PrototypePlatformField === 'MEAN STACK' && requests[i].OperatingSystemField === 'Linux') {
                instanceCount.lm++;
              } else if (requests[i].PrototypePlatformField === 'MEAN STACK' && requests[i].OperatingSystemField === 'Windows') {
                instanceCount.wm++;
              } else if (requests[i].PrototypePlatformField === 'Axure RP' && requests[i].OperatingSystemField === 'Windows') {
                instanceCount.wa++;
              }

            }
            for (a in instanceCount) {
              if (instanceCount[a] > 0 && a === 'lm') {
                let temp = {
                  type: {
                    platform: 'MEAN STACK',
                    os: 'Linux'
                  },
                  req_quantity: instanceCount[a],
                  ava_instance: 0,
                  norm_flag: false,
                  aws_flag: false
                }
                instance.push(temp);
              } else if (instanceCount[a] > 0 && a === 'wm') {
                let temp = {
                  type: {
                    platform: 'MEAN STACK',
                    os: 'Windows'
                  },
                  req_quantity: instanceCount[a],
                  ava_instance: 0,
                  norm_flag: false,
                  aws_flag: false
                }
                instance.push(temp);
              } else if (instanceCount[a] > 0 && a === 'wa') {
                let temp = {
                  type: {
                    platform: 'Axure RP',
                    os: 'Windows'
                  },
                  req_quantity: instanceCount[a],
                  ava_instance: 0,
                  norm_flag: false,
                  aws_flag: false
                }
                instance.push(temp);
              }
            }
            console.log('instance-----------', instance);
            console.log("no error in backend2")
            resolve("success");
          });
          let promise2 = new Promise((resolve, reject) => {
            Instances.find({
                flag: false
              })
              .exec((err, res) => {
                instance.forEach((e, i) => {
                  res.forEach((r, i) => {
                    if (e.type.platform == r.instance_type && e.type.os == r.operating_system) {
                      e.ava_instance++;
                    }
                  })
                  if (e.req_quantity > e.ava_instance) {
                    // console.log("true aws");
                    e.aws_flag = true;
                    console.log('in aws flag true');
                  } else {
                    e.norm_flag = true;
                  }
                });
                resolve(instance);
              });
          });

          function main() {
            console.log("function called");
            Promise.all([promise1, promise2]).then((response) => {
              console.log("requests")

              function callback() {
                /* ------------- Normal flow starts------------------*/
                each(requests, function(elem, next) {
                  console.log("requests")
                  var evnironmentinstancesneeded = elem.InstanceNeededField;
                  console.log("evnironmentinstancesneeded", "----instanceneeded")
                  for (var j = 0; j < evnironmentinstancesneeded; j++) {

                    // let serviceinstance = {
                    //   env_id: requests[i].id,
                    //   services_id: requests[i].services_id,
                    //   user_id: requests[i].user_id,
                    //   instance_id: null,
                    //   assignedto: "",
                    //   provision_date_from: "",
                    //   provision_date_to: ""
                    // };
                    // async function createServiceInstance() {
                    //   var createdServiceInstance = await Serviceinstances.create(serviceinstance).fetch();
                    //   return createdServiceInstance;
                    // }
                    // createServiceInstance()
                    //   .then((serviceinstancesdata) => {
                    async function instancesAdded() {
                      var instancesAdded = await Service.update({
                          id: req.body.id
                        })
                        .set({
                          status: "Pending Provisioning",
                          approvedDate: req.body.approvedDate
                        }).fetch();
                      return instancesAdded;
                    }
                    instancesAdded()
                      .then((instancesAdded) => {
                        console.log("update then in createservice instance===", instancesAdded)
                        async function updateNotification() {
                          var updatedNotification = await Notification.update({ "ref_id": req.body.id }).set({ status: "Approved" }).fetch();
                          return updatedNotification;

                        }
                        updateNotification()
                          .then((results) => {
                            let mailOptions = {
                              from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                              to: req.body.email, // list of receivers
                              subject: 'Service Request has been Approved..!!', // Subject line
                              text: '', // plain text body
                              html: "Hi " + (req.body.email) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID : " + (req.body.req_id) + " has been Approved.<p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8010/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                            };
                            sendEmail(
                              mailOptions
                            );
                          })
                          .catch((err) => {
                            // console.log("error in sendingMail")
                          })
                      })
                      .catch((err) => {
                        console.log("error in instances update", err)
                      })
                      //   })
                      //   .catch((err) => {
                      //     console.log("error in serviceinstance creation", err)
                      //   })

                  }
                  next();
                }, function(err) {
                  //   Service.findOne({ id: req.body.id })
                  //     .populate('assigned_users')
                  //     .populate('serviceInstance')
                  //     .populate('enrollments')
                  //     .then((service) => {
                  //       res.json(service)
                  //     })
                  //     .catch((error) => {
                  console.log(err)
                    //         //   res.sendStatus(400).json(error);
                    //     })
                });

                /* ------------- Normal flow ends------------------*/
              }
              console.log("asdfasdfasdf")
              var itemsProcessed = 0;
              var i = 0
              var response;
              instance.forEach((e, index) => {
                itemsProcessed++;
                console.log("processed")
                  // console.log(instance);
                if (e.aws_flag === true) {
                  var difference = e.req_quantity - e.ava_instance;
                  console.log("difference");

                  function resolveAfter2Seconds(difference) {
                    return new Promise(resolve => {
                      async function f2() {
                        let response;
                        try {
                          console.log("calling f2")
                          response = await AWS.createInstance(e.type.os, e.type.platform, difference);
                          resolve(response);
                        } catch (err) {
                          console.log(err);
                        }
                      }
                      f2();
                    });
                  }
                  async function f1() {
                    // for(;i<difference;i++){
                    let waited;
                    try {
                      waited = await resolveAfter2Seconds(difference);
                      console.log("got it");
                    } catch (err) {
                      console.log(err, " error in resolveAfter2Seconds");
                    }
                    // }
                  }
                  f1();
                }
                if (itemsProcessed === instance.length) {
                  console.log("calling call back")
                  callback();
                }
              });
            }).catch((err) => {
              console.log(err);
            });
          }
          main();
        })
        .catch((err) => {
          console.log("error in service request", err)
        })
    }
  },


  RejectRequest: (req, res, next) => {
    // console.log(req.body,"hitting back end servicerequestisnatces")
    async function serviceReject() {
      var updatedService = await Service.update({
          id: req.body.id
        })
        .set({
          status: "Rejected",
          servicerejectComment: req.body.servicerejectComment
        }).fetch();
      return updatedService;
    };
    serviceReject()
      .then((service) => {
        async function updateNotification() {
          var updatedNotification = await Notification.update({
            "ref_id": req.body.id
          }).set({
            status: "Rejected"
          }).fetch();
          return updatedNotification;
        }
        updateNotification()
          .then((results) => {
            let mailOptions = {
              from: '"TOY BOX" <no-reply@toybox.com>', // sender address
              to: req.body.email, // list of receivers
              subject: 'Service Request has been Rejected..!!', // Subject line
              text: '', // plain text body
              html: "Hi " + (req.body.email) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID : " + (req.body.req_id) + " has been Rejected.<p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8010/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
            };
            sendEmail(
              mailOptions
            );
          }).catch((err) => {
            // console.log("error in sendingMail")
          })
        Service.findOne({
            id: req.body.id
          })
          .populate('assigned_users')
          .populate('serviceInstance')
          .populate('enrollments')
          .then((service) => {
            res.json(service)
          })
          .catch((error) => {
            res.sendStatus(400).json(error);
          })
      })
      .catch((err) => {
        res.json(err);
      })

  },


  revertRequest: (req, res, next) => {
    // console.log(req.body.id);
    async function removeServiceInstance() {
      var removedServiceInstance = await Serviceinstances.destroy({
        services_id: req.body.id
      }).fetch();
      return removedServiceInstance;
    }
    removeServiceInstance()
      .then((result) => {
        async function updatedService() {
          var updatedService = await Service.update({
              id: req.body.id
            })
            .set({
              status: "Pending"
            }).fetch();
          return updatedService;
        }
        updatedService()
          .then((requestreverted) => {
            async function updateNotification() {
              var updatedNotification = await Notification.update({
                "ref_id": req.body.id
              }).set({
                status: "Reverted"
              })
              return updatedNotification;
            }
            updateNotification()
              .then((results) => {
                let mailOptions = {
                  from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                  to: req.body.email, // list of receivers
                  subject: 'Service Request has been Reverted..!!', // Subject line
                  text: '', // plain text body
                  html: "Hi " + (req.body.email) + ",<br><p>&ensp;&ensp;&ensp;Your service request - Service request ID : " + (req.body.req_id) + " has been Reverted.<p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8010/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                };
                sendEmail(
                  mailOptions
                );
              })
              .catch((err) => {
                // console.log("error in sendingMail")
              })
            Service.findOne({
                id: req.body.id
              })
              .populate('assigned_users')
              .populate('serviceInstance')
              .populate('enrollments')
              .then((service) => {
                res.json(service)
              })
              .catch((error) => {
                res.sendStatus(400).json(error);
              })
          })
          .catch((err) => {
            // console.log("error in instances update")
          })

      })
      .catch((err) => {
        console.log("error in revert function", err)
        res.json("err");
      })
  },


  assignCrowd: (req, res, next) => {
    var assignResources = req.body.assignResources;
    var useridarray = [];
    async function updateService() {
      for (var i = 0; i < assignResources.length; i++) {
        useridarray.push(assignResources[i].user_id)
      }
      var updatedService = await Service.update({
        id: req.params.id
      }).set({
        "assigned_users": useridarray,
        "status": "Pending Provisioning",
        "campaign": false
      }).fetch();
      return updatedService;
    }
    updateService()
      .then((updatedService) => {
        // for(var i=0;i< req.body.length;i++){
        each(assignResources, function(serviceinstaneele, next) {
          let serviceinstance = {
            services_id: req.params.id,
            user_id: serviceinstaneele.user_id,
            instance_id: null,
            assignedto: serviceinstaneele.email,
            OperatingSystemField: "",
            PrototypePlatformField: "",
            DurationNeededField: "",
            provision_date_from: req.body.serviceLifeSpanFromPicker,
            provision_date_to: req.body.serviceLifeSpanToPicker
          };
          async function createServiceInstance() {
            var createdServiceInstance = await Serviceinstances.create(serviceinstance).fetch();
            return createdServiceInstance;
          }
          createServiceInstance().then((response) =>
              console.log("successfully raised the request")
            )
            .catch((err) =>
              console.log("erroe while raising the service request", err)
            )
          next();
        })

        // }
        // console.log("updatedser", updatedService);
        //  console.log("services----------------------------------", services);
        // var assignedResources = req.body;
        var dueDate = moment(updatedService.dueDate).format('DD-MMM-YYYY');
        var tilldate = moment(updatedService.tilldate).format('DD-MMM-YYYY');
        // for (i = 0; i < assignResources.length; i++) {
        //     console.log("sending mail to ", assignResources);
        //     let mailOptions = {
        //         from: '"TOY BOX" <no-reply@toybox.com>', // sender address
        //         to: assignResources[i].email, // list of receivers
        //         subject: 'Successfully Chosen for campaigned service request', // Subject line
        //         text: '', // plain text body
        //         html: '<table cellpadding="0" cellspacing="0" border="0" style="height: 336px;background-color: #2550bc;width:100%"><tr><td style="height:25px;"></td></tr><tr><td><span style="display: inline-block;width:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><img src="https://s3.amazonaws.com/braas-monier/logo_new.png" /></td></tr><tr style="width: 100%"><td><p style="margin: 65px 0 0 100px;font-size: 57px;font-family:Open Sans;color:white;">Hi ' + assignResources[i].email + '</p></td></tr></table><div style="height: 495px;background-color: white;font-family:Open Sans "><table cellpadding="0" cellspacing="0" border="0" style="padding:0px;margin:0px;width:100%;font-family:Open Sans"><tr><td style="height: 72px;width: 100%;padding:0px;margin:0px;"></td></tr><tr><td style="padding:0px;margin:0px;" width="560"><table cellpadding="0" cellspacing="0" border="0" style="float:left;width: 401px;height: 416px;padding: 62px 0 0 0;"><tr style="padding:0px;margin:0px;"><td style="background-color: #2550bc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/client.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Client Name</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;font-family:Open Sans">' + updatedService[0].Clientname + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2a5ad4;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/tech.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Tech Category</p><p style="color: black;font-size: 20px;test-overflow:ellipses;overflow:hidden;white-space: nowrap;margin: 0;">' + updatedService[0].Preferredplatform + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2e67f7;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/calendra.png"></td><td style="display: inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Project Time Line</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + dueDate + '-' + tilldate + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #467afc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/roles.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Required Roles</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + (updatedService[0].skillsetneeded) + '</p></td></tr></table></td><td style="display: inline-block; width: 888px;margin: 72px 0 0 0;height: 420px;float: right;border-left: 1px #a2a2a2 solid;"><table><tr><p style="font-size: 36px;display: inline-block;margin: 0 0 0 40px;padding: 0 0 0 10px;border-left: 2px #2550bc solid;color: black;margin-bottom: 15px;">About</p><p style="margin: 0 0 0 40px;color: black;font-family: Open Sans ; font-size:20px;"> Congratulations! Your nomination for participating in the crowd campaign for building an ' + updatedService[0].Preferredplatform + ' based ' + updatedService[0].Fidelity + ' prototype for ' + updatedService[0].Clientname + ' has been accepted.</p></tr></table><hr style="margin: 44px 0 0 0;width: 895px;border-top:1px #a2a2a2;"><p style="margin: 0 0 0 40px;color: black; font-size:20px;">Reach out to your Toybox Project POC to know more.</p></td></tr><tr><td colspan="3" style="padding:0px;margin:0px;font-size:20px;height:20px;margin: 70px 0 0 0;" height="20">&nbsp;</td></tr></table></div><div style="text-align: center;"><p style="font-family:Open Sans ;font-size: 20px;color: black;">For any <span style="color: #2550bc;font-size: 36px;">Queries</span>, reach out to us at <a style="text-decoration: none;color: #2550bc !important;">Toyboxsupport@cognizant.com</a></p></div>'
        //     };
        //     console.log("mail content");
        //     sendEmail(
        //         mailOptions
        //     );
        // }
        res.json({
          status: 'ok'
        })

      })
      .catch((err) => {
        console.log("assiggncrows----", err)
        res.json(err);
      });
  },

  validateToyboxUser: (req, res, next) => {
    // console.log(req.body, "email req.body")
    var emailId = req.body.email.split('@')
    if (emailId[1] == "cognizant.com") {
      var userDetails = {
        userName: "593553@cognizant.com",
        password: "hanniballecter#95"
      };
      var adminDetails = {
        ldapUrl: 'ldap://10.251.96.22:389',
        userName: '',
        password: '',
        baseDN: "dc=cts, dc=com"
      };
      var adminClient = ldap.createClient({
        url: 'ldap://10.251.96.22:389'
      });
      adminClient.bind(userDetails.userName, userDetails.password, function(err) {
        if (err) {
          authenticationFlag = false;
          // console.log("authenticationFlag " + authenticationFlag);
          console.log(err)
            // return res.json({
            // 	success:false,
            // 	msg:'Invalid Credentials!'

          // });
        } else {
          var uid = emailId[0];
          var  opts  =   {
            "filter":   "(&(objectCategory=User)(mail=" + req.body.email + "))",
            "scope":   "sub" 
          };
          adminClient.search(adminDetails.baseDN, opts, function(err, ldapResult) {
            if (err != null) {
              console.log("user does'nt exist");
            } else {
              var emailflag
                //if we get a result then there is a user uid
              ldapResult.on('searchEntry', function(entry) {
                  emailflag = entry.object.mail
                  res.json("user does exist")
                })
                //if we get to the end and there is no DN, it mean there is no user.
              ldapResult.on("end",  function(result) {
                if (!emailflag) {
                  res.json("user doesn't exist")
                }
              })

            }
          });
        }

      })
    } else {
      console.log(emailId, "email_id")
      User.find({
        email: req.body.email
      }, function(err, user) {
        if (err) {
          console.log("could'nt find")
        } else {
          if (!user.length) {
            console.log("email id doesn't exists")
            res.json("user doesn't exist")
          } else if (user.length) {
            console.log("email id does exists")
            res.json("user does exist")
          }
        }
      });
    }
  },

  assignInstances: (req, res, next) => {
    console.log(req.body, "-----------------------------------------------------------------------------")
    each(req.body, function(updateinstanceelement, next) {
      // var d = new Date();
      // var fromDate = e.provision_date_from;
      // var toDate = e.e.provision_date_to;
      // fromDate = d.toISOString();
      // toDate = toDate.toISOString();    
      // console.log("from",fromDate);
      // console.log("to",toDate); 
      // Instances.find({ where })
      // console.log("updateinstanceelement", updateinstanceelement);
      Instances.find({
        and: [{
            and: [{
              flag: false
            }, {
              operating_system: updateinstanceelement.OperatingSystemField
            }]
          },
          {
            instance_type: updateinstanceelement.PrototypePlatformField
          }
        ]
      }, function(err, instancesobject) {
        if (err) {
          console.log("erroe in instance assigning at user congfi")
        } else {
          // console.log("instancesobject", instancesobject)
          if (!instancesobject.length)
            return false;
          Instances.update({
              id: instancesobject[0].id
            })
            .set({
              flag: true
            })
            .then((db) => {
              // console.log(instanceid, "<<<<<<<<<<<<<<", updateinstanceelement);

              var x = new Date(updateinstanceelement.provision_date_from).toISOString()
              var instanceid = instancesobject[0].id;
              async function updateServiceInstances() {
                var updatedServiceInstances = await Serviceinstances.update({
                  id: updateinstanceelement.id
                }).set({
                  instance_id: instanceid,
                  assignedto: updateinstanceelement.assignedto,

                  OperatingSystemField: updateinstanceelement.OperatingSystemField,
                  PrototypePlatformField: updateinstanceelement.PrototypePlatformField,
                  provision_date_from: new Date(updateinstanceelement.provision_date_from).toISOString(),
                  provision_date_to: new Date(updateinstanceelement.provision_date_to).toISOString()
                }).fetch();
                return updatedServiceInstances;
              }
              updateServiceInstances()
                .catch((err) => {
                  console.log("error")
                })
                .then((updatedServiceInstances) => {
                  // console.log("ssssss", updatedServiceInstances);
                  async function updateEnv() {
                    await Environment.update({
                      id: updateinstanceelement.env_id
                    }).set({
                      OperatingSystemField: updateinstanceelement.OperatingSystemField,
                      PrototypePlatformField: updateinstanceelement.PrototypePlatformField,
                      // InstanceNeededField: instancelength,
                      // DurationNeededField:  new Date(maxtoDate).toISOString()
                    });
                  }
                  // if(updateinstanceelement.OperatingSystemField){
                  // console.log("success while updateing enviroments", updateinstanceelement.id)
                  updateEnv().then((b) => {
                      console.log("success while updateing enviroments")
                    })
                    // }


                  User.findOne({
                      email: updatedServiceInstances[0].assignedto
                    })
                    .then((user) => {
                      // console.log(user, "user id");
                      // console.log("updated[0]", updatedServiceInstances[0].services_id)
                      Service.update({
                          id: updatedServiceInstances[0].services_id

                        })
                        .set({
                          status: "Fulfilled",
                          assigned_users: user.id
                        })
                        .then((results) => {
                          // console.log("-----status is fulfilled-----")
                          // console.log(updateinstanceelement.assignedto, 'sending mail to-----------');
                          var url = "http://toy-boxpro.com:8010/#/myProject"
                          var dueDate = moment(req.body[0].provision_date_from).format('DD MMM YYYY');
                          var tilldate = moment(req.body[0].provision_date_to).format('DD MMM YYYY');
                          let mailOptions = {
                            from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                            to: updateinstanceelement.assignedto, // list of receivers
                            subject: 'Successfully assigned instance', // Subject line
                            text: '', // plain text body
                            html: '<table cellpadding="0" cellspacing="0" border="0" style="height: 336px;background-color: #2550bc;width:100%"><tr><td style="height:25px;"></td></tr><tr><td><span style="display: inline-block;width:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><img src="https://s3.amazonaws.com/braas-monier/logo_new.png" /></td></tr><tr style="width: 100%"><td><p style="margin: 65px 0 0 100px;font-size: 57px;font-family:Open Sans;color:white;">Hi ' + '' + '</p></td></tr></table><div style="height: 495px;background-color: white;font-family:Open Sans "><table cellpadding="0" cellspacing="0" border="0" style="padding:0px;margin:0px;width:100%;font-family:Open Sans"><tr><td style="height: 72px;width: 100%;padding:0px;margin:0px;"></td></tr><tr><td style="padding:0px;margin:0px;" width="560"><table cellpadding="0" cellspacing="0" border="0" style="float:left;width: 401px;height: 416px;padding: 62px 0 0 0;"><tr style="padding:0px;margin:0px;"><td style="background-color: #2550bc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/client.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Operating Systems</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;font-family:Open Sans">' + req.body[0].OperatingSystemField + '</p> </td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2a5ad4;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/tech.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Pre-loaded Platform</p><p style="color: black;font-size: 20px;test-overflow:ellipses;overflow:hidden;white-space: nowrap;margin: 0;">' + req.body[0].PrototypePlatformField + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2e67f7;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/calendra.png"></td><td style="display: inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Start Date</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + dueDate + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #467afc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/roles.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">End Date</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + tilldate + '</p></td></tr></table></td><td style="display: inline-block; width: 888px;margin: 72px 0 0 0;height: 420px;float: right;border-left: 1px #a2a2a2 solid;"><table><tr><p style="font-size: 36px;display: inline-block;margin: 0 0 0 40px;padding: 0 0 0 10px;border-left: 2px #2550bc solid;color: black;margin-bottom: 15px;">About</p><p style="margin: 0 0 0 40px;color: black;font-family: Open Sans ; font-size:20px;">Based on the request ' + ' ' + ' raised by ' + req.body[0].requesteremail + ',the following instance has been provisioned to you.</p><p style="margin: 23px 0 8px 40px;color: #9f9e9e; font-size:20px;font-family:Open Sans"><a href=' + (url) + '>Click</a> here to launch the instance. </p></tr></table><hr style="margin: 44px 0 0 0;width: 895px;border-top:1px #a2a2a2;"><p style="margin: 0 0 0 40px;color: black; font-size:20px;">To learn more on how to utilize the instance, <a>click</a> here</p><p style="margin: 23px 0 0 40px;color: #9f9e9e; font-size:20px;">Thank you for choosing Toybox.</p></td></tr><tr><td colspan="3" style="padding:0px;margin:0px;font-size:20px;height:20px;margin: 70px 0 0 0;" height="20">&nbsp;</td></tr></table></div><div style="text-align: center;"><p style="font-family:Open Sans ;font-size: 20px;color: black;">For any <span style="color: #2550bc;font-size: 36px;">Queries</span>, reach out to us at <a style="text-decoration: none;color: #2550bc !important;">Toyboxsupport@cognizant.com</a></p></div>'
                          };
                          // console.log(mailOptions.html, "mail content");
                          sendEmail(
                            mailOptions
                          );
                        })
                        .catch((err) => {
                          console.log("error in sendingMail")
                        })
                    })
                    .catch((err) => {
                      console.log(err, "error in user finding");
                    })


                  console.log("approved instances has been added to the request")
                }).catch((err) => {
                  console.log("error in instances update", err)
                })
              console.log("upadted using mangoose")
            })
            .catch((err) => {
              console.log("error in mangoose update", err)
            })
        }
      });
      next()

    })
    res.json("user has been assigned")
      // console.log(req.body[0].service_id)
      // console.log(req.body[0],"body");
    var dueDate = moment(req.body[0].provision_date_from).format('DD MMM YYYY');
    var tilldate = moment(req.body[0].provision_date_to).format('DD MMM YYYY');
    // console.log('sendingmailto-------------------', req.body[0].requesteremail);
    let mailOptions = {
      from: '"TOY BOX" <no-reply@toybox.com>', // sender address
      to: req.body[0].requesteremail, // list of receivers
      subject: 'Successfully assigned instance', // Subject line
      text: req.body[0].service_id, // plain text body
      html: '<table cellpadding="0" cellspacing="0" border="0" style="height: 336px;background-color: #2550bc;width:100%"><tr><td style="height:25px;"></td></tr><tr><td><span style="display: inline-block;width:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><img src="https://s3.amazonaws.com/braas-monier/logo_new.png" /></td></tr><tr style="width: 100%"><td><p style="margin: 65px 0 0 100px;font-size: 57px;font-family:Open Sans;color:white;">Hi ' + '' + '</p></td></tr></table><div style="height: 495px;background-color: white;font-family:Open Sans "><table cellpadding="0" cellspacing="0" border="0" style="padding:0px;margin:0px;width:100%;font-family:Open Sans"><tr><td style="height: 72px;width: 100%;padding:0px;margin:0px;"></td></tr><tr><td style="padding:0px;margin:0px;" width="560"><table cellpadding="0" cellspacing="0" border="0" style="float:left;width: 401px;height: 416px;padding: 62px 0 0 0;"><tr style="padding:0px;margin:0px;"><td style="background-color: #2550bc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/client.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Operating Systems</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;font-family:Open Sans">' + req.body[0].OperatingSystemField + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2a5ad4;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/tech.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;font-family:Open Sans">Pre-loaded Platform</p><p style="color: black;font-size: 20px;test-overflow:ellipses;overflow:hidden;white-space: nowrap;margin: 0;">' + req.body[0].PrototypePlatformField + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #2e67f7;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/calendra.png"></td><td style="display: inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">Start Date</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + dueDate + '</p></td></tr><tr style="padding:0px;margin:0px;"><td style="background-color: #467afc;width: 105px;height: 104px;float: left;padding:0px 0 0 30px;"><img src="https://s3.amazonaws.com/braas-monier/email_template/roles.png"></td><td style="display:inline-block;width: 293px;height: 104px;padding:0px 0 0 20px;font-family:Open Sans"><p style="color: black;font-size: 24px;margin: 0;font-weight:700;">End Date</p><p style="color: black;font-size: 20px;margin: 0;test-overflow:ellipses;overflow:hidden;white-space: nowrap;">' + tilldate + '</p></td></tr></table></td><td style="display: inline-block; width: 888px;margin: 72px 0 0 0;height: 420px;float: right;border-left: 1px #a2a2a2 solid;"><table><tr><p style="font-size: 36px;display: inline-block;margin: 0 0 0 40px;padding: 0 0 0 10px;border-left: 2px #2550bc solid;color: black;margin-bottom: 15px;">About</p><p style="margin: 0 0 0 40px;color: black;font-family: Open Sans ; font-size:20px;">Based on the request ' + '' + ' raised by you, the following instance has been provisioned.</p></tr></table><hr style="margin: 44px 0 0 0;width: 895px;border-top:1px #a2a2a2;"><p style="margin: 23px 0 0 40px;color: #9f9e9e; font-size:20px;">Thank you for choosing Toybox.</p></td></tr><tr><td colspan="3" style="padding:0px;margin:0px;font-size:20px;height:20px;margin: 70px 0 0 0;" height="20">&nbsp;</td></tr></table></div><div style="text-align: center;"><p style="font-family:Open Sans ;font-size: 20px;color: black;">For any <span style="color: #2550bc;font-size: 36px;">Queries</span>, reach out to us at <a style="text-decoration: none;color: #2550bc !important;">Toyboxsupport@cognizant.com</a></p></div>'
    };
    //console.log(mailOptions.html, "mail content");
    // sendEmail(
    //   mailOptions
    // );

  },

  PendingServiceRequest: (req, res, next) => {

    Service.find({
      or: [{
        and: [{
          userconfigure: true
        }, {
          status: {
            'in': ['Pending', 'Pending Provisioning', 'Pending Resources', 'Resubmitted']
          }
        }]
      }, {
        and: [{
          userconfigure: false
        }, {
          status: {
            'in': ['Pending', 'Resubmitted']
          }
        }]
      }]
    }, function(err, services) {
      if (err) {
        console.log("error in service request", err)
      } else {

        res.json(services);
      }
    })
  },

  ApprovedService: (req, res, next) => {

    var newServicecontent;
    Service.find({
        or: [{
          status: "Fulfilled"
        }, {
          and: [{
            status: "Pending Provisioning"
          }, {
            userconfigure: false
          }]
        }]
      }, function(err, requests) {
        if (err) {
          console.log("error in service request", err)
        } else {

          // newServicecontent=requests;

          res.json(requests);
          // console.log("approvereq");
          //   newServicecontent = '';
        }
      }
      //  res.json(requests);
    );
  },

  getServiceRequestInstances: (req, res, next) => {
    // console.log("hitting back end servicerequestisnatces", req.params.id)
    Serviceinstances.find({
        "services_id": req.params.id
      })
      .populate('services_id')
      .then((requestinstances) => {
        // console.log(requestinstances, "--------requestinstances")
        res.json(requestinstances);
      })
      .catch((err) => {
        console.log("arun should have consolled this", err)
        res.json(err);
      })

  },
  ExtendRequest: (req, res, next) => {
    // console.log("hitting back end servicerequestisnatces", req.body)
    each(req.body, function(extendedinstance, next) {
        async function updateServiceinstances() {
          var updatedServiceInstances = await Serviceinstances.update({
              id: extendedinstance.id
            })
            .set({
              provision_date_from: extendedinstance.provision_date_from,
              provision_date_to: extendedinstance.provision_date_to
            }).fetch();
          return updatedServiceInstances;
        }
        updateServiceinstances()
          .then((success) => {

            Service.update({
                req_id: extendedinstance.req_id
              })
              .set({
                status: "Resubmitted"
              })
              .then((success) => {
                console.log("Resubmission updated")
              })
              .catch((err) => {
                console.log("error extended request")
              })
            Notification.remove({
                and: [{
                  serviceRequest: extendedinstance.req_id
                }, {
                  status: "Expiring"
                }]
              })
              .then((success) => {
                console.log("extending")
              })
              .catch((err) => {
                console.log("error extended request")
              })
          })

        .catch((err) => {
          console.log("error extended request")
        })


        next()

      },
      function(success) {
        res.json("success")
      });
  },
  getServiceEnvironment: (req, res, next) => {
    // console.log("hitting back end servicerequestisnatces")
    Environment.find({
      service_id: req.params.id
    }, function(err, environmet) {
      if (err) {
        res.json(err);
      }
      // console.log(environmet,"--------environmet")
      res.json(environmet);
    })
  },
  getserviceinstancerequest: (req, res, next) => {
    // console.log("hitting back end getserviceinstancerequest", req.body);
    // Serviceinstances.find({
    //   "assignedto": req.body.email
    // }, function(err, serviceinstances) {
    //   if (err) {
    //     res.json(err);
    //   } else {
    //     console.log(serviceinstances, "getserviceinstancerequestgetserviceinstancerequest")
    //     if (serviceinstances.length) {
    //       var servicerequestinfoarray = [];
    //       each(serviceinstances, function(serviceinstanceelement, next) {


    //         Service.find({ id: serviceinstanceelement.services_id }, function(err, service) {
    //           console.log(serviceinstanceelement.instance_id, "getserviceinstancerequestgetserviiiiiiiiiiiiiiiiiiiiiiiid")
    //           Instances.find({ id: serviceinstanceelement.instance_id }, function(err, instacnes) {
    //               if (err) {
    //                 console.log(err)
    //               } else {
    //                 console.log(instacnes.url, "instances.url");
    //                 var temp = {
    //                   service,
    //                   instance_url: instacnes.url
    //                 }
    //                 servicerequestinfoarray.concat(temp)
    //                   //    console.log(temp,"temp");
    //                   // res.json(temp);
    //               }
    //               next();
    //             })
    //             // console.log(service,"getserviceinstancerequestgetserviceinstancerequest")


    //         })


    //       }, function(err) {
    //         console.log("finished", servicerequestinfoarray)
    //         res.json(servicerequestinfoarray);
    //       });
    //     }
    //     // else{
    //     //     // console.log("blabla")
    //     //     res.json()
    //     //    }      
    //   }
    // })
    Serviceinstances.find({
        assignedto: req.body.email
      })
      .populate('services_id')
      .populate('user_id')
      .populate('instance_id')
      .then((serviceInstances) => {
        sails.log("asdadad", serviceInstances)
        res.json(serviceInstances)
      })
      .catch((error) => {
        res.sendStatus(400).json(error);
      })

  },
  getactiveenrollments: (req, res, next) => {
    // console.log("resbody", req.body.id)
    Enrollments.find({
        user_id: req.body.id
      })
      .populate("service_id")
      .then((enrollments) => {
        res.json(enrollments);
      })
      .catch((error) => {
        res.sendStatus(400).json(error)
      })
  },
  getassignedusers: (req, res, next) => {
    // console.log(req.body.id, 'status');
    Service.findOne({
        where: {
          id: req.body.id
        },
      })
      .populate('assigned_users', {
        select: ['id']
      }).then((services) => {
        // console.log("service", services);
        return res.json(services);
      }).catch((error) => {
        res.sendStatus(400).json(error);
      });
  },

  viewRequest: (req, res, next) => {
    // console.log("hittting back end view request")
    var username = "guacadmin";
    var password = "guacadmin";
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
      if (error) {
        console.log("Api call for authentication token error", error)
      } else {

        var data = JSON.parse(body);

        token = data.authToken;
        res.json(token);
        // console.log(response);
        // console.log(error);
      }
    });
  },
  viewcampaignDetails: (req, res, next) => {
    Service.find({
        id: req.body.req_id
      })
      .populate('assigned_users')
      .populate('serviceInstance')
      .populate('enrollments')
      .populate('nominees')
      .then((services) => {
        // sails.log("service", services)
        return res.json(services)
      })
      .catch((error) => {
        //res.send(400).json(error)
      })
  },

  getenrollment: (req, res, next) => {
    // console.log("resbody", req.body.id)

    Enrollments.find({
        user_id: req.body.id
      })
      .then((enrollment) => {
        res.json(enrollment)
      })
      .catch((error) => {
        console.log(error);
      })
  },

  nominateuser: (req, res, next) => {
    Service.addToCollection(req.params.id, 'nominees', req.body.query).exec(function(err, data) {
      if (err) {
        sails.log("nominee", err)
      } else {
        res.json("ok")
      }
    });
  },

  getallenrollment: (req, res, next) => {

    Enrollments.find({
        "service_id": req.body.service_id
      })
      .populate('user_id')
      .then((enrollment) => {
        res.json(enrollment)
      })
      .catch((error) => {
        console.log(error);
      })
  },

  /*-----------crowdsourcing----------*/

  getInstanceLowFidelity: (req, res, next) => {
    var saved_crowd = [];
    var filteredusersarr = [];
    var usersCrowd = [];
    var array = [];
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
        Serviceinstances.find({
          and: [{
            provision_date_from: {
              '<': new Date(req.body.toDate).toISOString()
            }
          }, {
            provision_date_to: {
              '>': req.body.fromDate
            }
          }]
        }, function(err, filteredpersons) {
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
            User.find({
              and: [{
                email: {
                  'nin': filteredusersarr
                }
              }, {
                enterrole: 'UX'
              }]
            }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsUX) {
              if (err) {
                console.log(err)
              } else {

                usersCrowd = usersCrowd.concat(filteredpersonsUX);
                User.find({
                  and: [{
                    email: {
                      'nin': filteredusersarr
                    }
                  }, {
                    enterrole: 'VD'
                  }]
                }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsVD) {
                  if (err) {
                    console.log(err);
                  } else {
                    usersCrowd = usersCrowd.concat(filteredpersonsVD);
                    User.find({
                      and: [{
                        email: {
                          'nin': filteredusersarr
                        }
                      }, {
                        enterrole: 'DEVELOPER'
                      }, {
                        skillsArray: {
                          'in': req.body.query
                        }
                      }]
                    }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsDeveloper) {
                      if (err) {
                        console.log(err);
                      } else {
                        if (filteredpersonsDeveloper.length == 0) {
                          User.find({
                            and: [{
                              email: {
                                'nin': filteredusersarr
                              }
                            }, {
                              enterrole: 'DEVELOPER'
                            }]
                          }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsDeveloper1) {
                            usersCrowd = usersCrowd.concat(filteredpersonsDeveloper1);

                            res.json({
                              'UX': filteredpersonsUX,
                              'VD': filteredpersonsVD,
                              'DEVELOPER': filteredpersonsDeveloper1
                            });
                          })
                        } else {
                          usersCrowd = usersCrowd.concat(filteredpersonsDeveloper);
                          res.json({
                            'UX': filteredpersonsUX,
                            'VD': filteredpersonsVD,
                            'DEVELOPER': filteredpersonsDeveloper
                          });
                        }
                      }
                    })
                  }
                })
              }
            })

          }
        })
      })

  },

  getInstanceHighFidelity: (req, res, next) => {
    var saved_crowd = [];
    var filteredusersarr = [];
    var usersCrowd = [];
    var array = [];
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
        Serviceinstances.find({
          and: [{
            provision_date_from: {
              '<': new Date(req.body.toDate).toISOString()
            }
          }, {
            provision_date_to: {
              '>': req.body.fromDate
            }
          }]
        }, function(err, filteredpersons) {
          console.log("filterperson", filteredpersons)
          if (err) {
            // console.log(err);
            return {
              success: false,
              message: "failed"
            };
          } else {

            for (var i = 0; i < filteredpersons.length; i++) {
              filteredusersarr.push(filteredpersons[i].assignedto)
            }
            User.find({
              and: [{
                email: {
                  'nin': filteredusersarr
                }
              }, {
                enterrole: 'UX'
              }]
            }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsUX) {
              if (err) {
                console.log(err)
              } else {

                usersCrowd = usersCrowd.concat(filteredpersonsUX);
                User.find({
                  and: [{
                    email: {
                      'nin': filteredusersarr
                    }
                  }, {
                    enterrole: 'VD'
                  }]
                }).sort('experience DESC').limit(1).exec(function(err, filteredpersonsVD) {
                  if (err) {
                    console.log(err);
                  } else {
                    usersCrowd = usersCrowd.concat(filteredpersonsVD);
                    User.find({
                      and: [{
                        email: {
                          'nin': filteredusersarr
                        }
                      }, {
                        enterrole: 'DEVELOPER'
                      }, {
                        skillsArray: {
                          'in': req.body.query
                        }
                      }]
                    }).sort('experience DESC').limit(3).exec(function(err, filteredpersonsDeveloper) {
                      if (err) {
                        console.log(err);
                      } else {
                        // console.log("developers3", filteredpersonsDeveloper)
                        if (filteredpersonsDeveloper.length < 3) {
                          User.find({
                            and: [{
                              email: {
                                'nin': filteredusersarr
                              }
                            }, {
                              enterrole: 'DEVELOPER'
                            }]
                          }).sort({
                            experience: -1
                          }).limit(3 - filteredpersonsDeveloper.length).exec(function(err, filteredpersonsDeveloper1) {
                            // console.log("developers3", filteredpersonsDeveloper1)
                            usersCrowd = usersCrowd.concat(filteredpersonsDeveloper1);
                            res.json({
                              'UX': filteredpersonsUX,
                              'VD': filteredpersonsVD,
                              'DEVELOPER': filteredpersonsDeveloper1
                            });
                          })
                        } else {
                          usersCrowd = usersCrowd.concat(filteredpersonsDeveloper);
                          res.json({
                            'UX': filteredpersonsUX,
                            'VD': filteredpersonsVD,
                            'DEVELOPER': filteredpersonsDeveloper
                          });
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
  },

  getNominees: (req, res, next) => {
    Enrollments.find({
        "service_id": req.body.query
      })
      .populate('user_id')
      .populate('service_id')
      .then((nominees) => {
        res.json(nominees);
      })
  },

  saveCrowdResources: (req, res, next) => {
    var next2days = new Date();
    next2days.setDate(next2days.getDate() + 2)
    async function updateService() {
      var updatedService = await Service.update({
        "id": req.body.id
      }).set({
        "saved_Resources": req.body.resources,
        "savednext2days": next2days,
        "savedResourceRole": req.body.savedResourceRole
      }).fetch()
      return updatedService;
    }
    updateService()
      .then((success) => {
        res.json({
          status: 'ok'
        })
      })
      .catch((err) => {
        res.json(err)
      })
  },

  getsavedResources: (req, res, next) => {
    Service.find({
        id: req.body.id
      })
      .populate('saved_Resources')
      .then((service) => {
        res.json(service[0].saved_Resources);
      })

  },
  assigned_crowd: (req, res, next) => {
    Serviceinstances.find({
        "services_id": req.body.id
      })
      .populate('user_id')
      .then((users) => {
        res.json(users);
      })
  },
  savednext2days: (req, res, next) => {
    Service.find({
        savednext2days: {
          '<': new Date()
        }
      })
      .then((response) => {
        response.forEach((service) => {
          async function updateService() {
            var updatedservice = await Service.findOne({
              id: service.id
            }).populate('saved_Resources')
            return updatedservice;
          }
          updateService().then((resource) => {
            resource.saved_Resources.forEach((userResource) => {

              async function updatedService() {

                var removeResource = await Service.removeFromCollection(service.id, 'saved_Resources', userResource.id);
                return removeResource;

              }
              updatedService().then((success) => {
                console.log("success", success)
              }).catch((error) => {
                console.log(error)
              })
            })



          }).catch((errror) => {
            console.log("error1", error)
          })
        })
        res.json({
          status: 'OK'
        });
      })
      .catch((error) => {
        console.log("find error", error)
      })

  },
  /*------crowdsourcing ends------------*/
  uploadAssets: (req, res) => {

    var uploadpath = path.join(__dirname, '../../assets/assets/images/serviceAssets/' + req.params.id);
    var assets = [];
    req.file('serviceAssets').upload({
        dirname: uploadpath
      },
      (err, files) => {
        if (!files) {
          sails.log(err)
          uploadedServiceAssets = []
        } else {
          screen = files;
          async function addassets() {
            files.forEach((element) => {
              assets.push('./assets/images/serviceAssets/' + req.params.id + '/' + path.basename(element.fd));
            })
            return assets;
          };
          addassets()
            .then((assets) => {
              uploadedServiceAssets = uploadedServiceAssets.concat(assets);
              async function updateService() {
                var updatedService = await Service.update({
                  req_id: req.params.id
                }).set({
                  "assets": assets
                }).fetch()
                return updatedService;
              }
              updateService()
                .then((success) => {
                  res.json({
                    status: success
                  })
                })
                .catch((err) => {
                  res.json(err)
                })
            }).catch((err) => {
              res.json(err)
            })
        }

      });
  }
};