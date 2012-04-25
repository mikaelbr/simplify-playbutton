# Simplify Play Button

## What is this?
This is a service for automaticly generating Spotify Play Button widget for your Last.fm scrobbled tracks. This service saves you the trouble of either making playlists of the tracks manually, or finding the spotify URI of each and every track you want to add.

Simplify Play Button is really easy to use, all you really need is your Last.fm username, and use the generator down below. This will give you a iframe to paste into your blog any other site with HTML support.

The service is running over at Herokus place (on a sub-domain for now): [http://simplifyplay.herokuapp.com](http://simplifyplay.herokuapp.com)


## Documentation of service usage

This service is an extra layer on top of the regular Spotify Play Button. It fetches data from a Last.fm user, searches through the Spotify Metadata API for URIs and generates an appropriate iframe to show of the new awesome play button.

Due to this only being a top layer, all the options and parameters from the original Spotify Play Button still exists. I highly recomend you read through their documentation, as I won't cover all limitations and such for the different params.

The width and height specification works exactly the same way as with the regular Spotify Play Button.

### Basic usage

The most basic usage is to follow the guide from the Spotify Play Button Documentation, and swap out the iframe source with this:

```
http://simplifyplay.herokuapp.com/user/«YOUR_LASTFM_USERNAME»
```

Resulting in this complete code:


```html
<iframe 
    src='http://simplifyplay.herokuapp.com/user/«YOUR_LASTFM_USERNAME»' 
    frameborder='0' 
    allowtransparency='true' 
    width='250px' 
    height='330px'
></iframe>
```

For more documentation of how to use the service visit the site at [http://simplifyplay.herokuapp.com](http://simplifyplay.herokuapp.com).

## Developing on Simplify Play Button

### Getting the solution up and running locally

To run this solution locally you'll need the following installed:

* Node.js
* NPM
* Redis

In addition to that, you'll need [Last.fm API access](http://www.last.fm/api/account).


After running ```git clone``` to get a local copy 

```
git clone git://github.com/mikaelbr/simplify-playbutton.git
```

you should set local variables to be able to access the Last.FM API. The following env vars are necessary:

```
export SIMPLIFY_LASTFM_API_KEY=MYKEYHERE
export SIMPLIFY_LASTFM_SECRET=MYSECRETHERE
```

Last step you need to do is install all the node modules required. Run the following line in your terminal

```
npm install
```

Now you should have a working copy of the Simplify Play Button and be ready to develop.
To run the solution you can use 

```
foreman start
```

Or simply 

```
node app.js 
```

Note: You should have redis up and running.

### An apology
For now the code is pretty cowboy-ish and lacks proper code documentation. This will get fixed as soon as I get around to it (albeit, it should have been there already).

# License 

```
SPOTIFY Disclaimer This product uses a SPOTIFY API but is not endorsed, certified or otherwise approved in any way by Spotify. Spotify is the registered trade mark of the Spotify Group.
```
