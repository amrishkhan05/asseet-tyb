/**
 * AddPrototypeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var find = require('find');
const qs = require("qs");
var fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
var Category_name = '';
var value = '';
var uploadedscreenshots = [];
var uploadedthumbnail = '';
var uploadedpreviewImage = '';
var uploadedSupportingfiles = '';
var supportingfilename = '';
var supportingfilesize = '';
var categoryDetails = {
    'Mobility': {
        'abbreviation': 'EM',
        'expansion': 'Enterprise Mobile'
    },
    'AR': {
        'abbreviation': 'AR',
        'expansion': 'Augmented Reality'
    },
    'Bot': {
        'abbreviation': 'AI',
        'expansion': 'Artificial Intelligence'
    },
    'Blockchain': {
        'abbreviation': 'BLC',
        'expansion': 'Block Chain'
    },
    'Social Media Analytics': {
        'abbreviation': 'SMA',
        'expansion': 'Social Media Analytics'
    },
    'Invision': {
        'abbreviation': 'IV',
        'expansion': 'Invision'
    },
    'VR': {
        'abbreviation': 'VR',
        'expansion': 'Virtual Reality'
    },
    'IoT': {
        'abbreviation': 'IOT',
        'expansion': 'Internet of things'
    },
    '3D Printing': {
        'abbreviation': '3DP',
        'expansion': '3D Printing'
    },
    'Image Analytics': {
        'abbreviation': 'IA',
        'expansion': 'Image Analytics'
    },
    'Axure': {
        'abbreviation': 'AX',
        'expansion': 'Axure'
    },
    'Bluetooth': {
        'abbreviation': 'BL',
        'expansion': 'Bluetooth'
    },
    'Website': {
        'abbreviation': 'WEB',
        'expansion': 'Website'
    },
    'Content Management': {
        'abbreviation': 'CMS',
        'expansion': 'Content Management'
    },
};

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

    //Folder Creation in the respective category
    categoryName: function(req, res) {
        Prototypes.find(function(err, prototypes) {
            prototypeName = req.body.PrototypeName;
            categories = req.body.Categories;
            value = categoryDetails[categories].abbreviation;
            Category_name = categoryDetails[categories].expansion;
            dir1 = path.join(__dirname, '../../assets/assets/images/Prototypes/' + value + '/' + prototypeName);
            if (value && prototypeName) {
                find
                    .eachdir(path.join(__dirname, '../../assets/assets/images/Prototypes/' + value + '/'), function(dir) {
                        if (dir.indexOf(prototypeName) != -1) {
                            sails.log("folder already exists")
                        } else {
                            fs.mkdir(dir1, function(suc, err) {
                                if (err) {
                                    sails.log("folder already exists")
                                }
                            });
                        }
                    })
                    .end(function() {})
            }
        })
        fs.emptyDir(path.join(__dirname, '../../assets/uploads'), err => {
            if (err) return sails.error(err)
        })
        return res.ok();
    },
    //Add Prototype button draft popup condition
    loadAddedPrototypes: function(req, res) {
        var resdata = req.body.fileName;
        async function loadadded() {
            var newProtocontent = await Prototypes.find({
                where: {
                    user_id: resdata
                }
            });
            return newProtocontent
        }
        loadadded().then((prototypes) => {
                res.json(prototypes)
            })
            .catch((error) => {
                res.json(error)
            })
    },
    //Add Prototype form details saved in db
    AddPrototype: (req, res) => {
        prototypeName = req.body.PrototypeName;
        categories = req.body.Categories;
        value = categoryDetails[categories].abbreviation;
        Category_name = categoryDetails[categories].expansion;
        let newForm = {
            title: req.body.PrototypeName,
            Categories: req.body.Categories,
            type: req.body.type,
            subtype: req.body.subtype,
            prototypeKind: req.body.prototypeKind,
            Fidelity: req.body.Fidelity,
            category_name: Category_name,
            description: req.body.LDescription,
            ownerID: req.body.ownerID,
            Requestername: req.body.Requestername,
            tags: req.body.tags,
            Domain: req.body.Domain,
            Frontend: req.body.Frontend,
            Middleware: req.body.Middleware,
            Backend: req.body.Backend,
            Comments: req.body.Comments,
            Hosted: req.body.Hosted,
            categoryUrl: req.body.categoryUrl,
            app_icon: uploadedthumbnail,
            accronym: value,
            uploadDate: req.body.uploadDate,
            rating: req.body.rating,
            ratingUrl: req.body.ratingUrl,
            popularity: req.body.popularity,
            thumbnail_url: uploadedpreviewImage,
            playstore_url: req.body.playstore_Url,
            ios_url: req.body.ios_Url,
            platform: req.body.platform,
            screenshots: uploadedscreenshots,
            prototype_type: req.body.prototype_type,
            Technology: Category_name,
            ExecuteableFile: '',
            HelpGuide: uploadedSupportingfiles,
            Icon: uploadedthumbnail,
            user_id: req.body.user_id,
            user_email: req.body.user_email,
            status: req.body.status,
            view: req.body.view,
            review: req.body.review,
            author_name: req.body.author_name,
            lastModifiedDate: req.body.lastModifiedDate,
            supportingFileName: supportingfilename,
            supportingFileSize: supportingfilesize,
            dueDate: req.body.dueDate,
            req_id: req.body.req_id,
            rejectFeedback: req.body.rejectFeedback,
            approvedDate: req.body.approvedDate,
            accessRestriction: req.body.accessRestriction
        }
        async function AddPrototypes() {
            createPrototype = await Prototypes.create(newForm).fetch()
            return createPrototype;
        }
        AddPrototypes()
            .then((data) => {
                console.log(data, 'protoupload data')
                User.findOne({ id: data.user_id }).populate('followers').then((user) => {
                        var followers = user.followers;
                        console.log("checkfollow", followers);
                        followers.forEach((follower) => {
                            if (follower.peopleEvent) {
                                const activity = {
                                    activityType: 'Upload Prototype Event',
                                    prototypeRefId: data.id,
                                    userId: data.user_id,
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
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                uploadedscreenshots = [];
                uploadedthumbnail = '';
                uploadedpreviewImage = '';
                uploadedSupportingfiles = '';
                supportingfilename = '';
                supportingfilesize = '';
                async function addtocategories() {
                    var addedtocategories = await Categories.findOne({
                        category_id: categoryDetails[data.Categories].abbreviation
                    })
                    return addedtocategories
                }
                addtocategories().then((category) => {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", category);
                    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<", data.id);
                    Categories.addToCollection(category.id, 'prototypes', data.id).then(() => {
                        let mailOptions = {
                            from: '"TOY BOX" <no-reply@toybox.com>', // sender address
                            to: newForm.user_email, // list of receivers
                            subject: 'Prototype Added Successfully..!!', // Subject line
                            text: '', // plain text body
                            html: "Hi " + (newForm.user_email) + ",<br><p>&ensp;&ensp;&ensp; Your prototype has been successfully uploaded to the prototype factory. <p>If you want to edit the prototype details, go to 'My prototypes' section in Toybox.</p><p>For any queries, reach out to us at toybox-support@cognizant.com.</p><p> Regards,</p><p><strong>Toybox Team.</strong></p><br><img src='http://ec2-34-203-191-62.compute-1.amazonaws.com:8003/assets/images/toyboximg.png' style='width:117px;height:51px'/>" // html body
                        };
                        sendEmail(mailOptions);
                        res.json(data);
                    }).catch((error) => {
                        sails.log(error)
                        res.json(error)
                    })
                })
            })
            .catch((error) => {
                sails.log(error)
                res.json(error)
            })
    },
    imageupload: (req, res) => {
        var uploadpath = path.join(__dirname, '../../assets/assets/images/Prototypes/' + value + '/' + prototypeName);
        var screenshots = [];
        req.file('screenshots').upload({
                dirname: uploadpath
            },
            (err, files) => {
                if (!files) {
                    sails.log(err)
                    uploadedscreenshots = []
                } else {
                    screen = files;
                    async function addscreenshots() {
                        files.forEach((element) => {
                            screenshots.push('./assets/images/Prototypes/' + value + '/' + prototypeName + '/' + path.basename(element.fd));
                        })
                        return screenshots;
                    };
                    addscreenshots()
                        .then((screenshots) => {
                            uploadedscreenshots = uploadedscreenshots.concat(screenshots);
                        })

                }
            });
        req.file('previewImage').upload({
            dirname: uploadpath
        }, (err, previewImage) => {
            if (previewImage.length == 0) {
                sails.log("preview image error")
                uploadedpreviewImage = ''
            } else {
                sails.log('----------------------------------------------------------------------------', previewImage)
                uploadedpreviewImage = './assets/images/Prototypes/' + value + '/' + prototypeName + '/' + path.basename(previewImage[0].fd);
            }

        });
        req.file('thumbnail').upload({
            dirname: uploadpath,
            saveAs: 'thumbnail.png'
        }, (err, thumbnail) => {

            if (thumbnail.length == 0) {
                sails.log(err)
                uploadedthumbnail = ''
            } else {
                uploadedthumbnail = './assets/images/Prototypes/' + value + '/' + prototypeName + '/' + path.basename(thumbnail[0].fd);
                sails.log('----------------------------------------------------------------------------', thumbnail)

            }
        });
        req.file('supportingFiles').upload({
            dirname: uploadpath
        }, (error, supportingFiles) => {
            if (supportingFiles.length == 0) {
                uploadedSupportingfiles = ''
            } else {
                sails.log('----------------------------------------------------------------------------', supportingFiles)
                uploadedSupportingfiles = './assets/images/Prototypes/' + value + '/' + prototypeName + '/' + path.basename(supportingFiles[0].fd);
                supportingfilename = path.basename(supportingFiles[0].filename);
                supportingfilesize = supportingFiles[0].size / 1024 / 1024;
            }
        });

        return res.json({
            message: ' file(s) uploaded successfully!'
        });
    },
    updatePrototype: (req, res, next) => {

        var thumb;
        var supfile;
        var supfilesize;
        var logo;
        var help;
        if (req.body.thumbnail_url === '' && uploadedpreviewImage !== '') {
            thumb = uploadedpreviewImage;
        } else {
            thumb = req.body.thumbnail_url;
        }

        if (req.body.Icon === '' && uploadedthumbnail !== '') {
            logo = uploadedthumbnail;
        } else {
            logo = req.body.Icon;
        }

        if (req.body.HelpGuide == "" && uploadedSupportingfiles != "") {
            help = uploadedSupportingfiles
            supfile = supportingfilename;
            supfilesize = supportingfilesize;
        } else {
            help = req.body.HelpGuide;
            supfile = req.body.supportingFileName;
            supfilesize = req.body.supportingFileSize;
        }

        if (uploadedpreviewImage) {
            thumb = uploadedpreviewImage;
        }
        if (uploadedthumbnail) {
            logo = uploadedthumbnail;
        }
        if (uploadedSupportingfiles) {
            help = uploadedSupportingfiles
            supfile = supportingfilename;
            supfilesize = supportingfilesize;
        }
        async function updatethePrototype() {
            var updatedPrototype = await Prototypes.update({
                    id: req.params.id
                })
                .set({
                    title: req.body.PrototypeName,
                    Categories: req.body.Categories,
                    type: req.body.type,
                    subtype: req.body.subtype,
                    prototypeKind: req.body.prototypeKind,
                    Fidelity: req.body.Fidelity,
                    Hosted: req.body.Hosted,
                    description: req.body.LDescription,
                    ownerID: req.body.ownerID,
                    Requestername: req.body.Requestername,
                    tags: req.body.tags,
                    domain: req.body.domain,
                    Frontend: req.body.Frontend,
                    Middleware: req.body.Middleware,
                    Backend: req.body.Backend,
                    Comments: req.body.Comments,
                    screenshots: req.body.screenshots.concat(uploadedscreenshots),
                    thumbnail_url: thumb,
                    app_icon: logo,
                    HelpGuide: help,
                    Icon: logo,
                    status: req.body.status,
                    supportingFileName: supfile,
                    supportingFileSize: supfilesize
                }).fetch();
            return updatedPrototype;
        }
        updatethePrototype().then((proto) => {
                uploadedscreenshots = [];
                uploadedthumbnail = '';
                uploadedpreviewImage = '';
                uploadedSupportingfiles = '';
                supportingfilename = '';
                supportingfilesize = '';
                sails.log('updated proto', proto)
                res.json(proto);
            })
            .catch((error) => {
                sails.log('updated proto error', error)

                res.json(error)
            })

    },
    delete: (req, res, next) => {
        Prototypes.find({
                id: req.params.id
            })
            .then((results) => {
                var prototype = results;
                async function deleteProto() {
                    var deletedProto = Prototypes.destroy({
                        id: req.params.id
                    }).fetch();
                    return deletedProto;
                }
                deleteProto()
                    .then((result) => {
                        res.json(result);
                    })
                    .catch((err) => {
                        res.json(err);
                    })
                fs.remove(path.join(__dirname, '../../assets/assets/images/Prototypes/' + prototype[0].accronym + '/' + prototype[0].title), err => {
                    if (err) {
                        console.log("err")
                    } else {
                        return console.error(err);
                    }
                });
            })
            .catch((err) => {
                sails.log(err)
                res.json(err)
            })









    },
    editPrototype: (req, res, next) => {
        sails.log("backend req.body.query", req.body.query)
        Prototypes.findOne({
                id: req.body.query
            }).then((results) => {
                sails.log('results', results)
                res.json(results)
            })
            .catch((err) => {
                sails.log(err)
                res.json(err)
            })
    },
};