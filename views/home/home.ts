// import barcodescannerModule  = require("nativescript-barcodescanner");
import { BarcodeScanner  } from "nativescript-barcodescanner";
let barcodescannerModule = new BarcodeScanner();
const httpModule = require("tns-core-modules/http");
const {fromObject} = require("@nativescript/core");
var appSettings = require("tns-core-modules/application-settings");
var Sqlite = require("nativescript-sqlite");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var fecha = require('fecha');

const obj = fromObject({
    temp: '',
    clave:'no identificado',
    mostrar:false,
    mostrarBtn:false,
    cantidadReg:0

})


var page;
var tempDB;
var temperature;
var codigoCliente;
var viewModel = new Observable();
viewModel.lists = new ObservableArray([]);

export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj;
    
    
    (new Sqlite("temp.db")).then(db => {
        db.execSQL("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, temperatura TEXT, codigo TEXT, fechaVisita DATETIME )").then(id => {
            tempDB = createViewModel(db);
        }, error => {
            console.log("CREATE TABLE ERROR", error);
        });
    }, error => {
        console.log("OPEN DB ERROR", error);
    });
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

export function sincReg(){
    console.log("sincronizando");
    tempDB.enviar();
}

export function onSubmit(){
    temperature = parseFloat(obj.get('temp'));
    codigoCliente = obj.get('clave');

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
            
            obj.set('mostrar',false);
            if(obj.get('cantidadReg')>0){

                obj.set('mostrarBtn',true);
            }
            obj.set('clave','no identificado')
           
        }, (e) => {
            console.log(e);
            tempDB.insert();               
            obj.set('mostrarBtn',false);
            obj.set('mostrar',true);
            obj.set('clave','no identificado')   

        });


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


function createViewModel(database) {


    viewModel.insert = function() {
        var date = new Date();
        var fechaVisita = fecha.format(date, 'YYYY-MM-DD HH:mm:ss');
            database.execSQL("INSERT INTO lists (temperatura, codigo, fechaVisita) VALUES (?,?,?)", [temperature.toString(),codigoCliente,fechaVisita]).then(id => {
                this.lists.push({id: id, temperatura: temperature.toString(), codigo:codigoCliente, fecha:fechaVisita});
                alert("insertado "+ this.lists.length);
                obj.set('cantidadReg',this.lists.length);
                // viewModel.enviar();
            }, error => {
                console.log("INSERT ERROR", error);
            });
        
    }
    viewModel.delete = function() {
        
            database.execSQL("DELETE FROM lists").then(() => {
                alert("deleted")
                this.lists.length = 0;
                obj.set('cantidadReg',this.lists.length);
                obj.set('mostrarBtn',false);
            }, error => {
                console.log("INSERT ERROR", error);
            });
        
    }
   
    

    viewModel.enviar = function() {
        this.lists = new ObservableArray([]);
        database.all("SELECT id, temperatura, codigo, fechaVisita FROM lists").then(rows => {
            for(var row in rows) {
                console.log(rows[row]);
                this.lists.push({id: rows[row][0], temperatura: rows[row][1], codigo: rows[row][2], fecha:rows[row][3]});
            }

            // this.lists.forEach(element => console.log(element.temperatura));
            this.lists.forEach(element => {

                 httpModule.request({
                    url: "https://www.covidcinvestav.com/index.php?r=api/checkin",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        "Visita":
                        {
                            "codigoindividuo":element.codigo,
                            "idnegocio":appSettings.getString("idNegocio","vacio"),
                            "fechavisita":element.fecha,
                            "temperatura":element.temperatura
                        },
                        "LoginForm":
                        {
                            "username":"negocio",
                            "password":"jvW13%b2020"
                        }
                    })
                }).then((response) => {
                        
                }, (e) => {
                            
                });

            });

            tempDB.delete();

    
        }).catch(()=>{
            console.log("Error al eliminar registros");
        });
    }
    viewModel.select = function() {
        this.lists = new ObservableArray([]);
        database.all("SELECT id, temperatura FROM lists").then(rows => {
            for(var row in rows) {
                this.lists.push({id: rows[row][0], temperatura: rows[row][1]});
            }

            // this.lists.forEach(element => console.log(element));


        }, error => {
            console.log("SELECT ERROR", error);
        });
    }

    viewModel.select();

    return viewModel;
}

exports.createViewModel = createViewModel;