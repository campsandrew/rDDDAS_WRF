const config = {
	controller: {
		host: "localhost",
		port: 3000,
		nodes: [
			"192.168.56.102",
			"192.168.56.103"
		],
		watch_path: "/Users/AndrewCamps/Desktop/DATA",
		interval: 10800
	},
	wrf: {
		host: "localhost",
		port: 3000
	},
	hdfs: {
		host: "192.168.56.101",
		port: 8020
	}
}

module.exports = config;