var tema = 0;
var nombreTema='';
var dataPreguntas = [];
var totalpreguntas = 0;
$(".btn-tema").click(function (e) {
    e.preventDefault();
    var id_tema = $(this).attr('id');
    $.ajax({
        type: 'GET',
        url: '/getcontenido_alumno/',
        data: { tema_id: id_tema },  // Reemplaza tu_id_de_tema con el ID de tema deseado
        dataType: 'json',
        success: function (data) {
            if (data.result === '1') {
                var enlace = data.enlace;
                var shortLink = enlace.substring(32);
                var pdf = data.pdf;
                // Ajustar la ruta para que coincida con la estructura de carpetas
                //pdfurl = pdf.replace('/pdfs/pdfs/', '/pdfs/'); 

                //pdfViewer.setDocument(pdf);
                // Actualizar la URL del visor de PDF
                $('#pdfViewer').attr('src', pdf);
                $('#videoViewer').attr('src', 'https://www.youtube.com/embed/' + shortLink);
                dataPreguntas = data.preguntas

            } else {
                console.log('Material no encontrado para el tema dado');
            }
        },
        error: function () {
            console.log('Error en la solicitud AJAX');
        }
    });


    const listTab = document.getElementById('list-tab');
    listTab.style.pointerEvents = 'auto';
    listTab.style.opacity=1;
    // Colocar el nombre del tema
    var name_tema = $(this).text();
    tema = id_tema;
    nombreTema = name_tema;
    $('#viewText').empty();
    $('#viewText').append("<h4 style='font-weight: bold; color: #fdb128;'>" + name_tema + "</h4>");
});


let preguntas_aleatorias = true;
let mostrar_pantalla_practica_terminada = true;
let reiniciar_puntos_al_reiniciar_la_practica = true;

let pregunta;
let posibles_respuestas;
btn_correspondiente = [
    $("#btn1"),
    $("#btn2"),
    $("#btn3"),
    $("#btn4")
];
let npreguntas = [];

let preguntas_hechas = 0;
let preguntas_correctas = 0;
let preguntas_incorrectas = 0;

function escogerPreguntaAleatoria() {

    getDataDB = dataPreguntas;
    totalpreguntas = getDataDB.length;
    let n;
    if (preguntas_aleatorias) {
        n = Math.floor(Math.random() * getDataDB.length);
    } else {
        n = 0;
    }

    while (npreguntas.includes(n)) {
        n++;
        if (n >= getDataDB.length) {
            n = 0;
        }
        if (npreguntas.length == getDataDB.length) {
            var correct = preguntas_correctas;
            if (mostrar_pantalla_practica_terminada) {
                swal.fire({
                    title: "Práctica finalizado",
                    text: "Puntuación: " + ((preguntas_correctas / totalpreguntas) * 10) + " / 10",
                    icon: "success"
                }).then(async function () {
                    // Guardar la práctica
                    registrarPractica(tema, correct, totalpreguntas);

                    // Redirigir a la página de contenido_alumno después de guardar la práctica
                    window.location.href = '/contenido_alumno/';
                });
            }
            if (reiniciar_puntos_al_reiniciar_la_practica) {
                preguntas_correctas = 0
                preguntas_hechas = 0
                preguntas_incorrectas = 0;
            }
            npreguntas = [];
        }
    }
    npreguntas.push(n);
    preguntas_hechas++;

    escogerPregunta(getDataDB, n);
}

