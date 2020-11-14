var Sqlite = require("nativescript-sqlite");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var Dialogs = require("ui/dialogs");

function onNavigatingTo(args) {    
    var page = args.object;

    

    (new Sqlite("walks.db")).then(db => {
        db.execSQL("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, list_name TEXT)").then(id => {
            page.bindingContext = createViewModel(db);
        }, error => {
            console.log("CREATE TABLE ERROR", error);
        });
    }, error => {
        console.log("OPEN DB ERROR", error);
    });
}

exports.onNavigatingTo = onNavigatingTo;



function createViewModel(database) {
    var viewModel = new Observable();
    viewModel.lists = new ObservableArray([]);

    viewModel.insert = function() {
        Dialogs.prompt("Todo List Name", "").then(result => {
            database.execSQL("INSERT INTO lists (list_name) VALUES (?)", [result.text]).then(id => {
                this.lists.push({id: id, list_name: result.text});
            }, error => {
                console.log("INSERT ERROR", error);
            });
        });
    }
    viewModel.delete = function() {
        
            database.execSQL("DELETE FROM lists").then(() => {
                alert("deleted")
            }, error => {
                console.log("INSERT ERROR", error);
            });
        
    }

    viewModel.select = function() {
        this.lists = new ObservableArray([]);
        database.all("SELECT id, list_name FROM lists").then(rows => {
            for(var row in rows) {
                this.lists.push({id: rows[row][0], list_name: rows[row][1]});
            }
        }, error => {
            console.log("SELECT ERROR", error);
        });
    }

    viewModel.select();

    return viewModel;
}

exports.createViewModel = createViewModel;