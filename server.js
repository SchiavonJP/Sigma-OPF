require('events').EventEmitter.prototype._maxListeners = 100;

var express = require('express');  //importando a biblioteca express

const exec = require('child_process').exec;

var LineByLineReader = require('line-by-line');

var fs = require('fs');

var cont = 0;

var flag = false;

var	n_classes = 1;

var array_colors = [];

var app = express();				//atribuindo a biblioteca a uma variavel

var server = app.listen(3000);		//"ouvindo" o servidor na porta 3000

app.use(express.static('public'));	//declarando que os dados que o cliente vai ler estão na pasta public

console.log("Meu socket server esta rodando " );

var socket = require('socket.io');	//importanto a biblioteca express

var io = socket(server);			//atribuindo a biblioteca a uma variavel

io.sockets.on('connection', newConnection);		//dispara quando a uma nova conexão

function newConnection(socket) {				//funcao para quando há uma nova conexão
	console.log('new connection: ' + socket.id);

	var path = '/temp/' + socket.id;
			fs.mkdir('temp/' + socket.id, (err,folder)=>{
				if(err)
					throw err;
				console.log(folder);
				cont = 0;
				n_classes = 1;
				array_colors = [];
				sample_json = [];
				testing_sample = [];
				training_sample = [];
				testing_out = [];
				training_out = [];
				training_sample_color = [];
				array_id = [];
				bolean_aux = false;
				bolean_aux2 = false;
				accuracy = 0;
			});

	
	socket.on('mouse', mouseMsg);				//recebe uma mensagem com as coordenadas do mouse e dispara mouseMsg

	
	function mouseMsg(data) {					//função para transmitir as coordenadas do mouse

		socket.on ('json', function (){				//Socket que manda jsons formatados para pintar na tela de visualizacao
				socket.emit ('json-response', sample_json, training_sample,testing_sample,testing_out, training_out,array_colors,accuracy);
		});
		
		if (!Array.prototype.includes) {		//prototipo de funcao para verificar se um elemento pertence a um array
		Object.defineProperty(Array.prototype, 'includes', {
			value: function(searchElement, fromIndex) {

			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If len is 0, return false.
			if (len === 0) {
				return false;
			}

			// 4. Let n be ? ToInteger(fromIndex).
			//    (If fromIndex is undefined, this step produces the value 0.)
			var n = fromIndex | 0;

			// 5. If n ≥ 0, then
			//  a. Let k be n.
			// 6. Else n < 0,
			//  a. Let k be len + n.
			//  b. If k < 0, let k be 0.
			var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

			function sameValueZero(x, y) {
				return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
			}

			// 7. Repeat, while k < len
			while (k < len) {
				// a. Let elementK be the result of ? Get(O, ! ToString(k)).
				// b. If SameValueZero(searchElement, elementK) is true, return true.
				// c. Increase k by 1. 
				if (sameValueZero(o[k], searchElement)) {
				return true;
				}
				k++;
			}

			// 8. Return false
			return false;
			}
		});
	}
	
		var features,
			color_id;
			if(!array_colors.includes(data.color)){
				array_colors[array_colors.length] = data.color;
			}
			color_id = array_colors.indexOf(data.color);
			sample_json[sample_json.length] = data;
			fs.writeFile("temp/"+socket.id+"/"+socket.id+".txt", cont + " " + (color_id+1) + " " + data.x + " " + data.y + "\n",{encoding:'utf-8', flag: 'a+'}, (err)=>{
				if(err){
					return console.log(err);
				}
				cont++;
				//console.log("saved!");
			});
		
			socket.on('generate',generate);			//Socket que trata de gerar os arquivos necessarios para o OPF

			function generate(train){				//CallBack que criar o arquivo com os dados dos elementos que o usuario inseriu
					n_classes = array_colors.length;
					fs.readFile(__dirname+"/temp/"+socket.id+"/"+socket.id+".txt",{encoding:'utf-8'},(err,data)=>{
						if(err){
							console.log(err+'train');
						}
						fs.writeFile(__dirname+"/temp/"+socket.id+"/data.txt",cont + ' ' +n_classes +' 2\n' + data, {encoding:'utf-8'}, (err)=>{
							if(err){
								console.log(err+'write');
							}
							finished(train);
						})
					})
			}
			function finished(train){				//Funcao faz a divisao do conjunto de treinamento
				exec('OPF_files/txt2opf '+__dirname+"/temp/"+socket.id+"/data.txt"+" "+__dirname+"/temp/"+socket.id+"/"+socket.id+"_data.dat",(error,stdout,stderr)=>{
						if(error){
							console.log(error);
						}
						//console.log(stderr);
					});
				exec('OPF_files/opf_split '+__dirname+"/temp/"+socket.id+"/"+socket.id+"_data.dat "+(train.training/100)+" 0 "+(train.test/100)+" 0 "+'temp/'+socket.id,(error,stdout,stderr)=>{
						if(error){
							console.log(error);
						}
						//console.log(stderr);
					});	
						processing();
			}
			function processing(){
				exec('OPF_files/opf_train '+'temp/'+socket.id+"/training.dat "+'temp/'+socket.id,(error,stdout,stderr)=>{
						if(error){
							console.log(error);
						}
						console.log(stderr);
						});	
					classify()
			}
			function classify(){					//Funcao que faz a classificacao do conjunto de teste
				exec('OPF_files/opf_classify '+'temp/'+socket.id+"/testing.dat "+'temp/'+socket.id,(error,stdout,stderr)=>{
						if(error){
							console.log(error);
						}						 	
				// Reading the testing sample
				exec('OPF_files/opf2txt '+__dirname+"/temp/"+socket.id+"/"+"testing.dat"+" "+__dirname+"/temp/"+socket.id+"/testing.txt",(error,stdout,stderr)=>{
							if(error){
								console.log(error);
							}
							//console.log(stderr);
							var	lr = new LineByLineReader('temp/'+socket.id+'/testing.txt', {skipEmptyLines: true }),
								row = 0;
							lr.on('error', function (err) {
								throw err;
							});

							lr.on('line', function (line) {
								//console.log(line.split(" ")[0]);
								if(row == 0){
									row = row +1 ;
								}else{
									var aux = {
										id : parseInt(line.split(" ")[0]),
										color : parseInt(line.split(" ")[1]),
										x : parseInt(line.split(" ")[2]),
										y : parseInt(line.split(" ")[3])
									}
									if(!array_id.includes(aux.id)){
										testing_sample[testing_sample.length] = aux;
										array_id[array_id.length] = aux.id;
									} 
								}
							});

							lr.on('end', function () {
								//console.log("Ok we're done - exiting now.");
								//console.log(testing_sample)
							});
							
						});
			
					// Reading training sample
					exec('OPF_files/opf2txt '+__dirname+"/temp/"+socket.id+"/"+"training.dat"+" "+__dirname+"/temp/"+socket.id+"/training.txt",(error,stdout,stderr)=>{
							if(error){
								console.log(error);
							}
							//console.log(stderr);
							var	lr = new LineByLineReader('temp/'+socket.id+'/training.txt', {skipEmptyLines: true }),
								row1 = 0;
							lr.on('error', function (err) {
								throw err;
							});

							lr.on('line', function (line) {
								//console.log(line.split(" ")[0]);
								if(row1 == 0){
									row1 = row1 +1 ;
								}else{
									var aux = {
										id : parseInt(line.split(" ")[0]),
										color : parseInt(line.split(" ")[1]),
										x : parseInt(line.split(" ")[2]),
										y : parseInt(line.split(" ")[3])
									}
									if(!array_id.includes(aux.id)){
										training_sample[training_sample.length] = aux;
										array_id[array_id.length] = aux.id;
									} 
								}
							});

							lr.on('end', function () {
								//console.log("Ok we're done - exiting now.");
								//console.log(training_sample)
							});
							
						});
						//Writing training_dat.txt		
						fs.readFile(__dirname+'/temp/'+socket.id+'/training.dat.out',{encoding:'utf-8'},(err,data)=>{
						if(err){
							console.log(err+'train');
						}
							fs.writeFile(__dirname+"/temp/"+socket.id+"/training_dat.txt",data, {encoding:'utf-8'}, (err)=>{
								if(err){
									console.log(err+'write');
								}
								if(bolean_aux2 == false){
									for(i=0; i < data.split("\n").length-1;i++){
										training_out.push(parseInt(data.split("\n")[i]));
									}
								bolean_aux2 = true;
								}
								//console.log(training_out)
							})
						})
						//Writing testing_dat.txt
						fs.readFile(__dirname+'/temp/'+socket.id+'/testing.dat.out',{encoding:'utf-8'},(err,data)=>{
						if(err){
							console.log(err+'train');
						}
							fs.writeFile(__dirname+"/temp/"+socket.id+"/testing_dat.txt",data, {encoding:'utf-8'}, (err)=>{
								if(err){
									console.log(err+'write');
								}
								if(bolean_aux == false){
									for(i=0; i < data.split("\n").length-1;i++){
										testing_out.push(parseInt(data.split("\n")[i]));
									}
								bolean_aux = true;
								}
								//console.log(testing_out)
							})
						})						
						//console.log(stderr);
						});
						
					accuracy()								
			}
			function accuracy(){				//Funcao que calcula a precisao do conjunto 
				exec('OPF_files/opf_accuracy '+__dirname+'/temp/'+socket.id+"/testing.dat",(error,stdout,stderr)=>{
						if(error){
							console.log(error);
						}
						//console.log(stderr); 
						var	lr = new LineByLineReader('temp/'+socket.id+'/testing.dat.acc', {skipEmptyLines: true }),
							row = 0;
							lr.on('error', function (err) {
								throw err;
							});

							lr.on('line', function (line) {
								//console.log(line.split(" ")[0]);
								if(row == 0){
									accuracy = (line.split("\n")[0]);
								}
								row = row + 1
							});

							lr.on('end', function () {
								//console.log("Ok we're done - exiting now.");
								console.log(accuracy)
							});
						});
			}
	}
}
		