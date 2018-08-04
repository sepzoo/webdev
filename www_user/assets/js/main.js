$.noConflict();
var pagina_attuale = "dashboard";
var AppName;

jQuery(document).ready(function($) {
  "use strict";

  [].slice
    .call(document.querySelectorAll("select.cs-select"))
    .forEach(function(el) {
      new SelectFx(el);
    });

  jQuery(".selectpicker").selectpicker;

  $("#menuToggle").on("click", function(event) {
    $("body").toggleClass("open");
  });

  $("#aste-globbali").on("click", function(event) {
    AppName.changePage("aste-table", AppName.goAsteTable, AppName.stopLoading);
  });

  $(".search-trigger").on("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(".search-trigger")
      .parent(".header-left")
      .addClass("open");
  });

  $(".search-close").on("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(".search-trigger")
      .parent(".header-left")
      .removeClass("open");
  });

  $("#button-table-aste").on("click", function() {
    AppName.changePage("aste-table", AppName.goAsteTable, AppName.stopLoading);
    // $('#dashboard').hide();
    // $('#aste-table').show();
    // pagina_attuale = 'aste-table';
    // AppName.addAsteTable(AppName.aste);
  });

  $("#button-dashboard").on("click", function() {
    AppName.changePage("dashboard", AppName.goDashboard, AppName.stopLoading);
  });

  $("#my-aste").on("click", function() {
    AppName.changePage("aste-table", AppName.goAsteTable, AppName.stopLoading);
  });

  AppName = {
    aste: [],
    text: "ciao",
    init: function() {
      /**
       * Click per attivare la
       *      FUNZIONE DI LOGOUT
       */
      $("#logout_buttons button").on("click", function() {
        App.logout_function();
        // do something
      });
    },

    goDashboard: function(page, next, data) {
      console.log("go dashboard");
      $.get("/aste-attive", function(data) {
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

    goAsteTable: function(page, next, data) {
      console.log("go aste table");
      $.get("/aste-table", function(data) {
        AppName.addAsteTable(data);
        pagina_attuale = "aste-table";
        next(page);
      });
    },

    stopLoading: function(page) {
      $("#loading").hide();
      $("#" + page).show();
    },

    changePage: function(page, callback_function, next, data) {
      console.log(pagina_attuale);
      $("#" + pagina_attuale).hide();
      $("#loading").show();
      pagina_attuale = "loading";

      callback_function(page, next, data);
    },

    getSession: function(callback_function) {
      $.get("/session", callback_function);
    },

    /**
     * FUNZIONE per
     *      COLLEGARSI al SERVER
     */
    getValueFromLogin: function(username, password) {
      username = $("#formLoginUsername").val();
      password = $("#formLoginPassword").val();
      AppName.username = username;

      $.post("/login", { nickname: username, password: password }, function(
        data
      ) {
        console.log("/login", data);
        if (data.result) {
          //se il login vaa buon fine ed ho il token, lo uso per aprire la connessione
          App.connection_server(data.token, function() {
            if (data.level == "A") $(location).attr("href", "/admin");
            else if (data.level == "U") $(location).attr("href", "/user");
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
    checkSessionLogin: function(data) {
      if (data.token) {
        // la sessione esiste perchè il token è stato creato.
        console.log("/session", data);
        AppName.username = data.nickname;
        App.user = data.nickname;
        App.connection_server(data.token, function() {
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
    logging: function() {
      var username;
      var password;

      $("#login-button").on("click", function() {
        // Tramite questa funzione si fa il Login
        AppName.getValueFromLogin(username, password);
      });

      AppName.getSession(function(data) {
        AppName.checkSessionLogin(data);
      });
    },

    sortByDate: function() {
      $("#dashboard-table").tablesorter({
        dataFormat: "uk",
        sortList: [[1, 0]]
      });
    },

    addAsteDashboard: function(data) {
      AppName.aste = data;
      $("#table-dashboard-body").empty();
      data.forEach(function(snap) {
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

    goAsteInfo: function(page, next, name) {
      console.log("go aste info");

      // trasformiamo la post in get
      $.post("/asta-info", { name: name.title }, function(data) {
        console.log("dati in arrivo", data);
        AppName.addAstaInfo(data);
        pagina_attuale = "aste-info";
        next(page);
      });
      // $.get("/asta-info", { name: "ciao" }, function(data) {
      //   console.log("dati in arrivo", data);
      // });
    },

    addAstaInfo: function(snap) {
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
      $("#card-info-asta").empty();
      $("#card-info-asta").append(element);
    },

    addAsteTable: function(data) {
      $("#table-aste-body").empty();
      data.forEach(function(snap) {
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

        $(element).on("click", function() {
          //   $("#aste-table").hide();
          //   $("#aste-info").show();
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
    }
  };

  AppName.init();
  AppName.logging();

  // if (pagina_attuale == "dashboard" || pagina_attuale == null) {
  //   console.log(true);
  //   AppName.changePage("dashboard", AppName.goDashboard, AppName.stopLoading);
  // } else console.log(false);
});
