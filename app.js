const dotenv = require("dotenv").config();
const http = require("http");
const { readFileSync, writeFileSync } = require("fs");
const homePage = readFileSync("./index.html");
let devJSON = readFileSync("./data.json");
let devObj = JSON.parse(devJSON);

const port = process.env.SERVER_PORT;
const hostName = process.env.SERVER_HOSTNAME;

const server = http.createServer((req, res) => {
  // route match
  const reqRoute = /[/devs/][0-9]/.test(req.url);

  // id extract from the url
  const reqId = Number(req.url.split("/")[2]);
  // console.log(reqId)

  // home routes
  if (req.url === "/" && req.method == "GET") {
    res.writeHead(200, { "Content-type": "text/html" });
    res.write(homePage);
    res.statusCode = 200;
    res.end();
  }

  // get all data
  else if (req.url == "/devs" && req.method == "GET") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.write(devJSON);
    res.end();
  }

  // get single data
  else if (reqRoute && req.method == "GET") {
    if (devObj.some((data) => data.id == reqId)) {
      const data = devObj.find((data) => data.id == reqId);
      res.writeHead(200, { "Content-type": "application/json" });
      res.write(JSON.stringify(data));
      res.end();
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.write(
        JSON.stringify({
          message: "no data found",
        })
      );
      res.end();
    }
  }

  // add new data
  else if (req.url == "/devs" && req.method == "POST") {
    let newData = "";
    req.on("data", (chunk) => {
      newData = newData + chunk.toString();
      devObj.push(JSON.parse(newData));
      writeFileSync("./data.json", JSON.stringify(devObj));
    });
    res.writeHead(200, { "Content-type": "application/json" });
    res.write(JSON.stringify(devObj));
    res.end("");
  }

  // delete single data
  else if (reqRoute && req.method == "DELETE") {
    if (devObj.some((data) => data.id == reqId)) {
      const index = devObj.findIndex((data) => data.id == reqId);
      if (index !== -1) {
        devObj.splice(index, 1);
        writeFileSync("./data.json", JSON.stringify(devObj));
        res.writeHead(200, { "Content-type": "application/json" });
        res.write(
          JSON.stringify({
            message: "successfully deleted",
          })
        );
        res.end("");
      }
    } else {
      res.writeHead(500, { "Content-type": "application/json" });
      res.write(
        JSON.stringify({
          message: "error while deleting the data",
        })
      );
      res.end();
    }
  }

  // update single data
  else if ((reqRoute && req.method == "PUT") || req.method == "PATCH") {
    if (devObj.some((data) => data.id == reqId)) {
      const index = devObj.findIndex((data) => data.id == reqId);
      let data = {};
      req.on("data", (chunk) => {
        data = chunk.toString();
      });
      req.on("end", () => {
        devObj[index] = {
          id: devObj[index].id,
          ...JSON.parse(data),
        };
        writeFileSync("./data.json", JSON.stringify(devObj));
      });
      res.writeHead(200, { "Content-type": "application/json" });
      res.write(
        JSON.stringify({
          message: "successfully updated",
        })
      );
      res.end("");
    } else {
      res.writeHead(200, { "Content-type": "application/json" });
      res.write(
        JSON.stringify({
          message: "error while updating the data",
        })
      );
      res.end();
    }
  }

  // error routes
  else {
    res.writeHead(200, { "Content-type": "application/json" });
    res.write(
      JSON.stringify({
        message: "Wrong Route",
      })
    );
    res.end("");
  }
});

//server listen
server.listen(port, () => {
  console.log(
    `Server is running on port ${port} or http://${hostName}:${port}`
  );
});
