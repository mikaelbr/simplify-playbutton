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
    mode = req.param("mode") || "top",
    view = req.param("view") || "list",
    theme = req.param("theme") || "black",
    width = req.param("width") || 250,
    dateOffset = req.param("offset") || 0,
    limit = req.param("limit") || 10,
    height = req.param("height") || 330,
    period = req.param("period") || "overall", // can be overall | 7day | 1month | 3month | 6month | 12month
    tracklist,
    options = {
      dateOffset: dateOffset,
      period: period,
      limit: limit
    };

  if (mode == "weekly") {
    mode = tracks.getURIListWeekly;
  } else if (mode == "loved") {
    mode = tracks.getURIListLoved;
  } else {
    mode = tracks.getURIListTop;
  }

  mode.call(tracks, user, options, function (err, data) {

    // Crude error checking.
    if (err) {
        if (req.param("format") == "json") {
          res.contentType('json');
          res.header("Content-Type", "json");
          res.header("Access-Control-Allow-Origin", "*");
          res.json(err);
        } else {
          res.send(err.message || err, 404);
        }
        return;
    }
    
    tracklist = playbutton.makeSrc(data);

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
      res.header("Access-Control-Allow-Origin", "*");

      res.json(playbutton.makeJSONFormatted(obj));
    } else {
      res.render('iframe', obj);
    }
    
  });
};