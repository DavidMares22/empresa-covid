var appSettings = require("tns-core-modules/application-settings");
 

var page;
 

export function loaded(args) {
    page = args.object;  
    
    
    page.bindingContext = {      
          
        nombreNegocio:appSettings.getString("nombreNegocio","vacio")
      }
    
    
}
