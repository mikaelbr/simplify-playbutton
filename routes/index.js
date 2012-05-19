var playbutton = require("../libs/playbutton").play,
    redis = require('redis-url').connect(process.env.REDISTOGO_URL),
    async = require('async');
/*
 * GET home page.
 */

exports.index = function (req, res) {



  async.series([
    function (callback) {
      redis.get("SPB_VIEWS_TOTAL", callback);
    },
    function (callback) {
      redis.get("SPB_TRACKS_SEEN", callback);
    },
    function (callback) {
      redis.get("SPB_JSON_LOOKUPS_TOTAL", callback);
    },
    function (callback) {
      redis.get("SPB_GENERATOR_MADE_TOTAL", callback);
    }
  ], function (err, results) {
    res.render('index', {
      title: 'Add automated play button to your blog!',
      totalViews: results[0] || 0,
      totalTracks: results[1] || 0,
      totalGenerated: results[3] || 0,
      totalJSON: results[2] || 0,
      hostname: req.headers.host
    });
  });

};

exports.user = function (req, res) {

  playbutton.show(req, res);

};