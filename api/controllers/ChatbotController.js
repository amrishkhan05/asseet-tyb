/**
 * ChatbotController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const uuidv1 = require('uuid/v1');
var reqID = uuidv1();
var request = require('request');

module.exports = {
    firstTimeUser: function (req, res) {
        var data = {};
        data = {
            "query": req.body.query,
            "lang": "en",
            "sessionId": reqID
        }
        request({
            url: "https://api.api.ai/v1/query?v=20150910",
            method: "POST",
            headers: {
                "Authorization": "Bearer c1eb4a5412194d6992f2d79ced6ab8b0",
                "content-type": "application/json"
            },
            body: JSON.stringify(data),
        }, function (error, response, body) {
            var newData = JSON.parse(body);
            var data = {};
            res.json(newData);
        });
    },
    oldUser: function (req, res) {
        var data = {};
        var data = {};
        data = {
            "query": req.body.query,
            "lang": "en",
            "sessionId": reqID
        }
        request({
            url: "https://api.api.ai/v1/query?v=20150910",
            method: "POST",
            headers: {
                "Authorization": "Bearer c830fb17e14a422e874d2100f659af27",
                "content-type": "application/json"
            },
            body: JSON.stringify(data),
        }, function (error, response, body) {
            var newData = JSON.parse(body);
            var data = {};
            res.json(newData);
        });
    }


};

