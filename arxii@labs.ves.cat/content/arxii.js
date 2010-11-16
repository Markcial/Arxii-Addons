var Arxii = {
	ctxArea:{},
	user:'',
	password:'',
	loggedIn:false,
	apiUrl:'http://phppr0.com/arxii/test/api.php',
	storeUrlParams:'?action=add&url={url}',
	loginUrlParams:'?action=login&user={user}&pass={pwd}',
	loggedUrlParams:'?action=logged&user={user}&pass={pwd}',
	gid:function(el){
		return document.getElementById(el);
	},
	onLoginLoad:function(){
		this.initialized = true;
		Arxii.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                                 .getService(Components.interfaces.nsIPrefService)
		                                 .getBranch("arxii.");
		Arxii.gid('usuari').value = Arxii.prefs.getCharPref('credentials.username');
		Arxii.gid('password').value = Arxii.prefs.getCharPref('credentials.username');
	},
	onOverlayLoad: function() {
		// initialization code
		this.initialized = true;
		Arxii.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                                 .getService(Components.interfaces.nsIPrefService)
		                                 .getBranch("arxii.");
		Arxii.user = Arxii.prefs.getCharPref('credentials.username');
		Arxii.password = Arxii.prefs.getCharPref('credentials.username');
		Arxii.doLogin();
		Arxii.ctxArea = Arxii.gid("contentAreaContextMenu");
		Arxii.ctxArea?Arxii.ctxArea.addEventListener("popupshowing", Arxii.onPopupMenu, false):false;
	},
	storeCredentials:function(){
		Arxii.user = Arxii.gid('usuari').value;
		Arxii.password = Arxii.gid('password').value;
		
		Arxii.prefs.setCharPref("credentials.username", Arxii.user);
		Arxii.prefs.setCharPref("credentials.password", Arxii.user);
		Arxii.doLogin();
		// do whatever you need to the created file  
		window.close();
	},
	onLoggedCheckSuccess:function(data){
		if(data == 1){
			Arxii.loggedIn = true;
		}
	},
	onLoggedCheckFailure:function(data){
		
	},
	onLoginSuccess:function(data){
		if(data == 1){
			Arxii.loggedIn = true;
		}
	},
	onLoginFailure:function(data){
		
	},
	doLogin:function( callback ){
		var url = Arxii.apiUrl + Arxii.loginUrlParams.replace('{user}',Arxii.user).replace('{pwd}',Arxii.password);
		var cb = Arxii.onLoginSuccess;
		if( typeof(callback) == 'function')cb = callback;
		Arxii.xhrGet(url, cb );
	},
	checkIsLogged:function( callback ){
		var url = Arxii.apiUrl + Arxii.loggedUrlParams.replace('{user}',Arxii.user).replace('{pwd}',Arxii.password);
		var cb = Arxii.onLoggedCheckSuccess;
		if( typeof(callback) == 'function')cb = callback;
		Arxii.xhrGet(url, cb );
	},
	getUrl:function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService(Components.interfaces.nsIWindowMediator);
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		return recentWindow ? recentWindow.content.document.location : null;		
	},
	xhrGet:function(url,callbacksuccess,callbackerror){
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.onreadystatechange = function(){
			if ( req.readyState == 4 ) {
				if ( req.status == 200 ) {
					var Ci = Components.interfaces;
					var Cc = Components.classes;
					var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
					var data = "";
					if(req.responseText != "" )data = nativeJSON.decode(req.responseText);
					if( typeof(callbacksuccess) == 'function' ){
						callbacksuccess(data);
					}
				} else {
					if( typeof(callbackerror) == 'function' ){
						callbackerror(data);
					}
				}
			}
		}
		req.send(null);
	},
	storeUrl: function(url){
		var destUrl = Arxii.apiUrl + Arxii.storeUrlParams.replace('{url}', encodeURIComponent(url));
		var cbSuccess = function(data){
			Firebug.Console.log(data);
		}
		var cbError = function(data){
			Firebug.Console.log(data);
		}
		Arxii.xhrGet(destUrl,cbSuccess,cbError);
	},
	onPopupMenu:function(){
		var elem = document.getElementById("ArxiiMenuItem");
		if(gContextMenu.linkURL != "" ){
			elem.setAttribute("label", "Arxii url de destí!");
			elem.setAttribute("oncommand","Arxii.onStoreDestinationUrl()");
		}else{
			elem.setAttribute("label", "Arxii actual!");
			elem.setAttribute("oncommand","Arxii.onStoreCurrentUrl()");
		}
	},
	onStoreDestinationUrl:function(){
		if(Arxii.loggedIn){
			var target = gContextMenu.link; 
			var uri = target.href;
			Arxii.storeUrl(uri);
		}else{
			Arxii.credentialsForm();
		}
	},
	onStoreCurrentUrl: function() {
		if(Arxii.loggedIn){
			var uri = Arxii.getUrl();
			Arxii.storeUrl(uri);
		}else{
			Arxii.credentialsForm();
		}
	},
	credentialsForm:function(){
		window.open("chrome://arxii/content/login.xul", "", "chrome");
	}
};