//declaramos 3 variables...para el formulario, la textarea, y la seccion de publicaciones
var fp,msg,muro;
$(document).ready(function() {
	//inicializamos las variables
	fp = $('#form-post');
	msg = $('#post');
	muro = $('#muro');
	//Cargamos el nombre de las imagenes que se mostraran con cada publicacion
	imgs = ['im1.jpg','im2.jpg','im3.jpg','im4.jpg','im5.jpg','im6.jpg'];

	//Llamamos a la funcion que carga las funciones guardadas en la BD
    cargarPost();

    //Inicializamos la variable pusher
	var pusher = new Pusher('9cc0bc2e04c995ae545e');
    //suscribirse al canal de comunicacion
    var channel = pusher.subscribe('red');
    //escuchar un evento llamado post, el cual se activa cada que alguien hace una publicacion
    channel.bind('post', function(data){
    		//creamos un template con la publicacion recibida, data es la respuesta con los datos de la publicacion
    	    template = '<article class="search-result row">'+
							'<div class="col-xs-12 col-sm-12 col-md-3">'+
								'<a href="#" title="NetoSolis" class="thumbnail"><img src="image/'+imgs[Math.floor((Math.random() * 6) + 1)]+'"  /></a>'+
							'</div>'+
							'<div class="col-xs-12 col-sm-12 col-md-7 excerpet">'+
								'<h3><a href="#" title="">'+data.usuario+'</a></h3>'+
								'<p>'+data.post+'</p>'+						
							'</div>'+

							'<span class="clearfix borda"></span>'+
						'</article>';
			//agregamos el template al muero
			muro.prepend(template);
    });
    //Cada ves que mandamos el mensaje
    fp.submit(function(event) {
    	//Comprobamos el tamaño del mensaje
    	if(msg.val().length < 30 || msg.val().length > 1000){
    		nota('error','La publicación debe ser mayor de 30 letras y menor que 1000');
    		return false;
    	}

    	//Comprobamos si ya tenemos un nombre para mostrar
    	if(!localStorage.getItem('nombre')){
	        usuario = prompt("Ingresa Tu Usuario", "Tontuelo");
	        if(usuario.length == 0)return;
	        localStorage.setItem('nombre',usuario);
	    }
	    //si ya hay un nombre de usuario solo lo tomamos del localStorage
	    else{
	        usuario = localStorage.getItem('nombre');
	    }

	    //Enviamos la publicacion mediante AJAX
    	$.post('servidor/servidor.php',{nuevo_post:true,nombre:usuario,post:msg.val()}, function(data) {
    		if(data.exito){
    			nota('success',data.msg);
    			fp[0].reset();
    		}else{
    			nota('error',data.msg);
    		}
    	});
    	return false;
    });
});


//Funcion que carga publicaciones guardadas en la bd
function cargarPost(){
	//Hacemos un llamado AJAX
	$.post('servidor/servidor.php',{getPost:true}, function(data) {
		//Nos devolvera un objeto JSON con las publicaciones guardadas
		//Para usar facilmente MUSTACHEJS creamos un vector JSON
		datos = '{"publicaciones":'+data.msg+'}';
		//Creamos el template con todas las publicaciones
		template = '{{#publicaciones}}<article class="search-result row">'+
							'<div class="col-xs-12 col-sm-12 col-md-3">'+
								'<a href="#" title="NetoSolis" class="thumbnail"><img src="image/im7.jpg"  /></a>'+
							'</div>'+
							'<div class="col-xs-12 col-sm-12 col-md-7 excerpet">'+
								'<h3><a href="#" title="">{{nombre}}</a></h3>'+
								'<p>{{post}}</p>'+						
							'</div>'+
							'<span class="clearfix borda"></span>'+
						'</article>{{/publicaciones}}';
		//Construimos el template con el vector JSON contruido arriba
		var html = Mustache.to_html(template, $.parseJSON(datos));
		//Agregamos las publicaciones al muro
        muro.html(html);
	});
}

//Funcion para mostrar notificaciones...usa la libreria noty.js
function nota(op,msg,time){
    if(time == undefined)time = 5000;
    var n = noty({text:msg,maxVisible: 1,type:op,killer:true,timeout:time,layout: 'top'});
}