(function (Progressable,protoProperties,propertyDefinitions) {
	var proto = Progressable.prototype,
		property
	for (property in protoProperties) {
		proto[property] = protoProperties[property]
	}
	for (property in propertyDefinitions) {
		Object.defineProperty(proto,property,propertyDefinitions[property])
	}
	this.Progressable = Progressable;
})(
	function Progressable(){},
	{
		status: 0,
		UNINIT: 0,
		STARTED: 1,
		PROGRESSED: 2,
		ENDED: 3,
		ABORTED: 4,
		ERRORED: 5,
		TIMEOUTED: 6,
		ERROR_CODES: {
			0: "Unknown error",
			1: "Invalid request",
			2: "No such object",
			3: "Provider error",
			4: "Request timed out",
			5: "Request aborted",
			6: "Insufficient resources available",
			7: "Security Error"
		},
		_: null,
		abort: function progressable_abort() {
			this.trigger({type:"abort"});
			return this;
		},
		execute: function progressable_execute() {
			this.trigger({type:"start"});
			this.trigger({type:"end"})
			return this;
		},
		on: function progressable_on(eventName,eventHandler) {
			var ons = this._.ons[eventName];
			if (!ons) {
				this._.ons[eventName] = [eventHandler];
			} else if (ons.indexOf(eventHandler) == -1) {
				ons[ons.length] = eventHandler;
			}
			return this;
		},
		off: function progressable_off(eventName,eventHandler) {
			var ons = this._.ons[eventName],index;
			
			if (ons) {
				index = ons.indexOf(eventHandler)
				if (index != -1) {
					ons.slice(index,1)
				}
			}
			return this;
		},
		events: function progressable_events(eventDefinitions) {
			for (var propertyName in eventDefinitions) {
				this.on(propertyName,eventDefinitions[propertyName]);
			}
			return this;
		},
		dispose: function progressable_dispose() {

		},
		trigger: function progressable_trigger(eventDetails,finalizer) {
			var type = eventDetails.type,
				ons = this._.ons[type];
			if (ons) setTimeout(this.triggerSync.bind(this,type,eventDetails,ons,finalizer))
			return this;
		},
		triggerSync: function progressable_triggerAsync(type,eventDetails,handlers,finalizer) {
				this.state = this[type.toUpperCase()+"ED"] || this.state;
				eventDetails.currentTarget = this;
				for (var i=0,l=handlers.length;i!=l;i++) {
					handlers[i].call(this,eventDetails);
				}
				if (finalizer) {
					finalizer.call(this,eventDetails);
				}
				delete eventDetails.currentTarget;
		},
		promise: function progressable_promise() {
			return this.promiseCreator();
		},
		Promise: Promise,
		promiseExecutor: function progressable_promiseExecutor(success,failure,progress){
			var fail = failure.bind(null,this)
			this.on("end",success.bind(null,this));
			this.on("abort",fail);
			this.on("timeout",fail);
			this.on("error",fail);
			if (progress) {
				this.on("progress",progress.bind(null,this))
			}
		},
		promiseCreator: function (executor) {
			var promise = new this.Promise(executor ? executor.bind(this) : this.promiseExecutor.bind(this));
			promise.progressable = this;
			return promise;
		},
		promiseNullifier: function (success) {
				success(null);
		},
		promiseError: function (success) {
			success(new Error("Progressable Error"))
		},
		metadata: function () {
			return this.promiseCreator(this.promiseNullifier);
		},
		peridata: function () {
			return this.promiseCreator(this.promiseNullifier);
		},
		data: function () {
			return this.promiseCreator(this.promiseNullifier);
		},
		exception: function () {
			if (this.state == 5) {
				return this.promiseCreator(this.promiseError.bind(this))
			}
			return this.promiseCreator(this.promiseNullifier);
		},
		type: function () {
			return this.promiseCreator(function(s){s("")});//always unknown
		},
		Private: function () {
			this.ons = {};
		}
	},{
		"_": {
			get: function () {
				return Object.defineProperty(this,"_",{
					value: new this.Private(),
					enumerable: false,
					configurable: false
				})._
			}
		} 
	}
);