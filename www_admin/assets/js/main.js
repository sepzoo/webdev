$.noConflict();
var pagina_attuale = "dashboard";
var AppName;

jQuery(document).ready(function ($) {
  "use strict";

  [].slice
    .call(document.querySelectorAll("select.cs-select"))
    .forEach(function (el) {
      new SelectFx(el);
    });

  jQuery(".selectpicker").selectpicker;

  $("#menuToggle").on("click", function (event) {
    $("body").toggleClass("open");
  });

  $(".search-trigger").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $(".search-trigger")
      .parent(".header-left")
      .addClass("open");
  });

  $(".search-close").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $(".search-trigger")
      .parent(".header-left")
      .removeClass("open");
  });

  $("#button-table-aste").on("click", function () {
    AppName.changePage("aste-table", AppName.goAsteTable, AppName.stopLoading);
    // $('#dashboard').hide();
    // $('#aste-table').show();
    // pagina_attuale = 'aste-table';
    // AppName.addAsteTable(AppName.aste);
  });

  $("#button-dashboard").on("click", function () {
    AppName.changePage("dashboard", AppName.goDashboard, AppName.stopLoading);
  });

  $("#button-admin").on("click", function () {
    AppName.changePage("administration", AppName.goAdministration, AppName.stopLoading);
  })

  $('#startVideo').on("click", function () {
    AppName.startVideo()
  })


  AppName = {
    aste: [],
    text: "ciao",
    init: function () {
      /**
       * Click per attivare la
       *      FUNZIONE DI LOGOUT
       */
      $("#logout_buttons button").on("click", function () {
        App.logout_function();
        // do something
      });
    },

    goDashboard: function (page, next, data) {
      console.log("go dashboard");
      $.get("/aste-attive", function (data) {
        console.log(data);
        AppName.addAsteDashboard(data);
        pagina_attuale = "dashboard";
        next(page);
      });

      // $.ajax({
      // 	url: '/aste-attive',
      // 	type: "get",
      // 	async: false,
      // 	success: function (data) {
      // 		console.log(data)
      // 		AppName.addAsteDashboard(data);
      // 		pagina_attuale = 'dashboard';
      // 	},
      // 	error: function () {
      // 		console.log('errore')
      // 	}
      // })

      console.log("fine go dash");
    },

    goAsteTable: function (page, next, data) {
      console.log("go aste table");
      $.get("/aste-table", function (data) {
        AppName.addAsteTable(data);
        pagina_attuale = "aste-table";
        next(page);
      });
    },

    goAdministration: function (page, next) {
      console.log("go administration");
      pagina_attuale = "administration";
      next(page);
    },

    stopLoading: function (page) {
      $("#loading").hide();
      $("#" + page).show();
    },

    changePage: function (page, callback_function, next, data) {
      console.log(pagina_attuale);
      $("#" + pagina_attuale).hide();
      $("#loading").show();
      pagina_attuale = "loading";

      callback_function(page, next, data);
    },

    getSession: function (callback_function) {
      $.get("/session", callback_function);
    },

    /**
     * FUNZIONE per
     *      COLLEGARSI al SERVER
     */
    getValueFromLogin: function (username, password) {
      username = $("#formLoginUsername").val();
      password = $("#formLoginPassword").val();
      AppName.username = username;

      $.post("/login", { nickname: username, password: password }, function (
        data
      ) {
        console.log("/login", data);
        if (data.result) {
          //se il login vaa buon fine ed ho il token, lo uso per aprire la connessione
          App.connection_server(data.token, function () {
            $(location).attr("href", "/admin");
          });
        } else {
          console.log("Username o Password Sbagliata!");
          if (data.notRegistered) {
          }
          // Visualizzi un messaggio di errore per i dati sbagliati.
        }

        if (data === "done") {
          console.log("Richiesta effettuata con successo. Data = " + data);
        }
      });
    },

    // Funzione che server per verificare se la sessione esiste già
    checkSessionLogin: function (data) {
      if (data.token) {
        // la sessione esiste perchè il token è stato creato.
        console.log("/session", data);
        AppName.username = data.nickname;
        App.user = data.nickname;
        App.connection_server(data.token, function () {
          AppName.changePage(
            pagina_attuale,
            AppName.goDashboard,
            AppName.stopLoading
          );
        });
      } else {
        // fai qualcosa se il token non è stato creato, quindi la sessione non esiste.
      }
    },

    /**
     * FUNZIONE per
     *      LOGGARSI sul SITO.
     */
    logging: function () {
      var username;
      var password;

      $("#login-button").on("click", function () {
        // Tramite questa funzione si fa il Login
        AppName.getValueFromLogin(username, password);
      });

      AppName.getSession(function (data) {
        AppName.checkSessionLogin(data);
      });
    },

    sortByDate: function () {
      $("#dashboard-table").tablesorter({
        dataFormat: "uk",
        sortList: [[1, 0]]
      });
    },

    addAsteDashboard: function (data) {
      AppName.aste = data;
      $("#table-dashboard-body").empty();
      data.forEach(function (snap) {
        var element = $(
          '<tr>\
					<th scope="row">' +
          snap.title +
          "</th>\
					<td>" +
          snap.fine +
          "</td>\
					<td>" +
          snap.stato +
          "</td>\
				</tr>"
        );

        $("#table-dashboard-body").append(element);
      });
      AppName.sortByDate();
    },

    goAsteInfo: function (page, next, name) {
      console.log("go aste info");

      $.get("/asta-info/?n=" + name.title, function (data) {
        console.log("dati in arrivo", data);
        AppName.addAstaInfo(data);
        pagina_attuale = "aste-info";
        next(page);
      });
    },

    addAstaInfo: function (snap) {
      var element =
        ' <aside class="profile-nav alt">\
        <section class="card">\
            <div class="card-header user-header alt bg-dark">\
                <div class="media">\
                    <a href="#">\
                        <img class="align-self-center rounded-circle mr-3" style="width:85px; height:85px;" alt="" src="images/admin.jpg">\
                    </a>\
                    <div class="media-body">\
                        <h2 class="text-light display-6" id="vincitore">' +
        snap.vincitore +
        '</h2>\
                    </div>\
                </div>\
            </div>\
            <ul class="list-group list-group-flush">\
                <li class="list-group-item">\
                    <a href="#">\
                        <i class="fa fa-envelope-o"></i> ' +
        snap.title +
        '\
                        <span class="badge badge-primary pull-right">10</span>\
                    </a>\
                </li>\
                <li class="list-group-item">\
                    <a href="#">\
                        <i class="fa fa-tasks"></i> Fine: ' +
        snap.fine +
        '\
                        <span class="badge badge-danger pull-right">15</span>\
                    </a>\
                </li>\
                <li class="list-group-item">\
                <i class="fa fa-bell-o"></i>\
                    <a href="#" id="valore-attuale">\
                        Valore:  ' +
        snap.valore_attuale +
        '\
                    </a>\
                </li>\
                <li class="list-group-item">\
                    <a href="#">\
                        <i class="fa fa-comments-o"></i> Rilancio: ' +
        snap.rilancio_minimo +
        '\
                        <span class="badge badge-warning pull-right r-activity">03</span>\
                    </a>\
                </li>\
            </ul>\
        </section>\
    </aside>';
      if (snap.stato == "conclusa") {
        console.log("asta conclusa");
        $(".chat-container").hide();
        $("#blocca-asta-container").hide();
        $("#liveVideo").hide();
      }
      else {
        $(".chat-container").show();
        $("#liveVideo").show();
        $(".blocca-asta-container").show();
      }

      $("#card-info-asta").empty();
      $("#card-info-asta").append(element);
    },

    addAsteTable: function (data) {
      $("#table-aste-body").empty();
      data.forEach(function (snap) {
        var element = $(
          '<tr>\
					<th scope="row">' +
          snap.title +
          "</th>\
					<td>" +
          snap.fine +
          "</td>\
					<td>" +
          snap.vincitore +
          "</td>\
					<td>" +
          snap.rilancio_minimo +
          "</td>\
					<td>" +
          snap.valore_attuale +
          "</td>\
					<td>" +
          snap.stato +
          '</td>\
					<td>\
                     <button class="btn btn-outline-success">Vai</button>\
                    </td>\
				</tr>'
        );

        $(element).on("click", function () {
          //   $("#aste-table").hide();
          //   $("#aste-info").show();
          $(".message-container").empty();
          App.socketJoin(snap.title);
          AppName.changePage(
            "aste-info",
            AppName.goAsteInfo,
            AppName.stopLoading,
            snap
          );
        });

        $("#table-aste-body").append(element);
      });

      $.fn.dataTable.moment("dd, MM Do, YYYY");
      $("#bootstrap-data-table").dataTable();
    },
    startVideo: function () {
      // Grab elements, create settings, etc.
      // var video = document.getElementById("video");
      var video = $('#video').get()[0];
      var canvas = $('#canvas');
      var ctx = canvas.get()[0].getContext('2d');

      // Get access to the camera!
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();

            var mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.onstart = function (e) {
              this.chunks = [];

              setTimeout(function () {
                console.log('prova')
                mediaRecorder.stop();
              }, 2000);
            };
            mediaRecorder.ondataavailable = function (e) {
              this.chunks.push(e.data);
            };
            mediaRecorder.onstop = function (e) {
              var blob = new Blob(this.chunks, { 'type': 'video/ogg;' });
              App.socket.emit('radio', blob);
              mediaRecorder.start();
            };

            // Start recording
            mediaRecorder.start();
            // Stop recording after 5 seconds and broadcast it to server


            // var timer = setInterval(
            //   function () {
            //     ctx.drawImage(video, 0, 0, 320, 240);
            //     var data = canvas.get()[0].toDataURL('image/jpeg', 1.0);
            //     App.socket.emit('stream', stream);
            //   }, 250);
          });
      }
      $('#startVideo').hide();
      // solo immagini
      // var timer = setInterval(
      //   function () {
      //     ctx.drawImage(video, 0, 0, 320, 240);
      //     var data = canvas.get()[0].toDataURL('image/jpeg', 1.0);
      //     App.socket.emit('stream', canvas.get()[0].toDataURL('image/webp'));
      //   }, 250);
    },
  };

  AppName.init();
  AppName.logging();

  // if (pagina_attuale == "dashboard" || pagina_attuale == null) {
  //   console.log(true);
  //   AppName.changePage("dashboard", AppName.goDashboard, AppName.stopLoading);
  // } else console.log(false);
});
