var appSettings = require("tns-core-modules/application-settings");
 

var page;
 

export function loaded(args) {
    page = args.object;  
    
    
    page.bindingContext = {      
          
        nombreNegocio:appSettings.getString("nombreNegocio","vacio")
      }
    
    
}


export function goCheckin(args) {
   
  page.frame.navigate("views/home/home");
  
}
export function goLogout() {
  appSettings.setString("LoggedIn","No");
  const options3 = {
    moduleName:"views/login/login",
    clearHistory:true
}
page.frame.navigate(options3);
  
  
}
