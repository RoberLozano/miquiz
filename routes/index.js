// Importamos explícitamente el módulo express (ya lo carguemos en app.js)
// Tenemos que indicar la carga otra vez, sin embargo,
// el gestor de módulos de node sabe que se refiere al mismo y no hace una segunda carga
var express = require('express');
var router = express.Router();


// **************  Carga de controladores
var sessionController = require('../controllers/session_controller');
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');


// **************  Autoload de documentos
router.param('quizId', quizController.load); 
router.param('commentId', commentController.load);


// **************  Gestión de rutas index y créditos
// res.render(vista, parámetros).  Donde parámetros es un objeto con propiedades

// Index
router.get('/', function(req, res) {	
	res.render('index', { title: 'Quiz', errors: []});
});

// Créditos
router.get('/author', function(req, res) {
	res.render('author', {errors: []});
});

// Rutas de sesión
router.get('/login',  sessionController.new);     // formulario login
router.post('/login', sessionController.create);  // crear sesión
router.get('/logout', sessionController.destroy); // destruir sesión

// Rutas de quizes -> Preguntas y respuestas
router.get('/quizes', quizController.index);
router.get('/quizes/:quizId(\\d+)', quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new', 				   sessionController.loginRequired, quizController.new);
router.post('/quizes/create',              sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.loginRequired, quizController.destroy);

// Rutas de los comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', 
	sessionController.loginRequired, commentController.publish);


// **************  Exportamos las rutas
module.exports = router;