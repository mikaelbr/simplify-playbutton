var util = require("util");

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

/**

{
  title: 'Automated Spotify Play Button',
  listname: encodeURIComponent(user + ": Last played tracks"),
  tracklist: tracklist,
  width: width,
  theme: theme,
  height: height,
  view: view
}

*/
PlayButton.prototype.makeJSONFormatted = function (options) {

    var url = 'https://embed.spotify.com/?uri=spotify:trackset:' +
                options.listname + ":" + options.tracklist +
                '&theme=' + options.theme + '&view=' + options.view;

    var HTML = "<iframe frameborder='0' allowtransparency='true' width='"+options.width+"px' height='"+options.height+"px' src='"+url+"'></iframe>";
    options.HTML = HTML;
    return options;
};

exports.play = new PlayButton();
