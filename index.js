//SERVIDOR WEB SIMPLE

//En la primera fila, la aplicación importa el módulo de servidor web integrado de Node.
//const http = require('http')

//EXPRESS

//PARA UTILIZAR LAS VARIABLES DE ENTORNO USAMOS LO SIGUIENTE
require('dotenv').config()

//Ahora realizaremos lo mismo pero utlizando Express
const express = require('express')
//Ahora usaremos morgan
const morgan = require('morgan')
//Utilizamos cors para que se pueda utilizar el backend desde otro origen
const cors = require('cors')
//Utilizamos el middleware de mongoose
//const mongoose = require('mongoose')

//Utilizamos el nuevo models creado
const Note = require('./models/note')

//POLITICA DE MISMO ORIGEN Y CORS

/***
 * El intercambio de recursos de origen cruzado (CORS) es un mecanismo que permite solicitar recursos 
 * restringidos (por ejemplo, fuentes) en una página web desde otro dominio fuera del dominio desde el que 
 * se sirvió el primer recurso. Una página web puede incrustar libremente imágenes, hojas de estilo, scripts, iframes y videos 
 * de origen cruzado. Ciertas solicitudes "entre dominios", en particular las solicitudes Ajax, están prohibidas de forma predeterminada 
 * por la política de seguridad del mismo origen.
 */

/***
 * El código usa el método createServer del módulo http para crear un nuevo servidor web. 
 * Se registra un controlador de eventos en el servidor, que se llama cada vez que se realiza una 
 * solicitud HTTP a la dirección del servidor http://localhost:3001.
 * 
 * La solicitud se responde con el código de estado 200, con el header Content-Type establecido en 
 * text/plain, y el contenido del sitio que se devolverá establecido en Hello World.
 * 
 */

//APLICACION A INTERNET
/**
 * Para este caso, utilizaremos Heroku, 
 */

//const app = http.createServer((request, response) => {
    /***
     * El valor application/json en el header Content-Type informa al receptor que los datos están en formato JSON. 
     * El arrray notes de notas se transforma en JSON con el método JSON.stringify(notes).
    */
    //response.writeHead(200, { 'Content-Type': 'application/json' })
    //response.end(JSON.stringify(notes))})

//Ahora hacemos lo mismo utilizando express
const app = express()
//Colocamos la url de acceso.
//const url = `mongodb+srv://destructorx958:xZncvLkQLOPfeQH4@cluster0.efwenbq.mongodb.net/?retryWrites=true&w=majority`

//MIDDLEWARE
/**
 * Los middleware son funciones que se pueden utilizar para manejar objetos de request y response.
 */

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))
//mongoose.connect(url)

//Se utiliza para capturar solicitudes realizadas a rutas inexistentes
//Devolviendo un mensaje de error en formato JSON
const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Middleware para manejo de errores
/****
 * El controlador de errores comprueba si el error es una excepción CastError, en cuyo 
 * caso sabemos que el error fue causado por un ID de objeto no válido para Mongo. En esta situación, el controlador 
 * de errores enviará una respuesta al navegador con el objeto de respuesta pasado como parámetro. En todas las demás situaciones de error, el middleware 
 * pasa el error al controlador de errores Express predeterminado.
 */
const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

//Ahora creamos el schema de la coleccion
/*const noteSchema = mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})*/

/***
 * FORMATEO DEL JSON OBTENIDO POR MONGO
 * Esto se hace con el objetivo de obviar el control de versiones que maneja la base de datos
 * para ello hacemos lo siguiente:
 */

/*noteSchema.set('toJSON', {
  //Transformamos la data.
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})*/

//Ahora se agregaran las notas que debera de devolver el listado de notas codificadas en formato JSON

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

//Agregamos un modelo a la base de datos
//const Note = mongoose.model('Note', noteSchema)


/***
 * La aplicación no cambió mucho. Justo al comienzo de nuestro código estamos importando express, que esta vez es una 
 * función que se usa para crear una aplicación express almacenada en la variable app
 */

