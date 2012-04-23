var LastFmNode = require('lastfm').LastFmNode,
    spotify = require('spotify'),
    async = require("async");

var lastfm = new LastFmNode({
    api_key: process.env.SIMPLIFY_LASTFM_API_KEY,
    secret: process.env.SIMPLIFY_LASTFM_SECRET
});

var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("ready", function (err) {
    console.log("Redis server ready");
});

var TrackProvider = function () { };


TrackProvider.prototype.getWeeklyTrackChart = function (user, from, to, limit, cb) {

    lastfm.request("user.getWeeklyTrackChart", {
        user: user,
        from: from,
        to: to,
        handlers: {
            success: function (d) {
                var tracks = d.weeklytrackchart.track;

                if (!tracks || tracks.length < 1) {
                    cb.apply("No results", ["No results", null]);
                    return;
                }

                if (tracks.length > limit) {
                    tracks = tracks.splice(0, limit);
                }

                cb(null, tracks);
            },
            error: function (e) {
                cb(e, null);
            }
        }
    });
};


TrackProvider.prototype.getWeeklyChartList = function (user, cb) {

    var request = lastfm.request("user.getWeeklyChartList", {
        user: user,
        handlers: {
            success: function (data) {
                cb(null, data);
            },
            error: function (error) {
                cb(error, null);
            }
        }
    });

    return request;
};

TrackProvider.prototype.searchTrackSpotify = function (trackName, cb) {

  // Filter out dangerous URL components
  trackName = trackName.replace(/[\?&]/g, "");
  return spotify.search({type: 'track', query: trackName}, function (err, data) {
    if (err || !data || data.tracks.length < 1) {
      cb(null, null);
      return;
    }

    cb(null, data.tracks[0].href);
  });
};

TrackProvider.prototype.getCompleteDataSet = function (user, dateOffset, limit, resCb) {
  var self = this,
        fn = function (elm, callback) {
            self.searchTrackSpotify(elm.artist["#text"] + " " + elm.name, callback);
        };


  this.getWeeklyChartList(user, function (error, data) {

    if (error) {
        resCb.apply(error, [error, null]);
        return;
    }

    var dates = data.weeklychartlist.chart,
        from,
        to,
        redisKey;

    if (typeof dateOffset === "function" || dateOffset >= dates.length || !dateOffset) {
        dateOffset = 0;
    }

    from = dates[dates.length - dateOffset - 1].from;
    to = dates[dates.length - dateOffset - 1].to;

    if (limit < 1) {
        limit = 10;
    }

    if (limit > 20) {
      limit = 20;
    }

    redisKey = limit + "-" + user + "-" + from + "-" + to;


    // This will return a JavaScript String
    client.get(redisKey, function (err, reply) {

      if (err) throw err;

      if ( reply ) {
        try {
          resCb(null, JSON.parse(reply));
          return;
        } catch (ex) {
        }
        
      }

      self.getWeeklyTrackChart(user, from, to, limit, function (err, data) {
          if (err) {
              resCb(err, null);
              return;
          }

          async.map(data, fn, function (err, data) {
            client.set(redisKey, JSON.stringify(data), redis.print);
            resCb(err, data);
          });
      });

      
    });
  });

};

exports.TrackProvider = new TrackProvider();