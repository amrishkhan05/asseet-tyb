/**
 *Prototypes.js
 *
 *@description::TODO:Youmightwriteashortsummaryofhowthismodelworksandwhatitrepresentshere.
 *@docs::http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    title: { type: 'string', required: false, unique: true },
    Categories: { type: 'string', required: false },
    type: { type: 'string', required: false },
    subtype: { type: 'string', required: false },
    prototypeKind: { type: 'string', required: false },
    Fidelity: { type: 'string', required: false },
    category_name: { type: 'string', required: false },
    description: { type: 'string', required: false },
    Domain: { type: 'string', required: false },
    ownerID: { type: 'string', required: false },
    Requestername: { type: 'string', required: false },
    tags: { type: 'json', columnType: 'array', required: false },
    Frontend: { type: 'string', required: false },
    Middleware: { type: 'string', required: false },
    Backend: { type: 'string', required: false },
    Comments: { type: 'string', required: false },
    Hosted: { type: 'string', required: false },
    categoryUrl: { type: 'string', required: false },
    app_icon: { type: 'string', required: false },
    accronym: { type: 'string', required: false },
    uploadDate: { type: 'string', required: false },
    rating: { type: 'number', required: false },
    ratingUrl: { type: 'string', required: false },
    popularity: { type: 'number', required: false },
    thumbnail_url: { type: 'string', required: false },
    playstore_url: { type: 'string', required: false },
    ios_url: { type: 'string', required: false },
    platform: { type: 'string', required: false },
    screenshots: { type: 'json', columnType: 'array' },
    accessRestriction: { type: 'json', columnType: 'array' },
    review: { type: 'json', columnType: 'array' },
    ExecuteableFile: { type: 'string', required: false },
    HelpGuide: { type: 'string', required: false },
    Icon: { type: 'string', required: false },
    user_email: { type: 'string', required: false },
    prototype_type: { type: 'string', required: false },
    Technology: { type: 'string', required: false },
    status: { type: 'string', required: false },
    view: { type: 'string', required: false },
    author_name: { type: 'string', required: false },
    lastModifiedDate: { type: 'string', required: false },
    supportingFileName: { type: 'string', required: false },
    supportingFileSize: { type: 'string', required: false },
    dueDate: { type: 'string', required: false },
    approvedDate: { type: 'string', required: false },
    rejectFeedback: { type: 'string', required: false },
    req_id: { type: 'string', required: false },
    shareCount: { type: 'number', required: false, defaultsTo: 0 },
    uniqueViewsCount: { type: 'number', required: false, defaultsTo: 0 },
    likesCount: { type: 'number', required: false, defaultsTo: 0 },
    previewCount: { type: 'number', required: false, defaultsTo: 0 },
    graphViewsData: { type: 'json', columnType: 'array', required: false, defaultsTo: [] },
    graphLikesData: { type: 'json', columnType: 'array', required: false, defaultsTo: [] },
    graphShareData: { type: 'json', columnType: 'array', required: false, defaultsTo: [] },
    graphPreviewData: { type: 'json', columnType: 'array', required: false, defaultsTo: [] },

    technical: { type: 'json', required: false, columnType: 'array' },
    //Associations
    user_id: { model: 'user' },
    categories: { collection: 'categories', via: 'prototypes' },
    playlist: { collection: 'playlist', via: 'prototypes' },
    userFavorite: { collection: 'user', via: 'favorites' },
    prototypeRefId: { collection: 'activityfeed', via: 'prototypeRefId' },
    rewards: {
      collection: 'rewards',
      via: 'prototypeId'
    }
  }
};