(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.jsLog = {}));
}(this, (function (exports) { 'use strict';

	var messages = [];
	var filter = "";
	var Handlers = {};

	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1)
	};

	function printdiv(printpage) {
	    var headstr = "<html><head><title>jsLOG</title></head><body>";
	    var footstr = "</body>";
	    var newstr = document.all.item(printpage).innerHTML;
	    var oldstr = document.body.innerHTML;
	    document.body.innerHTML = headstr + newstr + footstr;
	    window.print();
	    document.body.innerHTML = oldstr;
	    return false;
	}

	function CopyToClipboard(containerid) {
	  if (document.selection) {
	    var range = document.body.createTextRange();
	    range.moveToElementText(document.getElementById(containerid));
	    range.select().createTextRange();
	    document.execCommand("copy");
	  } else if (window.getSelection) {
	    var range = document.createRange();
	    range.selectNode(document.getElementById(containerid));
	    window.getSelection().addRange(range);
	    document.execCommand("copy");
	    alert("Logs has been copied to Clipboard");
	  }
	}
		
	function uuidv4() {
	  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}

	 	
	function checkContainer(){
		var el = document.getElementById('jsLogContainer');
		return el;
	}
		
	function createContainer(){
		var elem = document.createElement('div');
		elem.id = "jsLogContainer";
		elem.style.cssText = "position: fixed;bottom: 0;width: 100%;background-color:black;height:150px;left-align:0;";
		
		var header = document.createElement('div');
		header.style.cssText = "width:100%; border-bottom: 1px solid yellow;color:yellow;height:30px;";
		
		var header_title = document.createElement('div');
		header_title.innerHTML = "<b>>> jsLOG :</b>";
		header_title.style.cssText = "width:60%; float:left;";
		header.appendChild(header_title);
		
		var header_buttons = document.createElement('div');
		header_buttons.style.cssText = "width:30%;float:right;color:yellow;";

		var filter_input = document.createElement("input");
	    filter_input.type = "text";
		filter_input.placeholder = "Search";
		filter_input.onkeyup = function(){
			filter = this.value;
			displayAll();
		};
		header_buttons.appendChild(filter_input);
		
		var print_button = document.createElement('button');
		print_button.innerHTML = "&#128438; Print";
		print_button.style.cssText = "margin-left:15px";
		header_buttons.appendChild(print_button);
		print_button.onclick = function(){
			printdiv("JsLogContainerOutput");
		};
		
		var copy_button = document.createElement('button');
		copy_button.innerHTML = "&#128441; Copy";
		copy_button.style.cssText = "margin-left:15px";
		header_buttons.appendChild(copy_button);
		copy_button.onclick = function(){
			CopyToClipboard("JsLogContainerOutput");
		};
		
		
		header_buttons.style.cssText = "margin-top:10px;";
		header.appendChild(header_buttons);
		
		elem.appendChild(header);
		
		var content = document.createElement('div');
		content.style.cssText = "width:100%;color:yellow;height:110px;overflow: scroll;";
		content.id = "JsLogContainerOutput";
		elem.appendChild(content);
		document.body.appendChild(elem);
	}
		
	function init(){
		var test = checkContainer();
		if (test === null){
			createContainer();
		}
	}

	function onNewMessage(f){
		Handlers["onNewMessageFunction"] = f;
	}

	function activateNewMessage(msg){
		if("onNewMessageFunction" in Handlers){
			Handlers["onNewMessageFunction"](msg);
			
		}
	}

	function displayAll(){
		document.getElementById('JsLogContainerOutput').innerHTML = "";
		console.log(filter.length);
		for(var i=0; i< messages.length;i++){
			if((filter.length < 3) || messages[i]["msg"].includes(filter)){
				createDisplay(messages[i]);
			}
			
		}
	}
		
	function createDisplay(msg){
		init();
		var color = "";
		if(msg["type"] == "error"){
			color = "red";
		}else if(msg["type"] == "warning"){
			color = "orange";
		}else {
			color = "green";
		}
		var msgType = "[ "+ msg["type"].capitalize()+ " ]";
			
		var el = document.getElementById('JsLogContainerOutput');
		var currentValue = el.innerHTML;

		if(currentValue == ""){
			 var id = uuidv4();
			 el.innerHTML = msg["date"] + " | " + msg["msg"] + " <font size=\"2\" color=\""+color+"\">"+msgType+"</font>";
			 var details = document.createElement("div");
			 details.id = id;
			 el.appendChild(details);
		}else {
			 var id = uuidv4();
			 el.innerHTML = msg["date"] + " | " + msg["msg"] + " <font size=\"2\" color=\""+color+"\">"+msgType+"</font>" +"<br/>" + currentValue;
			 var details = document.createElement("div");
			 details.id = id;
			 el.appendChild(details);
		}
		}
		
	function printLastMessages(){
		createDisplay(messages[messages.length-1]);
	}
		
	function getCurrentTime(){
		var currentdate = new Date();
		var time =  currentdate.getDay() + "/" + currentdate.getMonth() 
		+ "/" + currentdate.getFullYear() + " @ " 
		+ currentdate.getHours() + ":" 
		+ currentdate.getMinutes() + ":" + currentdate.getSeconds();
		return time;
	}

	function thisLine() {
	  var err = new EvalError('Dummy', 'Dummy.js', 1);
	  var caller_line = err.stack.split("\n");
	  var target = caller_line[caller_line.length-2];
	  var index = target.indexOf("at ");
	  var clean = target.slice(index+2, target.length);
	  return clean;
	}

	function objCheck(msg){
		var line = thisLine();
		if(typeof msg === "string" || typeof msg === "boolean" || typeof msg === "bigint" || typeof msg === "number" || typeof msg === "symbol"){
			return msg + "          [ "+line+" ]";
		}else {
			return JSON.stringify(msg) + "          [ "+line+" ]";
		}
	}	

	function Log(msg){
		var tmp = {
			"id": messages.length+1,
			"date": getCurrentTime(),
			"msg": objCheck(msg),
			"type": "info"
		};
		messages.push(tmp);
		printLastMessages();
		activateNewMessage(tmp);
	}
		
	function Error(msg){
		var tmp = {
			"id": messages.length+1,
			"date": getCurrentTime(),
			"msg": objCheck(msg),
			"type": "error"
		};
		messages.push(tmp);
		printLastMessages();
	    activateNewMessage(tmp);	
	}
		
	function Warning(msg){
		var tmp = {
			"id": messages.length+1,
			"date": getCurrentTime(),
			"msg": objCheck(msg),
			"type": "warning"
		};
		messages.push(tmp);
		printLastMessages();
		activateNewMessage(tmp);
	}

	var onNewMessage_1 = onNewMessage;	
	var Log_1 = Log;
	var _Error = Error;
	var Warning_1 = Warning;

	var main = {
		onNewMessage: onNewMessage_1,
		Log: Log_1,
		Error: _Error,
		Warning: Warning_1
	};

	exports.Error = _Error;
	exports.Log = Log_1;
	exports.Warning = Warning_1;
	exports.default = main;
	exports.onNewMessage = onNewMessage_1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
