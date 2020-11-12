const {fromObject} = require("@nativescript/core")
const httpModule = require("tns-core-modules/http");
var appSettings = require("tns-core-modules/application-settings");


const obj = fromObject({
    username:'abelnevar3',
    pwd:'mad23241',
    years:'',
    mostrar:false,
    
})

var page;
var indexSelected;
var results=[];
var items = [];

export function loaded(args) {
    obj.set('mostrar',false)
    page = args.object;  
    page.bindingContext = obj
    appSettings.remove("nombreNegocio")
    appSettings.remove("idNegocio")
    items = []

    
}

export function onListPickerLoaded(fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        indexSelected = picker.selectedIndex;
        console.log(`index: ${picker.selectedIndex}; item" ${items[picker.selectedIndex]}`);
    });
}



export function onSubmit(){
    // console.log(obj.get('username') + '  ' +obj.get('pwd'))
    
    httpModule.request({
            url: "https://www.covidcinvestav.com/index.php?r=api/loginnegocio",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
            
                  
                    "username" :obj.get('username'),
                    "pwd" : obj.get('pwd')            
            
                })
            }).then((response) => {
                     results = response.content.toJSON();
                    // alert(response.content)
                    // alert(result.length)
                    
                    // appSettings.setString("nombreNegocio", result[0].nombre)
                    results.forEach(negocio => items.push(negocio.calle+" #"+negocio.numero));
                    
                    obj.set('years',items)
                    
                    obj.set('mostrar',true)
                 
                    
                    }).catch((e) => {
                              console.log(e);
                          }) 
                        // items = ['1993','1994','1995','1996']
                        
                    }
                    
                    export function selectNegocio(){
                        
                        // alert(items[indexSelected])
                     appSettings.setString("LoggedIn","Si");
                     appSettings.setString("nombreNegocio", results[indexSelected].nombre)
                     appSettings.setString("idNegocio", (results[indexSelected].idnegocio).toString())

                     const options1 = {
                             moduleName:"views/menu/menu",
                             clearHistory:true
                         }
                         page.frame.navigate(options1);

                         
                    }