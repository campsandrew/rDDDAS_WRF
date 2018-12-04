const config = {
	controller: {
		host: "localhost",
		port: 3000,
		nodes: [
			"192.168.56.102",
			"192.168.56.103"
		],
		watch_path: "/home/hduser/DATA"
	},
	wrf: {
		host: "localhost",
		port: 3000
	},
	hdfs: {
		host: "localhost",
		port: 50070
	}
}

module.exports = config;