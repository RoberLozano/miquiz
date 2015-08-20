// Definición del modelo de QUIZ

/*module.exports = function(sequelize, DataTypes){
	return sequelize.define('Quiz', 
		{ pregunta: DataTypes.STRING,
		  respuesta: DataTypes.STRING,
		});
}*/

// Definición del modelo Quiz con validación
module.exports = function(sequelize, DataTypes){
	return sequelize.define(
	  'Quiz', 
	  { 
		  tema: {
			type: DataTypes.STRING,
			validate: { notEmpty: {msg: "-> Falta temática"}}
		},
	  	  pregunta: {
			type: DataTypes.STRING,
			validate: { notEmpty: {msg: "-> Falta pregunta"}}
		},
		  respuesta: {
			type: DataTypes.STRING,
			validate: { notEmpty: {msg: "-> Falta respuesta"}}
		}
	  }
	);
};

