(function (ProgressableHttp,proto,protoProperties,propertyDefinitions) {
	var property;
	ProgressableHttp.prototype = proto;
	proto.constructor = ProgressableHttp;
	for (property in protoProperties) {
		proto[property] = protoProperties[property]
	}
	for (property in propertyDefinitions) {
		Object.defineProperty(proto,property,propertyDefinitions[property])
	}
	this.ProgressableHttp = ProgressableHttp;

})(
	function ProgressableHttp(){},
	new Progressable(),
	{
		httpRequest: null,
		config: null,
		execute: function (config) {
			this.config = config;
			var xhttp = this.httpRequest;

			xhttp.open(config.method, config.url, true);
			xhttp.send();
			return this;
		},
		end: function() {
			var xhttp = this.httpRequest,
						headers = xhttp.getAllResponseHeaders();
					if (this.config && !headers && ProgressableHttp.MIMETYPES) {//look for an extension
						var ext = this.config.url.match(/\.(.+)$/)
						if (ext && ProgressableHttp.MIMETYPES[ext[1]]) {
							this._.type = ProgressableHttp.MIMETYPES[ext[1]]
							//success(ProgressableHttp.MIMETYPES[ext[1]]);

							return
						} else {
							console.log("unknown 41")
						}
					}
					this._.type = ""
				
		},
		type: function () {
			if ("type" in this._) {
				return new Promise(new Function("s","s('"+this._.type+"')"))
			}
			return new Promise(
				(function (success,failure) {
					this.on("end",function () {
					var xhttp = this.httpRequest,
						headers = xhttp.getAllResponseHeaders();
					if (this.config && !headers && ProgressableHttp.MIMETYPES) {//look for an extension
						var ext = this.config.url.match(/\.(.+)$/)
						if (ext && ProgressableHttp.MIMETYPES[ext[1]]) {
							this._.type = ProgressableHttp.MIMETYPES[ext[1]]
							success(ProgressableHttp.MIMETYPES[ext[1]]);

							return
						} else {
							console.log("unknown 41")
						}
					}
						console.log("44")
						success(Progressable.prototype.type.apply(this,arguments))
					})
				}).bind(this)


			)
			
		},
		data: function() {
			return this.promiseCreator((function (success){success(this.httpRequest.response)}).bind(this))
		}
	},
	{
		"httpRequest": {
			get: function () {
				var request = new XMLHttpRequest();
				request.onloadstart = (function (nativeEvent){
					this.trigger({type:"start",innerEvent:nativeEvent});
				}).bind(this)
				request.onload = (function (nativeEvent){
					this.end()
					this.trigger({type:"end",innerEvent:nativeEvent});
				}).bind(this)
				request.onprogress = (function (nativeEvent){
					this.trigger({type:"progress",innerEvent:nativeEvent});
				}).bind(this);
				request.onerror = (function (nativeEvent){
					//console.log(nativeEvent)
					this.trigger({type:"error",innerEvent:nativeEvent});
				}).bind(this)
				return Object.defineProperty(this,"httpRequest",{
					value: request,//this will need to be changed to allow recycling for memory reasons
					enumerable: false,
					configurable: true
				}).httpRequest
			}
		} 
	}
);