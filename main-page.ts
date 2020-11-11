var appSettings = require("tns-core-modules/application-settings");

var page

 exports.onNavigatedTo = function(args){
    page = args.object;
 
    
    
 }

exports.onPageLoaded = function(args) {
    
    page = args.object;

    page.actionBarHidden = true;
    var LoggedIn = appSettings.getString("LoggedIn","No")
  
    if(LoggedIn==="Si"){
       const options1 = {
            moduleName:"views/menu/menu",
            clearHistory:true
        }
        page.frame.navigate(options1);
        
    }else{
       const options2 = {
            moduleName:"views/login/login",
            clearHistory:true
        }
        page.frame.navigate(options2);
    
    }
}

