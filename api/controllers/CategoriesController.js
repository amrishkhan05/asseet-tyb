/**
 * CategoriesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function (req, res) {

                let categoryId = req.param('category_id');
                Name = req.param('name');
                appIcon = req.param('app_icon');
                if(!categoryId){
                        return res.badRequest({err:'Invalid category_id'});
                }
                if(!Name){
                        return res.badRequest({err:'Invlaid name'});
                }
                if(!appIcon){
                //console.log("app",appIcon);
                        return res.badRequest({err:'Invlaid app icon'});
                }
                async function create(){
                        var createdCategory = await Categories.create({
                                              category_id : categoryId,
                                              name : Name,
                                              app_icon : appIcon
                                        }).fetch()
                                        return createdCategory;
                                }
                create().then(function(response) {
                        sails.log("fgnfhfh",response);
                        if(!response){
                                 return res.serverError({err:'Unable to create categories'});
                                } else {
                                        return res.ok(response);
                                }
                        })
                .catch(err => res.serverError(err.message));
        },
        
        relateapi: function (req, res) {
        let p_id = req.param('p_id'),
        c_id = req.param('c_id');
        Categories.addToCollection(c_id, 'prototypes',p_id).exec(function(err) {
        if (err) {
        // handle error
        }
        });
        },

        findOne: function (req, res) {
        let catId = req.params.id;
        if (!catId) return res.badRequest({ err: 'missing cat_id field' });
        Categories.findOne({ name: catId })
        .populate('prototypes')
        .then(_cat => {
        if (!_cat) return res.notFound({ err: 'No cat found' });
        return res.ok(_cat);
        })
        .catch(err => res.serverError(err));
        }

};

