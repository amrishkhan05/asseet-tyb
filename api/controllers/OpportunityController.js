/**
 * OpportunityController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const path = require('path');
var xlsx = require('node-xlsx');
var XLSX = require('xlsx');
var fs = require('fs');
var uploadedAssets;
var uploadedServiceAssets = [];

module.exports = {
  
    createOpportunity:(req,res,next)=>{
        let newOpportunity = {
            clientname:req.body.clientname,
            created_date:req.body.createddate,
            opportunity_id:req.body.opportunityid,
            opportunity_status:req.body.status,
            opportunity_owner:req.body.Opportunityowner,
            opportunity_description:req.body.Opportunitydescription
          }
        async function AddOpportunity() {
            createOpportunity = await Opportunity.create(newOpportunity).fetch()
            return createOpportunity;
        }
        AddOpportunity()
            .then((data) => {
                sails.log(data,"data data")
               res.json(data)
                })
            .catch((error) => {
                sails.log(error)
                res.json(error)
            })
    },
uploadAssets: (req, res) => {
                var uploadpath = path.join(__dirname, '../../assets/assets/images/opportunityAssets/' + req.params.id);
                var assets = [];
                var fileName;                
                sails.log(req.params.id, 'ddddddddddddddddddddssssssssssssssssssssssssssss')
                req.file('opportunityAssets')
                .upload({dirname: uploadpath},(err, files) => {
                        if (!files) {
                            sails.log(err)
                            uploadedServiceAssets = []
                        } else {
                            screen = files;
                            async function addassets() {
                                files.forEach((element) => {
                                    assets.push('./assets/images/opportunityAssets/' + req.params.id + '/' + path.basename(element.fd));
                                    fileName = path.basename(element.fd)
                                })
                                return assets;
                            };
                            addassets()
                                .then((assets) => {
                                    uploadedServiceAssets = uploadedServiceAssets.concat(assets);
                                    if(req.params.uploadType === 'singleupload') {
                                        async function updateService() {
                                            var updatedService = await Opportunity.update({ opportunityid: req.params.id }).set({ "assets": assets }).fetch()
                                            return updatedService;
                                        }
                                        updateService()
                                            .then((success) => {
                                                res.json({
                                                    status: files
                                                })
                                            })
                                            .catch((err) => {
                                                console.log(err)
                                            })
                                    }
                                    else if(req.params.uploadType === 'bulkupload') {
                                        console.log('assests',assets);
                                        var obj = [];                   
                                        var data;                     
                                        var dir = './assets/assets/images/opportunityAssets/opportunityAssetsexecl';
                                        fs.readdir(dir, function(err, files) {
                                            if (err) console.log(err);

                                            files.forEach(function(file) {
                                                console.log('name',fileName)
                                              if (file === fileName) {
                                                var obj1 = XLSX.readFile('./assets/assets/images/opportunityAssets/opportunityAssetsexecl/' + file); // parses a file
                                                var sheet_name_list =obj1.SheetNames;
                                                data = XLSX.utils.sheet_to_json(obj1.Sheets[sheet_name_list[0]]);
                                                console.log("Data of uploaded file",data)
                                                // obj1.filename = file;
                                                // obj = obj.concat(obj1);
                                                // console.log("pushed", obj);
                                                
                                              }
                                            });
                                            let flag = 0;
                                            for(i=0;i<data.length;i++){
              
                                                    async function AddOpportunity() {
                                                        var createdOpportunity = await Opportunity.create(data[i]).fetch()
                                                            return createdOpportunity;
                                                        }
                                                        AddOpportunity()
                                                        .then((data) => {
                                                            sails.log(data,"data data")
                                                        //    res.json(data)
                                                            })
                                                        .catch((error) => {
                                                            sails.log(error)
                                                            // res.json(error)
                                                        }) 
                                                // }
                                                // if(i>obj[0].data.length)
                                               
                                            }
                                      
                                            res.json(obj);
                                           
                                          });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        }
        
                    });
},
            getopportunities:(req, res) => {
                Opportunity.find({})
                .then((data) => {
                    sails.log(data,"data data")
                   res.json(data)
                    })
                .catch((error) => {
                    sails.log(error)
                    res.json(error)
                })
            },
            getopportunitiesform:(req, res)=>{
                Opportunity.findOne({id:req.params.id})
                .then((data) => {
                    sails.log(data,"data data")
                   res.json(data)
                    })
                .catch((error) => {
                    sails.log(error)
                    res.json(error)
                })  
            },

};

