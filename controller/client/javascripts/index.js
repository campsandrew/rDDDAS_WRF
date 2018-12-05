(function(){
	"use strict";
	
	window.addEventListener("load", function() {
		statusRequest();

	});
	
	function statusRequest() {
		var xhr = new XMLHttpRequest();
		//let url = "http://192.168.56.101:3000/status";
		let url = "http://localhost:3000/status";
		
		// Send ajax for node status
		xhr.addEventListener("load", function() {
			var res = JSON.parse(xhr.response);
			var nodes = document.getElementById("nodes");

			if(res.success) {
				var types = [];
				
				for(var host in res.stats) {
					for(var type in res.stats[host]) {
						if(types.indexOf(type) < 0) {
							types.push(type);
							nodes.innerHTML += "<div id=" 
															+ type
															+ "><h2>"
															+ type.toUpperCase()
															+  " Nodes</h2><ul id=" 
															+ type + "_ul"
															+ "></ul></div>";
						}
						
						var list = document.getElementById(type + "_ul");
						var ready = res.stats[host][type].ready ? "Ready" : "Busy";
						
						list.innerHTML += "<li>" 
													 + host + " : " 
													 + res.stats[host][type].status 
													 + " : " + ready
													 + "</li>";
					}
				}
			}
		});
		xhr.open("GET", url);
		xhr.send();
	}
})();