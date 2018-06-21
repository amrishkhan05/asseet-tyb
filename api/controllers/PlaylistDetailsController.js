/**
 * PlaylistDetailsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getPlaylistDetails: function(req, res) {
    Playlist.findOne({ 'id': req.params.id })
      .populate('prototypes')
      .exec(function(err, playlists) {
        sails.log("cfbch", playlists)
        res.json(playlists)
      });

  },
  deleteProtoFromPlaylist: function(req, res) {
    Playlist.removeFromCollection(req.params.id, 'prototypes', req.body.prototype_id).exec(function(err, data) {
      if (err) {
        sails.log(err)
      } else {
        Playlist.findOne({ 'id': req.params.id })
          .populate('prototypes')
          .exec(function(err, playlists) {
            sails.log("cfbch", playlists)
            res.json(playlists)
          });
      }
    });
  }

};