"use strict";


const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");


const app = express();


app.disable("x-powered-by");


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  }
}))
app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({origin: "*"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get(
  "/",
  (request, response) => {
    response.sendFile(process.cwd() + "/views/index.html");
  }
);

fccTestingRoutes(app);
apiRoutes(app);  
    
app.use((request, response, next) => {
  response
    .status(404)
    .type("text")
    .send("Not Found");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
  if(process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch(error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 3500);
  }
});


module.exports = app;