const {fromObject} = require("@nativescript/core")
const httpModule = require("tns-core-modules/http");
var appSettings = require("tns-core-modules/application-settings");

const obj = fromObject({
    username:'',
    pwd:'',

})

var page;
 

export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj
    appSettings.remove("nombreNegocio")
    
    
}


export function onSubmit(){
    // console.log(obj.get('username') + '  ' +obj.get('pwd'))

    httpModule.request({
        url: "https://www.covidcinvestav.com/index.php?r=api/loginnegocio",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({
            
            "username" :"damr18",
            "pwd" : "django123"
            // "username" :"abelnevar3",
            // "pwd" : "mad23241"            

        })
    }).then((response) => {
        var result = response.content.toJSON();
        // alert(result[0].nombre)
        appSettings.setString("LoggedIn","Si");
        appSettings.setString("nombreNegocio", result[0].nombre)
        const options1 = {
            moduleName:"views/menu/menu",
            clearHistory:true
        }
        page.frame.navigate(options1);
        
    }).catch((e) => {
          console.log(e);
      }) 


}