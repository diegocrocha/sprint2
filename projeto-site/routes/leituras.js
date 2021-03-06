var express = require('express');
var router = express.Router();
var sequelize = require('../models').sequelize;
var Leitura = require('../models').Leitura;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/* Recuperar as últimas N leituras */
router.get('/ultimas/:sensor', function (req, res, next) {

	// quantas são as últimas leituras que quer? 8 está bom?
	const limite_linhas = 7;

	console.log(`Recuperando as últimas ${limite_linhas} leituras`);

	const instrucaoSql = `
	select top ${limite_linhas} registro,
	luminosidade, fk_sensor_id,FORMAT(registro,'HH:mm:ss') as momento_grafico from tb_registro where fk_sensor_id = ${req.params.sensor} 
	order by registro desc
	`;

	sequelize.query(instrucaoSql, {
		model: Leitura,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});


// tempo real (último valor de cada leitura)
router.get('/tempo-real/:sensor', function (req, res, next) {

	console.log(`Recuperando a última leitura`);

	const instrucaoSql = `select top 1 registro,luminosidade,fk_sensor_id, FORMAT(registro,'HH:mm:ss') as momento_grafico  
						from tb_registro where fk_sensor_id = ${req.params.sensor} order by registro desc `;

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});

});


// estatísticas (max, min, média, mediana, quartis etc)
router.get('/estatisticas', function (req, res, next) {

	console.log(`Recuperando as estatísticas atuais`);

	const momento = new Date(new Date() - 1000 * 60 * 60);
	const uma_hora_atras = `${momento.getFullYear()}-${momento.getMonth() + 1}-${momento.getDate()} ${momento.getHours()}:${momento.getMinutes()}:00`
	const instrucaoSql = `select fk_sensor_id, avg(luminosidade) as media 
						from tb_registro where registro >= '${uma_hora_atras}'
						group by fk_sensor_id`;

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});

});

router.get('/lumensmes', function (req, res, next) {

	const limite_linhas = 100;

		let instrucaoSql = `select registro,luminosidade from tb_registro;`
		sequelize.query(instrucaoSql, {
			model: Leitura,
			mapToModel: true
		}).then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});


module.exports = router;