function registrarPractica(tema, preguntas_correctas, totalpreguntas) {
    var csrftoken = getCookie('csrftoken');
    var puntaje = ((preguntas_correctas / totalpreguntas) * 10).toFixed(2) + "/10";
    var username = document.getElementById('name').textContent;
    var data = {
        'username': username,
        'tema': tema,
        'puntaje': puntaje,
        'preguntas_respondidas': preguntas_correctas + "/" + totalpreguntas
    };
    fetch('/registrar_practica/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Asegúrate de obtener el valor correcto de la cookie CSRF
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje); // Mensaje de respuesta del servidor
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function escogerPregunta(params, n) {
    pregunta = params[n];
    $("#pregunta").html(pregunta.enunciado);
    // $("#numero").html(n);
    let pc = preguntas_correctas;
    var puntaje = (pc / totalpreguntas) * 10;
    if (preguntas_hechas > 1) {
        $("#puntaje").html("Puntaje: " + puntaje.toFixed(2) + " / 10");
    } else {
        $("#puntaje").html("");
    }
    desordenarRespuestas(pregunta);
}

function desordenarRespuestas(pregunta) {
    if (preguntas_correctas == 0 && preguntas_incorrectas == 0)
        $("#puntaje").html("Puntaje: 0.00 / 10");

    posibles_respuestas = [
        pregunta.opciones[0], //respuesta incorrecta
        pregunta.opciones[1], //respuesta incorrecta
        pregunta.opciones[2], //respuesta incorrecta
        pregunta.opciones[3] //respuesta correcta
    ];

    posibles_respuestas.sort(function () {
        return Math.random() - 0.5;
    });

    $("#btn1").html(posibles_respuestas[0]);
    $("#btn2").html(posibles_respuestas[1]);
    $("#btn3").html(posibles_respuestas[2]);
    $("#btn4").html(posibles_respuestas[3]);
}

let suspender_botones = false;

function oprimir_btn(i) {
    if (suspender_botones) {
        return;
    }
    suspender_botones = true;
    //Compara las respuestas seleccionada con la respuesta correcta
    if (posibles_respuestas[i] == pregunta.opciones[pregunta.resp_correcta]) {
        preguntas_correctas++;
        btn_correspondiente[i].css("background", "lightgreen");
    } else {
        btn_correspondiente[i].css("background", "pink");
        preguntas_incorrectas++;
    }
    for (let j = 0; j < 4; j++) {
        if (posibles_respuestas[j] == pregunta.opciones[pregunta.resp_correcta]) {
            btn_correspondiente[j].css("background", "lightgreen");
            break;
        }
    }
    if (preguntas_incorrectas == 3) {
        $('#exampleModal').modal('show'); // Mostrar el modal automáticamente
    }
    else {
        setTimeout(function () {
            reiniciar();
            suspender_botones = false;
        }, 2000);
    }

}

function reiniciar() {
    // Restablecer botones y cualquier otro estado necesario
    for (const btn of btn_correspondiente) {
        btn.css("background", "white");
    }

    // Llamar a la función para escoger una nueva pregunta aleatoria
    escogerPreguntaAleatoria();
}

$("#list-questions-list").click(function (e) {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    preguntas_aleatorias = true;
    mostrar_pantalla_practica_terminada = true;
    reiniciar_puntos_al_reiniciar_la_practica = true;
    pregunta = "";
    posibles_respuestas;
    npreguntas = [];
    preguntas_hechas = 0;
    preguntas_correctas = 0;
    preguntas_incorrectas = 0;
    escogerPreguntaAleatoria();
});
var openModalButton = document.getElementById('openModalButton');
openModalButton.addEventListener('click', function () {
    var search = nombreTema;
    console.log(search);
    $.ajax({
        type: 'POST',
        url: '/recomendacion/',
        data: {
            'search': search,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function (data) {
            // Actualizar el contenido del modal con los videos obtenidos
            var modalContent = $('.modal-body .container .row');
            modalContent.empty(); // Limpiar el contenido anterior

            for (var i = 0; i < data.videos.length; i++) {
                var video = data.videos[i];
                var videoHTML = `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <img class="bd-placeholder-img card-img-top" width="100%"
                            src="${video.thumbnail}" preserveAspectRatio="xMidYMid slice"
                            focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                        </img>
                        <div class="card-body">
                            <p class="card-text">${video.title}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-outline-secondary view-button"
                                data-video-url="${video.url}">Mirar</button>
                                </div>
                                <small class="text-muted">${video.duration} mins</small>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                modalContent.append(videoHTML);
            }
            // Agregar evento de clic a los botones de vista
            $('.view-button').click(function () {
                var videoUrl = $(this).data('video-url');
                window.open(videoUrl, '_blank'); // Abrir en nueva pestaña
            });
        }, error: function (xhr, textStatus, errorThrown) {
            console.log('Error:', errorThrown);
        }
    });
});

var cancelarModalButton = document.getElementById('cancelarModalButton');
cancelarModalButton.addEventListener('click', function () {
    window.location.href = '/contenido_alumno/';
});
var close = document.getElementById('close');
close.addEventListener('click', function () {
    window.location.href = '/contenido_alumno/';
});