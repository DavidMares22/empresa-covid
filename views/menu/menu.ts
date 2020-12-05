var appSettings = require("tns-core-modules/application-settings");
 

var page;


export function loaded(args) {
    page = args.object;  
    
    page.bindingContext = {      
          
        nombreNegocio:appSettings.getString("nombreNegocio","vacio") +" - "+appSettings.getString("calleNegocio","vacio")+" #"+appSettings.getString("numeroNegocio","vacio"),
        
      }
    // console.log(appSettings.getString("idNegocio"))
    
}


export function goCheckin(args) {
   
  page.frame.navigate("views/home/home");
  
}
export function goHistorial() {
   
  console.log("hola");
  
}
export function goLogout() {
  appSettings.setString("LoggedIn","No");
  const options3 = {
    moduleName:"views/login/login",
    clearHistory:true
}
page.frame.navigate(options3);
  
  
}
