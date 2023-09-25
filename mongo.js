const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Fullstack:${password}@fullstackopen.yvhkeuh.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

console.log(process.argv.length);

if (process.argv.length < 5) {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.map((person) => {
        console.log(`${person.number} ${person.number}`)
    })
    mongoose.connection.close();
    process.exit(1);
  });
}

const name = process.argv[3];
const number = process.argv[4];

const person = new Person({
  name: name,
  number: number,
});

person.save().then((result) => {
  console.log("person saved!");
  mongoose.connection.close();
});
