//SERVIDOR WEB SIMPLE

//En la primera fila, la aplicación importa el módulo de servidor web integrado de Node.
//const http = require('http')

//EXPRESS

//Ahora realizaremos lo mismo pero utlizando Express
const express = require('express')
//Ahora usaremos morgan
const morgan = require('morgan')
//Utilizamos cors para que se pueda utilizar el backend desde otro origen
const cors = require('cors')

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

//Se utiliza para capturar solicitudes realizadas a rutas inexistentes
//Devolviendo un mensaje de error en formato JSON
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(requestLogger)
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))

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

app.get('/api/notes', (request, response) => {
  //console.log("Headers: ",request.headers)
  response.json(notes)
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
app.get('/api/notes/:id', (request, response) => {
  //console.log(request.params.id)
  const id = Number(request.params.id)
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
  }
})

//ELIMINAR RECURSOS
app.delete('/api/notes/:id', (req, res) =>{
  const id = req.params.id
  const noteDelete = notes.filter(
    value => value.id !== id
  )

  /**
   * Si la eliminación del recurso es exitosa, lo que significa que la nota existe y se elimina, respondemos a la solicitud con el código de estado 204 no content y no devolvemos datos con la respuesta.
   * No hay consenso sobre qué código de estado debe devolverse a una solicitud DELETE si el recurso no existe. Realmente, las únicas dos opciones son 204 y 404. En aras de la simplicidad, nuestra 
   * aplicación responderá con 204 en ambos casos.
   */
  
  res.status(204).end()
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

app.post('/api/notes', (req, res) => {
  
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
  //Generamos la nueva nota
  const note = {
    content: newNote.content,
    important: newNote.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)
  console.log(note)

  res.json(note)
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

/***
 * Las últimas filas enlazan el servidor http asignado a la variable app, para escuchar las solicitudes 
 * HTTP enviadas al puerto 3001:
 */
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})

