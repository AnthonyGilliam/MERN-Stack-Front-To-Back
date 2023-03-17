const mongoose = require('mongoose');

// 3:9 - Use the mongoose.Schema() method to declare object-based schemas that define data in a MongoDB collection
//  Each schema should correlate to a collection in the database
//  Pass in a JSON object mapping all the relevant collection fields
const UserSchema = new mongoose.Schema({
    // 3:9 - Each relevant field in the collection should be mapped to a property
    //  A schema property can be assigned to a SchemaType (String, Number, etc.) or a POJO (Plain Old JSON Object)
    //  containing metadata about the object: https://mongoosejs.com/docs/guide.html#definition
    name: {
        // Always define the property's type when using a POJO: https://mongoosejs.com/docs/schematypes.html#what-is-a-schematype
        type: String,
        // Schema validation is also placed in SchemaType definition as well: https://mongoosejs.com/docs/validation.html#validation
        require: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
        type: String,
        required: true,
        // The unique option for schemas is not a validator. It's a convenient helper for building MongoDB unique
        // indexes: https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
        unique: true,
    },
    // Using Gravatar as avatar string: https://en.gravatar.com/
    avatar: String,
    date: {
        type: String,
        // Use the "default" property of a SchemaType to assign a field's default value
        default: Date.now,
    }
});

// Models are responsible for creating and reading documents from the underlying MongoDB database
//  An instance of a model is called a document
//  Call mongoose.model() on a schema to have Mongoose compile a model object
//  Pass in the singular name of the collection the model is for as the first parameter
//   **Mongoose automatically looks for a collection named the plural, lower cased version of this name
//  Pass in the Schema associated with this model as the second parameter
const User = mongoose.model('user', UserSchema);

// 3:9 - Export a schema's model for it to be used by the application
module.exports = User;
