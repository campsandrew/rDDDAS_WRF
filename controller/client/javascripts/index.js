(function(){
	"use strict";
	
	window.addEventListener("load", function() {
		var xhr = new XMLHttpRequest();
		
		xhr.addEventListener("load", function() {
			var data = JSON.parse(xhr.response);
			
			statusRequest(data);
		});
		xhr.open("GET", "http://192.168.56.101:3000/nodes");
		xhr.send();
	});
	
	function statusRequest(data) {
		var wps = document.getElementById("wps");
		var wrf = document.getElementById("wrf");
		
		wps.innerHTML = "<ul>";
		wrf.innerHTML = "<ul>";
		
		data.wps.forEach(function(host) {
			let xhr = new XMLHttpRequest();
			let url = "http://192.168.56.101:3000/heartbeat/?node=wps&host=" + host;
			
			wps.innerHTML += "<li id=wps_" + host + ">" + host + ": " + "Offline</li>";
			xhr.addEventListener("load", function() {
				var res = JSON.parse(xhr.response);
				
				if(res.success) {
					document.getElementById("wps_" + host).innerHTML = host + ": " + "Online";
				}
			});
			xhr.open("GET", url);
			xhr.send();
		});
		
		data.wrf.forEach(function(host) {
			let xhr = new XMLHttpRequest();
			let url = "http://192.168.56.101:3000/heartbeat/?node=wrf&host=" + host;
			
			wrf.innerHTML += "<li id=wrf_" + host + ">" + host + ": " + "Offline</li>";
			xhr.addEventListener("load", function() {
				var res = JSON.parse(xhr.response);
				
				if(res.success) {
					document.getElementById("wrf_" + host).innerHTML = host + ": " + "Online";
				}
			});
			xhr.open("GET", url);
			xhr.send();
		});
		
		wps.innerHTML += "</ul>";
		wrf.innerHTML += "</ul>";
	}
})();