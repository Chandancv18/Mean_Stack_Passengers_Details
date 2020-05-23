var express = require('express');  
var bodyParser = require('body-parser'); 
var ejs = require('ejs');
var MongoClient = require('mongodb').MongoClient;
var app = express();  
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// Connect to the db

MongoClient.connect("mongodb://127.0.0.1/mydb", function(err, db) {
 if(!err) {
    console.log("We are connected");

app.use(express.static('public')); //making public directory as static directory  
app.use(bodyParser.json());
app.get('/home', function (req, res) {  
   console.log("Got a GET request for the homepage");  
   res.send('<h1>WELCOME TO RIT TRAVELS</h1>');   
})

app.get('/about', function (req, res) {  
   console.log("Got a GET request for /about");  
    res.send(' <h1>  YOU CAN CHECK PASSENGER DETAILS </h1>');})  
/*JS client side files has to be placed under a folder by name 'public' */

app.get('/index.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.html" );    
})  

app.get('/insert.html', function (req, res) {
    res.sendFile( __dirname + "/" + "insert.html" );
})
/* to access the posted data from client using request body (POST) or request params(GET) */
//-----------------------POST METHOD-------------------------------------------------
app.post('/process_post', function (req, res) {
    /* Handling the AngularJS post request*/
    console.log(req.body);
	res.setHeader('Content-Type', 'text/html');
    req.body.serverMessage = "NodeJS replying to angular"
        /*adding a new field to send it to the angular Client */
		console.log("Sent data are (POST): PAssenger ID :"+req.body.pasid+" Pasenger Name="+req.body.pasname +"Passenger gender" +req.body.pasg +" passenger contact no"+req.body.pasno+" Travelling from"+req.body.src+"travelling to"+req.body.dst);
		// Submit to the DB
  	var pasid = req.body.pasid;
    var pasname = req.body.pasname;
    var pasg = req.body.pasg;
    var pasno = req.body.pasno;
    var src = req.body.src;
    var dst = req.body.dst;

	//To avoid duplicate entries in MongoDB
    db.collection('Passenger').createIndex({"pasid":1},{unique:true});
	/*response has to be in the form of a JSON*/
    db.collection('Passenger').insertOne({pasid:pasid,pasname:pasname,pasg:pasg,pasno:pasno,src:src,dst:dst}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
						res.send("Duplicate passenger ID")
					} 
					else
					{
                    console.log('PAssenger Inserted');
					/*Sending the respone back to the angular Client */
					res.end("Passenger  Inserted-->"+JSON.stringify(req.body));
					}
                })      
	
    });
//--------------------------GET METHOD-------------------------------
app.get('/process_get', function (req, res) { 
// Submit to the DB
  var newpas = req.query;
	var pasid = req.query['pasid'];
    var pasname = req.query['pasname'];
    var pasg = req.query['pasg'];
    var pasno = req.query['pasno'];
    var src = req.query['src'];
    var dst = req.query['dst'];

    db.collection('Passenger').createIndex({"pasid":1},{unique:true});
    db.collection('Passenger').insertOne({pasid:pasid,pasname:pasname,pasg:pasg,pasno:pasno,src:src,dst:dst}, (err, result) => {                       
                    if(err) 
					{ 
						console.log(err.message); 
                        res.send("Duplicate Passenger ID")
					} 
					else
					{
                    console.log("Sent data are (GET): EmpID :"+pasid+" and Employee name :"+pasname+  "gender: " +pasg+" passenger contact NO"+pasno+"travelling from"+src+" To"+dst);
					

/*Sending the respone back to the angular Client */
                        res.end("Passenger Inserted-->"+JSON.stringify(newpas));
					}
                })      
}) 

//--------------UPDATE------------------------------------------
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

     app.get("/update", function (req, res) {
         
	var pasname1=req.query.pasname;
    db.collection('Passenger', function (err, data) {
        data.update({"pasname":pasname1},{$set:{"pasname":"newpas"}},{multi:true},
            function(err, obj){
				if (err) {
					console.log("Failed to update data.");
			} else {
				if (obj.result.n==1)
				{
				res.send("<br/>"+pasname1+":"+"<b>Passenegr Name Updated</b>");
                    console.log("Passenger Updated")
				}
				else
                    res.send("Passenger Not Found")
			}
        });
    });
})	
//--------------SEARCH------------------------------------------
app.get('/search.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "search.html" );    
})

app.get("/search", function(req, res) {
	//var pasidnum=parseInt(req.query.pasid)  // if empid is an integer
	var pasidnum=req.query.pasid;
    db.collection('Passenger').find({pasid: pasidnum},{pasname:1,pasid:1,pasno:1 , pasg:1, src:1,dst:1, _id:0}).toArray(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    } else {
        //console.log("Sent data are (GET): EmpID :" + pasid + " and Employee name :" + pasname + "gender: " + pasg + " passenger contact NO" + pasno + "travelling from" + src + " To" + dst);
        res.status(200).json(docs);
        
	  
    }
  });
  });
  // --------------To find "Single Document"-------------------
	/*var empidnum=parseInt(req.query.empid)
    db.collection('employee').find({'empid':empidnum}).nextObject(function(err, doc) {
    if (err) {
      console.log(err.message+ "Failed to get data");
    } else {
      res.status(200).json(doc);
    }
  })
}); */

//--------------DELETE------------------------------------------
app.get('/delete.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "delete.html" );    
})

app.get("/delete", function(req, res) {
	//var empidnum=parseInt(req.query.empid)  // if empid is an integer
	var pasidnum=req.query.pasid;
    db.collection('Passenger', function (err, data) {
        data.remove({"pasid":pasidnum},function(err, obj){
				if (err) {
					console.log("Failed to remove data.");
			} else {
				if (obj.result.n>=1)
				{
                    res.send("<br/>" + pasidnum + ":" +"<b>Passenger Deleted</b>");
                    console.log("Passenger Deleted")
				}
				else
                    res.send("Passenger Not Found")
			}
        });
    });
    
  });
  

//-------------------DISPLAY-----------------------
app.get('/display', function (req, res) { 
//-----IN JSON FORMAT  -------------------------
/*db.collection('employee').find({}).toArray(function(err, docs) {
    if (err) {
      console.log("Failed to get data.");
    } else 
	{
		res.status(200).json(docs);
    }
  });*/
//------------- USING EMBEDDED JS -----------
    db.collection('Passenger').find().sort({pasid:1}).toArray(
 		function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{Passengers: i})  
     })
//---------------------// sort({empid:-1}) for descending order -----------//
}) 

 
var server = app.listen(8080, function () {  
var host = server.address().address  
  var port = server.address().port  
console.log("MEAN Stack app listening at http://%s:%s", host, port)  
})  
db.close();
}
else
{ console.log("not connecting to db",err);  
//db.close();  }
  }
});
