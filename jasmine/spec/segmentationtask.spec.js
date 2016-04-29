 describe("SegmentationTask Tests", function () {
 	var allResults = [],
      extraResults = []
 	for (var i=0;i<20;i++) {
 		allResults.push({index:i,name:"object"+(i+1)})
    extraResults.push({index:i+20,name:"object"+(i+21)})
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
  	

  	task.pushSegment(allResults);
  	task.start()
  	
  });
  it("when data is pushed to an empty started task it should fire the correct events in the correct order", function (done) {
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
   it("when data is pushed to a populated started task it should fire the correct events in the correct order", function (done) {
    task = new SegmentationTask()
    var
      start = false,
      segment = false,
      counter = 0,
      expectedEmits = Math.ceil((allResults.length+extraResults.length) / 3);
    task.segmentSize = 3;
    task.segmentDelay = 50
    task.on("segment", function (event) {
      counter++
      if (counter == expectedEmits) {
        expect(task.allSegments.length == allResults.length+extraResults.length).toBe(true)
        done()
      }
    })

    

    task.pushSegment(allResults);
    task.start()
    setTimeout(function () {
       task.pushSegment(extraResults)
    },100)
  });
  
  it("should fire an expire event if it times out ", function (done) {
  	task = new SegmentationTask();
  	now = Date.now()
  	task.expiry = 1000;
  	task.on("expire", function (event) {
  		expect(event.timeStamp >= now+1000).toBe(true)
  		done()

  	});
    //since no data is provided the task only starts but never emits any data
  	task.start()
  });
  //it("should fire an expire event and stop emitting data if it times out",)
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
  it("should emit at the specified intervals", function (done) {
    task = new SegmentationTask()
    task.segmentSize = 3;
    task.segmentDelay = 500;
    var segmentCount = expectedSegments = Math.ceil(allResults.length/task.segmentSize)
    var currentTime = 0,
        segmentsReceived = 0,
        totalTime = 6*500,
        startTime = Date.now()
    task.on("segment",function (event) {
      segmentsReceived+=event.segment.length
      if (currentTime==0) {//ignore first emit as it may be immediate
        currentTime = Date.now();
        return
      }
     totalTime-=(currentTime-event.timeStamp)

      if (segmentsReceived>=allResults.length) {
       // console.log()
        expect(Math.round((Date.now()-startTime)/1000) == 3).toBe(true);//just testing for a total time taken individual emits are varied depending on other threads etc
         
        done()
      }
      currentTime = event.timeStamp
    })
    task.pushSegment(allResults);
    task.start()
    
  })
  it("should fire end and complete events if notified that no more data is coming", function (done) {
    task = new SegmentationTask()
    task.segmentSize = 3
    var end = false, complete = false;
    task.on("end", function (event) {
      expect(complete).toBe(false);
      end = true;
      expect(event.segment.length).toBe(allResults.length)
    });
    task.on("complete", function (event) {
      expect(end).toBe(true);
      complete = true;
      expect(event.segment.length).toBe(allResults.length)
      done()
    });
    task.pushSegment(allResults);
    task.markComplete()
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
  		complete = true;
  		expect(event.segment.length).toBe(17)
      done()
  	});
  	task.pushSegment(allResults)
  	task.start()
  });
  it("should be able to be aborted and therefore emit no more segment events", function (done) {
    task = new SegmentationTask();
    task.segmentSize = 3;
    var segmentCount = 0;
    var failed = false,
        doneAndExpect = function () {
          expect(true).toBe(true)
          done()
          
        },
        doneTimeout = setTimeout(doneAndExpect,1000)
    task.on("segment", function (event) {
      if (failed) return
      segmentCount++;
      if (segmentCount>2) {
        failed = true
        clearTimeout(doneTimeout)
        expect(false).toBe(true);
        done()
      } 
      task.abort()

    });
    task.pushSegment(allResults)
    task.start()
    task.markComplete()
  })

   /*it("should carry on emitting when results are pushed during lifecycle", function (done) {
    task = new SegmentationTask();
    
    task.on("end", function (event) {
      console.log(task.allSegments.length)
      expect(true).toBe(true)
      done()
    })
    task.pushSegment(allResults);
    task.start()
  })*/
  //This test needs proper thought in its methodology as well as the code behind
  /*it("should endeavour to emit regularly even if time consuming code is run slowing it down ", function (done) {
    task = new SegmentationTask()
    task.segmentSize = 3;
    task.segmentDelay = 50;
    var segmentCount = expectedSegments = Math.ceil(allResults.length/task.segmentSize)
    var currentTime = 0,
        segmentsReceived = 0
    task.on("segment",function (event) {
      segmentsReceived+=event.segment.length
      if (currentTime==0) {//ignore first emit as it may be immediate
        currentTime = Date.now();
        var elements = []
        for (var i=0,breakLoop;!breakLoop;i++) {
          elements.push(document.createElement("div"))
          if (Date.now()-currentTime > 100) {
            breakLoop = true;
          }

        }
        return
      }
      expect(event.timeStamp-currentTime<=60).toBe(true)
      if (segmentsReceived>=allResults.length) {
        
        done()
      }
      currentTime = event.timeStamp
    })
    task.pushSegment(allResults);
    task.start()

  })*/
 
  
 });