
const fromObject = require("tns-core-modules/data/observable").fromObject;
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var httpModule = require("tns-core-modules/http");
var appSettings = require("tns-core-modules/application-settings");
var Dialogs = require("ui/dialogs");

var page
 


var obj =  fromObject({
    taskList : new ObservableArray([
    ]), 
    busy:true
});



exports.onPageLoaded = function(args){
//    alert(appSettings.getString("userCode","vacio"))
    page = args.object
    page.bindingContext = obj
    
    while((obj.taskList).length){
        obj.taskList.pop()
    }

   obtenerDatos()
}

function obtenerDatos(){
    
    obj.set('busy',true)

        httpModule.request({        
            url: "https://www.covidcinvestav.com/index.php?r=api/historialnegocio",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                "Negocio":
                {
                        "idnegocio":appSettings.getString("idNegocio","vacio")
                },
                "LoginForm":
                {
                    "username":"negocio",
                    "password":"jvW13%b2020"
                }
            })
        }).then(response => {
            return response.content.toJSON();
        }).then(data => {
    
            if(data.length){  // 2 o más elementos
                data.forEach((task)=>{
                    obj.taskList.push({
                        title:("fecha: "+task.fecha +" hora: "+task.hora+" concurrencia: "+task.concurrencia),
                    })
                })
            }else{
                obj.taskList.push({
                    title:'No se encontraron registros',
                });
            } 
                obj.set('busy',false)
        }).catch((e) => {
            // alert(e) 
            Dialogs.alert({
                title: "Error de conexion",
                message: "Por favor, intente acceder al historial de nuevo más tarde.",
                okButtonText: "Ok"
            }).then(function () {
                // console.log("Dialog closed!");
            });
        })
    }





exports.backHome = function(){    
 page.frame.goBack()
}

