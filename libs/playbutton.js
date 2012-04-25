var util = require("util"),
    tracks = require("../libs/track-provider").TrackProvider,
    redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var PlayButton = function (){ };

PlayButton.prototype.makeSrc = function (tracks) {
    var fixed = [],
        elm;
    for (var i = 0, ln = tracks.length; i < ln; i += 1) {
        elm = tracks[i];
        if ( elm ) {
            fixed.push(elm.replace("spotify:track:", ""));
        }
    }
    return fixed.join(",");
};

PlayButton.prototype.makeJSONFormatted = function (options) {

    options.URL = 'https://embed.spotify.com/?uri=spotify:trackset:' +
                options.listname + ":" + options.tracklist +
                '&theme=' + options.theme + '&view=' + options.view;

    options.HTML = "<iframe frameborder='0' allowtransparency='true' width='"+options.width+"px' height='"+options.height+"px' src='"+options.URL+"'></iframe>";
    return options;
};


PlayButton.prototype.show = function (req, res, extras) {
  var self = this,
    user = req.param("name"),
    mode = req.param("mode") || "top",
    view = req.param("view") || "list",
    theme = req.param("theme") || "black",
    width = req.param("width") || 250,
    dateOffset = req.param("offset") || 0,
    limit = req.param("limit") || 10,
    height = req.param("height") || 330,
    period = req.param("period") || "overall", // can be overall | 7day | 1month | 3month | 6month | 12month
    generatorMade = req.param("generator") || false,
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
    
    tracklist = self.makeSrc(data);

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

      if (generatorMade) {
        redis.incr("SPB_GENERATOR_MADE_TOTAL");
      }

      redis.incr("SPB_JSON_LOOKUPS_TOTAL");

      res.json(self.makeJSONFormatted(obj));
    } else {
      redis.incr("SPB_VIEWS_TOTAL");
      res.render('iframe', obj);
    }
    
  });
};

exports.play = new PlayButton();
