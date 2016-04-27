function basicProgressableTests(Constructor,title) {
  describe("Progressable tests for "+title, function() {
  var request = null,
      eventDetails = null,
      execute = Progressable.prototype.execute;//this forces 'successful' execution on objects being tested
  function eventHandler(eventDetails) {
    if (!eventDetails) {
      throw new Error("No event details provided")
    }
    eventDetails = eventDetails
  }

  beforeEach(function() {
    request = new Constructor();
    eventDetails = null;
  });

  it("should be executable and return itself", function () {
    expect(execute.apply(request)).toBe(request)
  })
  it("should be abortable and return itself", function () {
    expect(execute.apply(request)).toBe(request)
  });
  it("should accept eventListeners via 'on' and return itself", function () {
    expect(request.on("start",eventHandler)).toBe(request)
  });

  it("should fire a start event with details of the event when executed", function (done) {
    execute.apply(request.on("start",function (details) {
      expect(details).toBeTruthy()
      expect(details.type).toEqual("start")
      done()
    }));
  });
  it("should fire an end event with details of the event when executed", function (done) {
    execute.apply(request.on("end",function (details) {
      expect(details).toBeTruthy()
      expect(details.type).toEqual("end")
      done()
    }));
  });
  it("should fire an abort event with details of the event when aborted", function (done) {
    execute.apply(request.on("abort",function (details) {
      expect(details).toBeTruthy()
      expect(details.type).toEqual("abort")
      done()
    })).abort();
  });

  it("should be able to return as a promise (or promise compliant)", function() {
    expect(request.promise() instanceof Promise || typeof request.promise().then == "function").toBe(true)
  });

  it("should fulfill its promise with itself on end", function (done) {
    var promise = request.promise();
    promise.then(function (val) {
      expect(val).toBe(request)
      done()
    },function (){debugger;})
    execute.apply(request)
  })
  it("should break its promise with itself on abort", function (done) {
    var promise = request.promise();
    promise.then(function (val) {
      //expect(val).toBe(request)
     // done()
    },function (val) {
      expect(val).toBe(request)
      done()
    } )
    request.abort()
  })
  it("should break its promise with itself on error", function (done) {
    var promise = request.promise();
    promise.then(function (val) {
      //alert(val)
      expect(val).toBe(request)
      done()
    },function (val) {
      expect(val).toBe(request)
      done()
    } )
    request.trigger({type:"error"})
  })
   it("should break its promise with itself on timeout", function (done) {
    var promise = request.promise();
    promise.then(function (val) {
      //expect(val).toBe(request)
     // done()
    },function (val) {
      expect(val).toBe(request)
      done()
    } )
    request.trigger({type:"timeout"})
  });
   it("should have a null exception status by default", function (done) {
    request.exception().then(function (exc) {
      expect(exc).toBe(null);
      done()
    },function (){debugger;})
  });
 /*   it("should have an exception sto report if it's errored", function (done) {
   var promise = request.promise(),
        error = window["Error"]
    
    request.trigger({type:"error"},function () {
      this.exception().then(function (ook){
        var isError = ook instanceof Error
        expect(isError).toBe(true)
        ;done();})
    },function () {
      debugger;
    })
  });*/
    
    it("should be able to have multiple event listeners assigned with an object", function () {
      request.events({
        "start": function (event) {},
        "end": function() {},
        "error": {handleEvent: function () {}}
      })
      expect(request._.ons.start.length).toBe(1)
    })

  /* it("should return an object (but not itself) or null for its various data attributes", function (done) {
      var peridata = request.peridata(),
          metadata = request.metadata(),
          data = request.data(), 
          pdata, mdata, ddata;
      request.on("end", function () {
          peridata.then(function (data) {
            pdata = data
          })
          metadata.then(function (data) {
            mdata = data
          })
          data.then(function (data) {
            ddata = data;
            expect(mdata == "object" && !(data instanceof Constructor)).toBe(true)
            expect(typeof pdata == "object" && !(data instanceof Constructor)).toBe(true);
            expect(typeof ddata == "object" && !(data instanceof Progressable)).toBe(true);
            done();
          })
          
      });
      execute.apply(request);
   })*/
});


}



