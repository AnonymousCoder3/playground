const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, UPDATE, DELETE, OPTIONS');
    next();
  });

mongoose.connect("mongodb://localhost:27017/parkingDB",{useNewUrlParser:true});

const vehicleSchema = {
    vehicleNumber : String,
    vehicleType : String,
    vehicleModel : String,
    phoneNumber : Number,
    customerName : String,
    checkInTime : String
};

const Vehicle = mongoose.model("Vehicle",vehicleSchema);

app.get("/",function(req,res){
    res.sendFile('/api/swagger/index.html',{root:__dirname});
});

app.get("/vehicles",function(req,res){
    Vehicle.find(function(err,foundVehicles){
        if(!err){
            res.send(foundVehicles);
        } else {
            res.send(err);
        }
    });
});

app.post("/vehicles",function(req,res){
    const newVehicle = new Vehicle({
        vehicleNumber : req.body.vehicleNumber,
        vehicleModel : req.body.vehicleModel,
        vehicleType : req.body.vehicleType,
        phoneNumber : req.body.phoneNumber,
        customerName : req.body.customerName,
        checkInTime : new Date()
    });
    newVehicle.save(function(err){
        if(!err){
            res.send(JSON.parse('{"Status": "Success"}'));
        }
        else{
            res.send(err);
        }
    });
});

app.route("/vehicles/:vehicleNumber").get(function(req,res){
    Vehicle.findOne({vehicleNumber:req.params.vehicleNumber},function(err,docs){
        if(!err){
            const d = new Date();
            const date = new Date(docs["checkInTime"]);
            const time = Math.floor((d.getTime()-date.getTime())/(1000*3600));
            const type = docs["vehicleType"];
            if(type == "4 wheeler"){
                res.send(JSON.parse('{"cost":'+40*time+', "duration":'+time+'}'));
            }
            else{
                res.send(JSON.parse('{"cost":'+20*time+', "duration":'+time+'}'));
            }
        } else {
            res.send(err);
        }
    });
});

app.delete("/vehicles",function(req,res){
    Vehicle.findOneAndDelete({vehicleNumber : req.body.vehicleNumber},function(err,docs){
            if(!err){
                const d = new Date();
                const date = new Date(docs["checkInTime"]);
                const time = Math.floor((d.getTime()-date.getTime())/(1000*3600));
                const type = docs["vehicleType"];
                if(type == "4 wheeler"){
                    res.send(JSON.parse('{"cost":'+40*time+', "duration":'+time+'}'));
                }
                else{
                    res.send(JSON.parse('{"cost":'+20*time+', "duration":'+time+'}'));
                }
            } else {
                res.send(err);
            }
        });
});

app.listen(3000,function(){
    console.log("Server started on port 3000");
});