/**
 * A continuacion se tiene definida una ruta, la cual contiene un controlador de eventos 
 * que se utiliza para controlar las solicitudes HTTP GET que sean realizadas a la raiz de la 
 * aplicacion
 */
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

/***
 * Para estas funciones controladoras de eventos pueden aceptar dos parametros, el primero de ellos se tiene el 
 * parametro "request", el cual posee toda la informacion de la solicitud HTTP que se realizo. En cambio, para 
 * el segundo parametro "response", se tiene que este contiene como es que fue la respuesta a dicha solicitud que 
 * se realizo al servidor.
 */

/***
 * La segunda ruta define un controlador de eventos, que maneja las solicitudes HTTP GET realizadas a la ruta notes de la aplicación:
 */

/*app.get('/api/notes', (request, response) => {
  //console.log("Headers: ",request.headers)
  response.json(notes)
})*/

/***
 * Teniendo toda la base de datos configurada, procedemos 
 * a obtener los datos mediante el get. 
 */

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})


//NODEMON
/**
 * Como se ha estado haciendo, tanto en la utilizacion de node, como de express, para ambos 
 * se tenia que primero detener el servidor, y volverlo a iniciar para poder visualizar los cambios.
 * Cosa que eso a la larga se convierte en algo bastante engorroso y tedioso, en donde, para ello existe 
 * una solucion, la cual es NODEMON.
 * 
 * Nodemon observará los archivos en el directorio en el que se inició nodemon, y si algún archivo cambia, 
 * nodemon reiniciará automáticamente su aplicación de node.
 * 
 * Para ello lo instalaremos como una dependencia de desarrollo con el comando: 
 * npm install --save-dev nodemon
 * 
 * Una vez instalada dicha dependencia, podremos iniciarla de la siguiente manera: 
 * npm run dev el cual se tuvo que agregar al apartado de scripts del Package.json
 */

// REST
/**
 * Mencionamos en la parte anterior que las cosas singulares, como las notas en el caso de nuestra aplicación,
 * se llaman recursos en el pensamiento REST. Cada recurso tiene una URL asociada que es la dirección única del recurso.
 */

//OBTENIENDO UN SOLO RECURSO
app.get('/api/notes/:id', (request, response, next) => {
  //console.log(request.params.id)
  /*const id = Number(request.params.id)
  const note = notes.find(
    value => value.id === id
  )
  if (note) {
    //console.log(note)
    response.json(note)
  }
  else {
    //Dado que no se adjuntan datos a la respuesta, utilizamos el método status para establecer el estado y el método end para responder a la solicitud sin enviar ningún dato.
    response.status(404).end()
  }*/
  //MEJOR LO HAREMOS CON MONGOOSE
  Note.findById(request.params.id).then(
    note => {
      //MANEJO DE ERRORES
      if(note){
        response.json(note)
      }else{
        response.status(404).end()
      }
    }
  )
  .catch(
    //Bloque catch para manejar el rechazo de la peticion findById
    /**error => {
      console.log(error.message)
      //Cuando no se tiene el formato correcto de alguna informacion, el codigo de error correcto es 400
      response.status(400).send({ error: 'malformatted id' })
    }*/
    //Mejor la manejaremos con un middleware
    error => next(error)
  )
})

//ELIMINAR RECURSOS
app.delete('/api/notes/:id', (request, responsive, next) =>{
  /***const id = req.params.id
  const noteDelete = notes.filter(
    value => value.id !== id
  )*/

  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))

  /**
   * Si la eliminación del recurso es exitosa, lo que significa que la nota existe y se elimina, respondemos a la solicitud con el código de estado 204 no content y no devolvemos datos con la respuesta.
   * No hay consenso sobre qué código de estado debe devolverse a una solicitud DELETE si el recurso no existe. Realmente, las únicas dos opciones son 204 y 404. En aras de la simplicidad, nuestra 
   * aplicación responderá con 204 en ambos casos.
   */
  
  //res.status(204).end()
})

