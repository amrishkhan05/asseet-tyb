/**
 * Service.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        Requestername: { type: 'string', required: false },
        email_address: { type: 'string', required: false },
        Phonenumber: { type: 'string', required: false },
        Clientname: { type: 'string', required: false },
        onbehalfemail: { type: 'string', required: false },
        onbehalfname: { type: 'string', required: false },
        onbehalfphonenumber: { type: 'string', required: false },
        // Domain: req.body.Domain,
        Role: { type: 'string', required: false },
        ServiceRequested: { type: 'string', required: false },
        RequestType: { type: 'string', required: false },
        PreferredChannel: { type: 'string', required: false },
        Preferredplatform: { type: 'string', required: false },
        Fidelity: { type: 'string', required: false },
        techStackArray: { type: 'json', required: false, columnType: 'array' },
        req_id: { type: 'string', required: false },
        uploadDate: { type: 'string', required: false },
        userconfigure: { type: 'boolean', required: false },
        status: { type: 'string', required: false },
        servicerejectComment: { type: 'string', required: false },
        tilldate: { type: 'string', required: false },
        dueDate: { type: 'string', required: false },
        instance_url: { type: 'string', required: false },
        campaign: { type: 'boolean', required: false },
        approvedDate: { type: 'string', required: false },
        campaignDate: { type: 'string', columnType: 'date', required: false },
        savednext2days: { type: 'string', columnType: 'date', required: false },
        skillsetneeded: { type: 'json', required: false, columnType: 'array' },
        assets: { type: 'json', required: false, columnType: 'array' },
        savedResourceRole: { type: 'json', required: false, columnType: 'array', defaultsTo: [] },
        //associations
        user: { model: 'user' },
        nominees: {
            collection: 'user',
            via: 'servicesNominated'
        },
        assigned_users: {
            collection: 'user',
            via: 'assignedServices'
        },
        serviceInstance: {
            collection: 'serviceinstances',
            via: 'services_id'
        },
        enrollments: {
            collection: 'enrollments',
            via: 'service_id'
        },
        saved_Resources: {
            collection: 'user',
            via: 'savedService'
        }

        //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
        //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
        //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


        //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
        //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
        //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


        //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
        //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
        //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    },

};