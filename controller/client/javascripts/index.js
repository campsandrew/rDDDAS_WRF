(function(){
	"use strict";
	
	window.addEventListener("load", function() {
		var xhr = new XMLHttpRequest();
		
		xhr.addEventListener("load", function() {
			var data = JSON.parse(xhr.response);
			
			statusRequest(JSON.parse(xhr.response));
		});
		xhr.open("GET", "http://localhost:3000/nodes");
		xhr.send();
	});
	
	function statusRequest(data) {
		
		console.log(data)
		
		for(var host of data.wps.nodes) {
			var xhr = new XMLHttpRequest();
			var url = "http://" + host + ":" + data.wps.port + "wps/heartbeat";
			console.log(url)
			
			xhr.addEventListener("load", function() {
				console.log(xhr.response);
			});
			xhr.open("GET", url);
			xhr.send();
		}
		
		for(var host of data.wrf.nodes) {
			var xhr = new XMLHttpRequest();
			var url = "http://" + host + ":" + data.wrf.port + "wrf/heartbeat";
			console.log(url)
			
			xhr.addEventListener("load", function() {
				console.log(xhr.response);
			});
			xhr.open("GET", url);
			xhr.send();
		}
	}
})();