//ENTONCES, COMO PROBAMOS LA OPERACION DE ELIMINACION?

//POSTMAN
// Es una app que se utiliza en desarrollo para hacer las request a la api

/****
 * Del todo ya se tiene una busqueda de un elemento individual mediante su id, 
 * pero no funciona del todo bien, ya que, si se coloca un id que no existe o no esta asignado 
 * a una de las notas, este de igual manera responde con un status 200 en el navegador, lo cual, 
 * es incorrecto. Por lo que, se debera de manejar ese tipo de errores en el servidor.
 */

//RECIBIENDO INFORMACION
/***
 * A continuación, hagamos posible agregar nuevas notas al servidor. La adición de una nota ocurre 
 * al hacer una solicitud HTTP POST a la dirección http://localhost:3001/api/notes y se envía toda la información 
 * de la nueva nota en el body de la solicitud en formato JSON.
 */


const generateId = () => {
    /***
     * Necesitamos un id única para la nota. Primero, encontramos el número de id más grande en la 
     * lista actual y lo asignamos a la variable maxId. La id de la nueva nota se define como maxId + 1. 
     * De hecho, este método no se recomienda, pero viviremos con él por ahora, ya que lo reemplazaremos pronto.
     */
    /***
     * ¿Qué está sucediendo exactamente en esa línea de código? notes.map(n => n.id) crea un nuevo array que contiene 
     * todos los ids de las notas. 
     * Math.max devuelve el valor máximo de los números que se le pasan. Sin embargo, notes.map(n => n.id) es un array, por lo que 
     * no se puede asignar directamente como parámetro a Math.max. El array se puede transformar en números individuales mediante el 
     * uso de la sintaxis de spread de los "tres puntos".
     */

    const maxId = notes.length > 0 ? Math.max(...notes.map(n=>n.id)) : 0

    return maxId + 1
}

app.post('/api/notes', (req, res, next) => {
  
  //Recibimos los datos enviados
  //La función del controlador de eventos puede acceder a los datos de la propiedad body del objeto de request.
  const newNote = req.body;
  //revisamos si el contenido no esta vacio
  if (!newNote.content) {
    //Si a los datos recibidos les falta un valor para la propiedad content, el servidor responderá a la solicitud con el código de estado 400 bad request
    return res.status(400).json({
      error: 'content missing'
    })    
  }
  //Generamos la nueva nota pero ahora para guardarla en la base de datos
  //PROMISE CHAINING
  /**
   * Muchos de los controladores de ruta cambiaron los datos de respuesta al formato correcto llamando al método toJSON. Cuando creamos una nueva nota, se llamó 
   * al método toJSON para el objeto pasado como parámetro a then:
   * 
   * note.save()
    .then(savedNote => {
      response.json(savedNote.toJSON())
    })
    .catch(error => next(error)) 
    })
   * 
   */

  /**
   * Podemos lograr la misma funcionalidad de una manera mucho más limpia con el encadenamiento de promesas:
   * note
    .save()
    .then(savedNote => {
      return savedNote.toJSON()
    })
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    }) 
    .catch(error => next(error)) 
  })
   * 
   */

  const note = new Note({
    content: newNote.content,
    important: newNote.important || false,
    date: new Date(),
    id: generateId(),
  })

  note.save()
  .then(savedNote => savedNote.toJSON())
  .then(
    savedNoteFormmated => {
      res.json(savedNoteFormmated)
    }
  ).catch(
    error => next(error)
  )
})

