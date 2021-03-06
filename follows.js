(function ( $ ){

/*	
	//EXAMPLE CONFIGURATION
		var defaultKey	= 'fje329iun52ngtuijo2f4jeun432A', // Unique master Xively API key to be used as a default
		defaultFeeds	= [61916,12425,94322], // Comma separated array of Xively Feed ID numbers
		applicationName	= 'My Company\'s Application', // Replaces Xively logo in the header
		dataDuration	= '90days', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
		dataInterval	= 10800, // Default interval for data to be displayed (in seconds)
		dataColor		= '0A1922', // CSS HEX value of color to represent data (omit leading #)
		hideForm		= 0;
*/	

	var defaultKey		= 'oAFLQCo3Sq24RAureB0XTfdHtGY1lxKDM8oV90urYuZIF77L', // Unique master Xively API key to be used as a default
		defaultFeeds	= ['1961178354!T'], // Comma separated array of Xively Feed ID numbers 396478290!Scale1
	 //   var defaultKey		= 'AkDCUKiOhUnUZWDKBhQ7DYuf0MHlmmzK9QCGfenFw0WCFC7B', // Unique master Xively API key to be used as a default
	//	defaultFeeds	= ['396478290!Scale1'], // Comma separated array of Xively Feed ID numbers 396478290!Scale1
	
		applicationName	= 'iBees', // Replaces Xively logo in the header
		dataDuration	= '1week', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
		dataInterval	= 1000, // Default interval for data to be displayed (in seconds)
	        dataColor		= '0C3C60', // CSS HEX value of color to represent data (omit leading #)
		hideForm		= 1; // To hide input form use value of 1, otherwise set to 0
	
	var now = new Date();          //initiating date object
	var then = new Date();
	var updated = new Date;	
	var diff = null;
	var deviceVolt = [0,0,0,0,0];
	var curVolt;

// Function Declarations

	// URL Parameters
	function getParam(key) {
	 	var value = location.hash.match(new RegExp(key+'=([^&]*)'));
		if(value) {
			return value[1];
		} else {
			return "";
		}
	}

	// Graph Annotations
	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(seriesData[2][seriesData[2].length-1].x, messages.shift());
		}
	}

	// Add One (1) Day to Date Object
	Date.prototype.addDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t + (d * 86400000);
			this.setTime(t);
		}
	};

	// Subtract One (1) Day to Date Object
	Date.prototype.subtractDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t - (d * 86400000);
			this.setTime(t);
		}
	};

	// Parse Xively ISO Date Format to Date Object
	Date.prototype.parseISO = function(iso){
		var stamp= Date.parse(iso);
		if(!stamp) throw iso +' Unknown date format';
		return new Date(stamp);
	}

	// Set xively API Key
	function setApiKey(key) {
		xively.setKey(key);
	}

	function updateFeeds(feedId, datastreamIds, duration, interval) {
		xively.feed.get(feedId, function(feedData) {            //put xively data in feedData
			if(feedData.datastreams) {
				if(datastreamIds == '' || !datastreamIds) {          //if no datastreamId specified
					feedData.datastreams.forEach(function(datastream) {
						datastreamIds += datastream.id + " ";       // eg. S1
					});
				}
				feedData.datastreams.forEach(function(datastream) {      //for each datastream
				
					updated = updated.parseISO(datastream.at);
					if(duration == '1day')  {
						diff = 86400000;
						dataDuration = '1day';
						dataInterval = '60';
					}
					if(duration == '1week') {
						diff = 604800000;
						dataDuration = '1week';
						dataInterval = '900';
					}
					if(duration == '1month') {
						diff = 2628000000;
						dataDuration = '1month';
						dataInterval = '1800';
					}
					if(duration == '90days')  {
						diff = 7884000000;
						dataDuration = '90days';
						dataInterval = '10800';
					}
					if(duration == '1year')  {
						diff = 31536000000;
						dataDuration = '1year';
						dataInterval = '43200';
					}

//				
					then.setTime(now.getTime() - diff);          //eg date of 1 week ago
					if(updated.getTime() > then.getTime()) {         //last updated data less than 1 week ago
					
					        if (datastream.id == 'B0') deviceVolt[0] = datastream.current_value;
					        if (datastream.id == 'B1') deviceVolt[1] = datastream.current_value;
					        if (datastream.id == 'B2') deviceVolt[2] = datastream.current_value;
					      	if (datastream.id == 'B3') deviceVolt[3] = datastream.current_value;
						if (datastream.id == 'B4') deviceVolt[4] = datastream.current_value;
						if (datastream.id == 'B5') deviceVolt[5] = datastream.current_value;
					
						if(datastreamIds && datastreamIds != '' && datastreamIds.indexOf(datastream.id) >= 0) {      //correct datastream identified
							xively.datastream.history(feedId, datastream.id, {start: then.toISOString(), duration : duration, interval: interval, limit: 1000}, function(datastreamData) {       //werkt
								var series = [];
								var points = [];

								// Create Datastream UI
								$('.datastream-' + datastream.id).empty();
								$('.datastream-' + datastream.id).remove();
								$('#feed-' + feedId + ' .datastream.hidden').clone().appendTo('#feed-' + feedId + ' .datastreams').addClass('datastream-' + datastream.id).removeClass('hidden');
			
								if (datastream.id == 'S1' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Scale 1');
									curVolt = deviceVolt[1];
								}
								if (datastream.id == 'S2' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Scale 2');
									curVolt = deviceVolt[2];
								}
								if (datastream.id == 'S3' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Scale 3');
									curVolt = deviceVolt[3];
								}
								if (datastream.id == 'S4' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Scale 4');
									curVolt = deviceVolt[4];
								}
								if (datastream.id == 'S5' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Scale 5');
									curVolt = deviceVolt[5];
								}
								if (datastream.id == 'T' ) {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html('Temperature');
									curVolt = deviceVolt[0];
								}
								// Fill Datastream UI with Data
								//$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-name').html(datastream.id);
						
								//display volt
								$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-volt').html(curVolt + 'v');
								
							 	// display current value and unit
								$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-value').html(datastream.current_value);

								// Include Datastream Unit (If Available)  eg kg or C
								if(datastream.unit) {
									if(datastream.unit.symbol) {
										$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-value').html(datastream.current_value + datastream.unit.symbol);
									} else {
										$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-value').html(datastream.current_value);
									}
								} else {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .datastream-value').html(datastream.current_value);
								}
							
								$('.datastream-' + datastream.id).removeClass('hidden');
							

								// Historical Datapoints
								if(datastreamData.datapoints) {
									
									var minValue = Number.MAX_VALUE;
									var maxValue = Number.MIN_VALUE;

									// Add Each Datapoint to Array
									datastreamData.datapoints.forEach(function(datapoint) {
										if (datapoint.value != 0) {             //exclude zero readings
											points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
											minValue = Math.min(minValue,datapoint.value);
											maxValue = Math.max(maxValue,datapoint.value);	
										}
									});

									// Add Datapoints Array to Graph Series Array
									series.push({
										name: datastream.id,          //eg scale1
										data: points,
										color: '#' + dataColor
									});

									// Initialize Graph DOM Element
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .graph').attr('id', 'graph-' + feedId + '-' + datastream.id);

						 			// Build Graph
									var graph = new Rickshaw.Graph( {
										element: document.querySelector('#graph-' + feedId + '-' + datastream.id),
										width: 800,
										height: 400,
										renderer: 'line',
										min: minValue - 0.25*(maxValue - minValue),
										max: maxValue + 0.25*(maxValue - minValue),
										padding: {
											top: 0.02,
											right: 0.02,
											bottom: 0.02,
											left: 0.02
										},
										series: series
									});

									graph.render();

									var ticksTreatment = 'glow';

									// Define and Render X Axis (Time Values)
									var xAxis = new Rickshaw.Graph.Axis.Time( {
										graph: graph,
										ticksTreatment: ticksTreatment
									});
									xAxis.render();

									// Define and Render Y Axis (Datastream Values)
									var yAxis = new Rickshaw.Graph.Axis.Y( {
										graph: graph,
										tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
										ticksTreatment: ticksTreatment
									});
									yAxis.render();

									// Enable Datapoint Hover Values
									var hoverDetail = new Rickshaw.Graph.HoverDetail({
										graph: graph,
										formatter: function(series, x, y) {
											var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
											var content = swatch + "&nbsp;&nbsp;" + parseFloat(y) + '&nbsp;&nbsp;<br>';
											return content;
										}
									});

									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .slider').prop('id', 'slider-' + feedId + '-' + datastream.id);
									var slider = new Rickshaw.Graph.RangeSlider({
	            	   					graph: graph,
	        	       					element: $('#slider-' + feedId + '-' + datastream.id)
	               					});
								} else {
									$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .graphWrapper').addClass('hidden');
								}
							});
						} else {
							console.log('Datastream not requested! (' + datastream.id + ')');
						}
					} else {
						$('#feed-' + feedId + ' .datastreams .datastream-' + datastream.id + ' .graphWrapper').html('<div class="alert alert-box no-info">Sorry, this datastream does not have any associated data.</div>');
					}
				});
			}
			$('#loadingData').foundation('reveal', 'close');
		});
	}

	function setFeeds(feeds) {
		$('#welcome').addClass('hidden');
		feeds.forEach(function(id) {               //id means feeds array element (eg 189274932!Scale1 )

			var thisFeedId, thisFeedDatastreams;
			if(id.indexOf('!') > 0) {
				thisFeedId = id.substring(0, id.indexOf('!'));
				thisFeedDatastreams = id.substring(id.indexOf('!')+1).split('!');
			} else {
				thisFeedId = id;
			}
			id = thisFeedId;             //id = 123413435
			if($('#feed-' + id)) {
				$('#feed-' + id).remove();
			}
			
		
			xively.feed.history(id, {  duration: "6hours", interval: 30 }, function (data) {       //puts history in data
				if(data.id == id) {                 //correct response from server
					// Duplicate Example to Build Feed UI
					$('#exampleFeed').clone().appendTo('#feeds').attr('id', 'feed-' + id).removeClass('hidden');

					// ID
					$('#feed-' + data.id + ' .title .value').html(data.title);

					// Title
					$('#feed-' + data.id + ' .id .value').html(data.id);

					// Date Updated
					$('#feed-' + data.id + ' .updated .value').html(data.updated);

		
					$('#feed-' + data.id + ' .device-scale1').click(function() {
						defaultFeeds = [data.id + '!S1'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams,  duration, 900);
						//updateFeeds('511269866', '511269866!S1', dataDuration, dataInterval);
						return false;
					});
					$('#feed-' + data.id + ' .device-scale2').click(function() {
						defaultFeeds = [data.id + '!S2'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						//updateFeeds('511269866', 'S2', duration, 900);
						updateFeeds(data.id, thisFeedDatastreams, duration, 900);
						return false;
					});
					$('#feed-' + data.id + ' .device-scale3').click(function() {
						defaultFeeds = [data.id + '!S3'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams,  duration, 900);
						return false;
					});
					$('#feed-' + data.id + ' .device-scale4').click(function() {
						defaultFeeds = [data.id + '!S4'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						window.alert(data.id);
						window.alert(thisFeedDatastreams);
						updateFeeds(data.id, thisFeedDatastreams,  duration, 900);
						return false;
					});
					$('#feed-' + data.id + ' .device-scale5').click(function() {
						defaultFeeds = [data.id + '!S5'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams,  duration, 900);
						return false;
					});
					$('#feed-' + data.id + ' .device-hub').click(function() {
						defaultFeeds = [data.id + '!T'];
					 	feeds = defaultFeeds;
						setFeeds(feeds);
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, duration, 900);
						return false;
					});

					$('#feed-' + data.id + ' .duration-day').click(function() {               
						$('#loadingData').foundation('reveal', 'open');	
						updateFeeds(data.id, thisFeedDatastreams, '1day', 60);		//data.id = 12423552, thisfeedata = scale1
						return false;
					});

					$('#feed-' + data.id + ' .duration-week').click(function() {
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, '1week', 900);  //1week 900
						return false;
					});

					$('#feed-' + data.id + ' .duration-month').click(function() {
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, '1month', 1800);
						return false;
					});

					$('#feed-' + data.id + ' .duration-90').click(function() {
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, '90days', 10800);
						return false;
					});

					$('#feed-' + data.id + ' .duration-year').click(function() {
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, '1year', 43200);
						return false;
					});

					$('#feed-' + data.id + ' .duration-earlier').click(function() {
						var t = now.getTime();
						t = t - diff;
						now.setTime(t);
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, dataDuration, dataInterval);
						return false;
					});
					
					$('#feed-' + data.id + ' .duration-later').click(function() {
						var t = now.getTime();
						t = t + diff;
						now.setTime(t);
						if(updated.getTime() < now.getTime()) now.setTime(updated.getTime()); 
						$('#loadingData').foundation('reveal', 'open');
						updateFeeds(data.id, thisFeedDatastreams, dataDuration, dataInterval);
						return false;
					});
			/*		
					$('#feed-' + data.id + ' .duration-csv').click(function() {
						var urlP1 = 'http://api.xively.com/v2/feeds/';
						var urlP2 = '511269866';
						var urlP3 = '/datastreams/';
						var urlP4 = thisFeedDatastreams;
						var urlP5 = '.csv?start=';
						var urlP6 = then.toISOString();
						var urlP7 = '+1&duration=';
						var urlP8 = dataDuration;
						var urlP9 = '&interval=';
						var urlP10 = dataInterval;
						var urlP11 = '&timezone=1&per_page=1000&page=1';
						var url = urlP1.concat(urlP2,urlP3,urlP4,urlP5,urlP6,urlP7,urlP8,urlP9,urlP10,urlP11);					
						var win = window.open(url, '_blank');
  						win.focus();
						return false;
					});
			*/	
					
					// Handle Datastreams
					if(dataDuration != '' && dataInterval != 0) {
						updateFeeds(data.id, thisFeedDatastreams, dataDuration, dataInterval);
					} else {
						updateFeeds(data.id, thisFeedDatastreams, '6hours', 30);
					}
				} else {
					// Duplicate Example to Build Feed UI
					$('#exampleFeedNotFound').clone().appendTo('#feeds').attr('id', 'feed-' + id).removeClass('hidden');
					$('#feed-' + id + ' h2').html(id);
				}
			});
		});
	}
	

