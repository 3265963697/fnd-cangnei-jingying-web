System.register([], function (_export, _context) {
  "use strict";

  var now = function(){
    return window?.performance?.now ? performance.now() : Date.now()
  }

  console.log('Webloading...')

  /** WebLoading Begin */
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomRange(min, max) {return min + Math.random() * (max - min); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function easeInCubic(t) { return t * t * t; }
  function randomWeights(count, min) {
    var weights = [];
    var sum = 0;

    for (var i = 0; i < count; i++) {
      var weight = min + Math.random();
      weights.push(weight);
      sum += weight;
    }

    for (i = 0; i < count; i++) {
      weights[i] /= sum;
    }

    return weights;
  }
  function createProgSegments(maxProg, reserveDuration) {
    var speedProfiles = [
      [1.55, 0.65],
      [0.65, 1.55],
      [1.25, 0.72],
      [0.72, 1.25],
      [0.7, 1.65, 0.78],
      [1.55, 0.62, 1.25],
      [1.15, 0.72, 1.55],
      [0.82, 1.45, 0.68],
      [1.38, 0.72, 1.18],
      [0.75, 1.4, 0.66, 1.15],
      [1.25, 0.72, 1.38, 0.82]
    ];
    var speedProfile = speedProfiles[Math.floor(Math.random() * speedProfiles.length)];
    var count = speedProfile.length;
    var easingList = [easeOutCubic, easeInOutSine, easeInCubic];
    var progWeights = randomWeights(count, 0.16);
    var durationBases = [];
    var segments = [];
    var durationSum = 0;
    var i;

    for (i = 0; i < count; i++) {
      var speed = speedProfile[i] * randomRange(0.86, 1.14);
      var durationBase = progWeights[i] / speed;
      durationBases.push(durationBase);
      durationSum += durationBase;
    }

    var fromProg = 0;
    var fromTime = 0;
    for (i = 0; i < count; i++) {
      var toProg = i === count - 1 ? maxProg : fromProg + maxProg * progWeights[i];
      var durationShare = durationBases[i] / durationSum;
      var toTime = i === count - 1 ? reserveDuration : fromTime + reserveDuration * durationShare;
      var easing = easingList[Math.floor(Math.random() * easingList.length)];
      segments.push({
        fromProg: fromProg,
        toProg: toProg,
        fromTime: fromTime,
        toTime: toTime,
        easing: easing
      });

      fromProg = toProg;
      fromTime = toTime;
    }

    return segments;
  }
  function createWebLoading() {
    var root = document.getElementById('app-loading');
    var bar = root && root.querySelector('.app-loading__bar');
    var loadStartTime = now();
    var maxProg = randomRange(50, 85);
    var reserveDuration = randomRange(3, 4.25);
    var progSegments = createProgSegments(maxProg, reserveDuration);
    var crawlStartTime = 0;
    var crawlStartProg = 0;
    var exitDuration = 0.25;
    var exitStartTime = 0;
    var exitStartProg = 0;
    var curProg = 0;
    var hidden = false;
    var exiting = false;

    window.totalLoadTime = 0;

    function render() {
      if (bar) {
        bar.style.width = curProg.toFixed(3) + '%';
      }
    }

    function getIdleProg(now) {
      var elapsed = (now - loadStartTime) / 1000;

      if (elapsed <= reserveDuration) {
        for (var i = 0; i < progSegments.length; i++) {
          var seg = progSegments[i];
          if (elapsed <= seg.toTime) {
            var segT = clamp((elapsed - seg.fromTime) / Math.max(seg.toTime - seg.fromTime, 0.1), 0, 1);
            return seg.fromProg + (seg.toProg - seg.fromProg) * seg.easing(segT);
          }
        }

        return maxProg;
      }

      if (!crawlStartTime) {
        crawlStartTime = now;
        crawlStartProg = Math.max(curProg, maxProg);
      }

      var crawlSeconds = (now - crawlStartTime) / 1000;
      var under85 = Math.max(85 - crawlStartProg, 0);
      var crawlTo85 = Math.min(under85, crawlSeconds * (0.45 + under85 * 0.055));
      var beyond85Seconds = Math.max(crawlSeconds - (under85 ? under85 / (0.45 + under85 * 0.055) : 0), 0);
      return Math.min(99, crawlStartProg + crawlTo85 + beyond85Seconds * 0.18);
    }

    function hide() {
      if (!root || hidden) {
        return;
      }

      hidden = true;
      window.totalLoadTime = (now() - loadStartTime) / 1000;
      root.classList.add('is-hidden');
      window.setTimeout(function () {
        if (root && root.parentNode) {
          root.parentNode.removeChild(root);
        }
      }, 200);
    }

    function exitLoading() {
      if (exiting) {
        return;
      }

      exiting = true;
      exitStartTime = now();
      exitStartProg = curProg;
    }

    function tick(now) {
      if (exiting) {
        var exitT = clamp((now - exitStartTime) / 1000 / exitDuration, 0, 1);
        curProg = exitStartProg + (100 - exitStartProg) * easeOutCubic(exitT);

        if (exitT >= 1) {
          curProg = 100;
          render();
          hide();
          return;
        }
      } else {
        curProg = Math.max(curProg, getIdleProg(now));
      }

      render();
      requestAnimationFrame(tick);
    }

    window.exitLoading = exitLoading;
    render();
    requestAnimationFrame(tick);

    return {};
  }
  createWebLoading();
  /** WebLoading End */

  var cc, Application;

  function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a function as a constructor"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

  return {
    setters: [],
    execute: function () {
      _export("Application", Application = /*#__PURE__*/function () {
        function Application() {
          _classCallCheck(this, Application);
          this.settingsPath = 'src/settings.json';
          this.showFPS = false;
        }
        _createClass(Application, [{
          key: "init",
          value: function init(engine) {
            cc = engine;
            cc.game.onPostBaseInitDelegate.add(this.onPostInitBase.bind(this));
            cc.game.onPostSubsystemInitDelegate.add(this.onPostSystemInit.bind(this));
          }
        }, {
          key: "onPostInitBase",
          value: function onPostInitBase() {
            // cc.settings.overrideSettings('assets', 'server', '');
          }
        }, {
          key: "onPostSystemInit",
          value: function onPostSystemInit() {
            // do custom logic
          }
        }, {
          key: "start",
          value: function start() {
            return cc.game.init({
              debugMode: false ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
              settingsPath: this.settingsPath,
              overrideSettings: {
                profiling: {
                  showFPS: this.showFPS
                }
              }
            }).then(function () {
              return cc.game.run();
            });
          }
        }]);
        return Application;
      }());
    }
  };
});
