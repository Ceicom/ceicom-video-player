"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function () {
  "use strict";

  var CeicomVideoPlayer =
  /*#__PURE__*/
  function () {
    function CeicomVideoPlayer(videos) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, CeicomVideoPlayer);

      this._player = {};
      this._videos = videos;
      this._options = options;
      this._actualVideo = 0;
      this._isPlaying = false;
      this._fakePlayer = $('.cvp-player');
      this._$playBtn = this._fakePlayer.find('.play-btn');
      this._$progressBar = this._fakePlayer.find('.progress-bar');
      this._$time = this._fakePlayer.find('.time');
      this._$volumeWrapper = this._fakePlayer.find('.volume-wrapper');
      this._$volumeInput = this._fakePlayer.find('.volume-input');
      this._$expandBtn = this._fakePlayer.find('.expand-button');
      this.init();
    }

    _createClass(CeicomVideoPlayer, [{
      key: "init",
      value: function init() {
        var _this = this;

        if (!this._videos.length) {
          $(this._fakePlayer).html('<span class="error-msg">Nenhuma música detectada na lista atual.</span>');
          return;
        }

        var tag = document.createElement('script');
        var firstScriptTag = document.getElementsByTagName('script')[0];
        tag.src = 'https://www.youtube.com/iframe_api';
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = function () {
          // https://developers.google.com/youtube/player_parameters#Parameters
          var options = _objectSpread({
            width: 600,
            height: 600,
            playerVars: {
              autoplay: 0,
              cc_load_policy: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
              showinfo: 0
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
              onError: onPlayerError
            }
          }, _this._options);

          _this._player = new YT.Player('cvp-player', options);

          _this._initFakePlayerActions();
        };

        var onPlayerReady = function onPlayerReady() {
          var videoIds = _this._videos.map(function (item) {
            return _this._validaYoutube(item.link);
          });

          _this._player.loadPlaylist(videoIds);

          _this._player.setLoop(true);

          _this._isPlaying = true; // feito esse setInterval para atualizar o tempo atual já que o plugin do youtube 
          // não funciona tem um evento para cada segundo passado igual o elemento de audio

          setInterval(function () {
            _this._updateTime(_this._player.getCurrentTime(), _this._player.getDuration());

            _this._updateProgressBar(_this._player.getCurrentTime(), _this._player.getDuration());
          }, 1000);
        };

        var onPlayerStateChange = function onPlayerStateChange(event) {
          // Play/Pause Video
          _this._isPlaying = true;

          _this._fakePlayer.addClass('playing');

          if (event.data === 2) {
            _this._isPlaying = false;

            _this._fakePlayer.removeClass('playing');
          } // Verifica se foi alterado o video


          if (_this._player.getPlaylistIndex() !== _this._actualVideo) {
            _this._actualVideo = _this._player.getPlaylistIndex();

            _this._videoChange();
          }
        };

        var onPlayerError = function onPlayerError() {
          _this._videoChange(true);

          _this._player.nextVideo();
        };
      }
    }, {
      key: "_initFakePlayerActions",
      value: function _initFakePlayerActions() {
        var _this2 = this;

        this._$playBtn.on('click', function () {
          return _this2._isPlaying ? _this2._player.pauseVideo() : _this2._player.playVideo();
        });

        this._$volumeWrapper.on('click', function (e) {
          if (!$(e.target).hasClass('volume-wrapper')) return;

          _this2._$volumeWrapper.toggleClass('active');
        });

        this._$volumeInput.on('input', function () {
          return _this2.setVolume(_this2._$volumeInput.val() / 10);
        });

        this._$expandBtn.on('click', function () {
          var ele = _this2._fakePlayer.parent()[0];

          if (document.fullscreen || document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();else if (document.msExitFullscreen) document.msExitFullscreen();else if (document.mozCancelFullScreen) document.mozCancelFullScreen();else if (ele.webkitExitFullscreen) document.webkitExitFullscreen();
            return;
          }

          if (ele.requestFullscreen) ele.requestFullscreen();else if (ele.msRequestFullscreen) ele.msRequestFullscreen();else if (ele.mozRequestFullScreen) ele.mozRequestFullScreen();else if (ele.webkitRequestFullscreen) ele.webkitRequestFullscreen();
        });
      }
    }, {
      key: "getVolume",
      value: function getVolume() {
        return this._player.getVolume();
      }
    }, {
      key: "setVolume",
      value: function setVolume(value) {
        this._player.setVolume(value * 100);
      }
    }, {
      key: "_validaYoutube",
      value: function _validaYoutube(link) {
        var regex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;
        var match = regex.exec(link);
        return match && match[1].length === 11 ? match[1] : false;
      }
    }, {
      key: "_videoChange",
      value: function _videoChange(error) {
        $(document).trigger('cmp-media-end', [this._player.getPlaylistIndex(), error]);
      }
    }, {
      key: "_updateProgressBar",
      value: function _updateProgressBar(currentTime, musicDuration) {
        this._$progressBar.css('transform', "scaleX(".concat(Math.ceil(currentTime) / Math.ceil(musicDuration), ")"));
      }
    }, {
      key: "_updateTime",
      value: function _updateTime(currentTime, musicDuration) {
        var extraZero = function extraZero(n) {
          return n < 10 ? '0' + n : n;
        };

        var formatedTime = function formatedTime(time) {
          var s = parseInt(Math.ceil(time) % 60);
          var m = parseInt(Math.ceil(time) / 60 % 60);
          return extraZero(m) + ':' + extraZero(s);
        };

        this._$time.text(formatedTime(currentTime) + ' / ' + formatedTime(musicDuration));
      }
    }]);

    return CeicomVideoPlayer;
  }();
  /**********************************/
  // commonjs


  if (typeof exports !== "undefined") {
    exports.CeicomVideoPlayer = CeicomVideoPlayer;
  } else {
    window.CeicomVideoPlayer = CeicomVideoPlayer;
  }
})(typeof global !== "undefined" ? global : void 0);