//HAREMOS UN ACTUALIZADOR DE LA INFORMACION EN LA BASE DE DATOS
app.put('/api/notes/:id', (req, res, next) => {
  const urlId=req.params.id;
  const note = {
    content: req.body.content,
    important: req.body.important
  }
  /**
   * Hay un detalle importante con respecto al uso del método findByIdAndUpdate. 
   * De forma predeterminada, el parámetro updatedNote del controlador de eventos recibe el documento 
   * original sin las modificaciones. Agregamos el parámetro opcional { new: true }, que hará que nuestro controlador de 
   * eventos sea llamado con el nuevo documento modificado en lugar del original.
   */
  Note.findByIdUpdate(urlId, note, {new: true}).then(
    updatedNote => res.json(updatedNote)
  ).catch(
    error => next(error)
  )
})

//TIPOS DE SOLICITUDES HTTP

/**
 * El estándar HTTP habla de dos propiedades relacionadas con los tipos de solicitud, segura and idempotente.
 * La solicitud HTTP GET debe ser segura:
 * En particular, se ha establecido la convención de que los métodos GET y HEAD NO DEBEN tener la importancia de tomar una acción que no sea la recuperación. 
 * Estos métodos deben considerarse "seguros".
 */

//HEAD
/****
 * El estándar HTTP también define el tipo de solicitud HEAD, que debería ser seguro. En la práctica, HEAD debería funcionar exactamente como GET, pero no devuelve 
 * nada más que el código de estado y los headers de respuesta. El cuerpo de la respuesta no se devolverá cuando realice una solicitud HEAD.
 */

// TODAS LAS SOLICITUDES HTTP EXCEPTO POST DEBEN DE SER IDEMPOTENTES
/***
 * Los métodos también pueden tener la propiedad de "idempotencia" en el sentido de que (aparte de errores o problemas de caducidad) los efectos secundarios de N > 0 solicitudes idénticas 
 * son los mismos que para una sola solicitud. Los métodos GET, HEAD, PUT y DELETE comparten esta propiedad
 */

app.use(unknownEndpoint)

//Usamos el middleware de errores
app.use(errorHandler)

//SIRVIENDO ARCHIVOS ESTATICOS DESDE EL BACKEND
/***
 * Una opción para implementar el frontend es copiar la compilación de producción (el directorio build) a la raíz del repositorio del backend y configurar el 
 * backend para que muestre la página principal del frontend (el archivo build/index.html) como su página principal.
 * Para ello, se movio la carpeta build, del proyecto "notes-alter-data-server" hacia la raiz donde se encuentra la logica 
 * del backend, en este caso, es api_course el nombre del mismo.
 * 
 *  Para hacer que express muestre contenido estático, la página index.html y el JavaScript, etc., necesitamos un middleware integrado de express llamado static.
 * Cuando agregamos lo siguiente en medio de las declaraciones de middlewares
 * app.use(express.static('build'))
 * En donde 'build' le indicara al middleware el nombre de nuestro archivo
 */

//PROXY
/***
 * Debido a que en el modo de desarrollo el frontend está en la dirección localhost:3000, las solicitudes al backend van a la dirección incorrecta localhost:3000/api/notes.. 
 * El backend está en localhost:3001.
 * 
 * Si el proyecto se creó con create-react-app, este problema es fácil de resolver. Es suficiente agregar la siguiente declaración al archivo package.json del repositorio de frontend.
 * {
  "dependencies": {
    // ...
  },
  "scripts": {
    // ...
  },
  "proxy": "http://localhost:3001"
  }
  
 * Agregando el proxy del backend de desarrollo, lo que se hara es que, 
  el código de React realiza una solicitud HTTP a una dirección de servidor en http://localhost:3000 no administrada por la aplicación React en sí (es decir, cuando las solicitudes no 
  tratan de obtener el CSS o JavaScript de la aplicación), la solicitud se redirigirá a el servidor en http://localhost:3001. 
 */

//GUARDANDO DATOS EN MONGODB

//MONGODB
/***
 * Para almacenar nuestras notas guardadas indefinidamente, necesitamos una base de datos. La mayoría de los cursos que se imparten en la Universidad de Helsinki utilizan bases de datos relacionales. 
 * En este curso usaremos MongoDB, que es la denominada base de datos de documentos.
 */

//SCHEMA

