const config = {
	controller: {
		host: "192.168.56.101",
		port: 3000,
		status_path: "./nodes.stats",
		data_watch_path: "/home/hduser/DATA",
		geog_watch_path: "/home/hduser/WPS_GEOG",
		interval: 10800
	},
	wrf: {
		port: 3000,
		nodes: [
			"192.168.56.102",
			"192.168.56.103"
		],
		wrf_dir: "/home/andrewcamps/Build_WRF/WRFV3",
		gfs_dir: "/home/andrewcamps/Build_WRF/DATA",
		wrf_run_dir: "/home/andrewcamps/Build_WRF/WRFV3/run"
	},
	wps: {
		port: 3001,
		nodes: [
			"192.168.56.102",
			"192.168.56.103"
		],
		wps_dir: "/home/andrewcamps/Build_WRF/WPS",
		geog_dir: "/home/andrewcamps/Build_WRF/WPS_GEOG",
		gfs_dir: "/home/andrewcamps/Build_WRF/DATA",
		geogrid_log: "log.geogrid",
		metgrid_log: "log.metgrid",
		ungrib_log: "log.ungrib"
	},
	hdfs: {
		host: "192.168.56.101",
		port: 8020,
		gfs_dir: "/wrf/DATA",
		geog_dir: "/wrf/WPS_GEOG",
		met_em_dir: "/wrf/MET_EM",
		geo_em_dir: "/wrf/GEO_EM",
		log_dir: "/wrf/LOGS",
		config_dir: "/wrf/CONFIGS"
	}
}

module.exports = config;
