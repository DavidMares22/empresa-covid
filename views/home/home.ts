// import barcodescannerModule  = require("nativescript-barcodescanner");
import { BarcodeScanner  } from "nativescript-barcodescanner";
let barcodescannerModule = new BarcodeScanner();
const httpModule = require("tns-core-modules/http");
const {fromObject} = require("@nativescript/core")

const obj = fromObject({
    temp: '',
    clave:''
})

var clave;
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

 
export function onSubmit(){
    // var temperature = parseFloat(obj.get('temp'))
    // if (temperature<35 || temperature>40 || isNaN(temperature) ){
    //     alert('temperatura no valida (35° - 40°)')
    // }else{
    //     alert('Enviado! '+ temperature)

        httpModule.request({
            url: "https://www.covidcinvestav.com/index.php?r=api/checkin",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                "Visita":
                {
                    "codigoindividuo":"$2y$13$iuN17UXMrKHSfROYqCa3fuEfeJ7fmVqCXEY0Dm6VB6uXWipjf5P8y",
                    "idnegocio":"2",
                    "fechavisita":"2020-11-07 12:50:27",
                    "temperatura":"34"
                },
                "LoginForm":
                {
                    "username":"negocio",
                    "password":"jvW13%b2020"
                }
            })
        }).then((response) => {
            // const result = response.content.toJSON();
            alert(response.content)
        }, (e) => {
        });

    // }
    

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