/***
 * El schema le dice a mongoose como se almacenaran los objetos en la base de datos.
 * Un schema puede ir definido de la siguiente manera: 
 * const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
  })
 */

//MODEL
/***
 * Se tiene que el modelo, es aquella coleccion de schemas que contienen los datos
 * estos modelos son nombrados y estructurados de la siguiente mannera: 
 * 
 * const Note = mongoose.model('Note', noteSchema)
 * 
 * En donde se tiene que para el modelo se recibe el nombre que se le quiere dar, como tambien, 
 * el schema o estructura que tendran estas colecciones.
 */


//CREAR Y GUARDAR OBJETOS EN MONGODB
/***
 * Los modelos son las llamadas funciones constructoras que crean nuevos objetos JavaScript basados ​​en los 
 * parámetros proporcionados. Dado que los objetos se crean con la función constructora del modelo, tienen todas las 
 * propiedades del modelo, que incluyen métodos para guardar el objeto en la base de datos.
 */

/***
 * Guardar el objeto en la base de datos ocurre con el método save, que se puede proporcionar con un controlador de eventos con el método then:
 * 
 * note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
  })
 * 
 */

//OBTENIENDO OBJETOS DE LA BASE DE DATOS

/***
 * Para obtener datos de una base de datos de mongo, se utiliza 
 * lo siguiente: 
 * Note.find({}).then((result) => {
  result.forEach((notes) => {
    console.log(notes);
  });
  mongoose.connection.close()
});

  Tambien se tienen otros comandos como findOne, en donde solamente devuelve una 
  coleccion de todas las que se encuentran guardadas en la base de datos.

  Los objetos se recuperan de la base de datos con el método find del modelo Note. El parámetro 
  del método es un objeto que expresa condiciones de búsqueda. Dado que el parámetro es un objeto vacío {}, obtenemos 
  todas las notas almacenadas en la colección notes.

 */

  //BACKEND CONECTADO A UNA BASE DE DATOS 

//CONFIGURACION DE LA BASE DE DATOS EN SU PROPIO MODULO
/***
 * Basicamente consiste en separar la parte principal de la base de datos 
 * en un archivo por aparte, y con ese mismo archivo realizar todas las funciones del schema y modelo 
 * creado en la base de datos.
 */

//MOVER EL MANEJO DE ERRORES AL MIDDLEWARE
/**
 * Esto consiste en tener un middleware que haga el manejo de todos los errores que se encuentren en el codigo, 
 * y asi evitar que se vaya poniendo en partes del codigo cada uno de los errores.
 * 
 * Para este caso haremos uso del tercer parametro "next", el cual se encargara de pasar al siguiente middleware, 
 * el cual sera el controlador de nuestros errores. Dicho parametro es una funcion que recibe un parametro, el cual 
 * consistira en la porcion de codigo o middleware siguiente que se debe de ejecutar. 
 */

//VALIDACIÓN Y ESLint

/**
 * Por lo general, existen restricciones que queremos aplicar a los datos que se almacenan en la base de datos 
 * de nuestra aplicación. Nuestra aplicación no debe aceptar notas que tengan una propiedad content vacía o faltante. 
 * La validez de la nota se comprueba en el controlador de ruta:
 * 
 * app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  // ...
})
 */

/***
 * Tambien se tiene que la validacion se puede hacer desde el propio schemma establecido en mongoose,
 * esto se logra aplicando ya sea un "minlength" y un "required" aplicado al campo del schema que se 
 * quiere validar que no llegue vacio. 
 * 
 * const noteSchema = new mongoose.Schema({

  content: {
    type: String,
    minlength: 5,
    required: true
  },
  date: { 
    type: Date,
    required: true
  },
  important: Boolean
})
 * 
 */

/***
 * Las últimas filas enlazan el servidor http asignado a la variable app, para escuchar las solicitudes 
 * HTTP enviadas al puerto 3001:
 */
const PORT = process.env.PORT
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})