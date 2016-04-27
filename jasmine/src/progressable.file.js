(function (ProgressableFile,proto,protoProperties,propertyDefinitions) {
	var property;
	ProgressableFile.prototype = proto;
	proto.constructor = ProgressableFile;
	for (property in protoProperties) {
		proto[property] = protoProperties[property]
	}
	for (property in propertyDefinitions) {
		Object.defineProperty(proto,property,propertyDefinitions[property])
	}
	this.ProgressableFile = ProgressableFile;

})(
	function ProgressableFile(){},
	new Progressable(),
	{
		config: null,
		directory: function (path) {
			return Progressable.FileSystem.directory(path)
		},
		fileEntry: function (filename,directory) {
			var pFile = this;
			return new Promise(function (success,failure) {
				directory.getFile(filename,{create:false},function (fileEntryObject) {
					pFile.fileEntryObject = fileEntryObject;
					success(fileEntryObject)
				},failure)
			})
			
		},
		file: function (fileEntry) {
			var pFile = this;
			return new Promise(function (success,failure) {
				fileEntry.file(function (fileObject) {
					pFile.fileObject = fileObject;
					success(fileObject)
				})
			})
		},
		read: function (fileObject) {
			var pFile = this;
			return new Promise(function (success,failure) {
	
						 var reader = new FileReader();

					       reader.onloadend = function(e) {
					         pFile.result = this.result;
					         success(this.result)
					       };

       					  reader.readAsText(fileObject);
			})
		},
		head: function (url) {


		},
		get: function (url) {
			var parts = url.split("/"),
				filename = parts.pop(),
				path = parts.join("/");
			var pFile = this
			return this.directory(path).then(
					this.fileEntry.bind(this,filename)
				).then(
					this.file.bind(this)
				).then(
					this.read.bind(this)
				).then(
					function (result) {

						pFile.trigger({type:"end"});
					}
				)
		},
		execute: function (config) {
			this.config = config;
			this[config.method](config.url)
			return this;
		},
		data: function() {
			return new Promise((function (success,f) {
				success(this.result)
			}).bind(this))
		},
		type: function () {
			return new Promise((function (success,f) {
				success(this.fileObject.type)
			}).bind(this))
		}
	},
	{
	}
);