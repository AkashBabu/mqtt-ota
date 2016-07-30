var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var getKeys = require('recursively-keys');
var event = new EventEmitter();






var mqttObj = {};
var mqttOta = {};

var allowedKeys = ['broker', 'brokerUsername', 'brokerPassword', 'ota', 'otaTopic', 'statusTopic', 'file'];

var _isSubSet = function(arr1, arr2){
	return (arr1.every(function(val){
		return arr2.indexOf(val) >= 0;
	}));
}


var _verifyConfigFile = function(config){
	var keys = getKeys(config, {recursive : true});
	if(!(_isSubSet(keys, allowedKeys))){
		throw new Error('Unknown Key present in Config file provided');
	}
}

var _getConfigurations = function(config){
	_verifyConfigFile(config);
	if(config.broker){
		mqttObj.broker = config.broker;
		mqttObj.subTopics = [];
		mqttObj.otaTopicAndFile = {};
		if(config.brokerUsername && config.brokerPassword){
			mqttObj.brokerUsername = config.brokerUsername;
			mqttObj.brokerPassword = config.brokerPassword;
		}
		if(config.ota){
			if(config.ota.constructor == Array){
				config.ota.forEach(function(eachOta){
					if(eachOta.otaTopic && eachOta.file){
						mqttObj.subTopics.push(eachOta.otaTopic);
						mqttObj.otaTopicAndFile[eachOta.otaTopic] = {
							file : eachOta.file
						}
						if(eachOta.statusTopic){
							mqttObj.otaTopicAndFile[eachOta.otaTopic].statusTopic = eachOta.statusTopic;
						}
					}else{
						if(!eachOta.otaTopic){
							throw new Error('otaTopic not provided for file :' + eachOta.file);
						}else{
							throw new Error('File not provided for otaTopic :' + eachOta.otaTopic);
						}
					}
				})
			}else if(config.ota.constructor == Object){
				if(config.ota.otaTopic && config.ota.file){
					mqttObj.subTopics.push(config.ota.otaTopic);
					mqttObj.otaTopicAndFile[config.ota.otaTopic] = {
						file : config.ota.file
					}
					if(config.ota.statusTopic){
						mqttObj.otaTopicAndFile[config.ota.otaTopic].statusTopic = config.ota.statusTopic;
					}
				}else{
					if(!config.ota.otaTopic){
						throw new Error('otaTopic not provided for file :' + config.ota.file);
					}else{
						throw new Error('File not provided for otaTopic :' + config.ota.otaTopic);
					}
				}
			}
		}else{
			throw new Error('No File specified for Ota update in config file');
		}
	}else{
		throw new Error('Broker not specified in config file');
	}

	// console.log('Completed getting configFile parameters');
}


mqttOta._configFile = function(file){
	var fs = require('fs');
	var data = (fs.readFileSync(file, 'utf8'));

	var config;
	try{
		config = JSON.parse(data);
	}catch(err){
		throw new Error(err + ' in config file');
	}
	_getConfigurations(config);
}


//Mqtt Application
/////////////////////////////////////////////////////////////////implement event emitter////////////////////////


mqttOta._start = function(){
	var hostPort = mqttObj.broker.match(/[://]([a-z0-9]*):([0-9]{4})/)
	var mqttOptions = {
		host : hostPort[1],
		port : hostPort[2]
	}
	
	if(mqttObj.brokerUsername && mqttObj.brokerPassword){
		mqttOptions.username = mqttObj.brokerUsername;
		mqttOptions.password = mqttObj.brokerPassword;
	}
	var client = mqtt.connect(mqttOptions);

	client.on('connect', function(connack){
		event.emit('connected');
		mqttObj.subTopics.forEach(function(subTopic){
			client.subscribe(subTopic);
		});
	});

	// client.on('reconnect', function(){
	// 	// clientConnected = false;
	// 	// console.log('Retrying connection to broker');
	// });

	client.on('message', function(topic, message, payload){
		if(mqttObj.otaTopicAndFile[topic].statusTopic){
			client.publish(mqttObj.otaTopicAndFile[topic].statusTopic, 'Ack');
		}
		var ota = {};
		ota.topic = topic;
		ota.message = message;
		ota.file = mqttObj.otaTopicAndFile[topic].file;
		event.emit('otaData', ota);

		var fs = require('fs');
		fs.writeFile(mqttObj.otaTopicAndFile[topic].file, new Buffer(message).toString(), function(err){
			if(!err){ 	
				// ota.error = err;
				event.emit('otaUpdate', ota);

				if(mqttObj.otaTopicAndFile[topic].statusTopic)
					client.publish(mqttObj.otaTopicAndFile[topic].statusTopic, mqttObj.otaTopicAndFile[topic].file + ' updated successfully');
			}else{
				event.emit('error', err);

				if(mqttObj.otaTopicAndFile[topic].statusTopic)
					client.publish(mqttObj.otaTopicAndFile[topic].statusTopic, 'Error occurred while updating file :' + mqttObj.otaTopicAndFile[topic].file + ', err:' + err);
			}
		})
	});

	// client.on('offline' , function(){
	// 	// clientConnected = false;
	// })

	// client.on('close', function(){
	// 	// clientConnected = false;
	// })
}



// Exports

mqttOta.begin = function(configFile){
	if(!configFile){
		throw new Error('Provide Config file in mqttOta.begin(configFile)');	
	}
	
	mqttOta._configFile(configFile)
	mqttOta._start(); 
	// console.log('mqtt :' + JSON.stringify(mqttObj));
	// console.log('Completed');
};


module.exports = {
	mqttOta : mqttOta,
	event : event
};