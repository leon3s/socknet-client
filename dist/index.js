"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Socknet =
/*#__PURE__*/
function () {
  function Socknet(url, cookie) {
    var _this = this;

    _classCallCheck(this, Socknet);

    _defineProperty(this, "bindAction", function (actionCreator, dispatch) {
      return function () {
        dispatch(actionCreator.apply(void 0, arguments));
      };
    });

    _defineProperty(this, "createAction", function (_ref) {
      var DEFINE = _ref.DEFINE;
      return function (payload) {
        return {
          type: DEFINE,
          payload: payload
        };
      };
    });

    _defineProperty(this, "defineAction", function (DEFINE) {
      var action = {
        DEFINE: DEFINE,
        PENDING: "".concat(DEFINE, "_PENDING"),
        REJECTED: "".concat(DEFINE, "_REJECTED"),
        FULFILLED: "".concat(DEFINE, "_FULFILLED")
      };
      _this.actions["".concat(DEFINE)] = action;
      return action;
    });

    _defineProperty(this, "getActions", function (model) {
      var actions = {};

      if (_this.models[model]) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        args.forEach(function (arg) {
          actions[arg] = _this.models[model][arg];
        });
      }

      return actions;
    });

    _defineProperty(this, "load", function (events) {
      events.forEach(function (event) {
        if (!_this.models[event.model]) _this.models[event.model] = {};
        if (!_this.modelConfigs[event.model]) _this.modelConfigs[event.model] = {};

        _this.generateActionFn(event);
      });
    });

    _defineProperty(this, "sync", function () {
      var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          return reject(new Error('timeout after 20000ms'));
        }, 20000);

        _this.socket.emit('/BackSync', {}, function (err, events) {
          if (err) return reject(err);
          events.forEach(function (event) {
            if (!_this.models[event.model]) _this.models[event.model] = {};
            if (!_this.modelConfigs[event.model]) _this.modelConfigs[event.model] = {};

            _this.generateActionFn(event);
          });
          return resolve(events);
        });
      });
      return promise;
    });

    this.models = {};
    this.actions = {};
    this.modelConfigs = {};
    var query = cookie;
    this.socket = _socket.default.connect(url, {
      query: query
    });
    this.bindSocket();
  }

  _createClass(Socknet, [{
    key: "bindSocket",
    value: function bindSocket() {
      function on(name, callback) {
        this.socket.on(name, callback);
      }

      function emit(name) {
        var _this$socket;

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        (_this$socket = this.socket).emit.apply(_this$socket, [name].concat(args));
      }

      this.on = on;
      this.emit = emit;
    }
  }, {
    key: "generateActionFn",
    value: function generateActionFn(event) {
      var _this2 = this;

      var model = this.models[event.model];
      var newArgs = event.config.args || {};
      var modelConfig = this.modelConfigs[event.model];
      Object.keys(newArgs).forEach(function (key) {
        var arg = event.config.args[key];
        newArgs[key] = arg.name;
      });
      modelConfig[event.name] = {
        args: newArgs,
        name: event.name,
        route: event.config.route,
        requireSession: event.requireSession
      };

      model[event.name] = function (args) {
        var promise = new Promise(function (resolve, reject) {
          setTimeout(function () {
            return reject(new Error('timeout after 20000ms'));
          }, 20000);

          _this2.socket.emit(event.config.route, args, function (err, data) {
            if (err) return reject(err);
            return resolve(data);
          });
        });
        return promise;
      };
    }
  }]);

  return Socknet;
}();

var _default = Socknet;
exports.default = _default;