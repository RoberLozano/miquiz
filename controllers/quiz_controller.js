// Nota mental: La plantilla 'quizes/question', si en su lugar usamos '/quizes/question'
// Genera un error.  No hay que confundir las rutas con las plantillas

// Importamos el modelo de datos.  Que a su vez contiene a los demás modelos
var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
// Asigna al valor req.quiz el objeto quiz para la id correspondiente a quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: 
              {id: Number(quizId)},
              include: [{model: models.Comment}]
        }).then(
    // Quiz es una instancia de la tabla 
    // Cumple la condición que la id de la fila es igual a quizId
    // Si no existe esa id en la tabla devuelve un valor vacío (undefined)
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else {next(new Error('No existe quizId=' + quizId));}
    }
  ).catch(function(error){next(error);});
};

// Get /quizes
// Se le pasa la matriz completa (quizes) que tendrá tantos objetos como filas tenga la tabla
// Inicialmente hay que comprobar si existe req.query.search
// Si no existe -> Listado preguntas  -> index habitual
// Si existe    -> Listado búsqueda   -> index con listado búsqueda
exports.index = function(req, res){
  if(!req.query.search){    
    models.Quiz.findAll().then(function(quizes){
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error){next(error);})
    
  }else{
    // Inicialmente cometí el fallo de usar el parámetro search sin añadirle wildcarts
    var search = '%' + req.query.search + '%';

    // Cambiamos los espacios por la wildcart %
    search = search.replace(' ', '%');

    // Le pasamos a findAll un objeto con los parámetros de la búsqueda
    models.Quiz.findAll({where: ["pregunta like ?", search]}).then(function(quizes){
      res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error){next(error);})
  }
};

// GET /quizes/:quizId
// Muestra una pregunta correspondiente al quizId introducido
exports.show = function(req, res){
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// Función que muestra por pantalla la respuesta
// GET /quizes/:quizId/answer
exports.answer = function(req, res){
	// En la url recibimos una query ?respuesta=valorRespuesta
	// Esos parámetros son accesibles mediante la variable req.query
	// Debido a la comprobación 'roma' en minúscula aparecerá como respuesta incorrecta
	var resultado = 'Incorrecto';

	if (req.query.respuesta === req.quiz.respuesta) {
	    resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// Función que muestra la vista para introducir una nueva pregunta
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta", tema:"Por definir"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// Creamos una pregunta -> POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

// Guarda en DB los campos pregunta y respuesta de quiz
  quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// Mostrar datos de la pregunta a editar -> GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// Actualizamos una pregunta. PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// Borramos una pregunta -> DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};