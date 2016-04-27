basicProgressableTests(ProgressableHttp,"ProgressableHttp");
describe("ProgressableHttp specific tests", function () {
	var http;
	beforeEach(function () {
		http = new ProgressableHttp()
	})
	it("should be able to 'get' the data content of a specific resource via events", function (done) {
		http.on("end",function (eventDetails) {
			http.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
				
			});
		http.execute({method:"get",url:"res/text.txt"})
	})
	it("should be able to 'get' the data content of a specific resource via promise", function (done) {
		http.promise().then(function () {
			http.data().then(function (data) {
				expect(data == "text").toBe(true);
				done()
			})
		})
				
		
		http.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when txt", function (done) {
		//http.promise().then(function (ihttp) {
			http.type().then(function (type) {
				expect(type == "text/plain").toBe(true);
				done()
			})
		//})
		http.execute({method:"get",url:"res/text.txt"})
	});
	it("should be able to determine the type of its resource when jpg", function (done) {
		http.promise().then(function (ihttp) {
			http.type().then(function (type) {
				expect(type == "image/jpeg").toBe(true);
				done()
			})
		})
		http.execute({method:"get",url:"res/jpeg.jpg"})
	});
	it("should fire progress events", function (done) {
		var progressCount = 0
		http.on("progress",function (eventDetails) {
			progressCount++
			});
		http.execute({method:"get",url:"res/jpeg.jpg"})
		http.promise().then(function () {
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
		http.on("error", function(eventDetails) {
//			console.log(eventDetails)
			errorEvent = true;
			check()
		}).on("end", function () {
			errorEvent = false;
			check()
		}).promise().then(function (){
			errorPromise = false;
			check()
		},function (e) {
		//	console.log(e)
			errorPromise = true;
			check()
		})
		http.execute({method:"get",url:"nonsenmse"})
	})



})