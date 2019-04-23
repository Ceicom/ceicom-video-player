(function () {
    "use strict";

    class CeicomVideoPlayer {
        constructor(videos, options = {}) {
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

        init() {
            if (!this._videos.length) {
                $(this._fakePlayer).html('<span class="error-msg">Nenhuma música detectada na lista atual.</span>');
                return;
            }

            const tag = document.createElement('script');
            const firstScriptTag = document.getElementsByTagName('script')[0];

            tag.src = 'https://www.youtube.com/iframe_api';
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                // https://developers.google.com/youtube/player_parameters#Parameters
                const options = {
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
                    },
                    ...this._options
                };

                this._player = new YT.Player('cvp-player', options);
                this._initFakePlayerActions();
            }

            const onPlayerReady = () => {
                const videoIds = this._videos.map(item => this._validaYoutube(item.link));

                this._player.loadPlaylist(videoIds);
                this._player.setLoop(true);
                this._isPlaying = true;

                // feito esse setInterval para atualizar o tempo atual já que o plugin do youtube 
                // não funciona tem um evento para cada segundo passado igual o elemento de audio
                setInterval(() => {
                    this._updateTime(this._player.getCurrentTime(), this._player.getDuration());
                    this._updateProgressBar(this._player.getCurrentTime(), this._player.getDuration());
                }, 1000);
            }

            const onPlayerStateChange = event => {

                // Play/Pause Video
                this._isPlaying = true;
                this._fakePlayer.addClass('playing');
                if (event.data === 2) {
                    this._isPlaying = false;
                    this._fakePlayer.removeClass('playing');
                }

                // Verifica se foi alterado o video
                if (this._player.getPlaylistIndex() !== this._actualVideo) {
                    this._actualVideo = this._player.getPlaylistIndex();
                    this._videoChange();
                }
            }

            const onPlayerError = () => {
                this._videoChange(true);
                this._player.nextVideo();
            }
        }

        _initFakePlayerActions() {
            this._$playBtn.on('click', () => this._isPlaying ? this._player.pauseVideo() : this._player.playVideo());

            this._$volumeWrapper.on('click', e => {
                if (!$(e.target).hasClass('volume-wrapper')) return;
                this._$volumeWrapper.toggleClass('active');
            });

            this._$volumeInput.on('input', () => this.setVolume(this._$volumeInput.val() / 10));

            this._$expandBtn.on('click', () => {
                const ele = this._fakePlayer.parent()[0];

                if (document.fullscreen || document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                    if (document.exitFullscreen)
                        document.exitFullscreen();
                    else if (document.msExitFullscreen)
                        document.msExitFullscreen();
                    else if (document.mozCancelFullScreen)
                        document.mozCancelFullScreen();
                    else if (ele.webkitExitFullscreen)
                        document.webkitExitFullscreen();
                    return;
                }

                if (ele.requestFullscreen)
                    ele.requestFullscreen();
                else if (ele.msRequestFullscreen)
                    ele.msRequestFullscreen();
                else if (ele.mozRequestFullScreen)
                    ele.mozRequestFullScreen();
                else if (ele.webkitRequestFullscreen)
                    ele.webkitRequestFullscreen();
            });
        }

        getVolume() {
            return this._player.getVolume();
        }

        setVolume(value) {
            this._player.setVolume(value * 100);
        }

        _validaYoutube(link) {
            const regex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;
            const match = regex.exec(link);

            return match && match[1].length === 11 ? match[1] : false;
        };

        _videoChange(error) {
            $(document).trigger('cmp-media-end', [this._player.getPlaylistIndex(), error]);
        }

        _updateProgressBar(currentTime, musicDuration) {
            this._$progressBar.css('transform', `scaleX(${Math.ceil(currentTime) / Math.ceil(musicDuration)})`);
        }

        _updateTime(currentTime, musicDuration) {
            const extraZero = n => n < 10 ? '0' + n : n;

            const formatedTime = time => {
                const s = parseInt(Math.ceil(time) % 60);
                const m = parseInt((Math.ceil(time) / 60) % 60);

                return extraZero(m) + ':' + extraZero(s);
            }

            this._$time.text(formatedTime(currentTime) + ' / ' + formatedTime(musicDuration));
        }
    }

    /**********************************/

    // commonjs
    if (typeof exports !== "undefined") {
        exports.CeicomVideoPlayer = CeicomVideoPlayer;
    } else {
        window.CeicomVideoPlayer = CeicomVideoPlayer;
    }

}(typeof global !== "undefined" ? global : this));