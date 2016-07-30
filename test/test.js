








var mqttOta = require('./index.js');
var mqttota = mqttOta.mqttOta;
var mqttOtaEvent = mqttOta.event;

process.on('uncaughtException', function(err){
	console.log('Error : ' + err );
})

mqttota.begin('configFileexample.json');

mqttOtaEvent.on('otaData', function(ota){
	console.log('Data :' + JSON.stringify(ota));
})

mqttOtaEvent.on('error', function(err){
	console.log('Error in ota :' + err);
})

mqttOtaEvent.on('connected', function(){
	console.log('Mqtt ota client connected');
})

mqttOtaEvent.on('otaUpdate', function(ota){
	console.log('Update :' + JSON.stringify(ota));
})



// setInterval(function(){
// 	console.log('Keep Alive'); 
// }, 2000);