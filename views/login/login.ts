const {fromObject} = require("@nativescript/core")
const httpModule = require("tns-core-modules/http");
var appSettings = require("tns-core-modules/application-settings");


const obj = fromObject({
    username:'',
    pwd:'',
    years:'',
})

var page;
 
var items = [];

export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj
    appSettings.remove("nombreNegocio")
    
    
}

export function onListPickerLoaded(fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        console.log(`index: ${picker.selectedIndex}; item" ${items[picker.selectedIndex]}`);
    });
}



export function onSubmit(){
    // console.log(obj.get('username') + '  ' +obj.get('pwd'))

    // httpModule.request({
    //     url: "https://www.covidcinvestav.com/index.php?r=api/loginnegocio",
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     content: JSON.stringify({
            
    //         "username" :"damr18",
    //         "pwd" : "django123"
    //         // "username" :"abelnevar3",
    //         // "pwd" : "mad23241"            

    //     })
    // }).then((response) => {
    //     var result = response.content.toJSON();
    //     // alert(result[0].nombre)
    //     appSettings.setString("LoggedIn","Si");
    //     appSettings.setString("nombreNegocio", result[0].nombre)
    //     const options1 = {
    //         moduleName:"views/menu/menu",
    //         clearHistory:true
    //     }
    //     page.frame.navigate(options1);
        
    // }).catch((e) => {
    //       console.log(e);
    //   }) 
    items = [1993,1994,1995,1996]
    obj.set('years',items)

}