var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
			where: {id: Number(quizId)},
			include: [{model: models.Comment}]
		}).then(
		function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) { next(error);})
};

// GET  /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build(  // crea objeto quiz
		{ tema: "Tema", pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST  /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build( req.body.quiz);

	quiz.validate()
	  .then(
		function(err){
	  	  if (err){
			res.render('quizes/new',{quiz: quiz, errors: err.errors});
		  } else {
			quiz // guarda en DB los campos pregunta y respuesta de quiz
			.save({fields: ["tema", "pregunta", "respuesta"]})
			.then(function(){res.redirect('/quizes')});
		  } // Redireccion HTTP (URL relativo) lista de preguntas
	  	}
	  );
};



// GET /quizes  muestra preguntas
exports.index = function(req, res, next){
	var consulta = {};
	if (req.query.search) {
		consulta = {
		  where: {
			$or: [
				{pregunta: {$like: "%" + req.query.search.replace(" ", '%') + "%"}},
				{tema: {$like: "%" + req.query.search.replace(" ", '%') + "%"}}
			]
		  },
		  order: [
			 ['tema' , 'ASC'],
			 ['pregunta' , 'ASC']
		  ]
		}
	};
	models.Quiz.findAll(consulta).then(function(quizes){
		res.render('quizes/index', {quizes: quizes, errors: []});
	}).catch(function(error) {next(error);})
};

// GET /quizes/question  una sola pregunta

/*exports.question = function(req, res){
	models.Quiz.findAll().then(function(quiz){
		res.render('quizes/question', {pregunta: quiz[0].pregunta});
	})
};*/

// GET /quizes/:id  varias preguntas

exports.show = function(req, res){
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};


// GET quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; // autoload de instancia de quiz
	res.render('quizes/edit', {quiz: req.quiz, errors:[]});
};

// GET  /quizes/answer  una sola pregunta/respuesta

/*exports.answer = function(req, res){
	models.Quiz.findAll().then(function(quiz){
		if (req.query.respuesta === quiz[0].respuesta){
			res.render('quizes/answer',{respuesta: 'Correcto'});
		} else{
			res.render('quizes/answer',{respuesta: 'Incorrecto'});
		}
	})
};*/

exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
			resultado = 'Correcto';
	}
	res.render('quizes/answer',
				{quiz: req.quiz, 
				 respuesta: resultado,
				 errors: []
				}
	);
};

// PUT /quizes/:id
exports.update= function(req, res) {
	req.quiz.tema = req.body.quiz.tema;	
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			}else {
				req.quiz    //save:guarda campos pregunta y respuesta en DB
				.save ({fields: ["tema", "pregunta", "respuesta"]})
				.then ( function(){ res.redirect('/quizes');});
						// Redirección HTTP a la lista de preguntas URL relativo)
			}
		}
	);
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};

// GET /author
exports.author = function(req, res){
	res.render('author', {nombre: 'Roberto Lozano Sáez', errors: []});
};

// GET /quizes/statistics
exports.statistics = function(req, res){
	models.Quiz.findAll().then(function(stadquery1){
		var TotPreguntas = stadquery1.length;
		models.Comment.findAll().then(function(stadquery2){
			var TotComentarios = stadquery2.length;
			models.Quiz.findAll({include: [{model: models.Comment, required: true}]}).then(function(stadquery3){
				var PregConCom = stadquery3.length;
				var PregSinCom = TotPreguntas - PregConCom;
				var Media = 0;
				if (TotPreguntas !=0) Media= (TotComentarios / TotPreguntas).toFixed(2);
				res.render('quizes/statistics', {
					TotalPreguntas: TotPreguntas, 
					TotalComentarios: TotComentarios,
					MediaComxPreg: Media, 
					PreguntasConCom: PregConCom, 
					PreguntasSinCom: PregSinCom,
					errors: []
				});
			});
		});
		
	});
};

