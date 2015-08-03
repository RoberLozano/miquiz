// **************  Zona de importación de paquetes
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');


// **************  Importamos enrutadores
var routes = require('./routes/index');


// **************  Generamos la aplicación
var app = express();


// **************  Zona de configuraciones de la aplicación
app.set('views', path.join(__dirname, 'views'));        // Directorio que contiene las vistas
app.set('view engine', 'ejs');          // Motor de generación de plantillas, ejs en este caso
app.use(partials());                    // Uso de herencia en las plantillas
app.use(favicon(__dirname + '/public/images/favicon.ico'));  // Favicon
app.use(logger('dev'));
app.use(bodyParser.json());             // Esta y la siguiente para boder acceder a los
app.use(bodyParser.urlencoded());       // parámetros post de req.body
app.use(methodOverride('_method'));     // Sobreescritura de direcciones
app.use(cookieParser('Quiz 2015'));     // Generador de cookies
app.use(session());                     // Gestión de la sesión
app.use(express.static(path.join(__dirname, 'public')));      // Directorio estático

// Helper de la gestión de la sesión
app.use(function(req, res, next) {
  // guardar path en session.redir para despues de login
  if (!req.path.match(/\/login|\/logout/)) {
    req.session.redir = req.path;
  }
  
  res.locals.session = req.session;   // Hacer visible req.session en las vistas
  next();                             // Dar el control al siguiente middleware
});


// Middleware de gestión de las rutas que gestionamos en routes/index.js
// Si no hay una respuesta dentro de routes, pasa al siguiente, que sería generar error
app.use('/', routes);  


// **************  Zona de gestión de errores
// Si no hay respuesta en las rutas, pasa el control a esta función
// Generar el error 404 de HTTP
app.use(function(req, res, next) {
    var err = new Error('404 - La página web indicada no existe');
    err.status = 404;
    next(err);
});

// Los siguientes mostrarán el error 404 si existe, sino será error 500
// Gestión de errores durante el desarrollo.  Muestra el stack de errores
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
    // Si en la función anterior asignamos a err.status 404 se mantiene, sino se le asigna 500
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// Gestión de errores de producción.  Indica que hay error sin dar detalles
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


// **************  Exportamos la app para ser ejecutada en bin/www
module.exports = app;