var tracks = require("../libs/track-provider").TrackProvider,
    playbutton = require("../libs/playbutton").play;
/*
 * GET home page.
 */

exports.index = function (req, res) {
  res.render('index', {title: 'Add automated play button to your blog!'});
};

exports.user = function (req, res) {
  var user = req.param("name"),
    view = req.param("view") || "list",
    theme = req.param("theme") || "black",
    width = req.param("width") || 250,
    dateOffset = req.param("offset") || 0,
    limit = req.param("limit") || 10,
    height = req.param("height") || 330,
    tracklist;

  tracks.getCompleteDataSet(user, dateOffset, limit, function (err, data) {
    if (err) {
      console.log(err);
      tracklist = [];
    } else {
      tracklist = playbutton.makeSrc(data);
    }

    var obj = {
        title: 'Automated Spotify Play Button',
        listname: encodeURIComponent(user + ": Last played tracks"),
        tracklist: tracklist,
        width: width,
        theme: theme,
        height: height,
        view: view
      };

    if (req.param("format") == "json") {
      // Show JSON API
      res.contentType('json');
      res.send(playbutton.makeJSONFormatted(obj));
    } else {
      res.render('iframe', obj);
    }
    
  });
};