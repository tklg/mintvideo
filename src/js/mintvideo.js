import Log from 'Log.js';
import SVG from 'SVG.js';
import _ from 'NotUnderscore.js';
import Range from 'Range.js';
import TimeFormat from 'TimeFormat.js';

(function() {
	function MintVideo(_opts) {
		const TAG = "MintVideo";
		var opts = {
			srcName: '',
			src: null,
			id: ''+Date.now(),
			autoplay: false,
			volume: .5, // [0,1]
			muted: false,
			speed: 1, // [0,1]
			progress: 0, // seconds
			fullscreen: false,
			container: '#mv-container',
			controlsDelay: 2000,
			onplay: function() {
				// _this.emit('play');
			},
			onpause: function() {
				// _this.emit('pause');
			},
			onfinish: function() {
				// _this.emit('finish');
			},
			onvolumechange: function(vol) {
				// _this.emit('volumechange', vol);
			},
			onfullscreen: function(fullscreen) {
				// _this.emit('fullscreen', fullscreen);
			},
		};
		var state = {
			fullscreen: false,
		}
		var videoProgress, volumeSlider;
		var controlsTimeout;
		// opts extend
		for (var x in _opts) {
			if (opts.hasOwnProperty(x)) opts[x] = _opts[x];
			else Log.w(TAG, "Unrecognized option: " + x);
		}

		// opts.container check
		if (!opts.container || !opts.container instanceof HTMLElement || typeof opts.container !== 'string') {
			Log.e(TAG, "Invalid container: " + opts.container);
			return;
		}
		var elems = {};
		if (opts.container instanceof HTMLElement) elems.container = opts.container;
		else elems.container = _.first(_.find(opts.container));
		if (!elems.container) {
			Log.e(TAG, "No container found: " + opts.container);
			return;
		}

		// opts.src check
		if (!opts.src) {
			Log.w(TAG, "No source(s) found");
		}

		function constructVideoPlayerContent(container) {
			var main = _.createElem('div');
			main.classList.add('mv-mint-video');
			main.id = opts.id;
			elems.main = main;

			var btnBigPlay = _.createElem('button');
			btnBigPlay.classList.add('mv-btn-big');
			btnBigPlay.innerHTML = SVG.get('play');
			elems.btnBigPlay = btnBigPlay;

			var poster = _.createElem('div');
			poster.classList.add('mv-poster');
			poster.innerText = opts.srcName;
			elems.poster = poster;

			var video = _.createElem('video');
			video.classList.add('mv-video');
			elems.video = video;

			var controls = _.createElem('nav');
			controls.classList.add('mv-controls');

			var progress = _.createElem('div');
			progress.classList.add('mv-progress');
			elems.ranges = {};
			elems.ranges.video = {};
			var progLoad = _.createElem('div');
			progLoad.classList.add('mv-loadbar');
			elems.ranges.video.loaded = progLoad;
			var progAct = _.createElem('div');
			progAct.classList.add('mv-progressbar');
			elems.ranges.video.actual = progAct;
			var progScrubber = _.createElem('div');
			progScrubber.classList.add('mv-progressbar-scrubber');
			progScrubber.setAttribute('draggable', true);
			//progress.setAttribute('draggable', true);
			elems.ranges.video.handle = progScrubber;
			elems.ranges.video.container = progress;

			progress.append(progLoad);
			progress.append(progAct);
			progress.append(progScrubber);
			controls.append(progress);

			var buttons = _.createElem('div');
			buttons.classList.add('mv-buttons');
			elems.buttons = {};

			var btnPlay = _.createButton('mv-btn-play');
			btnPlay.innerHTML = SVG.get('play');
			var btnVolume = _.createButton('mv-btn-volume');
			btnVolume.innerHTML = SVG.get('volume-med');
			var btnSettings = _.createButton('mv-btn-settings');
			btnSettings.innerHTML = SVG.get('settings');
			var btnFullscreen = _.createButton('mv-btn-fullscreen');
			btnFullscreen.innerHTML = SVG.get('fullscreen-enter');
			elems.buttons.play = btnPlay;
			elems.buttons.volume = btnVolume;
			elems.buttons.settings = btnSettings;
			elems.buttons.fullscreen = btnFullscreen;


			var volRange = _.createElem('div');
			volRange.classList.add('mv-range');
			elems.ranges.volume = {};
			var rbValue = _.createElem('div');
			rbValue.classList.add('mv-rangebar-value');
			elems.ranges.volume.actual = rbValue;
			var rbBg = _.createElem('div');
			rbBg.classList.add('mv-rangebar');
			elems.ranges.volume.loaded = rbBg;
			var rbScrubber = _.createElem('div');
			rbScrubber.classList.add('mv-range-scrubber');
			rbScrubber.setAttribute('draggable', true);
			//volRange.setAttribute('draggable', true);
			elems.ranges.volume.handle = rbScrubber;
			elems.ranges.volume.container = volRange;

			volRange.append(rbValue);
			volRange.append(rbBg);
			volRange.append(rbScrubber);

			var timestamp = _.createElem('div');
			timestamp.classList.add('mv-timestamp');
			elems.timestamp = {};
			var tsCurr = _.createElem('span');
			tsCurr.innerText = '0:00';
			elems.timestamp.current = tsCurr;
			var tsTotal = _.createElem('span');
			tsTotal.innerText = '00:00';
			elems.timestamp.total = tsTotal;
			timestamp.append(tsCurr);
			timestamp.append(document.createTextNode(' / '));
			timestamp.append(tsTotal);

			var spacer = _.createElem('div');
			spacer.classList.add('mv-spacer');

			buttons.append(btnPlay);
			buttons.append(btnVolume);
			buttons.append(volRange);
			buttons.append(timestamp);
			buttons.append(spacer);
			buttons.append(btnSettings);
			buttons.append(btnFullscreen);
			controls.append(buttons);

			var gradTop = _.createElem('div');
			gradTop.classList.add('mv-gradient');
			gradTop.classList.add('top');
			var gradBottom = _.createElem('div');
			gradBottom.classList.add('mv-gradient');
			gradBottom.classList.add('bottom');

			main.append(video);
			main.append(btnBigPlay);
			main.append(poster);
			main.append(gradTop);
			main.append(gradBottom);
			main.append(controls);

			elems.controls = controls;

			container.innerHTML = '';
			container.append(main);
			return main;
		}


		//Log.d(TAG, elems);

		// elems now has refs to all parts needed to do stuff, so bind event listeners

		function init() {
			constructVideoPlayerContent(elems.container);
			showControls();
			_.event(elems.btnBigPlay, 'click', play);
			_.event(elems.buttons.play, 'click', playPause);
			_.event(elems.video, 'click', pause);
			_.event(elems.buttons.volume, 'click', mute);
			_.event(elems.buttons.fullscreen, 'click', fullscreen);
			_.event(elems.video, 'loadedmetadata', function(e) {
				playbackRate(opts.speed);
				videoProgress = new Range(opts.progress / elems.video.duration, elems.ranges.video, {
					onDrop: (pct) => progress(pct, true),
				});
				volumeSlider = new Range(opts.volume, elems.ranges.volume, {
					onDrag: volume,
				});
				volume(opts.volume);
				progress(opts.progress);
				timestamp(0, elems.video.duration);
				if (opts.autoplay) play();
			});
			_.event(elems.video, 'timeupdate', progUpdate);
			_.event(elems.main, 'mousemove', showControls);
			_.event(elems.controls, 'mouseenter', () => showControls(true));
			_.event(elems.controls, 'mouseleave', () => showControls(false));
			_.event(window, 'keyup', handleKeyPress);
			_.event(document, 'fullscreenchange', handleFullscreenChange); // PREFIXES WHY
			_.event(document, 'msfullscreenchange', handleFullscreenChange);
			_.event(document, 'mozfullscreenchange', handleFullscreenChange);
			_.event(document, 'webkitfullscreenchange', handleFullscreenChange);

			if (opts.fullscreen) fullscreen(true);
			elems.video.src = opts.src;
		}

		function showControls(forceKeep) {
			//if (forceKeep && forceKeep.preventDefault) forceKeep.preventDefault();
			elems.main.classList.add('controls-active');
			if (controlsTimeout) clearTimeout(controlsTimeout);
			if (forceKeep === true) {
				controlsTimeout = true;
				return;
			} else if (forceKeep === false) {
				controlsTimeout = false;
			}
			if (controlsTimeout === true) return;
			controlsTimeout = setTimeout(hideControls, opts.controlsDelay);
		}
		function hideControls() {
			elems.main.classList.remove('controls-active');
		}
		function playPause() {
			if (elems.video.paused) {

				if (!opts.src) {
					Log.e(TAG, "Cannot play null source.");
					//_this.emit('error', "Cannot play null source.");
					return;
				}

				if (progress() === duration()) {
					videoProgress.setProgress(0);
					progress(0);
				}

				elems.video.play().then(x => {
					//Log.d(x);
					elems.main.classList.add('playing');
					elems.buttons.play.innerHTML = SVG.get('pause');
					if (opts.onplay && typeof opts.onplay === 'function') opts.onplay();
				}).catch((err) => {
					Log.w(TAG, "Error on play: " + err);
					//_this.emit('error', err);
				})
			} else {
				elems.video.pause();
				elems.main.classList.remove('playing');
				elems.buttons.play.innerHTML = SVG.get('play');
				if (opts.onpause && typeof opts.onpause === 'function') opts.onpause();
			}
		}
		function play() {
			if (elems.video.paused) playPause();
		}
		function pause() {
			if (!elems.video.paused) playPause();
		}
		function loop(doloop) {
			elems.video.loop = doloop;
		}
		function volume(vol) {
			if (vol !== undefined) {
				elems.video.volume = vol;
				volumeSlider.setProgress(vol);

				if (vol === 0) {
					elems.buttons.volume.innerHTML = SVG.get('volume-off');
				} else if (vol < 1 / 3) {
					elems.buttons.volume.innerHTML = SVG.get('volume-low');
				} else if (vol < 2 / 3) {
					elems.buttons.volume.innerHTML = SVG.get('volume-med');
				} else {
					elems.buttons.volume.innerHTML = SVG.get('volume-high');
				}

			} else {
				return elems.video.volume;
			}
		}
		function volumeUp() {
			if (volume() < 1) volume(Math.min(volume() + .1, 1));
		}
		function volumeDown() {
			if (volume() > 0) volume(Math.max(volume() - .1, 0));
		}
		function mute() {
			if (elems.video.volume === 0) {
				volume(opts.volume);
			} else {
				opts.volume = elems.video.volume;
				volume(0);
			}
		}
		function progress(sec, isPct) {
			if (sec !== undefined) {
				elems.video.currentTime = isPct ? sec * duration() : sec;
			} else {
				return elems.video.currentTime;
			}
		}
		function seekLeft() {
			if (progress() > 0) progress(Math.max(progress() - 10, 0));
		}
		function seekRight() {
			if (progress() < duration()) progress(Math.min(progress() + 10, duration()));
		}
		function progUpdate() {
			timestamp(progress());
			if (!videoProgress.seeking()) videoProgress.setProgress(progress() / duration());
			if (progress() === duration()) {
				elems.buttons.play.innerHTML = SVG.get('replay');
			}
		}
		function timestamp(prog, total) {
			if (prog !== undefined) elems.timestamp.current.innerText = TimeFormat.format(prog);
			if (total !== undefined) elems.timestamp.total.innerText = TimeFormat.format(total);
		}
		function duration() {
			return elems.video.duration || 0;
		}
		function playbackRate(rate) {
			if (rate !== undefined) {
				elems.video.playbackRate = rate;
			} else {
				return elems.video.playbackRate;
			}
		}
		function ended() {
			return elems.video.ended;
		}
		function handleKeyPress(e) {
			const keys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'f', 'j', 'k', 'l'];
			if (keys.includes(e.key.toLowerCase())) e.preventDefault();
			switch(e.key.toLowerCase()) {
				case 'arrowup':
					volumeUp();
					break;
				case 'arrowdown':
					volumeDown();
					break;
				case 'arrowleft':
				case 'j':
					seekLeft();
					break;
				case 'arrowright':
				case 'l':
					seekRight();
					break;
				case ' ':
				case 'k':
					playPause();
					break;
				case 'f':
					fullscreen();
					break;
			}
		}
		function fullscreen(force) {
			var elem = elems.main;
			var requestFullscreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
			var fullscreenElement = document.fullscreenElement || document.msFullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement;
			var exitFullscreen = document.exitFullscreen || document.msExitFullscreen || document.mozExitFullscreen || document.webkitExitFullscreen;
			if (!state.fullscreen || force === true) {
				if (requestFullscreen) {
					//state.fullscreen = true;
					requestFullscreen.call(elem);
					//videoProgress.recalc();
					elems.buttons.fullscreen.innerHTML = SVG.get('fullscreen-exit');
				}
			} else {
				//state.fullscreen = false;
				exitFullscreen.call(document);
				//videoProgress.recalc();
				elems.buttons.fullscreen.innerHTML = SVG.get('fullscreen-enter');
			}
		}
		function handleFullscreenChange(e) {
			Log.d(e);
			if (state.fullscreen) {
				state.fullscreen = false;
			} else {
				state.fullscreen = true;
			}
			setTimeout(() => { // wtf event, why are you not done when you are called
				volumeSlider.recalc();
				videoProgress.recalc();
			}, 50);
		}

		init();
	}

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') module.exports = MintVideo;
 	else window.MintVideo = MintVideo;
})();