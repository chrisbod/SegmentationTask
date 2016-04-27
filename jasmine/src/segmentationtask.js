function SegmentationTask() {
	this.handlers = {};

}
SegmentationTask.prototype = {
   segmentSize:0,
   maxSize:0,
   forceSegmentSize:false,
   autoDispose:false,
   segmentDelay:0,
   nextSegmentEstimate:0,
   endEstimate:0,
   allSegments:null,
   expiry: 0,
   started: false,
   expired: false,
   disposed: false,
   ended: false,
   completed: false,
   errored: false,
   currentIndex: -1,
   on: function (eventName,handler) {
   		var handlers = this.handlers[eventName]||(this.handlers[eventName]=[])
   		if (handlers.indexOf(handler)==-1) {
   			handlers.push(handler);
   		}
   		return this;
   },
   emit: function (event) {
   		event.timeStamp = Date.now()
   		var handlers = this.handlers[event.type];
   		if (handlers) {
   			handlers.forEach(function (handler) {
   				handler.call(this,event)
   			},this)
   		}
   },
   emitAsync: function (event) {
   	setTimeout(this.emit.bind(this,event),0)
   },
   start: function () {
   		this.started = true;
   		if (this.expiry) {
   			this.expiryTimeout = setTimeout(this.forceExpire.bind(this),this.expiry)
   		}
   		this.emitAsync({
   			type: "start",
   			target: this,
   			segment: null
   		});
   		if (!this.allSegments) {
   			this.allSegments = []
   		} else {
   			this.emitNextSegment()
   			
   		}

   		//do work here
   },
   emitNextSegment: function () {
   	var segmentSize = this.segmentSize,
   		segmentsToEmit;
   	if (!segmentSize) {
   		segmentsToEmit = this.allSegments.concat();
   		this.currentIndex = this.allSegments.length;
   	} else {
   		segmentsToEmit = this.allSegments.slice(this.currentIndex+1,this.currentIndex+1+segmentSize)
   		this.currentIndex+=segmentSize;
   	}
   	if (this.maxSize) {
   		if (this.currentIndex > this.maxSize) {
   			var overspill = this.currentIndex-this.maxSize;
   			segmentsToEmit.length-=overspill;
   			if (segmentsToEmit.length) {
			   	this.emitAsync({
					type: "segment",
					target: this,
					segment: segmentsToEmit
				});
			}
			var shortenedResults = this.allSegments.slice(0,this.maxSize);
			this.ended = true;
			this.emitAsync(
				{
					type: "end",
					target: this,
					segment: shortenedResults
				}
			)
			this.completed = true
			this.emitAsync(
				{
					type: "complete",
					target: this,
					segment: shortenedResults
				}
			)

			return
   		}
   	}
   	if (segmentsToEmit.length) {
	   	this.emitAsync({
			type: "segment",
			target: this,
			timeStamp: Date.now(),
			segment: segmentsToEmit
		});
	}
	if (this.currentIndex<this.allSegments.length) {
		setTimeout(this.emitNextSegment.bind(this),this.segmentDelay)
	}
   
   },
   forceExpire: function () {
   		this.expired = true;
   		this.emitAsync({
   				type: "expire",
   				target: this,
   				timeStamp: Date.now(),
   				segments:this.allSegments.concat()
   		})
   },
   pushSegment: function (segment) {
   	if (!this.allSegments) {
   		this.allSegments = segment.concat()
   	} else {
   		this.allSegments.concat(segment)
   	}
   	if (this.started) {
   		this.emitAsync({
   				type: "segment",
   				target: this,
   				timeStamp: Date.now(),
   				segment:segment
   			})
   	}
   }
}