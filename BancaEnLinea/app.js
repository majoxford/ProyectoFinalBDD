const bodyParser = require('body-parser');
const express = require ('express');
const path = require('path');
const NodeCouchDb = require('node-couchdb');
const { redirect } = require('express/lib/response');
const { allowedNodeEnvironmentFlags, send } = require('process');

const couch = new NodeCouchDb({
    auth: {
        user: 'admin',
        password: 'admin'
    }
});


const dbName = 'cuentas';
const viewUrl = '_design/cuentas/_view/cuentas';



couch.listDatabases().then(function(dbs){
    console.log(dbs);
});


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
            res.render('index',{
                cuentas:data.data.rows
            })

        }, 
        function(err){
            res.send(err);
        });
});

app.post('/cuentas/add', function(req, res){
    const name = req.body.nombre;
    const cedula = req.body.cedula;
    const tipo = req.body.tipoCuenta;
    const numero = req.body.numeroCuenta;
    const balance = req.body.balance;
    
    couch.uniqid().then(function(ids){
        const id = ids[0];

        couch.insert(dbName, {
            _id:id,
            nombre:name,
            cedula:cedula,
            tipoCuenta:tipo,
            numeroCuenta:numero,
            balance:balance
            

        }).then(
            function(data,headers,status){
                res.redirect('/agregar');
            }, 
            function(err){
                res.send(err);
            }
        );
    });
});

app.post('/cuentas/delete/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del(dbName, id, rev).then(
        function(data, headers, status){
            res.redirect('/cancelar2');
        },
        function(err){
            res.send(err);
        });
});


app.get('/home', function(req,res){  
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
           res.render('home',{
               cuentas:data.data.rows
           });
        },
        function(err){
           res.send(err);
        });
   });  

   app.get('/agregar', function(req,res){  
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
           res.render('agregar',{
               cuentas:data.data.rows
           });
        },
        function(err){
           res.send(err);
        });
   });    

   app.get('/cancelar2', function(req,res){  
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
           res.render('cancelar2',{
               cuentas:data.data.rows
           });
        },
        function(err){
           res.send(err);
        });
   });    

   app.post('/editar/:id', function(req, res){

    const id = req.params.id;
    const rev = req.body.rev;
    const name = req.body.nombre;
    const tipo = req.body.tipoCuenta;
    const numero = req.body.numeroCuenta;
    const balance = req.body.balance;

    couch.update(dbName, {
        _id:id,
        _rev:rev,
        nombre:name,
        tipoCuenta:tipo,
        numeroCuenta:numero,
        balance:balance}).then(
        function(data,headers,status){
            res.redirect('/editar')
    }, function(err){
        res.send(err)
    })
   })
    
   app.get('/editar', function(req,res){  
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
           res.render('editar',{
               cuentas:data.data.rows
           });
        },
        function(err){
           res.send(err);
        });
   });    

app.listen(3000, function(){
    console.log('Server Started on port 3000');
});

