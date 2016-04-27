basicProgressableTests(ProgressableFile,"ProgressableFile");
describe("ProgressableFile specific tests", function () {
	var file;
	beforeEach(function (done) {
		Progressable.FileSystem.root().then(function (root) {
			file = new ProgressableFile();
			done()
		
		})
	});
	it("should be able to 'get' the data content of a specific resource via events", function (done) {
		file.on("end",function (eventDetails) {
			file.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
				
			});
		file.execute({method:"get",url:"res/text.txt"})
	})
	it("should be able to 'get' the data content of a specific resource via promise", function (done) {
		file.promise().then(function () {
			file.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
		})
				
		
		file.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when txt", function (done) {
		file.promise().then(function (ifile) {
			ifile.type().then(function (type) {
				expect(type == "text/plain").toBe(true);
				done()
			})
		})
		file.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when json", function (done) {
		file.promise().then(function (ifile) {
			ifile.type().then(function (type) {
				expect(type == "application/json").toBe(true);
				done()
			})
		})
		file.execute({method:"get",url:"res/text.txt"})
	});

})

/*
new Promise(function (success){
	Progressable.FileSystem.root().then(function (root) {
		return success(root)
	})


}).then(
function systemReady() {
	describe("ProgressableFile specific tests", function () {

	var file;
	beforeEach(function () {
		file = new ProgressableFile()
	})
	it("should be able to 'get' the data content of a specific resource via events", function (done) {
		alert('here')
		file.on("end",function (eventDetails) {
			file.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
				
			});
		file.execute({method:"get",url:"text.txt"})
	})
	it("should be able to 'get' the data content of a specific resource via promise", function (done) {
		file.promise().then(function () {
			file.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
		})
				
		
		file.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when txt", function (done) {
		file.promise().then(function (ihttp) {
			ihttp.type().then(function (type) {
				expect(type == "text/plain").toBe(true);
				done()
			})
		})
		file.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when jpg", function (done) {
		file.promise().then(function (ihttp) {
			ihttp.type().then(function (type) {
				expect(type == "image/jpeg").toBe(true);
				done()
			})
		})
		file.execute({method:"get",url:"res/jpeg.jpg"})
	});
	it("should fire progress events", function (done) {
		var progressCount = 0
		file.on("progress",function (eventDetails) {
			progressCount++
			});
		file.execute({method:"get",url:"res/jpeg.jpg"})
		file.promise().then(function () {
			expect(progressCount>0).toBe(true)
			done()
		})
	});
	it("should error when a non existent resource is requested", function (done) {
		function check() {
			if (errorEvent !== undefined && errorPromise !== undefined) {
				expect(errorEvent && errorPromise).toBeTruthy();
				done()
			}

		}
		var errorEvent, errorPromise
		file.on("error", function(eventDetails) {
			console.log(eventDetails)
			errorEvent = true;
			check()
		}).on("end", function () {
			errorEvent = false;
			check()
		}).promise().then(function (){
			errorPromise = false;
			check()
		},function (e) {
			console.log(e)
			errorPromise = true;
			check()
		})
		file.execute({method:"get",url:"nonsenmse"})
	})



})
})*/
