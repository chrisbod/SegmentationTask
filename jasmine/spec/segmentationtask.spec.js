 describe("SegmentationTask Tests", function () {
 	var allResults = []
 	for (var i=0;i<20;i++) {
 		allResults.push({index:i,name:"object"+(i+1)})
 	}
 	var config,
 		task

 		function validateEvent(event) {
 			expect(typeof event.type).toEqual("string")
 			expect(event.target).toBe(task)
 			expect(typeof event.timeStamp).toEqual("number")
 			expect(typeof event.segment).toEqual("object")
 		}

 it("you should be able to create a task,with default values", function () {
   task = new SegmentationTask();
   expect(task.segmentSize).toBe(0);
   expect(task.maxSize).toBe(0);
   expect(task.forceSegmentSize).toBe(false);
   expect(task.autoDispose).toBe(false);
   expect(task.segmentDelay).toBe(0);
   expect(task.expiry).toBe(0);
   expect(task.nextSegmentEstimate).toBe(0);
   expect(task.endEstimate).toBe(0);
   expect(task.allSegments).toBe(null);
   expect(task.started).toBe(false);
  })
  it("should be able to attach events and fire them aynchronously", function (done) {
   	task = new SegmentationTask();
   	var allEvents = ["start","segment","end","expire","error","abort","complete","dispose"]
   		firedEvents = [],
   		eventCounter = function (event) {
   			firedEvents.push(event.type);
   			expect(this).toBe(task)
   			if (firedEvents.length===8) {
   				
   				expect(allEvents.sort()).toEqual(firedEvents.sort())
   				done()
   			}
   		}
   	allEvents.forEach(function (eventName) {
   		task.on(eventName,eventCounter)
   	})
   	allEvents.forEach(function (eventName) {
   		task.emitAsync({type:eventName});
   	})
   	expect(firedEvents.length).toBe(0)
  });
  it("when data is pushed to an unconfigured task and the task is started it should fire the correct events in the correct order", function (done) {
  	task = new SegmentationTask()
  	var
  		start = false,
  		segment = false
  	task.on("start", function (event) {
  		expect(segment).toBe(false)
  		validateEvent(event)
  		expect(event.type).toEqual("start");
  		expect(event.segment).toBe(null);
  		start = true;
  	})
  	task.on("segment", function (event) {
  		expect(start).toBe(true)
  		validateEvent(event)
  		expect(event.type).toEqual("segment");
  		expect(event.segment).toEqual(allResults);
  		done()
  	})
  	

  	task.pushSegment(allResults);
  	task.start()
  });
  it("when the task is started it and data is pushed to an unconfigured task it should fire the correct events in the correct order", function (done) {
  	task = new SegmentationTask()
  	var
  		start = false,
  		segment = false
  	task.on("start", function (event) {
  		expect(segment).toBe(false)
  		validateEvent(event)
  		expect(event.type).toEqual("start");
  		expect(event.segment).toBe(null);
  		start = true;
  	})
  	task.on("segment", function (event) {
  		expect(start).toBe(true)
  		validateEvent(event)
  		expect(event.type).toEqual("segment");
  		expect(event.segment).toEqual(allResults);
  		done()
  	})
  	

  	
  	task.start()
  	task.pushSegment(allResults);
  });
  it("should fire an expire event if it times out ", function (done) {
  	task = new SegmentationTask();
  	now = Date.now()
  	task.expiry = 1000;
  	task.on("expire", function (event) {

  		expect(event.timeStamp >= now+1000).toBe(true)
  		done()

  	});
  	task.start()
  });
  it("should provide segments of the correct size when possible", function (done) {
  	task = new SegmentationTask()
  	task.segmentSize = 3;
  	var segments = [],
  		expectedSegments = Math.ceil(allResults.length/task.segmentSize)
  	task.on("segment",function (event) {
  		expect(event.segment.length<=3).toBe(true);
  		segments.push(event.segment)
  		if (segments.length==expectedSegments) {
  			expect([].concat.apply([],segments)).toEqual(allResults);
  			expect(segments[1][0].index).toBe(3);
  			expect(segments[segments.length-1].length).toBe(allResults.length % task.segmentSize)
  			done()
  		}

  	})
  	task.pushSegment(allResults);
  	task.start()
  })
  it("should fire an end  event then a complete event when the maxSize is exceeded with the correct values", function (done) {
  	task = new SegmentationTask()
  	task.maxSize = 17;
  	var end = false, complete = false
  	task.on("end", function (event) {
  		expect(complete).toBe(false);
  		end = true;
  		expect(event.segment.length).toBe(17)
  	});
  	task.on("complete", function (event) {
  		expect(end).toBe(true);
  		end = true;
  		expect(event.segment.length).toBe(17)
  	});
  	task.pushSegment(allResults)
  	task.start()
  })
  
 });