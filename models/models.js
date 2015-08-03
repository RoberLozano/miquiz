// **************  Zona de importación de paquetes
var path = require('path');
var Sequelize = require('sequelize');

// **************  Zona de configuración de la DB a usar
// En función de la url que recibe genera una configuración u otra
// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

//  Datos de la conexión a la DB
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);


// **************  Generación de la estructura de los modelos
// Importar definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Estructura de los modelos 
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz;  		// Exportar definición de la tabla Quiz
exports.Comment = Comment;	// Exportar definición de la tabla Comment


// **************  El siguiente bloque es para inicializar una DB si no tiene registros
// sequelize.sync() crea e inicializa la tabla de preguntas en DB
// Callback que se ejecutará cuando se sincroniza correctamente con la base de datos
sequelize.sync().then(function(){
	// then(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function (count){
		// Comprobamos si la tabla está vacía
		if (count === 0) { 
			// En caso afirmativo la inicializamos con tres preguntas, sus respuestas y tipos
			Quiz.create({
				pregunta: 'Capital de Italia',
				respuesta: 'Roma',
				tema: 'Humanidades'
			});
			Quiz.create({
				pregunta: 'Capital de Portugal',
				respuesta: 'Lisboa',
				tema: 'Humanidades'
			});
			Quiz.create({
				pregunta: 'Nombre de la plata en la tabla periódica',
				respuesta: 'Ag',
				tema: 'Ciencia'
			})
			.then(function(){console.log('Base de datos inicializada')});
		};
	});
});