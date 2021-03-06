/* Dashboard controller */
'use strict';
angular.module('analyzeCluster.ctrl', ['easypiechart', "ui.grid", 'ui.grid.resizeColumns', 'ui.bootstrap', 'countUpModule'])
	.controller('AnalyzeCluster', ['$scope', '$http', '$timeout', '$interval', '$compile', 'uiGridConstants', 'ClusterResultFactory', 'profilerGraph', 'common', 'ClusterResultFactoryNew', 'getIsMaprDistributionFactory', '$location', '$anchorScroll',
		function($scope, $http, $timeout, $interval, $compile, uiGridConstants, ClusterResultFactory, profilerGraph, common, ClusterResultFactoryNew, getIsMaprDistributionFactory, $location,$anchorScroll) {

			$scope.acTab                             = false;
			$scope.alertCounter                      = 0;
			$scope.alertsUpdateInterval              = 20;
			$scope.allAlerts                         = [];
			$scope.allCategories                     = {};
			$scope.allNodes                          = [];
			$scope.callBackEventForCategorySelection = { onItemSelect: onItemSelect };
			$scope.capacityUtilizationDetails        = {};
			$scope.chartData                         = {};
			$scope.clusterName                       = null;
			$scope.clusterwideMajorCounters          = {};
			/** Variable used for fetching Capacity Utilization latest jobs */
		     $scope.cpLastCheckpoint                  = 0;

		    /** Variables used for fetching Capacity Utilization Old jobs */
		    $scope.cpStartTime                       = 0;
		    $scope.cpEndTime                         = 0;
			$scope.cpDisplayLoadMoreOption           = true;
			$scope.dataCenterCounters                = {"good" : 0, "average" : 0, "bad" : 0, "unavailable" : 0};
			$scope.dataLoadCounter                   = {"good" : 0, "warn" : 0, "bad" : 0, "unavailable" : 0};
			$scope.dataLoadDetails;
			$scope.dataLoadDetailView                = false;
			$scope.dfsRemaining                      = { 'value': 0, 'unit': 'GB' };
			$scope.dfsUsed                           = { 'value': 0, 'unit': 'GB' };
			$scope.effCapacityUtilizationDetails     = [];
			$scope.filteredCategories                = {};
			$scope.getNodeSpecificValue              = {};
			$scope.getValue                          = {};
			$scope.hdfsEmpty                         = false;
			$scope.hmss                              = {};  // hadoop metrics and system stats
			$scope.hruaList                          = [];
			$scope.hruaMap                           = {};
			$scope.hruaSearch                        = "";
			$scope.instantAlertMessage               = "";
			$scope.instaneousQueues                  = {};
			$scope.isCapacityUtilizationOldJobsPending = false;
			$scope.isDrf;
			$scope.isFairScheduler;
			$scope.isMapr;
			$scope.oneAtATime = true;
			$scope.isShowBell                        = true;
			$scope.IsVisible                         = false;
			$scope.lraList                           = [];
			$scope.lraSearch                         = "";
			$scope.maprCldbMetrics                   = {};
			$scope.mquDataTemp                       = {};
			$scope.mquFilterQuery                    = "";
			$scope.mquSettingsLabel                  = 'Last 24 Hours';
			$scope.oldMetricsPersistedStats          = {};
			$scope.queueUtilizationSummary           = { data : undefined, redraw : undefined, hasError : false, loader: true};
			$scope.readWriteNodeServiceData          = {};
			$scope.readWriteServiceData              = {};
			$scope.requestDataForDC                  = {};
			$scope.runningJobsTitle                  = "";
			$scope.scrollBarView                     = false;
			$scope.selectedArrList                   = [];
			$scope.selectedCategory                  = [];
			$scope.selectedCategoryForSingleNode     = {};
			$scope.selectedNodes                     = [];
			$scope.selectedNodesForIndividualTabs    = {};
			$scope.showOnlyRunMessage = true;
			$scope.showNoDataAvailable = false;
			$scope.showHRUSearch = false;
			$scope.showLRASearch = false;
			//$scope.tabs = [{ "title": "All Nodes", "content": "All Nodes", "template": "app/analyzeCluster/result/clusterwide.html", "active": true }];
			$scope.tabs                              = [];
			$scope.thresholdMinutes                  = 30;
			$scope.thresholdMinutesCopied            = 30;
			$scope.localDataID = "tempJum123";

			/* Counters */
			$scope.rackNodeWrapperdataLocalJob;
			$scope.rackNodeWrapperrackLocalJob;
			$scope.rackNodeWrapperotherLocalJob;
			$scope.launchableContainersCounter;
			$scope.runningContainersCounter;

			$scope.nameNodeHeapUsage;
			$scope.nameNodeRpcActivityNumOpenConnections;
			$scope.resourceManagerHeapUsageCounter;

			// Mapr cldb counter
			$scope.clusterDiskSpaceAvailableGBCounter = { 'value': 0, 'unit': 'GB' };
			$scope.clusterDiskSpaceUsedGBCounter = { 'value': 0, 'unit': 'GB' };
			$scope.containersWithoutAtleaseOneReplicaCounter;
			$scope.noOfContainersCounter;
			$scope.noOfStoragePoolsOfflineCounter;
			$scope.noOfStoragesPoolsInClusterCounter;
			$scope.noOfVolumesCounter;

			$scope.resourceManagerRpcCounter;
			$scope.resourceManagerHeapUsageCounter2;
			/* Counters */

			/* Loaders */
			$scope.capacityLoadLoader    = true;
			$scope.dataCenterLoader      = true;
			$scope.dataLoadLoader        = true;
			$scope.liveContainersLoader  = true;
			$scope.queueDataLoader       = true;
			$scope.showHruaLoader        = true;
			$scope.showLraLoader         = true;
			$scope.majorCountersLoader   = true;
			$scope.maprCldbMetricsLoader = true;
			$scope.mquLoader             = true;
			$scope.queueUserLoader       = true;
			/* Loaders */

			/* Error message flags*/
			$scope.dataLoadDistributionErrorMessage            = false;
			$scope.dataCenterErrorMessage                      = false;
			$scope.rackAwareStatsErrorMessage                  = false;
			$scope.instantaneousQueueErrorMessage              = false;
			$scope.capacityUtilizationErrorMessage             = false;
			$scope.highResourceErrorMessage                    = false;
			$scope.longDurationErrorMessage                    = false;
			$scope.meteredQueueUsageErrorMessage               = false;
			$scope.liveContainerStatsErrorMessage              = false;
			$scope.metadataInformationErrorMessage             = false;

			$scope.isClusterSectionEnabled;
			$scope.isHdfsSectionEnabled;
			$scope.isUserMeteringSectionEnabled;
			$scope.isYarnContainersSectionEnabled;
			$scope.isYarnQueuesSectionEnabled;

			$scope.isChartsEnabled;
			$scope.isCopyHistoryFileEnabled;
			$scope.isDataCenterEnabled;
			$scope.isDataLoadEnabled;
			$scope.isEffCapUtilizationEnabled;
			$scope.isHeapUsageEnabled;
			$scope.isHruaEnabled;
			$scope.isLiveContainerEnabled;
			$scope.isLraEnabled;
			$scope.isMaprCldbMetricsEnabled;
			$scope.isMaprResourceManagerEnabled;
			$scope.isMeteredQueueEnabled;
			$scope.isQueueDataEnabled;
			$scope.isQuSummaryEnabled; // qu = queue utilization
			$scope.isRackAwareEnabled;
			$scope.isRPCOpenConnectionEnabled;
			$scope.isRunningAppsEnabled;
			$scope.isUpdateAlertsEnabled;

			var clusterwideisMajorCountersPending = false;
			var isCopyHistoryFilePending          = false;
			var isDataCenterPending               = false;
			var isDataLoadDetailsPending          = false;
			var isDataLoadPending                 = false;
			var isCapacityUtilizationLatestJobsPending = false;
			var ishmssStatsUpdatePending          = false; // hadoop metrics and system stats - > stats (ie. opened tabs and graphs)
			var ishmssStatsDataUpdatePending      = false; // hadoop metrics and system stats - > stats data (data to display graph)
			var isHruaPending                     = false;
			var isLiveContainerPending            = false;
			var isLraPending                      = false;
			var isSlaPending                      = false;
			var isMajorCountersPending            = false;
			var isMaprCldbMetricsPending          = false;
			var isMeteredQueueDataPending         = false;
			var isQueueDataPending                = false;
			var isQuSummaryPending                = false;
			var isRackAwarePending                = false;
			var isUpdateAlertsPending             = false;
			var isWriteClusterChartDataPending    = false;
			var isUserQueueUtilizationPending     = false;

			$scope.openPopup    = false;
			$scope.openPopup1   = false;
			$scope.openPopup2   = false;
			$scope.openPopup3   = false;
			$scope.openPopup4   = false;
			$scope.openPopup5   = false;
			$scope.openPopup6   = false;
			$scope.openPopup7   = false;
			$scope.openPopup8   = false;
			$scope.openPopup9   = false;
			$scope.openPopupDC  = false; // Data Center
			$scope.openPopupMQU = false; // metered queue usage
			$scope.openPopupJH  = false; // job history
			$scope.openPopupQU  = false; // Relative Queue Utilization by Users
			$scope.openPopupQUS = false; // Queue Utilization Summary
			$scope.openPopupRI  = false; // Refresh Intervals

			/* High Resource Usage Applications Options */
			$scope.hruaOptions = {
				memorythresholdMB : 2000,
				vcoresThreshold   : 4
			};

			/* Metered Queue Usage Options */
			$scope.mquOptions = {
				duration          : '1d',
				rangeFrom         : '',
				rangeTo           : ''
			};
			$scope.mquOptionsValueLabel = {
				usedResourcesMemoryPercent : '(%) Used Memory of Steady Fair Share',
				usedResourcesMemoryPercentC : '(%) Used Memory of Defined Queue Capacity',
				usedResourcesMemory         : 'Used Memory',
				usedResourcesVCoresPercent  : '(%) Used Vcores of Steady Fair Share',
				usedResourcesVCores         : 'Used Vcores'
			};
			/* Queue Utilization Summary */
			$scope.qusOptions = {
				graphType : 'Relative'
			};
			/* Job History Options */
			$scope.jhOptions = {
				intervalMode      : 'Duration',
				durationTextValue : '24',
				durationUnit      : 'd',
				rangeFrom         : '',
				rangeTo           : ''
			};
			/* Relative Queue Utilization by Users Options */
			$scope.quOptions = {
				intervalMode      : 'Duration',
				durationTextValue : '30',
				durationUnit      : 'd',
				rangeFrom         : '',
				stat              : 'usedMemory',
				rangeTo           : ''
			};

			/* Countup.js is used to animate the numbers when changed */
			$scope.countupOptions = {
				useEasing  : true,
				useGrouping: true,
				separator  : ',',
				decimal    : '.',
				prefix     : '',
				suffix     : '%'
			};

			var backgroundProcesses = {
				'SYSTEM_METRICS'        : false,
				'QUEUE_UTILIZATION'     : false
			};

			/* cluster wide major counters (Metadata Information) error first time */
			var cwmcErrorFirstTime = false;

			var alertsLastCheckpoint = 0;

			/* hadoop system metrices background process first time */
			var hsmbpFirstTime = false;

			var tooltip = d3.select("#tooltip");

			$scope.colorCodeClasses = ["firoziText", "lightBlueText", "orangeText", "darkBlueText", "lightGreenText", "darkGreenText", "maroonText"]

			/*  Data center options variables */
			$scope.dc = {};
			$scope.dc.cpuOperatorBad = "GREATER_THAN_OP";
			$scope.dc.cpuValueBad = 75;
			$scope.dc.cpuOperatorGood = "LESS_THAN_OP";
			$scope.dc.cpuValueGood = 25;
			$scope.dc.memOperatorBad = "GREATER_THAN_OP";
			$scope.dc.memValueBad = 80;
			$scope.dc.memOperatorGood = "LESS_THAN_OP";
			$scope.dc.memValueGood = 50;

			$scope.requestDataForDC = { "color": [{ "bad": { "operator": $scope.dc.cpuOperatorBad, "val": $scope.dc.cpuValueBad }, "good": { "operator": $scope.dc.cpuOperatorGood, "val": $scope.dc.cpuValueGood }, "category": "systemStats.cpu", "stat": "CpuUsage" }, { "bad": { "operator": $scope.dc.memOperatorBad, "val": $scope.dc.memValueBad }, "good": { "operator": $scope.dc.memOperatorGood, "val": $scope.dc.memValueGood }, "category": "systemStats.memory", "stat": "UsedMemory" }] };

			//  live containers = running apps
			// metadataInformation = Heap usage = namenoderpc
			// maprcldb = resource manager

			// in seconds

			var defaultRefreshIntervals = {
				'alerts'                       :   30000,
				'capacityUtilization'          :   60000,
				'cldbFsCounters'               :   60000,  // isMapr
				'containers'                   :   15000,
				'dataCenter'                   :   60000,
				'dataLoadDistribution'         : 1800000,
				'hadoopDaemonsAndSystemMetrics':   60000,
				'hrua'                         :   30000,
				'instantaneousQueueUtilization':   15000,
				'lra'                          :   60000,
				'metadataInformation'          :   60000,  // !isMapr
				'meteredQueueUsage'            :  300000,
				'queueUtilizationSummary'      : 1800000,
				'rackLocalJobs'                :  300000
			};

			$scope.refreshIntervals = angular.copy(defaultRefreshIntervals);

			var intervals = {};

			function clearIntervals() {
				for (var key in $scope.refreshIntervals) {
					if (intervals[key]) {
						$interval.cancel(intervals[key]);
					}
				}
			}
			var interval1,interval2,intervalUpdateQueue,intervalLicnese,intervalGetAvgWaitingTimeData;
			function setIntervals() {

				intervals['alerts'] = $interval(function() {
					updateAlerts();
				}, $scope.refreshIntervals['alerts'], false);

				intervals['metadataInformation'] = $interval(function() {
					updateClusterwideMajorCounters();
				}, $scope.refreshIntervals['metadataInformation'], false);

				intervals['dataLoadDistribution'] = $interval(function() {
					getDataLoadData();
					getDataLoadDataDetails();
				}, $scope.refreshIntervals['dataLoadDistribution'], false);

				intervals['dataCenter'] = $interval(function() {
					getDataCentersData();
				}, $scope.refreshIntervals['dataCenter'], false);

				intervals['rackLocalJobs'] = $interval(function() {
					getRackAwareData();
				}, $scope.refreshIntervals['rackLocalJobs'], false);

				intervals['cldbFsCounters'] = $interval(function() {
					updateMaprCldbMetrics();
				}, $scope.refreshIntervals['cldbFsCounters'], false);

				intervals['instantaneousQueueUtilization'] = $interval(function() {
					getQueueData();
				}, $scope.refreshIntervals['instantaneousQueueUtilization'], false);

				intervals['meteredQueueUsage'] = $interval(function() {
					getMeteredQueueData();
				}, $scope.refreshIntervals['meteredQueueUsage'], false);

				intervals['queueUtilizationSummary'] = $interval(function() {
					updateQueueUtilizationSummaryData();
				}, $scope.refreshIntervals['queueUtilizationSummary'], false);

				intervals['containers'] = $interval(function() {
					getLiveContainerData();
				}, $scope.refreshIntervals['containers'], false);

				intervals['capacityUtilization'] = $interval(function() {
					getEffCapUtilizationData();
				}, $scope.refreshIntervals['capacityUtilization'], false);

				intervals['hrua'] = $interval(function() {
					updateHighResourceUsageApps();
				}, $scope.refreshIntervals['hrua'], false);

				intervals['lra'] = $interval(function() {
					updateLongRunningApps();
				}, $scope.refreshIntervals['lra'], false);

				intervals['hadoopDaemonsAndSystemMetrics'] = $interval(function() {
					// fetch data for both background or non background process
				//	updateHadoopMetricsSystemStatsGraphData();
				}, $scope.refreshIntervals['hadoopDaemonsAndSystemMetrics'], false);
			}

			function setOtherIntervals() {
					interval1 = $interval(function() {
				// In case background process
				//	getHadoopMetricsOpenedStatNamesFromServer();
					// In case not a background process
				//	sendHadoopMetricesOpenedStatsNamesToServer();

					writeQueueUserDataIntoDataBase();
				}, 15000, false);

				interval2 = $interval(function() {
					//copyHistoryFile();
				}, 60000, false);

				intervalGetAvgWaitingTimeData = $interval(function () {
					getAvgWaitingTimeData();
				}, 300000, false);
			}



			$scope.$on('$destroy', function() {
				$interval.cancel(interval1);
				$interval.cancel(interval2);
				$interval.cancel(intervalLicnese);
				$interval.cancel(intervalGetAvgWaitingTimeData);
				clearIntervals();
			});

			$scope.refreshIntervalOptions = [
				{
					'text' : '15 seconds',
					'value' : 15000
				},
				{
					'text' : '20 seconds',
					'value' : 20000
				},
				{
					'text' : '30 seconds',
					'value' : 30000
				},
				{
					'text' : '1 minute',
					'value' : 60000
				},
				{
					'text' : '5 minutes',
					'value' : 300000
				},
				{
					'text' : '15 minutes',
					'value' : 900000
				},
				{
					'text' : '30 minutes',
					'value' : 1800000
				},
				{
					'text' : '1 hour',
					'value' : 3600000
				}
			];

			/**
			 * Data center settings option methods
			 *
			 */
			$scope.closeDropdown = function() {
				$scope.openPopupDC = false;
			}

			$scope.setValue = function() {
				$scope.requestDataForDC = { "color": [{ "bad": { "operator": $scope.dc.cpuOperatorBad, "val": $scope.dc.cpuValueBad }, "good": { "operator": $scope.dc.cpuOperatorGood, "val": $scope.dc.cpuValueGood }, "category": "systemStats.cpu", "stat": "CpuUsage" }, { "bad": { "operator": $scope.dc.memOperatorBad, "val": $scope.dc.memValueBad }, "good": { "operator": $scope.dc.memOperatorGood, "val": $scope.dc.memValueGood }, "category": "systemStats.memory", "stat": "UsedMemory" }] }
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["dataCenterOptions"] = $scope.requestDataForDC;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				$scope.closeDropdown();
			}

			$scope.openRIOptions = function() {
				$scope.isRIResetButtonDisabled = false;
				$scope.refreshIntervalsTemp = angular.copy($scope.refreshIntervals);
				$scope.openPopupRI = !$scope.openPopupRI;
				$scope.openPopup = false;
			}
			$scope.openSections = function() {
				$scope.openPopup = !$scope.openPopup;
				$scope.openPopupRI = false;
			}

			$scope.saveRIOptions = function() {
				$scope.openPopupRI = false;
				$scope.refreshIntervals = angular.copy($scope.refreshIntervalsTemp);
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["refreshIntervalsTemp"] = $scope.refreshIntervals;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				clearIntervals();
				setIntervals();

				updateAlerts();
				updateClusterwideMajorCounters();
				getDataLoadData();
				getDataLoadDataDetails();
				getDataCentersData();
				getRackAwareData();
				updateMaprCldbMetrics();
				getQueueData();
				getMeteredQueueData();
				updateQueueUtilizationSummaryData();
				getLiveContainerData();
				getEffCapUtilizationData();
				updateHighResourceUsageApps();
				updateLongRunningApps();
			}

			$scope.resetRIOptions = function() {
				$scope.refreshIntervalsTemp = angular.copy(defaultRefreshIntervals);
				$scope.isRIResetButtonDisabled = true;
			}

			/** Redirect to home page */
			$scope.clickedHomeIcon = function() {
				$location.path("/");
			}
			/**  */
			$scope.createAlertGrid = function(data) {}



			/** init function */
			$scope.init = function() {
				$("h2.my-tool-tip").tooltip();
				$("span.tool-tip").tooltip();
				$('#draggablePanelList').sortable({});
				var userWidth = $("#userNameId").width();
				$('#userNameIdTD').width(userWidth);
				$scope.bothWidth = (userWidth + 140);
				$('#instantAlertMessage').css({ 'max-width': '100%'});
				$('#instantAlertMessageTD').css({ 'max-width': 'calc(100% - ' + $scope.bothWidth + 'px)' });
				if (common.getIsMapr() != null) {
					$scope.isMapr = common.getIsMapr();
				} else {
					getIsMaprDistributionFactory.isMaprDistribution({},
						function(data) {
							var isMapr = data.isMapr;
							common.setIsMapr(isMapr);
							$scope.isMapr = isMapr;
						},
						function(e) {
							console.log("Error while checking if mapr distribution or not", e);
						});
				}
				var clusterName = common.getSelectedClusterNameForRun();
				if (clusterName == null) {
					clusterName = localStorage.getItem('clusterName');
				} else {
					 localStorage.setItem('clusterName', clusterName);
				}

				$scope.clusterName = clusterName;
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				var isClusterSettingsExists = true;
				if ( browserConf == null || browserConf == undefined ) {
					browserConf = {};
					browserConf[$scope.clusterName] = getDefaultLocalStorageJson();
					localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
					isClusterSettingsExists = false;
				} else if ( browserConf!= null && (browserConf[$scope.clusterName] == null)) {
					browserConf[$scope.clusterName] = getDefaultLocalStorageJson();
					localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
					isClusterSettingsExists = false;
				}

				extractWidgetSettingsFromLocalhost();

				ClusterResultFactoryNew
					.initClusterFac
					.post({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(result) {
						setTimeout(function() {
						updateAlerts();
						setTimeout(function() {
						setTimeout(function() {
						updateClusterwideMajorCounters();
						updateMaprCldbMetrics();
						setTimeout(function() {
						getDataLoadData();
						getDataLoadDataDetails();
						setTimeout(function() {
						getDataCentersDataPreview();
						setTimeout(function() {
						getQueueData();
						setTimeout(function(){
						detectSchedulerType(isClusterSettingsExists);
						setTimeout(function() {
						getAvgWaitingTimeData();
						setTimeout(function() {
						getLiveContainerData();
						setTimeout(function() {
						getEffCapUtilizationData();
						$scope.loadMoreJobsCapacityUtilization();
						setTimeout(function() {
						updateLongRunningApps();
						setTimeout(function() {
						updateHighResourceUsageApps();
						setTimeout(function() {
						setTimeout(function() {
						getCategoryData();
						setTimeout(function() {
						setIntervals();
						setOtherIntervals();
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);
						}, 2000);

					//	copyHistoryFile();

					});
			//	$scope.addTab('All Nodes');

				ClusterResultFactoryNew
					.backgroundProcesses
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(data) {
						backgroundProcesses.SYSTEM_METRICS         = data.SYSTEM_METRICS;
						backgroundProcesses.QUEUE_UTILIZATION = data.QUEUE_UTILIZATION;
					}, function(error) {
						console.log('Unable to get background processes details of cluster', error);
					}).finally(function() {

					});
			};

			function detectSchedulerType(isClusterSettingsExists) {
				/* For Metered Queue Usage */
				var isClusterSettingsExists = isClusterSettingsExists;
				ClusterResultFactoryNew
					.schedulerType
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(response) {

						$scope.isFairScheduler = response.isFairScheduler;
						$scope.isDrf = response.isDrf;
						var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
						var clusterSettings = browserConf[$scope.clusterName];

						if (!isClusterSettingsExists) {
							if ($scope.isFairScheduler) {
								$scope.mquOptions.stat = "usedResourcesMemoryPercent";
							} else {
								$scope.mquOptions.stat = "usedResourcesMemoryPercentC";
							}
							clusterSettings['mquOptions']['stat'] = $scope.mquOptions.stat;
							localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
						} else {
							$scope.mquOptions.stat = clusterSettings['mquOptions']['stat'];
						}


					}, function(error) {
						console.log("Error while getting scheduler type, assuming capacity scheduler");
						$scope.isFairScheduler = false;
						$scope.isDrf = false;
						$scope.mquOptions.stat = "usedResourcesMemory";
					}).finally(function() {
						getMeteredQueueData();
						updateQueueUtilizationSummaryData();
					});
			}

			function getDefaultLocalStorageJson () {
				var clusterSettings = {};
				clusterSettings["sections"] = {
					"isClusterSectionEnabled":true,
					"isHdfsSectionEnabled":true,
					"isUserMeteringSectionEnabled":true,
					"isYarnContainersSectionEnabled":true,
					"isYarnQueuesSectionEnabled" :true,

					"isChartsEnabled":false,
					"isCopyHistoryFileEnabled":true,
					"isDataCenterEnabled":true,
					"isDataLoadEnabled":true,
					"isEffCapUtilizationEnabled":true,

					"isHruaEnabled":true,
					"isLiveContainerEnabled":true,
					"isLraEnabled" :true,

					"isMeteredQueueEnabled" :true,
					"isQueueDataEnabled" :true,
					"isQuSummaryEnabled" :true,
					"isRackAwareEnabled":false,
					"isRunningAppsEnabled":true,
					"isUpdateAlertsEnabled" :true,

					"isHeapUsageEnabled" :true,
					"isRPCOpenConnectionEnabled":true,
					"isMajorCountersEnabled":true,
					"isMaprCldbMetricsEnabled":true,
					"isMaprResourceManagerEnabled":true
				};
				clusterSettings["hrua"] = {
					"memorythresholdMB" : 2000,
					"vcoresThreshold"   : 4
				};
				clusterSettings["utilizationMetering"] = {
					"month"     		  : 'current',
					"rangeFrom"         : '',
					"rangeTo"           : ''
				};
				clusterSettings["mquOptions"] = {
					"duration"          : '1d',
					"rangeFrom"         : '',
					"rangeTo"           : ''
				};
				clusterSettings["qusOptions"] = {
					graphType : 'Relative'
				};
				/* Job History Options */
				clusterSettings["jhOptions"] = {
					"intervalMode"      : 'Duration',
					"durationTextValue" : '24',
					"durationUnit"      : 'd',
					"rangeFrom"         : '',
					"rangeTo"           : ''
				};
				/* Relative Queue Utilization by Users Options */
				clusterSettings["quOptions"] = {
					"intervalMode"      : 'Duration',
					"durationTextValue" : '30',
					"durationUnit"      : 'd',
					"rangeFrom"         : '',
					"stat"              : 'usedMemory',
					"rangeTo"           : ''
				};
				clusterSettings["thresholdMinutes"] = 30;
				clusterSettings["refreshIntervalsTemp"] = defaultRefreshIntervals;

				$scope.dc = {};
				$scope.dc.cpuOperatorBad = "GREATER_THAN_OP";
				$scope.dc.cpuValueBad = 75;
				$scope.dc.cpuOperatorGood = "LESS_THAN_OP";
				$scope.dc.cpuValueGood = 25;
				$scope.dc.memOperatorBad = "GREATER_THAN_OP";
				$scope.dc.memValueBad = 80;
				$scope.dc.memOperatorGood = "LESS_THAN_OP";
				$scope.dc.memValueGood = 50;

				$scope.requestDataForDC = { "color": [{ "bad": { "operator": $scope.dc.cpuOperatorBad, "val": $scope.dc.cpuValueBad }, "good": { "operator": $scope.dc.cpuOperatorGood, "val": $scope.dc.cpuValueGood }, "category": "systemStats.cpu", "stat": "CpuUsage" }, { "bad": { "operator": $scope.dc.memOperatorBad, "val": $scope.dc.memValueBad }, "good": { "operator": $scope.dc.memOperatorGood, "val": $scope.dc.memValueGood }, "category": "systemStats.memory", "stat": "UsedMemory" }] };
				clusterSettings["dataCenterOptions"] = $scope.requestDataForDC;

					return clusterSettings;
			}

			function extractWidgetSettingsFromLocalhost () {
				var clusterSettings = JSON.parse(localStorage.getItem($scope.localDataID))[$scope.clusterName];
				$scope.hruaOptions = clusterSettings['hrua'];
				$scope.thresholdMinutesCopied = clusterSettings["thresholdMinutes"];
				var sections = clusterSettings['sections'];
				$scope.isClusterSectionEnabled        = sections['isClusterSectionEnabled'];
				$scope.isHdfsSectionEnabled           = sections['isHdfsSectionEnabled'];
				$scope.isUserMeteringSectionEnabled   = sections['isUserMeteringSectionEnabled'];
				$scope.isYarnContainersSectionEnabled = sections['isYarnContainersSectionEnabled'];
				$scope.isYarnQueuesSectionEnabled     = sections['isYarnQueuesSectionEnabled'];

				$scope.isChartsEnabled                = sections['isChartsEnabled'];
				$scope.isCopyHistoryFileEnabled       = sections['isCopyHistoryFileEnabled'];
				$scope.isDataCenterEnabled            = sections['isDataCenterEnabled'];
				$scope.isDataLoadEnabled              = sections['isDataLoadEnabled'];
				$scope.isEffCapUtilizationEnabled     = sections['isEffCapUtilizationEnabled'];

				$scope.isHruaEnabled                  = sections['isHruaEnabled'];
				$scope.isLiveContainerEnabled         = sections['isLiveContainerEnabled'];
				$scope.isLraEnabled                   = sections['isLraEnabled'];

				$scope.isMeteredQueueEnabled          = sections['isMeteredQueueEnabled'];
				$scope.isQueueDataEnabled             = sections['isQueueDataEnabled'];
				$scope.isQuSummaryEnabled             = sections['isQuSummaryEnabled'];
				$scope.isRackAwareEnabled             = sections['isRackAwareEnabled'];
				$scope.isRunningAppsEnabled           = sections['isRunningAppsEnabled'];
				$scope.isUpdateAlertsEnabled          = sections['isUpdateAlertsEnabled'];

				$scope.isHeapUsageEnabled             = sections['isHeapUsageEnabled'];
				$scope.isRPCOpenConnectionEnabled     = sections['isRPCOpenConnectionEnabled'];
				$scope.isMajorCountersEnabled         = sections['isMajorCountersEnabled'];
				$scope.isMaprCldbMetricsEnabled       = sections['isMaprCldbMetricsEnabled'];
				$scope.isMaprResourceManagerEnabled   = sections['isMaprResourceManagerEnabled'];
				$scope.mquOptions = clusterSettings['mquOptions'];
				$scope.jhOptions = clusterSettings['jhOptions'];
				$scope.quOptions = clusterSettings['quOptions'];
				$scope.qusOptions = clusterSettings['qusOptions'];
				$scope.refreshIntervalsTemp = clusterSettings['refreshIntervalsTemp'];
				$scope.refreshIntervals = angular.copy($scope.refreshIntervalsTemp);

				$scope.dc.cpuOperatorBad = clusterSettings['dataCenterOptions'].color[0]['bad']['operator'];
				$scope.dc.cpuValueBad = clusterSettings['dataCenterOptions'].color[0]['bad']['val'];
				$scope.dc.cpuOperatorGood = clusterSettings['dataCenterOptions'].color[0]['good']['operator'];
				$scope.dc.cpuValueGood = clusterSettings['dataCenterOptions'].color[0]['good']['val'];
				$scope.dc.memOperatorBad = clusterSettings['dataCenterOptions'].color[1]['bad']['operator'];
				$scope.dc.memValueBad =clusterSettings['dataCenterOptions'].color[1]['bad']['val'];
				$scope.dc.memOperatorGood = clusterSettings['dataCenterOptions'].color[1]['good']['operator'];
				$scope.dc.memValueGood = clusterSettings['dataCenterOptions'].color[1]['good']['val'];

				$scope.requestDataForDC = { "color": [{ "bad": { "operator": $scope.dc.cpuOperatorBad, "val": $scope.dc.cpuValueBad }, "good": { "operator": $scope.dc.cpuOperatorGood, "val": $scope.dc.cpuValueGood }, "category": "systemStats.cpu", "stat": "CpuUsage" }, { "bad": { "operator": $scope.dc.memOperatorBad, "val": $scope.dc.memValueBad }, "good": { "operator": $scope.dc.memOperatorGood, "val": $scope.dc.memValueGood }, "category": "systemStats.memory", "stat": "UsedMemory" }] };
				updateMquSettingsLabel();
				updateJobHistorySettingsLabel();
				updateRelativeQueueSettingsLabel();
				$scope.thresholdMinutes = $scope.thresholdMinutesCopied;
			}
			$scope.showHRUSearchBox = function () {
				$scope.showHRUSearch = true;
			}
			$scope.showLRASearchBox = function () {
				$scope.showLRASearch = true;
			}
			$scope.resetWidgetSettings = function () {
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName] = getDefaultLocalStorageJson();
				if ($scope.isFairScheduler) {
					browserConf[$scope.clusterName]['mquOptions']['stat'] = "usedResourcesMemoryPercent";
				} else {
					browserConf[$scope.clusterName]['mquOptions']['stat'] = "usedResourcesMemoryPercentC";
				}
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				extractWidgetSettingsFromLocalhost();
			}
			$scope.DurationUnit = {"6h":"6 Hours", "1d":"24 Hours","7d":"7 Days","30d":"30 Days"};

			$scope.formatDate = function (date) {
				var d = new Date(date),
					month = d.getMonth(),
					day = '' + d.getDate(),
					year = d.getFullYear();
					var monthNames = [
						"Jan", "Feb", "Mar",
						"Apr", "May", "Jun", "Jul",
						"Aug", "Sep", "Oct",
						"Nov", "Dec"
					];
				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;
				return day + ' ' + monthNames[month] + ' ' + year;
			}

			function getCurrentDateInCalenderFormat() {
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!

				var yyyy = today.getFullYear();
				if(dd<10){
					dd='0'+dd;
				}
				if(mm<10){
					mm='0'+mm;
				}
				var today = yyyy+'/'+mm+'/'+dd + ' ' + today.getHours() + ':' + today.getMinutes();
				return today;
			}

			function updateMquSettingsLabel() {
				if ($scope.mquOptions.duration != 'custom') {
					$scope.mquSettingsLabel = 'Last ' + $scope.DurationUnit[$scope.mquOptions.duration];
				} else {
					var temp;
					if (!$scope.mquOptions.rangeTo) {
						$scope.mquOptions.rangeTo = getCurrentDateInCalenderFormat();
					}
					temp = $scope.formatDate($scope.mquOptions.rangeTo);
					$scope.mquSettingsLabel = $scope.formatDate($scope.mquOptions.rangeFrom) + ' - ' + temp;
				}
			}
			$scope.scrollTo = function(id) {
				$location.hash(id);
				$anchorScroll();
			}
			$scope.getCurrentMonth = function (date) {
				var monthNames = ['January', 'February', 'March',
               'April', 'May', 'June', 'July',
               'August', 'September', 'October', 'November', 'December'];
					var d = new Date(),year = d.getFullYear();
					if ( date == 'current') {
						var month = d.getMonth();
					} else if ( date == 'previous') {
						var month = d.getMonth() - 1;
					}
				return monthNames[month] + ' ' + year;
			}
			$scope.durationUnit = {"d":"Days","m":"Minutes","h":"Hours"};
			$scope.relativeQueueSettingsLabel = 'Last ' + $scope.quOptions.durationTextValue + ' ' + $scope.durationUnit[$scope.quOptions.durationUnit];
			function updateRelativeQueueSettingsLabel() {
				if ($scope.quOptions.intervalMode == 'Duration') {
					$scope.relativeQueueSettingsLabel = 'Last ' + $scope.quOptions.durationTextValue + ' ' + $scope.durationUnit[$scope.quOptions.durationUnit];
				} else {
					if (!$scope.quOptions.rangeTo) {
						$scope.quOptions.rangeTo = getCurrentDateInCalenderFormat();
					}
					$scope.relativeQueueSettingsLabel = $scope.formatDate($scope.quOptions.rangeFrom) + ' - ' + $scope.formatDate($scope.quOptions.rangeTo);
				}
			}

			$scope.getSchedulerType = function() {
				return $scope.isFairScheduler ? 'Fair Scheduler' : 'Capacity Scheduler';
			}

			$scope.JobHistorySettingsLabel = 'Last ' + $scope.jhOptions.durationTextValue + ' ' + $scope.durationUnit[$scope.jhOptions.durationUnit];
			function updateJobHistorySettingsLabel() {
				if ($scope.jhOptions.intervalMode == 'Duration') {
					$scope.JobHistorySettingsLabel = 'Last ' + $scope.jhOptions.durationTextValue + ' ' + $scope.durationUnit[$scope.jhOptions.durationUnit];
				} else {
					if (!$scope.jhOptions.rangeTo) {
						$scope.jhOptions.rangeTo = getCurrentDateInCalenderFormat();
					}
					$scope.JobHistorySettingsLabel = $scope.formatDate($scope.jhOptions.rangeFrom) + ' - ' + $scope.formatDate($scope.jhOptions.rangeTo);
				}
			}
			function removeLocalStorageVariables() {
				localStorage.removeItem('isClusterSectionEnabled');
				localStorage.removeItem('isHdfsSectionEnabled');
				localStorage.removeItem('isUserMeteringSectionEnabled');
				localStorage.removeItem('isYarnContainersSectionEnabled');
				localStorage.removeItem('isYarnQueuesSectionEnabled');

				localStorage.removeItem('isChartsEnabled');
				localStorage.removeItem('isCopyHistoryFileEnabled');
				localStorage.removeItem('isDataCenterEnabled');
				localStorage.removeItem('isDataLoadEnabled');
				localStorage.removeItem('isEffCapUtilizationEnabled');

				localStorage.removeItem('isHruaEnabled');
				localStorage.removeItem('isLiveContainerEnabled');
				localStorage.removeItem('isLraEnabled');

				localStorage.removeItem('isMeteredQueueEnabled');
				localStorage.removeItem('isQueueDataEnabled');
				localStorage.removeItem('isQuSummaryEnabled');
				localStorage.removeItem('isRackAwareEnabled');
				localStorage.removeItem('isRunningAppsEnabled');
				localStorage.removeItem('isUpdateAlertsEnabled');

				localStorage.removeItem('isHeapUsageEnabled');
				localStorage.removeItem('isRPCOpenConnectionEnabled');
				localStorage.removeItem('isMajorCountersEnabled');
				localStorage.removeItem('isMaprCldbMetricsEnabled');
				localStorage.removeItem('isMaprResourceManagerEnabled');
			}

			function updateSectionsAndWidgetsValues() {
				$scope.isClusterSectionEnabled        = getWidgetValue('isClusterSectionEnabled');
				$scope.isHdfsSectionEnabled           = getWidgetValue('isHdfsSectionEnabled');
				$scope.isUserMeteringSectionEnabled   = getWidgetValue('isUserMeteringSectionEnabled');
				$scope.isYarnContainersSectionEnabled = getWidgetValue('isYarnContainersSectionEnabled');
				$scope.isYarnQueuesSectionEnabled     = getWidgetValue('isYarnQueuesSectionEnabled');

				$scope.isChartsEnabled                = getWidgetValue('isChartsEnabled');
				$scope.isCopyHistoryFileEnabled       = getWidgetValue('isCopyHistoryFileEnabled');
				$scope.isDataCenterEnabled            = getWidgetValue('isDataCenterEnabled');
				$scope.isDataLoadEnabled              = getWidgetValue('isDataLoadEnabled');
				$scope.isEffCapUtilizationEnabled     = getWidgetValue('isEffCapUtilizationEnabled');

				$scope.isHruaEnabled                  = getWidgetValue('isHruaEnabled');
				$scope.isLiveContainerEnabled         = getWidgetValue('isLiveContainerEnabled');
				$scope.isLraEnabled                   = getWidgetValue('isLraEnabled');

				$scope.isMeteredQueueEnabled          = getWidgetValue('isMeteredQueueEnabled');
				$scope.isQueueDataEnabled             = getWidgetValue('isQueueDataEnabled');
				$scope.isQuSummaryEnabled             = getWidgetValue('isQuSummaryEnabled');
				$scope.isRackAwareEnabled             = getWidgetValue1('isRackAwareEnabled');
				$scope.isRunningAppsEnabled           = getWidgetValue('isRunningAppsEnabled');
				$scope.isUpdateAlertsEnabled          = getWidgetValue('isUpdateAlertsEnabled');

				$scope.isHeapUsageEnabled             = getWidgetValue('isHeapUsageEnabled');
				$scope.isRPCOpenConnectionEnabled     = getWidgetValue('isRPCOpenConnectionEnabled');
				$scope.isMajorCountersEnabled         = getWidgetValue('isMajorCountersEnabled');
				$scope.isMaprCldbMetricsEnabled       = getWidgetValue('isMaprCldbMetricsEnabled');
				$scope.isMaprResourceManagerEnabled   = getWidgetValue('isMaprResourceManagerEnabled');
			}

			function getWidgetValue(variableName) {
				var flag = localStorage.getItem(variableName);
				if (flag == null) {
					return true;
				}
				if (typeof flag == 'boolean') {
					return flag;
				}
				if ( flag == 'true') {
					return true;
				} else {
					return false;
				}
			}

			function getWidgetValue1(variableName) {
				var flag = localStorage.getItem(variableName);
				if (flag == null) {
					return false;
				}
				if (typeof flag == 'boolean') {
					return flag;
				}
				if ( flag == 'true') {
					return true;
				} else {
					return false;
				}
			}

			$scope.saveToLocalStorage = function(variableName) {
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				var sections = browserConf[$scope.clusterName]['sections'];
			//	localStorage.setItem(variableName, $scope[variableName]);
				sections[variableName] = $scope[variableName];
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
			}

			/**  */
			function updateAlerts() {

				if (isUpdateAlertsPending || !$scope.isUpdateAlertsEnabled) {
					return;
				}
				isUpdateAlertsPending = true;
				ClusterResultFactoryNew.getAlerts.get({
					clusterName: $scope.clusterName,
					lastCheckpoint: alertsLastCheckpoint
				}).$promise.then(function (response) {
					var newAlerts = response.alerts;
					alertsLastCheckpoint = response.lastCheckpoint;
					/* Parsing incoming json and setting isNew key to true */
					for (var i = 0; i < newAlerts.length; i++) {
						newAlerts[i]['isNew'] = true;
					}

					/* Algorithm to not repeat alerts again and again :
					 * Step 1 : Remove objects from existingAlerts that are not in newAlerts
					 * Step 2 : Remove objects from newAlerts that are in existingAlerts
					 * Step 3 : Append newAlerts to existingAlerts
					 * Print existingAlerts
					 */
					var existingAlerts = angular.copy($scope.allAlerts);

					var i, j, existingLevel, nodeIP, existingMessage, rowFound;

					/*
					 * Step 1 & Step 2 Combined
					 */
					for (i = existingAlerts.length - 1; i >= 0; i--) {

						if (existingAlerts[i].skipOccuringSince) {
							continue;
						}

						existingLevel = existingAlerts[i].level;
						nodeIP = existingAlerts[i].nodeIP;
						existingMessage = existingAlerts[i].message;

						rowFound = false;

						for (j = 0; j < newAlerts.length; j++) {

							if (newAlerts[j].level == existingLevel && newAlerts[j].nodeIP == nodeIP && newAlerts[j].message == existingMessage) {

								if (!existingAlerts[i].skipOccuringSince) {
									existingAlerts[i].lastOccured = newAlerts[j].date;
									existingAlerts[i].occuringSince = getDateInStringFormat(existingAlerts[i].date, existingAlerts[i].lastOccured);
								}

								newAlerts.splice(j, 1);
								rowFound = true;
								break;
							}

						}
						if (!rowFound) {
							existingAlerts.splice(i, 1);
						}
					}

					for (j = 0; j < newAlerts.length; j++) {
						if (!newAlerts[j].skipOccuringSince) {
							newAlerts[j].lastOccured = newAlerts[j].date;
							newAlerts[j].occuringSince = "Just Now";
						}
					}

					/*
					 * Step 3
					 */
					$scope.allAlerts = existingAlerts.concat(newAlerts);

					if (newAlerts.length > 0) {
						showInstantAlertMessage(newAlerts[0].message);
					}
					for (i = 0; i < $scope.allAlerts.length; i++) {
						if ($scope.allAlerts[i].jobId != null) {
							addErrorInEffCapacityUtilizationDetail($scope.allAlerts[i].jobId, $scope.allAlerts[i].message);
						}
					}

					/*
					 * To show the counter
					 */
					var alertCounterTemp = 0;
					for (i = 0; i < $scope.allAlerts.length; i++) {
						if ($scope.allAlerts[i]['isNew'] == true) {
							alertCounterTemp = alertCounterTemp + 1;
						}
					}

					$scope.alertCounter = alertCounterTemp;

				}).finally(function() {
					isUpdateAlertsPending = false;

				});

			}

			function showInstantAlertMessage(message) {
				$scope.instantAlertMessage = message;
				$scope.IsVisible = true;
				$timeout(function() {
					$scope.IsVisible = false;
				}, 10000);
			}

			$scope.showAlertData = function() {
				$("#profileGraph").modal('show');
				$scope.alertCounter = 0;
				for (var i = 0; i < $scope.allAlerts.length; i++) {
					$scope.allAlerts[i].isNew = false;
				}
				//$scope.showAlertTable = true;
			};

			function writeQueueUserDataIntoDataBase() {
				if (backgroundProcesses.QUEUE_UTILIZATION) {
					return;
				}
				ClusterResultFactoryNew
					.queueUserGraph
					.post({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(response) {
					}).finally(function() {
					});
			}

			$scope.persistHruaOptionsIntoTemp = function() {
				$scope.hruaOptionsTemp = angular.copy($scope.hruaOptions);
			}
			$scope.saveHruaOptions = function() {
				$scope.showHruaLoader = true;
				if ($scope.hruaOptionsTemp.memorythresholdMB == undefined
					|| $scope.hruaOptionsTemp.memorythresholdMB == '') {
					$scope.hruaOptionsTemp.memorythresholdMB = 2000;
				}
				if ($scope.hruaOptionsTemp.vcoresThreshold == undefined
					|| $scope.hruaOptionsTemp.vcoresThreshold == '') {
					$scope.hruaOptionsTemp.vcoresThreshold = 4;
				}

				$scope.hruaOptions = angular.copy($scope.hruaOptionsTemp);

				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["hrua"] = $scope.hruaOptions;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));

				updateHighResourceUsageApps();
			}
			$scope.persistMquDataIntoTemp = function() {
				$scope.mquOptionsTemp = angular.copy($scope.mquOptions);
			}
			$scope.saveMquOptions = function() {
				$scope.mquLoader = true;
				$scope.mquOptions = angular.copy($scope.mquOptionsTemp);
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["mquOptions"] = $scope.mquOptions;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				updateMquSettingsLabel();
				getMeteredQueueData();
			}
			$scope.persistQusDataIntoTemp = function() {
				$scope.qusOptionsTemp = angular.copy($scope.qusOptions);
			}
			$scope.saveQusOptions = function() {
				$scope.queueUtilizationSummary.loader = true;
				$scope.qusOptions = angular.copy($scope.qusOptionsTemp);
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["qusOptions"] = $scope.qusOptions;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				updateQueueUtilizationSummaryData();
			}

			$scope.persistJHDataIntoTemp = function() {
				$scope.jhOptionsTemp = $scope.jhOptions;
			}
			$scope.saveJHOptions = function() {
				$scope.jhOptions = $scope.jhOptionsTemp;
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["jhOptions"] = $scope.jhOptions;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				$scope.updateJobhistoryGraph();
				updateJobHistorySettingsLabel();
			}
			$scope.persistQUDataIntoTemp = function() {
				$scope.quOptionsTemp = $scope.quOptions;
			}
			$scope.saveQUOptions = function() {
				$scope.quOptions = $scope.quOptionsTemp;
				var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
				browserConf[$scope.clusterName]["quOptions"] = $scope.quOptions;
				localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
				$scope.updateQUGraph();
				updateRelativeQueueSettingsLabel();
			}

			$scope.hruaFilter = function(appDetail) {
				if (appDetail.usedVcores > $scope.hruaOptions.vcoresThreshold
					|| appDetail.usedMemory > $scope.hruaOptions.memorythresholdMB) {
						if ( appDetail.applicationID.includes($scope.hruaSearch) ) {
							return true;
						}
				}
				return false;
			}

			$scope.lraFilter = function(appDetail) {
				if ( appDetail.applicationID.includes($scope.lraSearch) ) {
					return true;
				}
				return false;
			}

			function getNodeSpecificJson() {
				var singleNodeJsonData = [];
				var tabsNode = [];
				var tabsNode1 = [];

				var settingsData = [];
				angular.forEach($scope.readWriteNodeServiceData, function(row, index) {
					settingsData = [];
					var nodeCategoryJson = JSON.stringify({ "trends": row });

					angular.forEach($scope.getNodeSpecificValue, function(row2, index2) {

						if (row.nodeKey != 'All Nodes') {
							var nodeRowValue = {};

							nodeRowValue = {
								"nodeKey"          : row2.nodeKey,
								"category"         : index2,
								"duration"         : row2.duration,
								"rangeFrom"        : row2.rangeFrom,
								"rangeTo"          : row2.rangeTo,
								"aggregateFunction": row2.aggregateFunction
							};

							if (index == nodeRowValue.nodeKey) {
								var cat = index2;
								nodeRowValue.category = cat.split(index)[0];
								delete nodeRowValue.nodeKey;

								for (var key in row) {
									if (row.hasOwnProperty(key)) {
										for (var subkey in row[key]) { 
											for (var key3 in row[key][subkey]) {  
												var ar = (key + "." + subkey + "." + row[key][subkey][key3]); 
												if (ar == nodeRowValue.category) {
													settingsData.push(nodeRowValue)
												}  
											}
										}

									}
								}

							}

						}
					});
					var object = {
						"nodeIP"        : index,
						"categoriesJson": nodeCategoryJson,
						"settings"      : settingsData
					};
					singleNodeJsonData.push(object);
				});
				return singleNodeJsonData;
			}

			$scope.textForFilterButton      = { buttonDefaultText: 'Filter Stats' };
			$scope.textForFilterNodesButton = { buttonDefaultText: 'Filter Nodes' };
			$scope.dropdownExtraSettings    = { dynamicTitle: false }

			/** After receiving the response [ for major counters]
			 * from server it updates the variables related to major counters */
			function updateCWMC(majorCounters) {
				if ($scope.isHdfsSectionEnabled && $scope.isMajorCountersEnabled) {
							$scope.dfsRemaining          = getParsedMajorCounterUnit(majorCounters.dfsRemaining);
							$scope.dfsUsed               = getParsedMajorCounterUnit(majorCounters.dfsUsed);
							$scope.underReplicatedBlocks = majorCounters.underReplicatedBlocks;
							$scope.lastCheckpointTime    = majorCounters.lastCheckpointTime;
							$scope.corruptedBlocks       = majorCounters.corruptedBlocks;
							$scope.missingBlocks         = majorCounters.missingBlocks;
						}
						if ($scope.isClusterSectionEnabled) {
							if ($scope.isHeapUsageEnabled) {
								if (majorCounters.nameNodeHeapUsage) {
									$scope.nameNodeHeapUsage = majorCounters.nameNodeHeapUsage;
								}
								if (majorCounters.resourceManagerHeapUsage) {
									$scope.resourceManagerHeapUsageCounter = majorCounters.resourceManagerHeapUsage;
								}
							}

							if ($scope.isRPCOpenConnectionEnabled && majorCounters.nameNodeRpcActivityNumOpenConnections) {
								$scope.nameNodeRpcActivityNumOpenConnections = majorCounters.nameNodeRpcActivityNumOpenConnections;
							}
						}
			}

			function getParsedMajorCounterUnit(sValueInGB) {
				if (!sValueInGB) {
					return { 'value': 0, 'unit': 'GB' };
				}
				if (sValueInGB.indexOf('.') == -1) {
					sValueInGB = sValueInGB + '.0';
				}

				var totalGB = parseFloat(sValueInGB);

				var output = '';
				var unit;

				if (totalGB > 1048576) {
					output = (totalGB / 1048576).toFixed(2);
					unit = 'PB';
				} else if (totalGB > 1024) {
					output = (totalGB / 1024).toFixed(2);
					unit = 'TB';
				} else {
					output = totalGB.toFixed(2);
					unit = 'GB';
				}

				var beforeDot = parseInt(output.substring(0, output.length - 3));
				var afterDot = parseInt(output.substring(output.length - 2));

				if (beforeDot >= 100) {
					if (afterDot > 70) {
						beforeDot++;
					}
					return { 'value': beforeDot, 'unit': unit };
				} else if (beforeDot >= 10) {
					if (afterDot % 10 > 7) {
						afterDot += 10;
					}
					afterDot = afterDot / 10;

					if (afterDot > 0) {
						return { 'value': beforeDot + '.' + afterDot, 'unit': unit };
					} else {
						return { 'value': beforeDot, 'unit': unit };
					}
				} else {
					if (afterDot == 0) {
						output = output.substring(0, output.length - 3);
					} else if (afterDot % 10 == 0) {
						output = output.substring(0, output.length - 1);
					}
					return { 'value': output, 'unit': unit };
				}
			}

			/** Function updates major counters of cluster */
			function updateClusterwideMajorCounters() {

				if ($scope.isMapr) {
					return;
				}
				if (!$scope.isHdfsSectionEnabled && !$scope.isClusterSectionEnabled ) {
					return;
				}
				if ((!$scope.isHdfsSectionEnabled || !$scope.isMajorCountersEnabled)
					&& ( !$scope.isClusterSectionEnabled || (!$scope.isHeapUsageEnabled
								&& !$scope.isRPCOpenConnectionEnabled))) {
						return;
					}

				isMajorCountersPending = true;

				// First attempt
				ClusterResultFactoryNew
					.clusterwideMajorCounters
					.get({ "clusterName": $scope.clusterName })
					.$promise.then(function(majorCounters) {
						$scope.metadataInformationErrorMessage = false;
						updateCWMC(majorCounters);
					}, function (error) {

						setTimeout(function () {
							// Second Attempt
							ClusterResultFactoryNew
								.clusterwideMajorCounters
								.get({ "clusterName": $scope.clusterName })
								.$promise.then(function(majorCounters) {
									$scope.metadataInformationErrorMessage = false;
									updateCWMC(majorCounters);
								}, function (error) {
									setTimeout(function () {
									// Third Attempt
										ClusterResultFactoryNew
											.clusterwideMajorCounters
											.get({ "clusterName": $scope.clusterName })
											.$promise.then(function(majorCounters) {
												$scope.metadataInformationErrorMessage = false;
												updateCWMC(majorCounters);
											}, function(error) {
												$scope.metadataInformationErrorMessage = true;
											});
									}, 7000);
								});

						}, 7000);
					}).finally(function() {
						isMajorCountersPending = false;
						$scope.majorCountersLoader = false;
					});
			}

			function updateMaprCldbMetrics() {
				if ( !$scope.isMapr || isMaprCldbMetricsPending ||
					(!$scope.isMaprCldbMetricsEnabled && !$scope.isMaprResourceManagerEnabled)) {
					return;
				}
				isMaprCldbMetricsPending = true;
				ClusterResultFactoryNew
					.maprCldbMetrics
					.get({ "clusterName": $scope.clusterName })
					.$promise.then(function(counters) {
						if ($scope.isMaprCldbMetricsEnabled && counters.cldbMetricsEnabled == "true") {
							$scope.clusterDiskSpaceAvailableGBCounter        = getParsedMajorCounterUnit(counters.clusterDiskSpaceAvailableGB);
							$scope.clusterDiskSpaceUsedGBCounter             = getParsedMajorCounterUnit(counters.clusterDiskSpaceUsedGB);
							$scope.noOfContainersCounter                     = counters.noOfContainers;
							$scope.containersWithoutAtleaseOneReplicaCounter = counters.containersWithoutAtleaseOneReplica;
							$scope.noOfVolumesCounter                        = counters.noOfVolumes;
							$scope.noOfStoragesPoolsInClusterCounter         = counters.noOfStoragesPoolsInCluster;
							$scope.noOfStoragePoolsOfflineCounter            = counters.noOfStoragePoolsOffline;
						}
						if ($scope.isMaprResourceManagerEnabled) {
							$scope.resourceManagerHeapUsageCounter2          = counters.resourceManagerHeapUsage;
							$scope.resourceManagerRpcCounter                 = counters.resourceManagerRpcActivityNumOpenConnections;
						}

						$scope.maprCldbMetricsLoader = false;
					}).finally(function() {
						$scope.maprCldbMetricsLoader = false;
						isMaprCldbMetricsPending = false;
					});
			}

			/** Function copy history file */
			function copyHistoryFile() {

				if (backgroundProcesses.QUEUE_UTILIZATION) {
					return;
				}

				if ( !$scope.isYarnContainersSectionEnabled
					&& (!$scope.isQueueDataEnabled || !$scope.isYarnQueuesSectionEnabled)
					&& (!$scope.isRackAwareEnabled || !$scope.isClusterSectionEnabled)
					&& !$scope.isUpdateAlertsEnabled) {
					$scope.isCopyHistoryFileEnabled = false;
				} else {
					$scope.isCopyHistoryFileEnabled = true;
				}

				if (isCopyHistoryFilePending || !$scope.isCopyHistoryFileEnabled) {
					return;
				}


				isCopyHistoryFilePending = true;

				ClusterResultFactoryNew
					.copyHistoryFile
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(copyResponse) {

					}).finally(function() {
						isCopyHistoryFilePending = false;
					});
			}

			/** Function to get queue data */
			function getQueueData() {
				if (isQueueDataPending || !$scope.isQueueDataEnabled
					|| !($scope.isYarnQueuesSectionEnabled && $scope.isMeteredQueueEnabled)) {
					return;
				}

				isQueueDataPending = true;

				ClusterResultFactoryNew
					.queueStats
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(queueData) {
						$scope.instantaneousQueueErrorMessage = false;

						for (var i = 0; i < queueData.length; i++) {
							var queue = queueData[i];
							if ($scope.isFairScheduler != true) {
								queue['percentage'] = Number(queue.usedCapacity);
							} else {
								queue['percentage'] = Number(queue.percentUsedMemory);
							}
							$scope.instaneousQueues[queue.queueName] = queue;
						}
					}, function(error) {
						 $scope.instantaneousQueueErrorMessage = true;
					}).finally(function() {
						isQueueDataPending = false;
						$scope.queueDataLoader = false;
					});
			}

			function getAvgWaitingTimeData () {
				ClusterResultFactoryNew
					.averageWaitingTime
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(avgWaitingTimeData) {
					$scope.queueWaitingTimeData = avgWaitingTimeData;
					}, function(error) {
					}).finally(function() {
					});
			}
			$scope.getAverageWaitingTime = function (queueName) {
				for(var queue in $scope.queueWaitingTimeData) {
					if ( queueName == queue) {
						return $scope.queueWaitingTimeData[queue];
					} else {
					}

				}
			}

			/** Function to get metered queue data */
			function getMeteredQueueData() {
				if (isMeteredQueueDataPending || !$scope.isMeteredQueueEnabled || !$scope.isYarnQueuesSectionEnabled) {
					return;
				}

				isMeteredQueueDataPending = true;

				if ($scope.mquOptions.stat == undefined) {
					isMeteredQueueDataPending = false;
					return;
				}

				var meteredQueueParams = 'clusterName=' + $scope.clusterName + '&stat=' + $scope.mquOptions.stat;

				if ($scope.mquOptions.duration == 'custom') {
					meteredQueueParams = meteredQueueParams + "&rangeFrom=" + $scope.mquOptions.rangeFrom + "&rangeTo=" + $scope.mquOptions.rangeTo;
				} else {
					meteredQueueParams = meteredQueueParams + "&duration=" + $scope.mquOptions.duration;
				}

				var req = {
					method : 'POST',
					url    : '/apis/clusteranalysis/clusterprofiling/metered-queue-usage',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					data   : meteredQueueParams,
					timeout: 210000
				};

				$http(req).then(function(data) {
					$scope.mquLoader = false;
					$scope.meteredQueueUsageErrorMessage = false;
					if (data.data) {
						$scope.chartQueueData = changeJson(data.data);
						$scope.queueNames = [];
						for (var statName in $scope.chartQueueData) {
							for (var key in $scope.chartQueueData[statName]) {
								if (key != 'unit' && key != 'time') {
									$scope.queueNames.push(key);
								}
							}
						}
						$scope.sortedQueueNames = $scope.queueNames;
						$scope.sortedQueueNames.sort(function (a, b) {
							return a.toLowerCase().localeCompare(b.toLowerCase());
						});
					}
					isMeteredQueueDataPending = false;
					$scope.changeMquData();
				}, function(error) {
					console.log("Error while receiving metered queue usage data from influxdb", error);
					$scope.meteredQueueUsageErrorMessage = true;
					isMeteredQueueDataPending = false;
				}).finally(function() {
					$scope.mquLoader = false;
					isMeteredQueueDataPending = false;
				});

			}

			/* Function to update queue utilization summary */
			function updateQueueUtilizationSummaryData() {
				if (isQuSummaryPending || !$scope.isQuSummaryEnabled || !$scope.isYarnQueuesSectionEnabled) {
					return;
				}

				isQuSummaryPending = true;

				ClusterResultFactoryNew
					.queueUtilizationSummary
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(data) {
						$scope.queueUtilizationSummary.redraw(data);
						$scope.queueUtilizationSummary.loader = false;
						$scope.queueUtilizationSummary.hasError = false;
					}, function(error) {
						$scope.queueUtilizationSummary.hasError = true;
					}).finally(function() {
						$scope.queueUtilizationSummary.loader = false;
						isQuSummaryPending = false;
					});

			}
			$scope.isQUGroupByDisabled = function() {
				if ($scope.quOptionsTemp == null) {
					return true;
				}
				/*if ($scope.quOptionsTemp.stat == '') {
					return true;
				}*/
				if ($scope.quOptionsTemp.intervalMode == 'Duration' &&  $scope.quOptionsTemp.durationTextValue =='') {
					return true;
				}
				if ($scope.quOptionsTemp.intervalMode == 'Range' &&  $scope.quOptionsTemp.rangeFrom =='') {
					return true;
				}
				return false;
			}

			/** Function for create queue graph */
			function createQueueGraphSimple(graphData) {

				var HEIGHT = 209 - 10;
				var WIDTH = document.getElementById("queueTimeLineDiv").offsetWidth - 10;
				if (WIDTH < 0) {
					return;
				}
				var svg = document.getElementById('queueTimeLine');
				svg.innerHTML = "";
				svg.setAttribute('height', HEIGHT + 'px');
				svg.setAttribute('width', WIDTH + 'px');
				var MARGINS = {
					top   : 0,
					right : 20,
					bottom: 20,
					left  : 50
				};

				var vis = d3.select("#queueTimeLine");
				var xlabels = [];
				var xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, 24]);
				var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom + 30]).domain([0, 100]);

				var xAxis = d3.svg.axis().scale(xScale);
				var yAxis = d3.svg.axis().scale(yScale).orient("left");
				xAxis.ticks(24);
				yAxis.ticks(6);

				vis.append("svg:g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom - 20) + ")")
					.call(xAxis);

				vis.append("svg:g")
					.attr("class", "axis")
					.attr("transform", "translate(" + (MARGINS.left) + ", -" + 40 + ")")
					.call(yAxis);

				var lineGen = d3.svg.line()
					.x(function(d) {
						return xScale(d.hour);
					})
					.y(function(d) {
						return yScale(d.percent);
					});
				vis.append("text")
					.attr("text-anchor", "middle")
					.attr("transform", "translate(" + MARGINS.right + "," + (HEIGHT / 2) + ")rotate(-90)")
					.text("Percent");
				vis.append("text")
					.attr("text-anchor", "middle")
					.attr("transform", "translate(" + (WIDTH / 2) + "," + HEIGHT + ")")
					.text("Hours");

				var color = ['#2196F3', '#4CAF50', '#FF5722', '#0D47A1', '#2E7D32', '#F44336', '#03A9F4', '#8BC34A', '#5E35B1','#00BCD4','#5D4037', '#C0CA33', '#E91E63', '#009688', '#546E7A'];

				var queueToolTip = d3.select("#queueToolTip");

				for (var i = 0; i < graphData.length; i++) {
					//	var queueName = graphData[i].queueName;
					var ddArray = graphData[i].queueData;
					vis.append('svg:path')
						.attr('d', lineGen(ddArray))
						.attr("transform", "translate(0,-" + 40 + ")")
						.attr('stroke', function() {
							return color[i % color.length];
						})
						.attr('stroke-width', 3)
						.data(ddArray)
						.on("mousemove", function(d) {
							this.setAttribute('stroke-width', 6);
							queueToolTip.transition()
								.duration(200)
								.style("opacity", 1);
							var left = queueToolTip.style('width'); // output is 121.12px or something like that
							left = left.substring(0, left.length - 3); // removing 'px'
							left = d3.event.clientX - Number(left) - 10;
							//queueToolTip.html('Queue : ' + d.queueName)
							queueToolTip.html(d.queueName)
								.style('top', (d3.event.clientY - 30) + 'px')
								.style('left', left + 'px');
						})
						.on("mouseout", function() {
							this.setAttribute('stroke-width', 3);
							queueToolTip.transition()
								.duration(500)
								.style("opacity", 0);
						})
						.attr('fill', 'none');
				}
			}

			/** Function to get rack aware data */
			function getRackAwareData() {

				if (isRackAwarePending || !$scope.isRackAwareEnabled || !$scope.isClusterSectionEnabled) {
					return;
				}

				isRackAwarePending = true;

				ClusterResultFactoryNew
					.rackAwareStats
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(rackAwareData) {
						$scope.rackAwareStatsErrorMessage = false;
						$scope.rackNodeWrapperrackLocalJob = rackAwareData.rackLocalJob;
						$scope.rackNodeWrapperdataLocalJob = rackAwareData.dataLocalJob;
						$scope.rackNodeWrapperotherLocalJob = rackAwareData.otherLocalJob;
					}, function(error) {
						 $scope.rackAwareStatsErrorMessage = true;
					}).finally(function() {
						isRackAwarePending = false;
					});
			}

			/** Function to get live container data */
			function getLiveContainerData() {

				if (isLiveContainerPending) {
					return;
				}
				var isLiveContainerWidgetActive = ($scope.isLiveContainerEnabled && $scope.isYarnContainersSectionEnabled);
				var isRunningAppsWidgetActive = ($scope.isRunningAppsEnabled && $scope.isClusterSectionEnabled );

				if (!isLiveContainerWidgetActive && !isRunningAppsWidgetActive) {
					return;
				}

				isLiveContainerPending = true;

				ClusterResultFactoryNew
					.liveContainerStats
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function (response) {
						$scope.liveContainersLoader = false;
						$scope.liveContainerStatsErrorMessage = false;
						$scope.totalRunningApplications = response.runningApps;

						$scope.launchableContainersMessage = response.launchableContainers.message;
						$scope.launchableContainersCounter = response.launchableContainers.capacity;
						$scope.runningContainersCounter = response.runningContainers;

						if (response.runningJobNameList.length != 0) {
							$scope.runningJobsTitle = response.runningJobNameList.join();
							if ($scope.runningJobsTitle.length > 100) {
								$scope.runningJobsTitle = $scope.runningJobsTitle.substring(0, 100);
								$scope.runningJobsTitle = $scope.runningJobsTitle + "..";
							}
						} else {
							$scope.runningJobsTitle = "No jobs running";
						}


					}, function (error) {
						$scope.liveContainersLoader = false;
						$scope.liveContainerStatsErrorMessage = true;
					}).finally(function () {
						$scope.liveContainersLoader = false;
						isLiveContainerPending = false;
					});
			}
			/** Load more capacity utilization job list */
		      $scope.loadMoreJobsCapacityUtilization = function () {
				if ($scope.isCapacityUtilizationOldJobsPending) {
					return;
				}
		        if ( $scope.cpStartTime != 0 && $scope.cpEndTime != 0 ) {
		          $scope.cpEndTime = $scope.cpStartTime;
		          $scope.cpStartTime = $scope.cpEndTime - 3600000;
		        }
		        fetchOldJobsCU(0, 0);
		        
		      }
			 /** function to fetch old jobs for capacity utilization */
		      function fetchOldJobsCU ( totalJobsFetched, iteration) {
				$scope.isCapacityUtilizationOldJobsPending = true;
		        ClusterResultFactoryNew
		          .capacityUtilizationOldJobs
		          .get({ "clusterName": $scope.clusterName , "startTime": $scope.cpStartTime , "endTime": $scope.cpEndTime })
		          .$promise
		          .then(function(response) {
		            addCapacityUtilizationOldJobs(response.jobsList);
					var length = response.jobsList.length;
		            $scope.cpStartTime = response.startTime;
		            $scope.cpEndTime = response.endTime;
					$scope.capacityLoadLoader = false;
		            if ( length == 0 ) {
		              $scope.cpDisplayLoadMoreOption = false;
		            } else if ( (length + totalJobsFetched) < 5 ) {
					  $scope.capacityLoadLoader = false;
		              var difference = $scope.cpEndTime - $scope.cpStartTime;
		              $scope.cpEndTime = $scope.cpStartTime;
		              $scope.cpStartTime = $scope.cpEndTime - difference;
		              fetchOldJobsCU(length + totalJobsFetched , iteration + 1);
		            }

					if (length == 0 || (length + totalJobsFetched) >= 5) {
						$scope.isCapacityUtilizationOldJobsPending = false;
					}
		          }, function(error) {
		             $scope.capacityUtilizationErrorMessage = true;
					 $scope.isCapacityUtilizationOldJobsPending = false;
		          }).finally(function() {
		            $scope.capacityLoadLoader = false;
		          });
		      }
			/** Function to add capacity utilization details */
		      function addCapacityUtilizationOldJobs(jobsList) {
		        for (var i = 0; i < jobsList.length; i++) {
		          var jobDetail = getEffCapacityDetail(jobsList[i].jobId);
		          if (jobDetail == null) {
		            $scope.effCapacityUtilizationDetails.unshift(createEffCapactiyUtilizationObject(jobsList[i]));
		          }
		        }
		      }

			/** Function to handle error in effective capacity utilization */
			function addErrorInEffCapacityUtilizationDetail(jobId, message) {
				if (jobId == null) {
					return;
				}
				var jobDetail = getEffCapacityDetail(jobId);
				if (jobDetail == null) {
					return;
				}
				jobDetail['hasError'] = true;
				jobDetail['errorMessage'] = message;
			}

			/** Function to get queue data */
			function getEffCapacityDetail(jobId) {
				for (var i = 0; i < $scope.effCapacityUtilizationDetails.length; i++) {
					if ($scope.effCapacityUtilizationDetails[i].jobId == jobId) {
						return $scope.effCapacityUtilizationDetails[i];
					}
				}
				return null;
			}
			/** Function to get effective capacity utilization data */
			function getEffCapUtilizationData() {

				if (isCapacityUtilizationLatestJobsPending || $scope.isCapacityUtilizationOldJobsPending || !$scope.isEffCapUtilizationEnabled || !$scope.isYarnContainersSectionEnabled) {
					return;
				}

				isCapacityUtilizationLatestJobsPending = true;

				ClusterResultFactoryNew
					.capacityUtilizationLatestJobs
					.get({ "clusterName": $scope.clusterName , "lastCheckpoint": $scope.cpLastCheckpoint })
					.$promise
					.then(function(response) {
						$scope.capacityUtilizationErrorMessage = false;
						$scope.cpLastCheckpoint = response.lastCheckpoint;
			            addCapacityUtilizationLatestJobs(response.jobsList);
					}, function(error) {
						 $scope.capacityUtilizationErrorMessage = true;
					}).finally(function() {
						isCapacityUtilizationLatestJobsPending = false;
						$scope.capacityLoadLoader = false;
					});
			}

			/** Function to updateeffective capacity utilization details */
			function addCapacityUtilizationLatestJobs(response) {

				for (var i = 0; i < response.length; i++) {
					var jobDetail = getEffCapacityDetail(response[i].jobId);
					if (jobDetail == null) {
						$scope.effCapacityUtilizationDetails.push(createEffCapactiyUtilizationObject(response[i]));
					}
				}
			}

			/** Function create effective capacity utilization object */
			function createEffCapactiyUtilizationObject(value) {
				var obj = {
					'jobId'              : value.jobId,
					'jobName'            : value.jobName,
					'usedContainers'     : value.usedContainers,
					'usedVCores'         : value.usedVCores,
					'jobFinishTime'      : value.jobFinishTime,
					'usedMaxMapMemory'   : value.usedMaxMapMemory + ' / ' + value.allocatedMapMemory,
					'usedMaxReduceMemory': value.usedMaxReduceMemory + ' / ' + value.allocatedReduceMemory
				};
				if (obj['usedMaxMapMemory'] == "0 / 0") {
					obj['usedMaxMapMemory'] = '-/-';
				}
				if (obj['usedMaxReduceMemory'] == "0 / 0") {
					obj['usedMaxReduceMemory'] = '-/-';
				}
				return obj;
			}

			/** Function updates high resource usage apps */
			function updateHighResourceUsageApps() {

				if (isHruaPending || !$scope.isHruaEnabled || !$scope.isUserMeteringSectionEnabled) {
					return;
				}

				isHruaPending = true;

				ClusterResultFactoryNew
					.resourceOverUsage
					.get({
						'clusterName'      : $scope.clusterName,
						'memoryThresholdMB': $scope.hruaOptions.memorythresholdMB,
						'vcoresThreshold'  : $scope.hruaOptions.vcoresThreshold
					})
					.$promise
					.then(function(response) {
						$scope.highResourceErrorMessage = false;
						response = response.resourceOverUsage;
						if ( angular.equals({}, response.resourceOverUsage) ) {
							$scope.showNoDataAvailable = true;
						} else {
							$scope.showNoDataAvailable = false;
						}
						for (var appID in response) {
							$scope.hruaMap[appID] = response[appID];
						}
						$scope.hruaList = [];
						for (var appID in $scope.hruaMap) {
							$scope.hruaList.push({
								'applicationID': appID,
								'usedMemory'   : $scope.hruaMap[appID].usedMemory,
								'usedVcores'   : $scope.hruaMap[appID].usedVcores,
								'user'         : $scope.hruaMap[appID].user,
								'appType': $scope.hruaMap[appID].appType,
								'queue' : $scope.hruaMap[appID].queue,
							});
						}
					}, function(error) {
						 $scope.highResourceErrorMessage = true;
						 $scope.showNoDataAvailable = false;
					}).finally(function() {
						isHruaPending = false;
						$scope.showHruaLoader = false;
					});
			}

			$scope.changeLraThresholdMinutes = function() {
				$scope.showLraLoader = true;
				if ($scope.openPopup8 == false) {
					$scope.thresholdMinutes = $scope.thresholdMinutesCopied;
					var browserConf = JSON.parse(localStorage.getItem($scope.localDataID));
					browserConf[$scope.clusterName]["thresholdMinutes"] = $scope.thresholdMinutesCopied;
					localStorage.setItem($scope.localDataID, JSON.stringify(browserConf));
					$scope.lraList = [];
					updateLongRunningApps();
				}
			}

			/** Function to update long running apps */
			function updateLongRunningApps() {

				if (isLraPending || !$scope.isLraEnabled || !$scope.isUserMeteringSectionEnabled) {
					return;
				}

				isLraPending = true;

				if ($scope.thresholdMinutes == undefined || $scope.thresholdMinutes == null) {
					$scope.thresholdMinutes = 30;
				}
				ClusterResultFactoryNew
					.longRunningApps
					.get({
						'clusterName'    : $scope.clusterName,
						'thresholdMillis': $scope.thresholdMinutes * 60 * 1000
					})
					.$promise
					.then(function(response) {
						if ( response.longRunningApps == [] || response.longRunningApps == null || response.longRunningApps == "") {
							$scope.lraList = [];
							$scope.showOnlyRunMessage = true;
						} else {
							$scope.showOnlyRunMessage = false;
						}
						updateLraAppsList(response.longRunningApps);
						isLraPending = false;
						updateSlaApps();

					}).finally(function() {
						$scope.showLraLoader = false;
					});
			}

			function updateAppObjectInLraList(appId, message) {
				var obj = getAppObjectInLraList(appId);
				if (obj != null) {
					obj['errorMessage'] = message;
				}
			}

			function getAppObjectInLraList(appId) {
				for (var i = 0; i < $scope.lraList.length; i++) {
					if (appId ==  $scope.lraList[i]['applicationID']) {
						return $scope.lraList[i];
					}
				}
				return null;
			}

			function updateLraAppsList(response) {
				for (var i = 0; i < response.length; i++) {
					var obj = getAppObjectInLraList(response[i]['applicationID']);
					if (obj == null) {
						$scope.lraList.push(response[i]);
					}
				}
			}

			function updateSlaApps() {
				if (isSlaPending || !$scope.isLraEnabled || !$scope.isYarnContainersSectionEnabled) {
					return;
				}
				isSlaPending = true;
				ClusterResultFactoryNew
					.slaApps
					.get({
						'clusterName': $scope.clusterName
					})
					.$promise
					.then(function(response) {
						$scope.longDurationErrorMessage = false;
						for (var i = 0; i < response.length; i++) {
							updateAppObjectInLraList(response[i], "The Application exceeded the threshold limit as defined in the SLA (cluster configurations)");
						}
					}, function(error) {
						 $scope.longDurationErrorMessage = true;
						 $scope.showOnlyRunMessage = false;
					}).finally(function() {
						isSlaPending = false;
					});
			}

			/** Function to get data center data */
			function getDataCentersData() {

				if (isDataCenterPending || !$scope.isDataCenterEnabled || !$scope.isClusterSectionEnabled) {
					return;
				}

				isDataCenterPending = true;

				var params = "colorConfigJSON=" + JSON.stringify($scope.requestDataForDC) + "&clusterName=" + $scope.clusterName;

				// First Attempt
				ClusterResultFactoryNew
					.dataCenter
					.post(params)
					.$promise
					.then(function(result) {
						$scope.dataCenterErrorMessage = false;
						$scope.dataCenters = result.dataCenters;
						getDataCenterCounts($scope.dataCenters);
					}, function(error) {
						//Second Attempt
						 ClusterResultFactoryNew
						.dataCenter
						.post(params)
						.$promise
						.then(function(result) {
							$scope.dataCenterErrorMessage = false;
							$scope.dataCenters = result.dataCenters;
							getDataCenterCounts($scope.dataCenters);
						}, function(error) {
							// Third Attempt
							ClusterResultFactoryNew
							.dataCenter
							.post(params)
							.$promise
							.then(function(result) {
								$scope.dataCenterErrorMessage = false;
								$scope.dataCenters = result.dataCenters;
								getDataCenterCounts($scope.dataCenters);
							}, function(error) {
								$scope.dataCenterErrorMessage = true;
							});
						});
					}).finally(function() {
						isDataCenterPending = false;
						$scope.dataCenterLoader = false;
					});
			}

			/** Function to get data centers data data preview */
			function getDataCentersDataPreview() {
				// First Attempt
				ClusterResultFactoryNew
					.dataCenterPreview
					.get({ "clusterName": $scope.clusterName })
					.$promise.then(function(result) {
						$scope.dataCenters = result.dataCenters;
						getDataCenterCounts($scope.dataCenters);
						getDataCentersData();
				}, function(error) {
					// Second Attempt
						ClusterResultFactoryNew
							.dataCenterPreview
							.get({ "clusterName": $scope.clusterName })
							.$promise.then(function(result) {
								$scope.dataCenters = result.dataCenters;
									getDataCenterCounts($scope.dataCenters);
									getDataCentersData();
								}, function(error) {
									// Third Attempt
									ClusterResultFactoryNew
									.dataCenterPreview
									.get({ "clusterName": $scope.clusterName })
									.$promise.then(function(result) {
									$scope.dataCenters = result.dataCenters;
										getDataCenterCounts($scope.dataCenters);
										getDataCentersData();
									}, function(error) {
											$scope.dataCenterErrorMessage = true;
									});
							});
				}).finally(function() {
					$scope.dataCenterLoader = false;
				});
			}

			$scope.updateDataload = function() {
				$scope.dataLoadLoader = true;
				getDataLoadData();
				getDataLoadDataDetails();
			}

			/** Function to get data load data */
			function getDataLoadData() {

				if (isDataLoadPending || !$scope.isDataLoadEnabled
					|| !$scope.isHdfsSectionEnabled || $scope.dataLoadDetailView) {
					return;
				}

				isDataLoadPending = true;
				// First Attempt
				ClusterResultFactoryNew
					.dataLoad
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(result) {
						$scope.dataLoadLoader = false;
						$scope.dataLoadDistributionErrorMessage = false;
						drawDataLoad(result);
						setDataLoadCounters(result);
					}, function (error) {

						//Second Attempt
						setTimeout(function () {
							ClusterResultFactoryNew
								.dataLoad
								.get({ "clusterName": $scope.clusterName })
								.$promise
								.then(function(result) {
									$scope.dataLoadLoader = false;
									$scope.dataLoadDistributionErrorMessage = false;
									drawDataLoad(result);
									setDataLoadCounters(result);
								}, function (error) {
									setTimeout(function () {
										//Third Attempt
										ClusterResultFactoryNew
											.dataLoad
											.get({ "clusterName": $scope.clusterName })
											.$promise
											.then(function(result) {
												$scope.dataLoadLoader = false;
												$scope.dataLoadDistributionErrorMessage = false;
												drawDataLoad(result);
												setDataLoadCounters(result);
											}, function(error) {
												$scope.dataLoadDistributionErrorMessage = true;
											});
										}, 5000);
								});
						//second attempt ends
						}, 5000);
					}).finally(function () {
						isDataLoadPending = false;
						$scope.dataLoadLoader = false;
					});
			}

			/** Function to get data load data details */
			function getDataLoadDataDetails() {

				if (isDataLoadDetailsPending || !$scope.isDataLoadEnabled
					|| !$scope.isHdfsSectionEnabled || !$scope.dataLoadDetailView) {
					return;
				}

				isDataLoadDetailsPending = true;
				// First Attempt
				ClusterResultFactoryNew
					.dataLoadDetails
					.get({ "clusterName": $scope.clusterName })
					.$promise
					.then(function(result) {
						$scope.dataLoadLoader = false;
						isDataLoadDetailsPending = false;
						if (!checkIfHdfsEmpty(result)) {
							$scope.dataLoadDetails = result;
						}
					}, function (error) {
						//Second Attempt
						ClusterResultFactoryNew
							.dataLoadDetails
							.get({ "clusterName": $scope.clusterName })
							.$promise
							.then(function(result) {
								$scope.dataLoadLoader = false;
								isDataLoadDetailsPending = false;
								if (!checkIfHdfsEmpty(result)) {
									$scope.dataLoadDetails = result;
								}
							}, function (error) {
								//Third Attempt
								ClusterResultFactoryNew
									.dataLoadDetails
									.get({ "clusterName": $scope.clusterName })
									.$promise
									.then(function(result) {
										$scope.dataLoadLoader = false;
										isDataLoadDetailsPending = false;
										if (!checkIfHdfsEmpty(result)) {
											$scope.dataLoadDetails = result;
										}
									}, function (error) {
										$scope.dataLoadDistributionErrorMessage = true;
									});
							});
					}).finally(function() {
						isDataLoadDetailsPending = false;
						$scope.dataLoadLoader = false;
					});
			}

			function checkIfHdfsEmpty(data) {
				var totalDfs = 0;
				for (var i = 0; i < data.length; i++) {
					totalDfs += Number(data[i].dataLoadStats);
				}
				if (totalDfs == 0) {
					$scope.hdfsEmpty = true;
					return true;
				}
			}

			function setDataLoadCounters(result) {
				$scope.dataLoadCounter = {"good" : 0, "warn" : 0, "bad" : 0, "unavailable" : 0};
				for (var i = 0; i < result.length; i++) {
					var node = result[i];
					if ("Good" == node.performance) {
						$scope.dataLoadCounter.good += node.totalNodes;
					} else if ("Warn" == node.performance) {
						$scope.dataLoadCounter.warn += node.totalNodes;
					} else if ("Bad" == node.performance) {
						$scope.dataLoadCounter.bad += node.totalNodes;
					} else {
						$scope.dataLoadCounter.unavailable += node.totalNodes;
					}
				}
			}

			function drawDataLoad(barData) {
				var nodesData = barData;
				var max = null;

				for (var i = 0; i < nodesData.length; i++) {
					var node = nodesData[i];
					if (max == null) {
						max = node.meanPercentage;
						continue;
					}
					if (max < node.meanPercentage) {
						max = node.meanPercentage;
					}
				}

				if (max == 0) {
					$scope.hdfsEmpty = true;
					return;
				} else {
					$scope.hdfsEmpty = false;
				}

				var color        = d3.scale.ordinal().range(['#3c763d', '#D1BE0D', '#C5621F', '#a94442']);

				var innerRadius  = 70;
				var visHeight    = 200 - document.getElementById("dataLoadHeading").offsetHeight;

				var scaleFactor  = (visHeight - 5) / (2 * innerRadius + 2 * max);
				var vis          = document.getElementById("visualisation");
				vis.style.height = visHeight + "px";
				vis.style.width  = visHeight + "px";
				innerRadius      = innerRadius * scaleFactor;
				var outerRadius  = innerRadius + max * scaleFactor;
				var donutWidth   = 2 * outerRadius;
				document.getElementById('visualisation').innerHTML = '';
				var svg = d3.select('#visualisation')
					.append('svg')
					.attr('height', donutWidth)
					.attr('width', donutWidth)
					.style('height', donutWidth + 'px')
					.style('width', donutWidth + 'px')
					.append('g')
					.attr('transform', 'translate(' + outerRadius + ',' + outerRadius + ')');

				var dataloadtooltip = d3.select("body")
					.append("div")
					.attr("class", "dataloadtooltip")
					.style("position", "absolute")
					.style("z-index", "10")
					.style("opacity", 0);

				var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function(d) {
					if (d.data.meanPercentage < 5) {
						return innerRadius + 5 * scaleFactor;
					}
					return innerRadius + d.data.meanPercentage * scaleFactor;
				});

				var pie = d3.layout.pie().value(function(d) {
					return d.totalNodes;
				}).sort(null);

				var path = svg.selectAll('path')
					.data(pie(nodesData))
					.enter()
					.append('path')
					.attr('d', arc)
					.attr('fill', function(d, i) {
						var performance = d.data.performance;
						if (performance == "Good") {
							return "#4caf50";
						} else if (performance == "Warn") {
							return "#ff6d00";
						} else if (performance == "Bad") {
							return "#f44336";
						} else {
							return '#616161';
						}
					});

				/* Adding Tooltip */
				var dataloadtooltip = d3.select('#visualisation')
					.append('div')
					.attr('class', 'dataloadtooltip');

				dataloadtooltip.append('div')
					.attr('class', 'totalNodes');

				dataloadtooltip.append('div')
					.attr('class', 'instances');

				dataloadtooltip.append('div')
					.attr('class', 'meanPercentage');

				dataloadtooltip.append('div')
					.attr('class', 'message');

				path.on('mouseover', function(d) {
					var totalNodes = d.data.totalNodes;
					var nodesList = d.data.nodes;

					if (totalNodes == 1) {
						dataloadtooltip.select('.totalNodes').html('Node : ' + nodesList);
						dataloadtooltip.select('.instances').html('');
						dataloadtooltip.select('.meanPercentage').html('Data Load   : ' + d.data.meanPercentage + '%');
					} else {
						var str = '[ ' + nodesList[0];
						for (var i = 1; i < totalNodes && i <= 5; i++) {
							str += ", " + nodesList[i];
						}
						if (totalNodes <= 5) {
							str += " ]";
						} else {
							str += ", ... ] ";
						}
						dataloadtooltip.select('.totalNodes').html('Nodes     : ' + totalNodes);
						dataloadtooltip.select('.instances').html('Instances : ' + str);
						dataloadtooltip.select('.meanPercentage').html('Avg. Data Load   : ' + d.data.meanPercentage + '%');
					}

					var performance = d.data.performance;
					var isPositive = d.data.isPositive;
					var msg;
					if (performance == "Good") {
						msg = 'Balanced';
					} else if (performance == "Warn") {
						if (isPositive) {
							msg = 'Slightly Over Utilized';
						} else {
							msg = 'Slightly Under Utilized';
						}
					} else if (performance == "Bad") {
						if (isPositive) {
							msg = 'Over Utilized';
						} else {
							msg = 'Under Utilized';
						}
					} else {
						msg = 'Node(s) Unavailable';
					}
					dataloadtooltip.select('.message').html("Status : " + msg);
					dataloadtooltip.style('display', 'inline');

				});
				path.on('mouseout', function() {
					dataloadtooltip.style('display', 'none');
				});

				path.on('mousemove', function(d) {
					dataloadtooltip.style('top', (d3.event.clientY - 100) + 'px')
						.style('left', (d3.event.clientX - 200) + 'px');
				});
			}

			function changeJson(graphs) {
				for (var graphName in graphs) {
					var graph = graphs[graphName];
					if (! graph.timeRange) {
						continue;
					}
					for (var i = 0; i < graph.timeRange.length; i++) {
						graph.timeRange[i] = new Date(graph.timeRange[i]);
					}

					for (var lineName in graph.linesMap) {
						var points = graph.linesMap[lineName];
						for (var i = 0; i < points.length; i++) {
							points[i].time = new Date(points[i].time);
						}
					}
				}

				for (var graphName in graphs) {
					var newGraph = {};
					var graph = graphs[graphName];
					newGraph['time'] = graph.timeRange;
					newGraph['unit'] = graph.unit;
					for (var lineName in graph.linesMap) {
						/*var points = graph.linesMap[lineName];

						var newPoints = [];
						for (var i = 0; i < points.length; i++) {
							newPoints.push([points[i].value, points[i].time]);
						}*/
						newGraph[lineName] = graph.linesMap[lineName];
					}
					graphs[graphName] = newGraph;
				}

				return graphs;
			}

			function changeQueueData(jsonObj) {
				var json = jsonObj.data;
				$scope.arrayQueue = [];
				$scope.namesQueue = [];
				for (var queueName in json) {
						if (queueName == 'time' || queueName == 'unit') {
							continue;
						} else  {
							$scope.arrayQueue.push(json[queueName]);
							$scope.namesQueue.push(queueName);
						}
				}

			}

			function changeQueueDataJson(jsondata) {
				$scope.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
				var json = jsondata.data;
				var statObject = json;

					var timeSeries = statObject.time;

					// Creating parsed time series
					var timeSeriesFormated = [];
					for (var i = 0; i < timeSeries.length; i++) {
						timeSeriesFormated.push($scope.parseDate(timeSeries[i]));
					}


					// Now Looping through series
					for (var seriesName in statObject) {
						if (seriesName == 'unit') {
							continue;
						}

						var seriesValues = statObject[seriesName];
						var ddArray = new Array();

						//Looping through series values and transforming it into a dd array
						for (var i = 0; i < seriesValues.length; i++) {
							ddArray[i] = [seriesValues[i], timeSeriesFormated[i]];
						}
						statObject[seriesName] = ddArray;
					}
				return json;
			}

			//End : auto get alerts in given time interval
			function getDateInStringFormat(dateString1, dateString2) {
				var date1 = new Date(dateString1);
				var date2 = new Date(dateString2);
				var differenceInMillis = date2 - date1;
				var occuringSince;

				var temp;
				if ((differenceInMillis / (1000 * 60 * 60 * 24)) >= 1) {
					occuringSince = differenceInMillis / (1000 * 60 * 60 * 24);
					temp = occuringSince;
					occuringSince = parseInt(occuringSince);
					if (occuringSince > 1) {
						occuringSince += " days";
					} else {
						occuringSince += " day";
					}
					temp = temp - parseInt(temp);
					temp = parseInt(temp * 24);
					if (temp > 1) {
						occuringSince += " " + temp + " hours";
					} else if (temp == 1) {
						occuringSince += " " + temp + " hour";
					}
				} else if ((differenceInMillis / (1000 * 60 * 60)) >= 1) {
					occuringSince = differenceInMillis / (1000 * 60 * 60);
					temp = occuringSince;
					occuringSince = parseInt(occuringSince);
					if (occuringSince > 1) {
						occuringSince += " hours";
					} else {
						occuringSince += "hour";
					}
					temp = temp - parseInt(temp);
					temp = parseInt(temp * 60);
					if (temp > 1) {
						occuringSince += " " + temp + " minutes";
					} else if (temp == 1) {
						occuringSince += " " + temp + " minute";
					}
				} else if ((differenceInMillis / (1000 * 60)) >= 1) {
					occuringSince = differenceInMillis / (1000 * 60);
					temp = occuringSince;
					occuringSince = parseInt(occuringSince);
					if (occuringSince > 1) {
						occuringSince += " minutes";
					} else {
						occuringSince += " minute";
					}
					temp = temp - parseInt(temp);
					temp = parseInt(temp * 60);
					if (temp > 1) {
						occuringSince += " " + temp + " seconds";
					} else if (temp == 1) {
						occuringSince += " " + temp + " second";
					}
				} else {
					occuringSince = differenceInMillis / 1000;
					occuringSince = parseInt(occuringSince) + " Seconds";
				}
				return occuringSince;
			}

			function getCategoryData() {
				ClusterResultFactoryNew.clusterNodes.get({ "clusterName": $scope.clusterName }).$promise.then(function(result) {
					angular.copy(result, $scope.selectedArrList);
					$scope.allNodes = result;
					angular.forEach(result, function(row, i) {
						$scope.selectedNodes.push(row);
					})

				}).finally(function() {

				});
			}

			function onItemSelect(item) {}

			function getDataCenterCounts(dataCenters) {
				var good = 0, bad = 0, average = 0, unavailable = 0;
				angular.forEach(dataCenters, function(dataCenter, i) {
					angular.forEach(dataCenter.racks, function(racks, i) {
						angular.forEach(racks.nodes, function(node, i) {
							switch (node.performance) {
								case 'Good':
									good++;
									break;
								case 'Average':
									average++;
									break;
								case 'Bad':
									bad++;
									break;
								case 'Unavailable':
									unavailable++;
									break;
							}
						})
					});
				});
				$scope.dataCenterCounters = {
					"good"       : good,
					"average"    : average,
					"bad"        : bad,
					"unavailable": unavailable
				};
			}
			$scope.disableSubmitIP = function() {
				return ($scope.selectedArrList.length === 0 || !$scope.nodeSelect)
			};
			// queue user
			$scope.openQueueUserGraph = function(queueName) {
				if ( isUserQueueUtilizationPending ) {
					return;
				}
				isUserQueueUtilizationPending = true;
				$scope.quName = queueName;
				$("#QueueUserGraph").modal('show');
				$scope.queueUserLoader = true;
				var queueData = "clusterName=" + $scope.clusterName + "&queueName=" + queueName;
				if ($scope.quOptions.intervalMode == 'Duration') {
					queueData = queueData + "&duration=" + $scope.quOptions.durationTextValue + $scope.quOptions.durationUnit;
				} else {
					queueData = queueData + "&rangeFrom=" + $scope.quOptions.rangeFrom + "&rangeTo=" + $scope.quOptions.rangeTo;
				}
				if ($scope.quOptions.stat) {
					queueData = queueData + "&stat=" + $scope.quOptions.stat;
				}

				var req = {
					method : 'GET',
					url    : '/apis/clusteranalysis/user-queue-utilization?' + queueData,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					timeout: 210000
				};

				$http(req).then(function(result) {
					$scope.queueUserLoader = false;
					$scope.queueUserGraphContainerError = false;

					if (result.data.length == 0) {
						$scope.queueUserGraphNoData = true;
						document.getElementById("queueId").innerHTML = "";
						document.getElementById("xAxisId").innerHTML = "";
						return;
					} else {
						$scope.queueUserGraphNoData = false;
						showQueueUserGraph(result.data);
					}
				}, function(error) {
					document.getElementById("queueId").innerHTML = "";
					document.getElementById("xAxisId").innerHTML = "";
					$scope.queueUserGraphContainerError = true;
					$scope.queueUserGraphNoData = false;
					console.log("Error while receiving jqueue user data", e)
				}).finally(function() {
					isUserQueueUtilizationPending = false;
					$scope.queueUserLoader = false;
				});
			}

			//Capacity utilization
			$scope.openProfilerGraph = function(jobName) {
				if (jobName) {
					$("#profilerGraphWrapper").empty();
					if ($("#jvmGraphContainer").length > 0) {
						$("#jvmGraphContainer").remove();
					}
					$("#profilerGraphWrapper").append('<div id="jvmGraphContainer" style="display: inline-block;" ></div>');

					$("#CapacityUtilizationGraph").modal('show');
					$("#capacityUtilizationSpinner").show();

					ClusterResultFactoryNew.profilerGraphData.get({
						"clusterName": $scope.clusterName,
						jobName      : jobName
					}).$promise.then(function(result) {
						var newJson = result;
						$("#capacityUtilizationSpinner").hide();
						profilerGraph.initJVMGraph(newJson);
					}).finally(function() {
						$("#capacityUtilizationSpinner").hide();
					});
				}
			}

			// Job history
			$scope.openJobhistoryGraph = function(jobName) {
				$scope.jhJobName = jobName;
					$("#JobhistoryGraph").modal('show');
					var data = {
						"clusterName": $scope.clusterName,
						jobName: jobName
					};
					if ($scope.jhOptions.intervalMode == 'Duration') {
						data['duration'] = $scope.jhOptions.durationTextValue + $scope.jhOptions.durationUnit;
					} else {
						data['rangeFrom'] = $scope.jhOptions.rangeFrom;
						data['rangeTo'] = $scope.jhOptions.rangeTo;
					}
					ClusterResultFactoryNew.jobhistoryGraphData.get(data).$promise.then(function(result) {
						$scope.jobHistoryLoader = false;
						$scope.historyGraphContainerError = false;
						var newJson = result;
						$scope.historyGraphContainerError = false;
						if (result.length == 0) {
							$scope.jobHistoryNoData = true;
						} else {
							$scope.jobHistoryNoData = false;
							$scope.jobhistoryGraphFun(newJson);
						}
					},
					function(e) {
						document.getElementById("historyGraphContainer").innerHTML = "";
						$scope.historyGraphContainerError = true;
						$scope.jobHistoryNoData = false;
						console.log("Error while receiving job history data", e)
					}).finally(function() {
						$scope.jobHistoryLoader = false;
					});
			}

			$scope.updateJobhistoryGraph = function() {
				$scope.openJobhistoryGraph($scope.jhJobName);
			}

			function getFormattedNumber(number) {
				var formattedNum = number.toFixed(2);
				var length = formattedNum.length;
				if (formattedNum.charAt(length - 1) == '0') {
					if (formattedNum.charAt(length - 2) == '0') {
						return formattedNum.substring(0, length - 3);
					} else {
						return formattedNum.substring(0, length - 1);
					}
				} else {
					return formattedNum;
				}
			}

			// show queueUser graph
			function showQueueUserGraph(data) {
				for (var i = 0; i < data.length; i++) {
					data[i].relativePercentUsage = getFormattedNumber(data[i].relativePercentUsage);
				}

				var svgWidth        = 800;
				var width           = 792;
				var svgMaxHeight    = 450;

				// Sum of barPaddingRatio and barHeightRatio Ratio should be 1 or 100 (recommended)
				var barPaddingRatio = 0.4;
				var barHeightRatio  = 0.5;
				var barMinPadding   = 20;
				var barMaxHeight    = 50;
				var barMinHeight    = 20;

				var barHeight;
				var barPadding;

				/* RULES:
					(1) padding means space between bars and barheight means thickness of bar
					(2) Number of paddings should be 1 greater than number of bars
					ie.
						padding
						bar
						padding
						bar
						padding

					(3) Height of all the paddings should be equal ( note: bars are horizontal aligned)
					(4) Height of bar paddings can be stretched to infinite and compressed to barMinPadding.
					(5) Height of bar can be stretched to barMaxHeight and compressed to barMinPadding.
					(6) If bar paddings and bar heights can be stretched, then they will be stretched in the ratio of barPaddingRation:barHeightRatio or something like that. We will continue to stretch untill bar heights reach its maximum limit (barMaxHeight), after that we will continue to stretch padding.
					(7) All these stretching and compressing we are doing because in case if there are a very few bars then they could spead out to svg (vertically with appropriate paddings and bar heights).
				*/

				var height = data.length * (barMinPadding + barMinHeight) + barMinPadding;
				if (data.length == 1 ) {
					svgMaxHeight = 4 * barMaxHeight;
				}
				if (height < svgMaxHeight) {
					height = svgMaxHeight;
					if (barMaxHeight * (2 * data.length + 1) < svgMaxHeight) {
						barPadding = (svgMaxHeight - (data.length * barMaxHeight)) / (data.length + 1);
						barHeight  = barMaxHeight;
					} else {
						var temp   = svgMaxHeight / ( barHeightRatio * data.length +  barPaddingRatio * (data.length + 1));
						barPadding = temp * barPaddingRatio;
						if (barPadding >= barMinPadding) {
							barHeight = temp * barHeightRatio;
						} else {
							barHeight = (svgMaxHeight - (barMinPadding * (data.length + 1))) / data.length;
						}
					}
				} else {
					barHeight  = barMinHeight;
					barPadding = barMinPadding;
				}

				var bar, svg, scale, xAxis, labelWidth = 0;

				var color = generateColor('#0D47A1', '#E3F2FD', data.length);

				var max = d3.max(data, function(d) { return d.relativePercentUsage; });
                var removeId = document.getElementById('queueId')
                removeId.innerHTML = '';
			    svg = d3.select('#queueId').attr("width", svgWidth);
			    document.getElementById('queueId').style.height = height + 'px';

				data = data.sort(function(a, b) {
				    return b.relativePercentUsage - a.relativePercentUsage;
				}).reverse();

			    bar = svg.selectAll("g")
			            .data(data)
			            .enter()
			            .append("g");

			    bar.attr("class", "bar")
			        .attr("cx",barPadding)
			        .attr("transform", function(d, i) {
			             return "translate(" + 0 + "," + (i * (barHeight + barPadding) ) + ")";
			        });

			    var maxLengthUserLabel = 0;
			    for (var i = 0; i < data.length; i++) {
			    	var userName = data[i].userName;
			    	var userNameLength = getTextWidth(userName, '14px sans-serif');
			    	if (maxLengthUserLabel < userNameLength) {
			    		maxLengthUserLabel = userNameLength;
			    	}
			    }

			    bar.append("text")
			        .attr("class", "label")
			        .style('font-size','14px')
			        .style('font-weight','normal')

			        .attr("y", barHeight / 2 + barPadding)
			        .attr("dy", ".35em") //vertical align middle
			        .style("color", "black")
			        .text(function(d){
			            return d.userName;
			        });

				labelWidth = maxLengthUserLabel + 10;

			    scale = d3.scale.linear()
			            .domain([0, 100])
			            .range([0, width - labelWidth]);

			    xAxis = d3.svg.axis()
			        .scale(scale)
			        .tickSize(-height)
			        .orient("bottom");
			    bar.append("rect")
			    	.attr("fill", function(d,i) {
			    		return color[i % d.relativePercentUsage];
			    	})
			        .attr("transform", "translate("+labelWidth+", " + barPadding + ")")
			        .attr("height", barHeight)
			        .attr("width", function(d){
			            return scale(d.relativePercentUsage);
			        });
			    bar.append("text")
			        .attr("class", "relativePercent")
			        .attr("y", barHeight / 2 + barPadding)
			         .attr("dx", function(d) {
			         	return (getTextWidth(d.relativePercentUsage + '%', '15px sans-serif') + labelWidth + (svgWidth - width));
			         })
			        .attr("dy", ".35em") //vertical align middle
			        .attr("text-anchor", "end")
			        .text(function(d){
			            return (d.relativePercentUsage+"%");
			        })
			        .attr("x", function(d){
			            return scale(d.relativePercentUsage);
			        });

			    svg.insert("g",":first-child")
			        .attr("class", "axisHorizontal")
			        .attr("transform", "translate(" + (labelWidth) + ","+ (height )+")")
			        .call(xAxis);
			     var removeAxisId = document.getElementById('xAxisId')
                removeAxisId.innerHTML = '';
				var xaxis_svg = d3.select('#xAxisId')
			    .attr("width", width)
			  	.attr("height", 60)
			    .append('g');

			    xaxis_svg.append("text")
					.attr("class", "XLabel")
					.attr("text-anchor", "middle")
					.attr("transform", "translate("+ (labelWidth + width) / 2 +"," +45 +")")
					.style("dominant-baseline", "central")  // centre below axis
					.text("Relative Percent Usage");

			     xaxis_svg.insert("g",":first-child")
			        .attr("class", "axisHorizontal")
			        .attr("transform", "translate(" + (labelWidth) + "," + 10 + ")")
			        .call(xAxis)
			}

			function getTextWidth(text, font) {
				var c = document.getElementById("myCanvas");
				var ctx = c.getContext("2d");
				ctx.font = font;
				var x= ctx.measureText(text).width;
				return x;
			}

			function hex(c) {
				var s = "0123456789abcdef";
				var i = parseInt(c);
				if (i == 0 || isNaN(c))
					return "00";
				i = Math.round(Math.min(Math.max(0, i), 255));
				return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
			}

			/* Convert an RGB triplet to a hex string */
			function convertToHex(rgb) {
				return '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
			}

			/* Remove '#' in color hex string */
			function trim(s) {
				return (s.charAt(0) == '#') ? s.substring(1, 7) : s
			}

			/* Convert a hex string to an RGB triplet */
			function convertToRGB(hex) {
				var color = [];
				color[0] = parseInt((trim(hex)).substring(0, 2), 16);
				color[1] = parseInt((trim(hex)).substring(2, 4), 16);
				color[2] = parseInt((trim(hex)).substring(4, 6), 16);
				return color;
			}

			function generateColor(colorStart, colorEnd, colorCount) {

				// The beginning of your gradient
				var start = convertToRGB(colorStart);

				// The end of your gradient
				var end = convertToRGB(colorEnd);

				// The number of colors to compute
				var len = colorCount;

				//Alpha blending amount
				var alpha = 0.0;

				var saida = [];

				for (var i = 0; i < len; i++) {
					var c = [];
					alpha += (1.0 / len);

					c[0] = start[0] * alpha + (1 - alpha) * end[0];
					c[1] = start[1] * alpha + (1 - alpha) * end[1];
					c[2] = start[2] * alpha + (1 - alpha) * end[2];

					saida.push(convertToHex(c));

				}

				return saida;
			}
			$scope.updateQUGraph = function() {
				$scope.openQueueUserGraph($scope.quName);
			}

			$scope.jobhistoryGraphFun = function (jobHistory) {
				var HEIGHT  = 400;
				var WIDTH   = 850;
				var trans   = 80;
				var MARGINS = {
					top   : 0,
					right : 0,
					bottom: 60,
					left  : 50
				};
				var yTextLabelWidth = 20;
				var padding = 100;
				var svg = document.getElementById('historyGraphContainer');
				svg.innerHTML = "";
				svg.setAttribute("height", HEIGHT + 'px');
				svg.setAttribute("width", WIDTH + 'px');

				var vis = d3.select("#historyGraphContainer");

				var lengthData = jobHistory.length;
				var MAX;
				var maximumMapMemoryPercent = d3.max(jobHistory, function(d) {
					return d.effMapMemoryPercent;
				});
				var maximumReduceMemoryPercent = d3.max(jobHistory, function(d) {
					return d.effReduceMemoryPercent;
				});
				if (maximumReduceMemoryPercent > maximumMapMemoryPercent) {
					MAX = maximumReduceMemoryPercent;
				} else {
					MAX = maximumMapMemoryPercent;
				}
				var formatxAxis = d3.format('.0f');
				var xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right - yTextLabelWidth]).domain([1, lengthData]);
				var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top - 40 , MARGINS.bottom ]).domain([0, MAX]);

				//var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(jobHistory.length - 1).tickFormat(d3.format("d")).tickSubdivide(0);
				var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d")).tickSubdivide(0);
				var yAxis = d3.svg.axis().scale(yScale).tickFormat(function(d) {
					if (d == 0) {
						return 0;
					}
					return d = d + " %";
				}).orient("left");

				/*xAxis.ticks(lengthData);
				yAxis.ticks(6);*/

				vis.append("svg:g")
					.attr("class", "axis")
					//.attr("transform", "translate(0," +  (HEIGHT - MARGINS.bottom - 20) + ")")
					.attr("transform", "translate(" + (yTextLabelWidth) + "," + (HEIGHT - MARGINS.bottom - 20) + ")")
					.call(xAxis);

				vis.append("svg:g")
					.attr("class", "axis")
					.attr("transform", "translate(" + (MARGINS.left + yTextLabelWidth) + ", -" + 40 + ")")
					.call(yAxis);
				vis.append("text")
		            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
		            .attr("transform", "translate("+ (padding/8) +","+(HEIGHT/3)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
		            .text("Utilization");

				vis.append("text")
					.attr("text-anchor", "middle")
					.attr("transform", "translate("+ (WIDTH/2) +","+(HEIGHT-(padding/3))+")")
					.style("dominant-baseline", "central")  // centre below axis
					.text("Executions");

				var mapPhaseLine = d3.svg.line()
					.x(function(d, i) {
						return xScale(i+1);
					})
					.y(function(d) {
						return yScale(d.effMapMemoryPercent);
					});

				var reducePhaseLine = d3.svg.line()
					.x(function(d, i) {
						return xScale(i+1);
					})
					.y(function(d) {
						return yScale(d.effReduceMemoryPercent);
					});

				vis.append('svg:path')
					.attr("class", "line")
					.attr('d', mapPhaseLine(jobHistory))
					.style("stroke", "#1E88E5")
					//.attr("transform", "translate(0,-" + 40 + ")")
					.attr("transform", "translate("+yTextLabelWidth +",-"+ 40 +")")
					.attr('stroke-width', 3);

				vis.append('svg:path')
					.attr('d', reducePhaseLine(jobHistory))
					.style("stroke", "#26C6DA")
					//.attr("transform", "translate(0,-" + 40 + ")")
					.attr("transform", "translate("+yTextLabelWidth +",-"+ 40 +")")
					.attr('stroke-width', 3);

				vis.append("svg:g").selectAll("circle")
					.data(jobHistory)
					.enter()
					.append("circle")
					.attr("r", 4)
					.attr("cx", function(d, i) {
						return xScale(i+1) + 20
					})
					.attr("cy", function(d) {
						return yScale(d.effMapMemoryPercent) - 40
					})
					.style("fill", "#1E88E5")
					.on("mousemove", function(d) {

						tooltip.style("opacity", 1);

						tooltip.html("Job ID : " + d.jobId + "<br/>Job start time : " + d.jobStartTime.replace('T', ' ').replace('Z', '') + "<br/>Job duration : " + getMillisDateToString(d.jobDuration) + "<br/>Map Memory Utilization : " + d.effMapMemoryPercent + "% of " + d.allocatedMapMemory);

						var left = d3.event.pageX;
						var tooltipWidth =  parseInt(tooltip.style("width"), 10);
						var screenWidth = document.documentElement.clientWidth;
						if ((left + tooltipWidth) > screenWidth) {
							left = screenWidth - tooltipWidth - 20;
						}

						tooltip.style("left", left + "px");
						tooltip.style("top", (d3.event.pageY + 20) + "px");
					})
					.on("mouseout", function(d) {
						tooltip.style("opacity", 0);
					});
				vis.append("svg:g").selectAll("circle")
					.data(jobHistory)
					.enter()
					.append("circle")
					.attr("r", 4)
					.attr("cx", function(d, i) {
						return xScale(i+1) + 20;
					})
					.attr("cy", function(d) {
						return yScale(d.effReduceMemoryPercent) - 40;
					})
					.style("fill", "#26C6DA")
					.on("mousemove", function(d) {
						tooltip.style("opacity", 1);

						tooltip.html("Job ID : " + d.jobId + "<br/>Job start time : " + d.jobStartTime.replace('T', ' ').replace('Z', '') + "<br/>Job duration : " + getMillisDateToString(d.jobDuration) + "<br/>Reduce Memory Utilization : " + d.effReduceMemoryPercent + "% of " + d.allocatedReduceMemory);

						var left = d3.event.pageX;
						var tooltipWidth =  parseInt(tooltip.style("width"), 10);
						var screenWidth = document.documentElement.clientWidth;
						if ((left + tooltipWidth) > screenWidth) {
							left = screenWidth - tooltipWidth - 20;
						}

						tooltip.style("left", left + "px");
						tooltip.style("top", (d3.event.pageY + 20) + "px");
					})
					.on("mouseout", function(d) {
						tooltip.style("opacity", 0);
					});
			}

			function getMillisDateToString(durationInMillis) {
				var occuringSince = "";

				if ((durationInMillis / (1000 * 60 * 60 * 24)) >= 1) {
					occuringSince = Math.floor(durationInMillis / (1000 * 60 * 60 * 24)) + "d ";
					durationInMillis = durationInMillis % (1000 * 60 * 60 * 24);
				}

				if ((durationInMillis / (1000 * 60 * 60)) >= 1) {
					occuringSince += Math.floor(durationInMillis / (1000 * 60 * 60)) + "h ";
					durationInMillis = durationInMillis % (1000 * 60 * 60);
				}

				if ((durationInMillis / (1000 * 60)) >= 1) {
					occuringSince += Math.floor(durationInMillis / (1000 * 60)) + "m ";
					durationInMillis = durationInMillis % (1000 * 60);
				}

				if ((durationInMillis / 1000) >= 1) {
					occuringSince += Math.floor(durationInMillis / 1000) + "s ";
					durationInMillis = durationInMillis % 1000;
				}

				if (durationInMillis >= 1 && occuringSince.length == 0) {
					occuringSince += durationInMillis + "ms";
				}

				return occuringSince.trim();
			}

			function saveFile (name, type, data) {
				if (data != null && navigator.msSaveBlob)
					return navigator.msSaveBlob(new Blob([data], { type: type }), name);
				var a = $("<a style='display: none;'/>");
				var url = window.URL.createObjectURL(new Blob([data], {type: type}));
				a.attr("href", url);
				a.attr("download", name);
				$("body").append(a);
				a[0].click();
				window.URL.revokeObjectURL(url);
				a.remove();
			}

			function getHadoopMetricsOpenedStatNamesFromServer() {
				if (!backgroundProcesses.SYSTEM_METRICS) {
					return;
				}

				if (!$scope.isChartsEnabled || ishmssStatsUpdatePending) {
					return;
				}

				ishmssStatsUpdatePending = true;

				var req = {
					method : 'GET',
					url    : '/apis/clusteranalysis/get-hadoop-metrics-latest-stats/' + $scope.clusterName,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					timeout: 210000
				};

				$http(req).then(function(data) {
					var newJson = data.data;

					if (newJson.length == 0) {
						console.log('new json is empty');
					}
					/**
						new Json eg.
						{
							"All Nodes" : { "clusterWide": { "nameNode": ["FSNamesystemState.CapacityTotal"], "resourceManager": ["JvmMetrics.MemMaxM"] }, "systemStats": { "cpu": ["NumberOfCores"] } },
							"127.26.49.201" : { "systemStats": { "cpu": ["NumberOfCores"] } } }, { "tabName": "111.26.49.111", "openedStats": { "systemStats": { "cpu": ["CpuUsage"] }}
						}
					*/
					var oldJson = $scope.oldMetricsPersistedStats;
					// Adding ips that are in new json but not opened yet
					for (var nodeIP in newJson) {
						if (!isTabAdded(nodeIP) && !isTabEmpty(newJson[nodeIP])) {
							$scope.addTab(nodeIP, false);
						}
					}

					// Removing ips that are in old json but not in new json
					for (var nodeIP in oldJson) {
						if (!newJson[nodeIP]) {
							removeTabByName(nodeIP);
						}
					}
					//cat1= SystemStats, cat2 = cpu, cat3 = CpuUsage

					// Adding those stats which are in new json but not in old json
					for (var nodeIP in newJson) {
						for (var cat1 in newJson[nodeIP]) {
							for ( var cat2 in newJson[nodeIP][cat1]) {
								var arr = newJson[nodeIP][cat1][cat2];

								for (var i = 0 ; i < arr.length; i++) {
									if (!findStat(cat1, cat2, arr[i], oldJson[nodeIP])) {
										addStatToTab(nodeIP, cat1, cat2, arr[i]);
									}
								}
							}
						}
					}

					// Removing those stats which are in old json but not in new json
					for (var nodeIP in oldJson) {
						for (var cat1 in oldJson[nodeIP]) {
							for ( var cat2 in oldJson[nodeIP][cat1]) {
								var arr = oldJson[nodeIP][cat1][cat2];
								for (var i = 0 ; i < arr.length; i++) {
									if (!findStat(cat1, cat2, arr[i], newJson[nodeIP])) {
										removeStatFromTab(nodeIP, cat1, cat2, arr[i]);
									}
								}
							}
						}
					}

					$scope.oldMetricsPersistedStats = newJson;
					if (hsmbpFirstTime) {
						hsmbpFirstTime = false;
						setActiveTab('All Nodes');
						var isAllTabsEmpty = true;
						for (var nodeIP in oldJson) {
							if (!isTabEmpty(oldJson[nodeIP])) {
								isAllTabsEmpty = false;
							}
						}
						if (isAllTabsEmpty) {
							addStatToTab('All Nodes', 'systemStats', 'cpu', 'CpuUsage');
							notifyServerForAddingChart('systemStats', 'cpu', 'CpuUsage', 'All Nodes', 'add');
						}

					}
				}, function(error) {
					console.log("Error while fetching latest stats names from server.", error);
				}).finally(function() {
					ishmssStatsUpdatePending = false;
				});
			}

			function isTabAdded(tabName) {
				for (var i = 0; i < $scope.tabs.length; i++) {
					if ($scope.tabs[i].content == tabName) {
						return true;
					}
				}
				return false;
			}

			function isTabEmpty(statObject) {
				var count = 0;
				for (var cat1 in statObject) {
					for (var cat2 in statObject[cat1]) {
						if (statObject[cat1][cat2].length > 0) {
							return false;
						}
					}
				}
				return true;
			}

			function setActiveTab(tabName) {
				for (var i = 0; i < $scope.tabs.length; i++) {
					if ($scope.tabs[i].content == tabName) {
						$scope.tabs[i].active = true;
					} else {
						$scope.tabs[i].active = false;
					}
				}
			}

			function removeTabByName(tabName) {
				for (var i = 0; i < $scope.tabs.length; i++) {
					if ($scope.tabs[i].content == tabName) {
						$scope.removeTab(i);
						break;
					}
				}
			}

			//cat1= SystemStats, cat2 = cpu, cat3 = cpuUsage
			function addStatToTab(nodeIP, cat1, cat2, cat3) {
				var temp = nodeIP.split('.').join('_');
				if ($scope.hmss[temp]) {
					$scope.hmss[temp]['addStat'](cat3, cat1, cat2);
					updateOldMetricsPersistedStatsADD(nodeIP, cat1, cat2, cat3);
				} else {
					var timer = setInterval(function() {
						if ($scope.hmss[temp]) {
							clearInterval(timer);
							$scope.hmss[temp]['addStat'](cat3, cat1, cat2);
							updateOldMetricsPersistedStatsADD(nodeIP, cat1, cat2, cat3);
						}
					}, 1000);
				}
			}

			/**
				cat1= SystemStats, cat2 = cpu, cat3 = CpuUsage
			*/
			function removeStatFromTab(nodeIP, cat1, cat2, cat3) {
				var temp = nodeIP.split('.').join('_');
				if ($scope.hmss[temp]) {
					$scope.hmss[temp]['removeStat'](cat3, cat1, cat2);
					updateOldMetricsPersistedStatsRemove(nodeIP, cat1, cat2, cat3);
				}
			}

			/**
				cat1= SystemStats, cat2 = cpu, cat3 = CpuUsage
			*/
			function updateOldMetricsPersistedStatsADD(nodeIP, cat1, cat2, cat3) {
				if ($scope.oldMetricsPersistedStats[nodeIP]) {
					if ($scope.oldMetricsPersistedStats[nodeIP][cat1]) {
						if ($scope.oldMetricsPersistedStats[nodeIP][cat1][cat2]) {
							var arr = $scope.oldMetricsPersistedStats[nodeIP][cat1][cat2];
							var isExists = false;
							for (var i = 0; i < arr.length; i++) {
								if (arr[i] == cat3) {
									return;
								}
							}
							$scope.oldMetricsPersistedStats[nodeIP][cat1][cat2].push(cat3);
						} else {
							$scope.oldMetricsPersistedStats[nodeIP][cat1][cat2] = [cat3];
						}
					} else {
						$scope.oldMetricsPersistedStats[nodeIP][cat1] = {
							cat2 : [cat3]
						};
					}
				} else {
					$scope.oldMetricsPersistedStats[nodeIP] = {
						cat1 : {
							cat2 : [cat3]
						}
					};
				}
			}

			/**
				cat1= SystemStats, cat2 = cpu, cat3 = CpuUsage
			*/
			function updateOldMetricsPersistedStatsRemove(nodeIP, cat1, cat2, cat3) {
				if ($scope.oldMetricsPersistedStats[nodeIP]) {
					if ($scope.oldMetricsPersistedStats[nodeIP][cat1]) {
						if ($scope.oldMetricsPersistedStats[nodeIP][cat1][cat2]) {
							var arr = $scope.oldMetricsPersistedStats[nodeIP][cat1][cat2];
							for (var i = 0; i < arr.length; i++) {
								if (arr[i] == cat3) {
									arr.splice(i, 1);
									return;
								}
							}
						}
					}
				}
			}

			/**
				cat1= SystemStats, cat2 = cpu, cat3 = CpuUsage
			*/
			function findStat(cat1, cat2, cat3, json) {
				if (json && json[cat1] && json[cat1][cat2] && json[cat1][cat2]) {
					var arr = json[cat1][cat2];
					for (var i = 0; i < arr.length; i++) {
						if (arr[i] == cat3) {
							return true;
						}
					}
				}
				return false;
			}

			$scope.sendRequestForRemovingTab = function(tabName) {
				if (! backgroundProcesses.SYSTEM_METRICS) {
					return;
				}
				var req = {
					method : 'POST',
					url    : '/apis/clusteranalysis/update-hadoop-metrics-remove-tab',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					data   : 'tabName='+tabName,
					timeout: 210000
				};

				$http(req).then(function(data) {

				}, function(error) {
					console.log("Error while sending request for remving tab in hadoop metrics and system stats", error)
				});

			}

			function sendHadoopMetricesOpenedStatsNamesToServer() {

				if (backgroundProcesses.SYSTEM_METRICS) {
					return;
				}

				if (!$scope.isChartsEnabled || ishmssStatsUpdatePending) {
					return;
				}

				ishmssStatsUpdatePending = true;

				// Node Specific
				var	json = angular.copy($scope.readWriteNodeServiceData);

				//All Nodes
				json['All Nodes'] = $scope.readWriteServiceData;

				var dataToSend = "clusterName=" + $scope.clusterName + "&json=" + JSON.stringify(json)

				var req = {
					method : 'POST',
					url    : '/apis/clusteranalysis/update-hadoop-metrics-stats',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					data   : dataToSend,
					timeout: 210000
				};

				$http(req).then(function(data) {

				}, function(error) {
					console.log("Error while updating hadoop metrics and system stats to server", error)
				}).finally(function() {
					ishmssStatsUpdatePending = false;
				});
			}

			function updateHadoopMetricsSystemStatsGraphData() {
				if (!$scope.isChartsEnabled || ishmssStatsDataUpdatePending) {
					return;
				}

				ishmssStatsDataUpdatePending = true;

				var currentTab = getCurrentTab();

				var tabSettings = [];

				if (currentTab == 'All Nodes') {

					angular.forEach($scope.getValue, function(row, index) {
						if (row.nodeKey == 'All Nodes') {  
							var rowValue = {
								"category"         : index,
								"duration"         : row.duration,
								"rangeFrom"        : row.rangeFrom,
								"rangeTo"          : row.rangeTo,
								"aggregateFunction": row.aggregateFunction
							};  
							tabSettings.push(rowValue);  
						}
					});

				} else {
					var selectedStats = $scope.readWriteNodeServiceData[currentTab];
					for (var cat1 in selectedStats) {
						for (var cat2 in selectedStats[cat1]) {
							for ( var i = 0; i < selectedStats[cat1][cat2].length; i++) {
								var stat = cat1 + '.' + cat2 + '.' + selectedStats[cat1][cat2][i];
								var catSetting = $scope.getNodeSpecificValue[stat + currentTab];
								if (catSetting) {
									tabSettings.push({
										"category"         : stat,
										"duration"         : catSetting.duration,
										"rangeFrom"        : catSetting.rangeFrom,
										"rangeTo"          : catSetting.rangeTo,
										"aggregateFunction": catSetting.aggregateFunction
									});
								}
							}
						}
					}

				}

				var dataToSend = "clusterName=" + $scope.clusterName + "&currentOpenedTab=" + currentTab + "&tabSettings=" + JSON.stringify(tabSettings);
				if (currentTab == 'All Nodes') {
					dataToSend = dataToSend + "&selectedNodes=" + JSON.stringify($scope.selectedNodes);
				}

				var req = {
					method : 'POST',
					url    : '/apis/clusteranalysis/get-hadoop-metrics-stats-data',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					data   : dataToSend,
					timeout: 210000
				};

				$http(req).then(function(data) {
					// In case ui send the request and before the response comes user changes the tab
					if (currentTab == getCurrentTab() ) {
						if (currentTab == 'All Nodes') {
							$scope.chartData1 = changeJson(data.data);
						} else {
							$scope.chartData = changeJson(data.data);
						}
					}

				}, function(error) {
					console.log("Error while getting hadoop metrics and system stats graph data from server", error)
				}).finally(function() {
					ishmssStatsDataUpdatePending = false;
				});
			}

			$scope.updateHadoopMetricsSystemStatsGraphData = function() {
				updateHadoopMetricsSystemStatsGraphData();
			}

			$scope.$on('add-remove-chart', function(event, cat1, cat2, cat3, action) {
				if (!backgroundProcesses.SYSTEM_METRICS) {
					return;
				}
				notifyServerForAddingChart(cat1, cat2, cat3, getCurrentTab(), action);
			})

			function notifyServerForAddingChart(cat1, cat2, cat3, tabName, action) {
				if (!backgroundProcesses.SYSTEM_METRICS) {
					return;
				}
				if (action == 'add') {
					updateOldMetricsPersistedStatsADD(tabName, cat1, cat2, cat3);
				} else {
					updateOldMetricsPersistedStatsRemove(tabName, cat1, cat2, cat3);
				}
				var dataToSend = "statName=" + cat1 + '.' + cat2 + '.' + cat3 + "&tabName=" + tabName + "&action=" + action + "&clusterName=" + $scope.clusterName;
				var req = {
					method : 'POST',
					url    : '/apis/clusteranalysis/update-hadoop-metrics-single-stat',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					isArray: false,
					data   : dataToSend,
					timeout: 240000
				};
				$http(req).then(function(data) {
						//$scope.chartData = changeJson(data.data);
				}, function(error) {
					console.log("Error while updating stats information on server", error)
				}).finally(function() {

				});
			}

			function getCurrentTab() {
				for (var i = 0; i < $scope.tabs.length; i++) {
					if ($scope.tabs[i].active) {
						return $scope.tabs[i].content;
					}
				}
			}

			$scope.addTab = function(nodeSelect, addDefault) {
				$('#exampleModal').modal('hide');
				if (nodeSelect == 'All Nodes') {
					ClusterResultFactoryNew
						.filteredCategoryList
						.get({"clusterName": $scope.clusterName })
						.$promise
						.then(function(result) {
							$scope.allCategories[nodeSelect] = result;
							addTab1(nodeSelect);
						});
				} else {
					ClusterResultFactoryNew
					.getCategoryData
					.get({
						"clusterName": $scope.clusterName,
						"nodeIP"     : nodeSelect
					})
					.$promise
					.then(function(result) {
						$scope.allCategories[nodeSelect] = result;
						addTab1(nodeSelect);
					})
					.then(function() {
						if (addDefault) {
							setTimeout(function(){
								addStatToTab(nodeSelect, 'systemStats', 'cpu', 'CpuUsage');
								notifyServerForAddingChart('systemStats', 'cpu', 'CpuUsage', nodeSelect, 'add');
							}, 1000);
						}
					});
				}

			};

			function addTab1(nodeSelect) {
				if (isAlreadyAdded(nodeSelect)) {
					return;
				}
				$scope.nodeSelect = nodeSelect;
				if (nodeSelect == 'All Nodes') {
					$scope.tabs.unshift({ title: $scope.nodeSelect, content: $scope.nodeSelect, "template": "app/analyzeCluster/result/clusterwide.html", "active": true });
				} else {
					$scope.tabs.push({ title: $scope.nodeSelect, content: $scope.nodeSelect, "template": "app/analyzeCluster/result/singlecluster.html", "active": true });
				}
				var openTabs = [];
				for (var key in $scope.tabs) {
					openTabs.push($scope.tabs[key].title);
				}
				$scope.selectedArrList = $($scope.allNodes).not(openTabs).get();
				$scope.selectedCategoryForSingleNode[$scope.nodeSelect] = [];
				$scope.selectedNodesForIndividualTabs[$scope.nodeSelect] = [];

				$scope.selectedNodesForIndividualTabs[$scope.nodeSelect].push($scope.nodeSelect);
				//$scope.tabs[$scope.tabs.length - 1].active = true;
				$scope.nodeSelect = '';
			}

			function isAlreadyAdded(tab) {
				for (var i = 0; i < $scope.tabs.length; i++) {
					if ($scope.tabs[i].content == tab) {
						return true;
					}
				}
				return false;
			}

			$scope.setActive = function(currentTab) {

			}

			$scope.changeMquData = function() {
				var mquOptionStat;
				mquOptionStat = $scope.mquOptions.stat;
				var obj = {};
				obj[mquOptionStat] = {};
				if ( $scope.chartQueueData == undefined || $scope.chartQueueData == null ) {
					return;
				}
				if ( $scope.mquFilterQuery == undefined || $scope.mquFilterQuery == null || $scope.mquFilterQuery == "" ) {
					$scope.mquDataTemp =  $scope.chartQueueData;
					return;
				}
				obj[mquOptionStat][$scope.mquFilterQuery] = $scope.chartQueueData[mquOptionStat][$scope.mquFilterQuery];
				obj[mquOptionStat]["time"] = $scope.chartQueueData[mquOptionStat]["time"];
				obj[mquOptionStat]["unit"] = $scope.chartQueueData[mquOptionStat]["unit"];
				$scope.mquDataTemp = obj;
			}

			// It removes the tab in hadoop metrics and system stats
			$scope.removeTab = function(index, event) {
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}
				$scope.tabs.splice(index, 1);
				var openTabs = [];
				for (var key in $scope.tabs) {  
					openTabs.push($scope.tabs[key].title);
				}  
				$scope.selectedArrList = $($scope.allNodes).not(openTabs).get();
				var curTab = $scope.tabs.length - 1;
			};
		}
	]).filter('reverseAlertArr', function() {
		return function(items) {
			return items.slice().reverse();
		};
	}).filter('dateStringFormat', function() {
		return function(durationInMillis) {
			var occuringSince = "";

			if ((durationInMillis / (1000 * 60 * 60 * 24)) >= 1) {

				occuringSince = Math.floor(durationInMillis / (1000 * 60 * 60 * 24)) + "d ";
				durationInMillis = durationInMillis % (1000 * 60 * 60 * 24);
			}

			if ((durationInMillis / (1000 * 60 * 60)) >= 1) {
				occuringSince += Math.floor(durationInMillis / (1000 * 60 * 60)) + "h ";
				durationInMillis = durationInMillis % (1000 * 60 * 60);
			}

			if ((durationInMillis / (1000 * 60)) >= 1) {
				occuringSince += Math.floor(durationInMillis / (1000 * 60)) + "m ";
				durationInMillis = durationInMillis % (1000 * 60);
			}

			if ((durationInMillis / 1000) >= 1) {
				occuringSince += Math.floor(durationInMillis / 1000) + "s ";
				durationInMillis = durationInMillis % 1000;
			}

			if (durationInMillis >= 1 && occuringSince.length == 0) {
				occuringSince += durationInMillis + "ms";
			}

			return occuringSince.trim();
		};
	});
