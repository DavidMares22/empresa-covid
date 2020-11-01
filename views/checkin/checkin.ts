
const {fromObject} = require("@nativescript/core")

const obj = fromObject({
    temp: ''
})

var page;



exports.loaded = function(args) {
    page = args.object;  
    page.bindingContext = obj
}
exports.onNavigatedTo = function(args) {
    const context = args.context;  
    alert(context.data)
}


exports.onSubmit = function(args) {
    var temperature = parseFloat(obj.get('temp'))
    if (temperature<35 || temperature>40 || isNaN(temperature) ){
        alert('temperatura no valida (35° - 40°)')
    }else{
        alert('Enviado! '+ temperature)
    }
    

}
