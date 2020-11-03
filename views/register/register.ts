
const {fromObject} = require("@nativescript/core")
var dialogs = require("@nativescript/core/ui/dialogs");

const obj = fromObject({
    email: '',
     
})

var page

export function loaded(args) {
    page = args.object;  
    page.bindingContext = obj


   
}


function validEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};


export function onSubmit(){
    var correoValido = validEmail(obj.get('correo'))
    var pass1 = obj.get('con')
    var pass2 = obj.get('repcon')

    if (correoValido ){
        // alert('correo Ok')
    }else{
        dialogs.alert({
            title: "Error de validación",
            message: "Correo no valido",
            okButtonText: "Ok"
        })
    }

    if (pass1 != pass2){
        dialogs.alert({
            title: "Error de validación",
            message: "Contraseñas no coinciden",
            okButtonText: "Ok"
        })
    }else if(!pass1 || !pass2){
        dialogs.alert({
            title: "Error de validación",
            message: "Campo de contraseña vacio",
            okButtonText: "Ok"
        })
    }

}