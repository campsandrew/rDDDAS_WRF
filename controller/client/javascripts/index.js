(function(){
	"use strict";
	
	window.addEventListener("load", function() {
		statusRequest();

	});
	
	function statusRequest() {
		var xhr = new XMLHttpRequest();
		var wps = document.getElementById("wps");
		var wrf = document.getElementById("wrf");
		let url = "http://controller:3000/status";
		
		wps.innerHTML = "";
		wrf.innerHTML = "";
		
		// Send ajax for node status
		xhr.addEventListener("load", function() {
			var res = JSON.parse(xhr.response);

			if(res.success) {
				for(var host in res.stats.wps) {
					wps.innerHTML += "<li>" + host + ": " + res.stats.wps[host] + "</li>";
				}
				
				for(var host in res.stats.wrf) {
					wrf.innerHTML += "<li>" + host + ": " + res.stats.wrf[host] + "</li>";
				}
			}
		});
		xhr.open("GET", url);
		xhr.send();
	}
})();