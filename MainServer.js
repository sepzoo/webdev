var http = require("http");
var EventEmitter = require("events").EventEmitter;
var express = require("express");
var bodyparser = require("body-parser");
var url = require("url");
var request = require("request");
var port = 80;
var logger = new EventEmitter();
var app = express();
var serverWeb = http.createServer(app);
var socketIO = require("socket.io");
var websocketServer = socketIO(serverWeb);
var ss = require('socket.io-stream');
//  Auth token
var jwt = require("jsonwebtoken");
var socketJWT = require("socketio-jwt");
//  Sessione
var session = require("express-session");
// per lo streaming
// var lib = require("webcamstreaming-js");
// var lib = new lib(app, http);

var mySecret = "random-word";

var users = [];

var aste = [
  {
    title: "Asta1",
    stato: "attiva",
    utenti: [],
    fine: "12/12/2018",
    vincitore: "Pippo",
    rilancio_minimo: 20,
    valore_attuale: 100
  },
  {
    title: "Asta2",
    stato: "attiva",
    utenti: [],
    fine: "03/12/2018",
    vincitore: "Pippo",
    rilancio_minimo: 20,
    valore_attuale: 100
  },
  {
    title: "Asta3",
    stato: "conclusa",
    utenti: [],
    fine: "05/12/2018",
    vincitore: "Pippo",
    rilancio_minimo: 20,
    valore_attuale: 100
  },
  {
    title: "Asta4",
    stato: "attiva",
    utenti: [],
    fine: "11/12/2018",
    vincitore: "Pippo",
    rilancio_minimo: 20,
    valore_attuale: 100
  }
];

// moduli del db, contiene tutte le funzioni (query ecc)
var db = require("./dbmodules")

// the session function midleware
var sessionMidleware = session({
  name: "App-Name", // Sarà il nome del Cookie
  secret: mySecret, // Questo segreto è richiesto ed è usato per loggarsi con il cookie.
  resave: false, // Forza il salvataggio della sessione per ogni richeista
  saveUninitialized: true, // Salva una sessione che è nuova, ma non è stata modificata
  cookie: {
    //secure: true, //Note be careful when setting this to true, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection. Please note that secure: true is a recommended option. However, it requires an https-enabled website, i.e., HTTPS is necessary for secure cookies
    maxAge: 6000000
  }
});

// attach the same session to websocket and web server
websocketServer.use(function (socket, next) {
  sessionMidleware(socket.request, socket.request.res, next);
});
app.use(sessionMidleware);

//manage the get and post data
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

var checkUser = function (req, res, next) {
  console.log("entrato");
  if (req.session.user) {
    if (req.session.user) {
      res.send("Sei loggato");
    }
  } else next();
};

app.use("/", express.static("www_user"));

app.get("/login", function (req, res) { res.sendFile(__dirname + "/www/login.html") })
// app.get("/", function(req, res) {
//   if (req.session.user) {
//     res.send("Già Loggato");
//   } else {
//     ;
//     res.redirect("www/index.html");
//   }
// });

//MODULO LOGIN
var checkLoginInput = function (req, res, next) {
  if (req.body.nickname && req.body.password) next();
  else res.send({ result: false, msg: "mancano i dati" }); // Un controllo lato client permetterà di capire se i dati son presenti nel form o meno.
};

var checkLoginDb = function (req, res, next) {
  /* Controlliamo se l'username è già presente nel DataBase tabella user
    unica tabella utenti
  */

  var user;
  //db check login
  db.checkAdminLogin(req.body.nickname, req.body.password, function (element) {
    if (element) user = element[0];
    console.log('utente', user);

    if (!user) {
      console.log("User non in DB");
      // Inviare dati per farsi registrare.
      res.send({
        notRegistered: true,
        message: "Utente non registrato. Registrati!"
      });
    } else {
      //checkadmin controlliamo sul db se è un admin
      //se login riesce
      req.session.user = {
        level: 'A',//'user.level',
        nickname: req.body.nickname,
        token: jwt.sign({ nickname: req.body.nickname, ts: Date.now() }, mySecret)
      };

      console.log("checkLoginRespond: Creazione Sessione");
      // Salviamo la sessione
      req.session.save(function (err) {
        if (err) console.error(err);

        console.log("checkLoginRespond: Salvataggio Sessione Avvenuto.");
        let data = {
          result: true,
          token: req.session.user.token,
          level: req.session.user.level
        };
        res.send(data);
        next();
      });
    }
  })
  // if (users_nickname.username.indexOf(req.body.nickname) == -1) {
  //   console.log("Utente non registrato.");
  //   // Inviare dati per farsi registrare.
  //   res.send({
  //     notRegistered: true,
  //     message: "Utente non registrato. Registrati!"
  //   });
  //   console.log("Utente non in DB ", users_nickname);
  // } else {
  //   console.log("Utente presente, quindi puoi accedere all'account.");
  //   next();
  // }
};

// var checkLoginRespond = function(req, res) {
//   if (req.session.user.level == "A") {
//     app.use("/admin", express.static("www_admin"));
//   } else app.use("/user", express.static("www_user"));
// };
var checkLoginAdmin = function (req, res, next) {
  if (req.session.user && req.session.user.level && req.session.user.level == "A") {
    next();
  } else {
    res.redirect("/login")
    //res.send("Accedi come Utente");
  }
};

