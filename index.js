require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const personService = require("./models/person");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  personService.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p> <p>${new Date()}</p>`
    );
  });
});

app.get("/api/persons", (request, response) => {
  personService.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  personService
    .findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
  personService.find({}).then((persons) => {
    const body = request.body;
    if (!body.name) {
      return response.status(400).json({
        error: "name missing",
      });
    } else if (!body.number) {
      return response.status(400).json({
        error: "number missing",
      });
    } else if (persons.find((person) => person.name === body.name)) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
    //validate person

    const person = new personService({
      name: body.name,
      number: body.number,
    });
    const error = person.validateSync();
    if (error) {
      console.log(error.message);
      return response.status(400).json({
        error: error.message,
      });
    }

    personService.create(person).then((savedPerson) => {
      response.json(savedPerson);
    });
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = new personService({
    name: body.name,
    number: body.number,
  });
  const error = person.validateSync();
  if (error) {
    console.log(error.message);
    return response.status(400).json({
      error: error.message,
    });
  }
  personService
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  personService
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
