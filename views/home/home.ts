// import barcodescannerModule  = require("nativescript-barcodescanner");
import { BarcodeScanner  } from "nativescript-barcodescanner";
let barcodescannerModule = new BarcodeScanner();
const httpModule = require("tns-core-modules/http");
const {fromObject} = require("@nativescript/core");
var appSettings = require("tns-core-modules/application-settings");
var Sqlite = require("nativescript-sqlite");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

const obj = fromObject({
    temp: '',
    clave:'no identificado',

})


var page;



export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj
    
    
     

   
}

export function requestPermission() {
    return new Promise((resolve, reject) => {
        barcodescannerModule.available().then((available) => {
            if(available) {
                barcodescannerModule.hasCameraPermission().then((granted) => {
                    if(!granted) {
                        barcodescannerModule.requestCameraPermission().then(() => {
                            resolve("Camera permission granted");
                        });
                    } else {
                        resolve("Camera permission was already granted");
                    }
                });
            } else {
                reject("This device does not have an available camera");
            }
        });
    });
}

export function backHome(){    
    page.frame.goBack()
}
 
export function onSubmit(){
    var temperature = parseFloat(obj.get('temp'))
    var codigoCliente = obj.get('clave')

    if (temperature<35 || temperature>40 || isNaN(temperature) ){
        alert('temperatura no valida (35° - 40°)')
    }else{
        

        httpModule.request({
            url: "https://www.covidcinvestav.com/index.php?r=api/checkin",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                "Visita":
                {
                    "codigoindividuo":codigoCliente,
                    "idnegocio":appSettings.getString("idNegocio","vacio"),
                    "fechavisita":"",
                    "temperatura":temperature.toString()
                },
                "LoginForm":
                {
                    "username":"negocio",
                    "password":"jvW13%b2020"
                }
            })
        }).then((response) => {
            // const result = response.content.toJSON();
            
            alert('Enviado! '+ temperature + codigoCliente+ response.content)
           
        }, (e) => {
            // alert(e);
       
            (new Sqlite("temp.db")).then(db => {
                db.execSQL("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, temperatura TEXT)").then(id => {
                    
                    db.execSQL("INSERT INTO lists (temperatura) VALUES (?)", temperature.toString()).then(id => {
                        alert('insertado!'+ id)
                    }, error => {
                        console.log("INSERT ERROR", error);
                    });

                }, error => {
                    console.log("CREATE TABLE ERROR", error);
                });
            }, error => {
                console.log("OPEN DB ERROR", error);
            });    



        });

        obj.set('clave','no identificado')

    }
    

}

export function scanBarcode() {
    //  clave = new Promise((resolve,reject) =>{
        requestPermission().then((result) => {
            barcodescannerModule.scan({
                   cancelLabel: "Stop scanning",
                   message: "Go scan something",
                   preferFrontCamera: false,
                   showFlipCameraButton: true
               }).then((result) => {
                   console.log("Scan format: " + result.format);
                   console.log("Scan text:   " + result.text);                                      
                   obj.set('clave',result.text)
                //    page.bindingContext = {      
                //     clave:result.text       
                //   }
                
                //    resolve(result.text)

               }, (error) => {
                   console.log("No scan: " + error);
                //    reject(error)
               });
           }, (error) => {
               console.log("ERROR", error);
            //    reject(error)
           });
    // })

  
   
 

 
}


