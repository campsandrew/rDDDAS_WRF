(function(){
	"use strict";
	
	window.addEventListener("load", function() {
		statusRequest();

	});
	
	function statusRequest() {
		var xhr = new XMLHttpRequest();
		var wps = document.getElementById("wps");
		var wrf = document.getElementById("wrf");
		let url = "http://192.168.56.101:3000/status";
		
		wps.innerHTML = "<ul>";
		wrf.innerHTML = "<ul>";
		
		// Send ajax for node status
		xhr.addEventListener("load", function() {
			var res = JSON.parse(xhr.response);
			
			if(res.success) {
				for(var host of res.stats.wps) {
					//document.getElementById("wps_" + host).innerHTML = host + ": " + "Online";
				}
				
				for(var host of res.stats.wrf) {
					//document.getElementById("wrf_" + host).innerHTML = host + ": " + "Online";
				}
			}
		});
		xhr.open("GET", url);
		xhr.send();
		
		wps.innerHTML += "</ul>";
		wrf.innerHTML += "</ul>";
	}
})();