// END Function Declarations

// BEGIN Initialization
	if(hideForm == 1) {
		$('#form').hide();
	}

	var today = new Date();
	var yesterday = new Date(today.getTime()-1000*60*60*24*1);
	var lastWeek = new Date(today.getTime()-1000*60*60*24*7);

	var key = getParam('key');       //checks url for key
	var feedString = getParam('feeds');      //checks url for feed

	// Check for Default Values
	if(key == '' && defaultKey != '') {      //if no url key looks at default key
		key = defaultKey;
	}

	if(feedString == '' && defaultFeeds.toString(',') != '') {          //if no url feedstring look for default feedstring
		feedString = defaultFeeds.toString(',');
	}


/*	if(applicationName != '') {
		$('h1').html(applicationName).css('color', 'white');
		document.title = applicationName + ' - Powered by Xively';
	}
*/
	if(dataColor == '') {
		dataColor = '0A1922';
	}

	var feeds = feedString.split(',');          //converts string into an array of elements eg [18398080!Scale1,...]

	$('#apiKeyInput').val(key);                 //checks input field
	$('#feedsInput').val(feedString);           //checks input field

	$("#apiKeyInput").mouseover(function() {
		console.log($("#apiKeyInput").prop('disabled'));
		if($("#apiKeyInput").prop('disabled')) {
			$("#apiKeyInput").prop('disabled', false);
		}
	});

	if(key != '' && feedString != '') {            //set apikey and feeds from imputs
		setApiKey($('#apiKeyInput').val());
		feeds = $('#feedsInput').val().replace(/\s+/g, '').split(',');
		setFeeds(feeds);
	}

	if(key != '') {
		$("#apiKeyInput").prop('disabled', true);
	}

	$('#apiKeyInput').change(function() {
		if($('#apiKeyInput').val() == '') {
			$('#welcome').addClass('hidden');
			$('#invalidApiKey').removeClass('hidden');
			$('#validApiKey').addClass('hidden');
		} else {
			xively.setKey($('#apiKeyInput').val());
			xively.feed.get(61916, function(data) {
				if(data.id == 61916) {
					$("#apiKeyInput").prop('disabled', true);
					$('#welcome').addClass('hidden');
					$('#validApiKey').removeClass('hidden');
					$('#invalidApiKey').addClass('hidden');
				} else {
					$('#welcome').addClass('hidden');
					$('#validApiKey').addClass('hidden');
					$('#invalidApiKey').removeClass('hidden');
				}
			});
		}
		return false;
	});

/*	$('#setFeeds').click(function() {                 //opens new url with key and feeds
		setApiKey($('#apiKeyInput').val());
		feeds = $('#feedsInput').val().replace(/\s+/g, '').split(',');
		window.location = './index.html#key=' + $('#apiKeyInput').val() + '&feeds=' + $('#feedsInput').val();
		return false;
	});
*/	
					
	
// END Initialization

})( jQuery );
