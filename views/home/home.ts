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
var Dialogs = require("ui/dialogs");

const obj = fromObject({
    temp: '',
    clave:'no identificado',
    mostrar:false,
    mostrarBtn:false,
    mostrarMsj:false,
    cantidadReg:0,
    txtBtn:'',
    afluBanner:'',
    afluColor:'',
    afluMax:0,
    afluCounter:0,
    busy:false,
    mostrarCheck:false,

})
// red #ffcccb
// green #90ee90
// yellow #fffcbb

var page;
var tempDB;
var temperature;
var codigoCliente;
var viewModel = new Observable();
viewModel.lists = new ObservableArray([]);
viewModel.afluencia = new ObservableArray([]);

export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj;
    
    obj.set('afluBanner', obj.get('afluCounter') + ' / ' +appSettings.getString("aforoNegocio"));
    obj.set('afluMax', parseInt(appSettings.getString("aforoNegocio")));
    
    
    // obj.set('mostrarMsj',false);

    (new Sqlite("temp.db")).then(db => {
        db.execSQL("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, temperatura TEXT, codigo TEXT, fechaVisita DATETIME )").then(id => {
            tempDB = createViewModel(db);
        }, error => {
            console.log("CREATE TABLE ERROR", error);
        });
     
    }, error => {
        console.log("OPEN DB ERROR", error);
    });

    // if(obj.get('afluCounter')>=(obj.get('afluMax'))){
    //     obj.set('afluColor','#ffcccb');
    //     obj.set('mostrarMsj',true);
    // }else if(obj.get('afluCounter')>(obj.get('afluMax')*.7)){
    //     obj.set('afluColor','#fffcbb');
    //     obj.set('mostrarMsj',false);
    // }else{
    //     obj.set('afluColor', '#90ee90');
    //     obj.set('mostrarMsj',false);
    // }
    
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
    // obj.set('afluCounter', 0); 
    page.frame.goBack()
}

export function sincReg(){
    console.log("sincronizando");
    tempDB.enviar();
}

export function onSubmit(){
    
    temperature = parseFloat(obj.get('temp'));
    codigoCliente = obj.get('clave');
    
    obj.set('mostrarCheck',false);
    if (temperature<35 || temperature>40 || isNaN(temperature) ){
        Dialogs.alert({
            title: "Error",
            message: "Temperatura no valida (35° - 40°): ",
            okButtonText: "Ok"
        }).then(function () {
            // console.log("Dialog closed!");
        });
       
    }else{
        obj.set('busy',true);
        
        

        httpModule.request({
            url: "https://www.covidcinvestav.com/index.php?r=api/checkin",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                "Visita":
                {
                    "codigoindividuo":codigoCliente,
                    "idnegocio":appSettings.getString("idNegocio","vacio"),
                    "fechavisita":""
                },
                "LoginForm":
                {
                    "username":"negocio",
                    "password":"jvW13%b2020"
                },
                "Biometrico":
                {
                    "valor":temperature.toString(),
                    "tipo":"TEMP"
                }                
            })
        }).then((response) => {
            const result = response.content.toJSON();
          
            // Dialogs.alert({
            //     title: "Enviado!",
            //     message: "temp: "+temperature+" codigo: "+codigoCliente,
            //     okButtonText: "Ok"
            // }).then(function () {
            //     // console.log("Dialog closed!");
            // });
            if(result.codigoindividuo){
                alert(result.codigoindividuo)
            }else{
                // alert(result)
                obj.set('mostrarCheck',true)
                
                obj.set('afluCounter',result)
                obj.set('afluBanner', obj.get('afluCounter') + ' / ' +appSettings.getString("aforoNegocio"));
                setTimeout(() => {
                    obj.set('mostrarCheck',false)
                     
                }, 1000);
            }
        
            obj.set('mostrar',false);
            if(obj.get('cantidadReg')>0){

                obj.set('mostrarBtn',true);
            }
            obj.set('clave','no identificado')

            if(obj.get('afluCounter')>=(obj.get('afluMax'))){
                obj.set('afluColor','#ffcccb');
                obj.set('mostrarMsj',true);
            }else if(obj.get('afluCounter')>(obj.get('afluMax')*.7)){
                obj.set('afluColor','#fffcbb');
                obj.set('mostrarMsj',false);
            }else{
                obj.set('afluColor', '#90ee90');
                obj.set('mostrarMsj',false);
            }

            obj.set('busy',false);
            
        }, (e) => {
            // console.log(e);
            tempDB.insert();
            obj.set('busy',false);
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
                // alert("insertado "+ this.lists.length);
                Dialogs.alert({
                    title: "Almacenado localmente!",
                    message: "# Cantidad: "+this.lists.length,
                    okButtonText: "Ok"
                }).then(function () {
                    // console.log("Dialog closed!");
                });
                obj.set('cantidadReg',this.lists.length);
                obj.set('txtBtn',"Sincronizar " +this.lists.length + " registros");
                // viewModel.enviar();
            }, error => {
                console.log("INSERT ERROR", error);
            });
        
    }
    viewModel.delete = function() {
        
            database.execSQL("DELETE FROM lists").then(() => {
                // alert("deleted")
                Dialogs.alert({
                    title: "Enviado!",
                    message: "Sincronizado correctamente!",
                    okButtonText: "Ok"
                }).then(function () {
                    // console.log("Dialog closed!");
                });
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
                // console.log(rows[row]);
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
                        },
                        "LoginForm":
                        {
                            "username":"negocio",
                            "password":"jvW13%b2020"
                        },
                        "Biometrico":
                        {
                            "valor":element.temperatura,
                            "tipo":"TEMP"
                        }                
                    })
                }).then((response) => {
                    console.log(response.content.toJSON());
                }, (e) => {
                    console.log("ERROR", e);
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