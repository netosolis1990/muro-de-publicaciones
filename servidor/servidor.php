<?php
//Le decimos a PHP que vamos a devolver objetos JSON
header('Content-type: application/json');

//Importamos la libreria de ActiveRecord
require_once 'php-activerecord/ActiveRecord.php';

//importamos la libreria de pusher
require_once 'libs/Pusher.php';

//Configuracion de ActiveRecord
ActiveRecord\Config::initialize(function($cfg)
{
	//Ruta de una carpeta que contiene los modelos de la BD (tablas)
	$cfg->set_model_directory('models');
	//Creamos la conexion
	$cfg->set_connections(array(
		'development' => 'mysql://USUARIO:PASS@HOST/NOMBRE_BD'));
});
//Creamos un objeto pusher con las keys que nos dio al crear una cuenta en pusher.com
$pusher = new Pusher('KEY', 'SECRET', 'APP_ID');

//Checamos si la petcion es para un nuevo post
if(isset($_POST['nuevo_post'])){
	//creamos un vector con los datos de la publicacion
	$p['nombre'] = strip_tags($_POST['nombre']);
	//Quitamos etiquetas de html para evitar ataques
	$p['post'] = strip_tags($_POST['post'],'<h2><h3>');
	//Podemos guardar la path de una imagen...para el ejemplo no se usa
	$p['img'] = 'Mandar Path Imagen';


	//Guardamos la publicacion en la base de datos
	try{
		$post = Red::create($p);
		$res['exito'] = true;
		$res['msg'] = 'Post guardado correctamente';
		//Si la publicacion se guardo correctamente entonces con pusher les avismos a todos los usuarios conectados
		$pusher->trigger('red', 'post', array('usuario'=> $p['nombre'],'post' => $p['post']));
	}catch(Exception $e){
		$res['exito'] = false;
		$res['msg'] = $e->getMessage();
	}
	echo json_encode($res);
}

//Checamos si la peticion es para ver las publicaciones guardadas en la BD
if(isset($_POST['getPost'])){
	$post = Red::find('all',array('order' => 'id desc'));
	$res['exito'] = true;
	$res['msg'] = datosJSON($post);
	echo json_encode($res);
}




//funcio que convierte objetos regresados por la BD a JSON
function datosJSON($data, $options = null) {
	$out = "[";
	foreach( $data as $row) { 
		if ($options != null)
			$out .= $row->to_json($options);
		else 
			$out .= $row->to_json();
		$out .= ",";
	}
	$out = rtrim($out, ',');
	$out .= "]";
	return $out;
}

?>