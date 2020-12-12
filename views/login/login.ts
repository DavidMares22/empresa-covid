import { BarcodeScanner } from "nativescript-barcodescanner";
let barcodescannerModule = new BarcodeScanner();
const { fromObject } = require("@nativescript/core")
const httpModule = require("tns-core-modules/http");
var appSettings = require("tns-core-modules/application-settings");
var Dialogs = require("ui/dialogs");

const obj = fromObject({
    codigo: '',
    busy:false

})

var page;
var results;



export function loaded(args) {

    page = args.object;
    page.bindingContext = obj
    appSettings.remove("nombreNegocio")
    appSettings.remove("idNegocio")
    appSettings.remove("calleNegocio")
    appSettings.remove("numeroNegocio")
    appSettings.remove("aforoNegocio")



}

export function requestPermission() {
    return new Promise((resolve, reject) => {
        barcodescannerModule.available().then((available) => {
            if (available) {
                barcodescannerModule.hasCameraPermission().then((granted) => {
                    if (!granted) {
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
export function scanBarcode() {

    requestPermission().then((result) => {
        barcodescannerModule.scan({
            cancelLabel: "Stop scanning",
            message: "Go scan something",
            preferFrontCamera: false,
            showFlipCameraButton: true
        }).then((result) => {
            console.log("Scan format: " + result.format);
            console.log("Scan text:   " + result.text);
            obj.set('codigo', result.text)


        }, (error) => {
            console.log("No scan: " + error);

        });
    }, (error) => {
        console.log("ERROR", error);
    });






}


export function onSubmit() {
    obj.set('busy',true)

    httpModule.request({

        url: "https://www.covidcinvestav.com/index.php?r=api/iniciosesion",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({
            "Negocio":
            {
                "codigo": obj.get('codigo')
                
            },
            "LoginForm":
            {
                "username": "negocio",
                "password": "jvW13%b2020"
            }
        })
    }).then((response) => {
        results = JSON.parse(response.content);
        if (results.status === 404) {
            obj.set('busy',false)
            Dialogs.alert({
                title: "Código no encontrado",
                message: "El código no se encuentra en la base de datos",
                okButtonText: "Ok"
            }).then(function () {
                // console.log("Dialog closed!");
            });
        } else {
            appSettings.setString("LoggedIn", "Si");
            appSettings.setString("nombreNegocio", results.nombre)
            appSettings.setString("calleNegocio", results.calle)
            appSettings.setString("numeroNegocio", results.numero)
            appSettings.setString("idNegocio", (results.idnegocio).toString())
            appSettings.setString("aforoNegocio", (results.aforo).toString())
            obj.set('codigo','')
            obj.set('busy',false)
            cambiarPantall();
            // alert(appSettings.getString("idNegocio"))

        }
    }).catch((e) => {
        console.log(e);
    })

}

function cambiarPantall() {

    const options1 = {
        moduleName: "views/menu/menu",
        clearHistory: true
    }
    page.frame.navigate(options1);


}