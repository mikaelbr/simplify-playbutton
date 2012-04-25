var LastFmNode = require('lastfm').LastFmNode,
    spotify = require('spotify'),
    async = require("async"),
    redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var lastfm = new LastFmNode({
    api_key: process.env.SIMPLIFY_LASTFM_API_KEY,
    secret: process.env.SIMPLIFY_LASTFM_SECRET
});

var TrackProvider = function () { };


TrackProvider.prototype.getWeeklyTrackChart = function (user, from, to, limit, cb) {

    lastfm.request("user.getWeeklyTrackChart", {
        user: user,
        from: from,
        to: to,
        handlers: {
            success: function (d) {
                
                if (d.error) {
                  cb(d, null);
                  return;
                }

                var tracks = d.weeklytrackchart.track;

                if (!tracks || tracks.length < 1) {
                    cb.apply("No tracks found", ["No tracks found", null]);
                    return;
                }

                tracks = (tracks.length > 1) ? tracks : [tracks];

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


TrackProvider.prototype.getLovedTracks = function (user, limit, cb) {

    lastfm.request("user.getLovedTracks", {
        user: user,
        limit: limit,
        handlers: {
            success: function (d) {
                if (d.error) {
                  cb(d, null);
                  return;
                }

                var tracks = d.lovedtracks.track;

                if (!tracks || tracks.length < 1) {
                    cb.apply("No tracks found", ["No tracks found", null]);
                    return;
                }

                tracks = (tracks.length > 1) ? tracks : [tracks];

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


TrackProvider.prototype.getTopTracks = function (user, period, limit, cb) {

    lastfm.request("user.getTopTracks", {
        user: user,
        limit: limit,
        period: period,
        handlers: {
            success: function (d) {
                if (d.error) {
                  cb(d, null);
                  return;
                }

                var tracks = d.toptracks.track;

                if (!tracks || tracks.length < 1) {
                    cb.apply("No tracks found", ["No tracks found", null]);
                    return;
                }
                
                tracks = (tracks.length > 1) ? tracks : [tracks];

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

  // This will return a JavaScript String
  redis.get(trackName, function (err, reply) {

    if ( reply && !err ) {
      try {
        cb(null, reply);
        return;
      } catch (ex) {
      }
    } // end cache



    // No cache found. Look up track URI from search.
    return spotify.search({type: 'track', query: trackName}, function (err, data) {
      if (err || !data || data.tracks.length < 1) {
        cb(null, null);
        return;
      }

      var trackURI = data.tracks[0].href;
    
      redis.incr("SPB_TRACKS_SEEN");
      redis.set(trackName, trackURI);
      cb(null, trackURI);
    });

  });
};

TrackProvider.prototype.getURIListLoved = function (user, options, resCb) {
  var self = this,
        fn = function (elm, callback) {
            self.searchTrackSpotify(elm.artist.name + " " + elm.name, callback);
        },
        limit = options.limit;

  self.getLovedTracks(user, limit, function (err, data) {
      if (err) {
          resCb(err, null);
          return;
      }
      async.map(data, fn, function (err, data) {
        // redis.set(redisKey, JSON.stringify(data));
        resCb(null, data || []);
      });
  });
};


TrackProvider.prototype.getURIListTop = function (user, options, resCb) {
  var self = this,
        fn = function (elm, callback) {
            self.searchTrackSpotify(elm.artist.name + " " + elm.name, callback);
        },
        period = options.period, // can be overall | 7day | 1month | 3month | 6month | 12month
        limit = options.limit;

  self.getTopTracks(user, period, limit, function (err, data) {
      if (err) {
          resCb(err, null);
          return;
      }
      async.map(data, fn, function (err, data) {
        resCb(null, data || []);
      });
  });
};

TrackProvider.prototype.getURIListWeekly = function (user, options, resCb) {
  var self = this,
        fn = function (elm, callback) {
            self.searchTrackSpotify(elm.artist["#text"] + " " + elm.name, callback);
        },
        dateOffset = options.dateOffset,
        limit = options.limit;

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
    redis.get(redisKey, function (err, reply) {

      if ( reply && !err ) {
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
            redis.set(redisKey, JSON.stringify(data));
            resCb(null, data || []);
          });
      });

      
    });
  });

};

exports.TrackProvider = new TrackProvider();