const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

// Connect to MongoDB using Mongoose
mongoose.connect(url)
.then(response => console.log('connected to MongoDB'))
.catch((error) => console.log('Error connecting to MongoDB', error.message))

const noteSchema = mongoose.Schema({
    content: {
      type: String,
      //Esto permite que se solicite y revise el estado de los datos antes de ser almacenados en la base de datos
      minlength: 5,
      required: true,
    },
    date: Date,
    important: Boolean,
  })

//Formteamos para que no salgan las versiones de mongo
noteSchema.set('toJSON',{
    transform: (document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)