function Promise(fn){
	var self = this
	self.status = 0
	self.value = undefined
	self.onResolvedCallback = []
	self.onRejectedCallback = []

	function resolve(value){
		if(self.status === 0){
			self.status = 1
			self.value = value
			for(var i = 0; i < self.onResolvedCallback.length; i++){
				self.onResolvedCallback[i](value)
			}
		}
	}
	function reject(reason){
		if(self.status === 0){
			self.status = 2
			self.value = reason
			for(var i = 0; i < self.onRejectedCallback.length; i++){
				self.onRejectedCallback[i](reason)
			}
		}
	}

	try{
		fn(resolve,reject)
	}catch(error){
		reject(error)
	}
}
Promise.prototype.then = function(onResolved, onRejected){
	var self = this
	onResolved = typeof onResolved === 'function' ? onResolved : function(value){ return value }
	onRejected = typeof onRejected === 'function' ? onRejected : function(value){ return value }

	if(self.status === 0){
		return new Promise(function(resolve, reject){
			self.onResolvedCallback.push(function(value){
				try{
					var x = onResolved(self.value)
					if(x instanceof Promise){
						x.then(resolve, reject)
					}
				}catch(e){
					reject(e)
				}
			})
			self.onRejectedCallback.push(function(value){
				try{
					var x = onRejected(self.value)
					if(x instanceof Promise){
						x.then(resolve, reject)
					}
				}catch(e){
					reject(e)
				}
			})
		})
	}

	if(self.status === 1){
		return new Promise(function(resolve, reject){
			try{
				var x = onResolved(self.value)
				if(x instanceof Promise){
					x.then(resolve, reject)
				}
				resolve(x)
			}catch(e){
				reject(e)
			}
		})
	}

	if(self.status === 2){
		return new Promise(function(resolve, reject){
			try{
				var x = onRejected(self.value)
				if(x instanceof Promise){
					x.then(resolve, reject)
				}
			}catch(e){
				reject(e)
			}
		})
	}
}

Promise.prototype.catch = function(onRejected){
	return this.then(null, onRejected)
}
