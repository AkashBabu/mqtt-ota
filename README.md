




mqtt-ota

======================================================================================

An event driven nodejs library for updating file over the air via mqtt client. 


## Installation

	npm install mqtt-ota --save


## Config File Example
	
	{
		"broker" : "mqtt://localhost:1884",
		"brokerUsername" : "user",
		"brokerPassword" : "password",
		"ota" : [
			{
				"otaTopic" : "/topic1",
				"statusTopic" : "/topic1/status",
				"file" : "/home/aakash/Documents/Nodejs/lib/mqtt-ota/file1.js"
			},
			{
				"otaTopic" : "/topic2",
				"statusTopic" : "/status2",
				"file" : "/home/aakash/Documents/Nodejs/lib/mqtt-ota/file2.js"
			}
		]
	}

	broker (mandatory)-> Mqtt broker to which you wish to connect for ota.
	
	brokerUsername (optional)-> If the mqtt broker to which you wish to connect requires credentials then you may provide this option
	
	brokerPassword (optional)-> If the you provide username then this option becomes mandatory or even username will not be used
	
	ota (mandatory): Atleast 1 object has to be provided
		otaTopic (mandatory)-> Topic on which the new File contents will be sent (Recommend you to use a key in the topic for security);
		statusTopic (optional)-> If you wish to be acknowledged about the updated file, then use this option
		file (mandatory)-> The file that you would like to bind to the topic, i.e, the file which you would like to update on sending the new 
							file contents over the specified topic.


## Functions
	
	var mqttOta = require('mqtt-ota').mqttOta;

	var configFile = '/home/root/mqtt/configFile.json';

	mqttOta.begin(configFile);


## Usage Example

	var mqttOta = require('mqtt-ota').mqttOta;
	var mqttOtaEvent = require('mqtt-ota').event;

	mqttOta.begin('./configFileexample.json');

	mqttOtaEvent.on('connected', function(){
		console.log('Mqtt ota client connected');
	})

	mqttOtaEvent.on('otaData', function(ota){
		console.log('Data :' + JSON.stringify(ota));
	})

	mqttOtaEvent.on('otaUpdate', function(ota){
		console.log('Updated :' + ota.file);
	})

	mqttOtaEvent.on('error', function(err){
		console.log('Error in ota :' + err);
	})


## Contributing
	
	In lieu of a formal styleguide, take care to maintain the existing coding style.
	Add unit tests for any new or changed functionality. Lint and test your code.


## Release History

	* 1.0.0 Initial Release












