// import barcodescannerModule  = require("nativescript-barcodescanner");
import { BarcodeScanner  } from "nativescript-barcodescanner";
let barcodescannerModule = new BarcodeScanner();


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
        }, (error) => {
            console.log("No scan: " + error);
        });
    }, (error) => {
        console.log("ERROR", error);
    });
}