app.use("/admin", checkLoginAdmin, express.static("www_admin"));

var checkLoginUser = function (req, res, next) {
  if (req.session.user.level == "U") {
    next();
  } else {
    res.send("Accedi come Amministratore");
  }
};
app.use("/user", checkLoginUser, express.static("www_user"));

var getAste = function (req, res) {
  res.send(aste);
};

var getAsteAttive = function (req, res) {
  var arr = [];
  aste.forEach(function (snap) {
    if (snap.stato == "attiva") {
      var obj = {
        title: snap.title,
        fine: snap.fine,
        stato: snap.stato
      };
      arr.push(obj);
    }
  });
  setTimeout(function () {
    res.send(arr);
    console.log("attendo invio dati");
  }, 1000);
};

var getAsteTable = function (req, res) {
  var arr = [];
  aste.forEach(function (snap) {
    var obj = {
      title: snap.title,
      fine: snap.fine,
      stato: snap.stato,
      valore_attuale: snap.valore_attuale,
      rilancio_minimo: snap.rilancio_minimo,
      vincitore: snap.vincitore
    };
    arr.push(obj);
  });
  setTimeout(function () {
    res.send(arr);
  }, 1000);
};

// app.get('/stream', function (req, res) {
//   lib.sendFile(__dirname + "/www_admin/test.html", res);
// })

var cercaAsta = function (req, res) {
  var obj = findAsta(req.query.n);
  console.log("cercaAsta", req.query.n);
  // aste.forEach(function (snap) {
  //   if (snap.title == req.query.n) obj = snap;
  // });
  setTimeout(function () {
    res.send(obj);
  }, 1000);
};

app.post("/login", checkLoginInput, checkLoginDb);

app.post("/stream", function (req, res) {
  if (req.body.data) console.log("qualcosa è arrivata")
})

//app.get("/asta-info", cercaAsta);

var getSession = function (req, res) {
  res.send(req.session.user);
};
app.get("/asta-info", cercaAsta);
app.get("/session", getSession);
app.get("/aste-attive", getAsteAttive);
app.get("/aste-table", getAsteTable);

// app.get("/admin", function(req, res) {
//   if (req.session.user.level != "A") {
//     console.log("Utente non auterizzato");
//     res.send("No autorized");
//   } else res.sendfile(__dirname + "/www_admin");
// });

var destroySession = function (req, res) {
  req.session.destroy(function (err) {
    console.log("Server -> Sessione distrutta.");
    res.send("Deleted");
  });
};

app.post("/logout", destroySession);

websocketServer.on(
  "connection",
  socketJWT.authorize({
    secret: mySecret,
    timeout: 30000
  })
);

function findAsta(title) {
  var currentAsta;
  aste.forEach(function (snap) {
    if (snap.title == title) currentAsta = snap;
  });
  return currentAsta;
}
websocketServer.on("authenticated", function (socketC) {
  console.log("Un Utente si è collegato");

  if (socketC.request.session.user)
    users[socketC.request.session.user.nickname] = socketC; // Inseriamo nell'Array Users la Socket

  socketC.on("logout_event", function (data) {
    console.log("Server -> socket:", data);
    var nickname = socketC.request.session.user.nickname;
    if (nickname) {
      delete users[nickname];
      console.log("Lista precedente: ", users_nickname);
      users_nickname.splice(users_nickname.indexOf(nickname), 1);
      console.log("Lista successiva: ", users_nickname);
      console.log("Si è disconnesso", nickname);
    }
  });

  // GESTIONE ROOM
  socketC.on("roomJoined", function (room) {
    socketC.join(room);
    _room = room;
    socketC.request.session.user.room = room;
    socketC.request.session.save(function (err) {
      if (err) console.log(err);
      console.log("room aggiunta alla sessione del client");
    });
    console.log("qualcuno si è connesso alla room", room);
    socketC.emit("joinedIntoRoom");
  });

  socketC.on("sendMessage", function (data) {
    console.log("messaggio arrivato", data, socketC.request.session.user.room);
    var currentAsta = findAsta(socketC.request.session.user.room);
    console.log(currentAsta);
    if (currentAsta.stato == "attiva") {
      var newValue;
      var rilancio = parseInt(data.message);
      if (rilancio >= currentAsta.rilancio_minimo) {
        newValue = currentAsta.valore_attuale + parseInt(data.message);
        currentAsta.valore_attuale = newValue;

        newData = {
          name: data.name,
          message: data.message,
          time: data.time,
          valoreAttuale: newValue
        };
        websocketServer
          .in(socketC.request.session.user.room)
          .emit("messageReceived", newData);
      }
      else {
        newData = {
          name: "message from server",
          message: "rilancio non accettato"
        };

        websocketServer
          .in(socketC.request.session.user.room)
          .emit("server response", newData);
      }
    }
  });

  socketC.on("closeAuction", function () {
    var currentAsta = findAsta(socketC.request.session.user.room);
    currentAsta.stato = "conclusa";

    //salva sul db i dati dell'asta

    websocketServer
      .in(socketC.request.session.user.room)
      .emit("auctionClosed", { message: "Asta conclusa dall'amministratore" });
  });
});

serverWeb.listen(port, function () {
  logger.emit("info", "Server avviato sulla porta", port);
});
