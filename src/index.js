/**
* @Date:   2018-01-31T18:08:02+01:00
* @Last modified by:
* @Last modified time: 2018-04-08T02:36:58+02:00
*/

import io from 'socket.io-client';

class Socknet {
 constructor(url, cookie) {
   this.models = {};
   this.actions = {};
   this.modelConfigs = {};
   const query = cookie;

   this.socket = io.connect(url, { query });
   this.bindSocket();
 }

 bindSocket() {
   function on(name, callback) {
     this.socket.on(name, callback);
   }
   function emit(name, ...args) {
     this.socket.emit(name, ...args);
   }

   this.on = on;
   this.emit = emit;
 }

 bindAction = (actionCreator, dispatch) => (...args) => {
   dispatch(actionCreator(...args));
 }

 createAction = ({ DEFINE }) => payload => ({
   type: DEFINE,
   payload,
 })

 defineAction = (DEFINE) => {
   const action = {
     DEFINE,
     PENDING: `${DEFINE}_PENDING`,
     REJECTED: `${DEFINE}_REJECTED`,
     FULFILLED: `${DEFINE}_FULFILLED`,
   };

   this.actions[`${DEFINE}`] = action;
   return action;
 }

 generateActionFn(event) {
   const model = this.models[event.model];
   const newArgs = event.config.args || {};
   const modelConfig = this.modelConfigs[event.model];

   Object.keys(newArgs).forEach((key) => {
     const arg = event.config.args[key];
     newArgs[key] = arg.name;
   });

   modelConfig[event.name] = {
     args: newArgs,
     name: event.name,
     route: event.config.route,
     requireSession: event.requireSession,
   };

   model[event.name] = (args) => {
     const promise = new Promise((resolve, reject) => {
       setTimeout(() => reject(new Error('timeout after 20000ms')), 20000);
       this.socket.emit(event.config.route, args, (err, data) => {
         if (err) return reject(err);
         return resolve(data);
       });
     });
     return promise;
   };
 }

 getActions = (model, ...args) => {
   const actions = {};
   if (this.models[model]) {
     args.forEach((arg) => {
       actions[arg] = this.models[model][arg];
     });
   }
   return actions;
 }

 load = (events) => {
   events.forEach((event) => {
     if (!this.models[event.model]) this.models[event.model] = {};
     if (!this.modelConfigs[event.model]) this.modelConfigs[event.model] = {};
     this.generateActionFn(event);
   });
 }

 sync = (store = null, path = null) => {
   const promise = new Promise((resolve, reject) => {
     setTimeout(() => reject(new Error('timeout after 20000ms')), 20000);
     this.socket.emit('/BackSync', {}, (err, events) => {
       if (err) return reject(err);
       events.forEach((event) => {
         if (!this.models[event.model]) this.models[event.model] = {};
         if (!this.modelConfigs[event.model]) this.modelConfigs[event.model] = {};
         this.generateActionFn(event);
       });
       return resolve(events);
     });
   });
   return promise;
 }
}

export default Socknet;
