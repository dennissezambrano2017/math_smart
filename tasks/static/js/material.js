var idMaterial = 0;
var idTema = 0;
var opcionesDetalle = [];
var botonAgregado = false;
var botonAgregadoEdit = false;
var idListMaterial = 0;
autosize($('#preguntaOpciones'));
$(".btnViewMaterial").click(function () {
    var csrftoken = getCookie('csrftoken');
    var materialId = $(this).attr("vid");
    idMaterial = materialId;
    $.ajax({
        url: '/material_seleccionada/',
        type: 'GET',
        data: {
            "idMaterial": materialId,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            if (!botonAgregado) {
                // Código de evento aquí (si es necesario)
                // Crea un nuevo botón
                var nuevoBoton = document.createElement("button");
                nuevoBoton.type = "button";
                nuevoBoton.className = "btn btn-sm btn-success";
                nuevoBoton.dataset.bsToggle = "modal";
                nuevoBoton.dataset.bsTarget = "#modalRegist-ejercicio";
                nuevoBoton.textContent = "Agregar Ejercicios";
                nuevoBoton.setAttribute("vid", materialId);

                // Encuentra el elemento <div> donde deseas agregar el botón
                var contenedor = document.getElementById("miDiv");

                // Agrega el botón al <div>
                contenedor.appendChild(nuevoBoton);

                // Marca el botón como agregado
                botonAgregado = true;
            }
            // Mostrar el nombre del archivo PDF seleccionado
            var pdfFileName = d.pdf.split('/').pop();
            $("#pdfFileView").val(pdfFileName);

            // Actualizar el valor del enlace
            $("#nombreEnlace").val(d.enlace);

            // Obtener el select por su ID
            var selectUnidad = $("#selectViewMaterial");

            // Limpiar las opciones previas (si las hay)
            selectUnidad.empty();

            // Recorrer los temas y agregarlos como opciones al select
            d.temas.forEach(function (tema) {
                // Crear la opción y establecer los atributos
                var option = $('<option>', {
                    value: tema.id,
                    text: tema.nombre
                });
                // Si la unidad actual es la preseleccionada, establecer el atributo "selected"
                if (tema.id === d.material_id) {
                    option.prop("selected", true);
                }

                // Agregar la opción al select
                selectUnidad.append(option);
            });


            // Actualizar la tabla de ejercicios (si es necesario)
            var tablaEjercicios = $("#tablaEjercicios");
            tablaEjercicios.empty();
            //var viewButtonCell = $(`<td style="text-align: center;">`).html();

            if (d.ejercicios.length > 0) {
                d.ejercicios.forEach(function (ejercicio) {
                    // Crear una nueva fila y celdas para la tabla de ejercicios
                    var newRow = $("<tr>");
                    var idCell = $("<td>").text(ejercicio.id);
                    var enunciadoCell = $("<td>").text(ejercicio.enunciado);
                    // Crear botones
                    var viewButton = $("<a>").addClass("btn btn-secondary")
                        .attr("href", "javascript:btnViewEjercicio(" + ejercicio.id + ");")
                        .html('<i class="fa-solid fa-eye" aria-hidden="true"></i>');

                    var deleteButton = $("<a>").addClass("btn btn-danger")
                        .attr("href", "javascript:confi_delet_ejercicio(" + ejercicio.id + ");")
                        .html('<i class="fa-solid fa-trash" aria-hidden="true"></i>');

                    var viewButtonCell = $("<td>").css("text-align", "center")
                        .append(viewButton, deleteButton);

                    // Agregar las celdas a la fila
                    newRow.append(idCell, enunciadoCell, viewButtonCell);

                    // Agregar la fila a la tabla de ejercicios
                    tablaEjercicios.append(newRow);
                });
            } else {
                tablaEjercicios.append('<p>No se encontraron ejercicios registrados.</p>');
            }
        } else {
            console.log('Error en la obtención de datos');
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log('Error en la solicitud AJAX');
    });
});
$(document).ready(function () {
    // Obtener el elemento select
    var selectUnidad = $('#selectViewTema-ma');

    // Lógica para cargar los datos de unidades en el select
    $.ajax({
        url: '/obtener_temas/',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // Iterar a través de los datos y agregar opciones al select
            $.each(data, function (index, unidad) {
                selectUnidad.append($('<option>', {
                    value: unidad.id,
                    text: unidad.nombre
                }));
            });
        },
        error: function () {
            console.log('Error al cargar los datos de unidades.');
        }
    });

    // Obtener el valor del parámetro en la URL
    var params = new URLSearchParams(window.location.search);
    var showAlert = params.get('showAlert');

    if (showAlert === 'true') {
        // Mostrar la alerta de éxito
        mostrarAlerta("Se registro el contenido correctamente.", "success", "#alertMessage");

        // Remover el parámetro de la URL para que no se acumule
        history.replaceState({}, document.title, window.location.pathname);
    }



});
function confi_delet_ejercicio(id) {
    // Obtener una referencia al modal
    var modal = $('#modalDelet');
    // Activar el modal
    modal.modal('show');
    idElim = id;
}
function confi_delet_material(id) {
    // Obtener una referencia al modal
    var modal = $('#modalDeletMaterial');
    // Activar el modal
    modal.modal('show');
    idListMaterial = id;
}
function delete_material() {
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/eliminar_material/',
        type: 'POST',
        data: {
            "idMaterial": idListMaterial,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            mostrarAlerta(d.message, "danger", "#alertMessage");
        } else {
            mostrarAlerta(d.message, "danger", "#alertMessag");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        mostrarAlerta(d.message, "danger", "#alertMessage")
    }).always(function (data) {
    });

}
// función para eliminar un contenido luego de haberse confirmado la acción
function delete_ejercicio() {
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/eliminar_ejercicio/',
        type: 'POST',
        data: {
            "idEjercicio": idElim,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            mostrarAlerta(d.message, "danger", "#alertMessage");
        } else {
            mostrarAlerta(d.message, "danger", "#alertMessag");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        mostrarAlerta(d.message, "danger", "#alertMessage")
    }).always(function (data) {
    });

}
function btnViewEjercicio(id) {
    $("#preguntaOpciones").prop('disabled', true);
    // Obtener una referencia al modal
    var modal = $('#modalViewRespue-material');
    // Activar el modal
    modal.modal('show');
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/ejercicio_material/',
        type: 'GET',
        data: {
            "ejercicioId": id,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            $("#ejercicioEnunciado").val(d.enunciado);
            if (d.opciones.length > 0) {
                var opcionesText = ""; // Variable para almacenar el texto de las opciones

                d.opciones.forEach(function (opcion, index) {
                    opcionesText += (index + 1) + ".- " + opcion + "\n";
                });

                var textarea = $("#ejercicioOpciones");
                var respuestaCorrectaInput = $("#respuestaCorrecta");
                // Insertar el texto en el textarea
                textarea.val(opcionesText);

                // Ajustar el número de filas del textarea según la cantidad de opciones
                textarea.attr("rows", d.opciones.length);

                // Insertar la respuesta correcta en el input correspondiente
                respuestaCorrectaInput.val((d.resp_correct + 1) + ".- " + d.opciones[d.resp_correct]);
            }

        } else {
            console.log('Error en la obtención de datos');
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log('Error en la solicitud AJAX');
    });
}
$(document).on('submit', '#formRgMaterial', function (e) {
    e.preventDefault();

    var enlace = $('#nombreEnlaceReg').val();
    var archivoInput = document.getElementById('inputGroupFile01');
    var archivo = archivoInput.files[0];
    var tema_id = $('#selectViewTema-ma').val();

    var formData = new FormData(); // Usar FormData para enviar archivos
    formData.append('enlace', enlace);
    formData.append('archivo_pdf', archivo); // Cambiar 'archivo' por 'archivo_pdf'
    formData.append('tema_id', tema_id);
    formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

    $.ajax({
        type: 'POST',
        url: '/create_material/',
        data: formData, // Usar formData en lugar de un objeto plano
        processData: false, // Evitar procesamiento automático de datos
        contentType: false, // Evitar configuración automática de contenido
        dataType: 'json',
        success: function (data) {
            if (data.result === 'success') {
                // Mostrar la alerta de éxito después de completar la redirección
                window.location.search = '?showAlert=true'; // Redirigir sin cambiar toda la URL
                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";
                // Obtener el valor del parámetro en la URL
                var params = new URLSearchParams(window.location.search);
                var showAlert = params.get('showAlert');

                if (showAlert === 'true') {
                    // Mostrar la alerta de éxito
                    mostrarAlerta("Se registro el material correctamente.", "success", "#alertMessage");

                    // Remover el parámetro de la URL para que no se acumule
                    history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                mostrarAlerta(data.message, "danger", "#alertMessageRegister");
            }
        },
        error: function () {
            console.log("data.message");
            // mostrarAlerta(data.message, "danger", "#alertMessageRegister")
        }
    });
});
$(document).on('submit', '#formRgejercicio', function (e) {
    e.preventDefault();
    var csrftoken = getCookie('csrftoken');
    var enunciado = $('#preguntaEnunciado').val();
    var respuesta = $('#preguntaCorrecta').val();

    var opci = JSON.stringify(opcionesDetalle);
    $.ajax({
        type: 'POST',
        url: '/create_ejercicio/',
        data: {
            "enunciado": enunciado,
            "opciones": opci,
            "respuesta": (respuesta - 1),
            "material_id": idMaterial,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
        success: function (data) {
            if (data.result === 'success') {
                opcionesDetalle = [];
                // Mostrar la alerta de éxito después de completar la redirección
                window.location.search = '?showAlert=true'; // Redirigir sin cambiar toda la URL
                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";
                // Obtener el valor del parámetro en la URL
                var params = new URLSearchParams(window.location.search);
                var showAlert = params.get('showAlert');

                if (showAlert === 'true') {
                    // Mostrar la alerta de éxito
                    mostrarAlerta("Se registro el material correctamente.", "success", "#alertMessage");

                    // Remover el parámetro de la URL para que no se acumule
                    history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                mostrarAlerta(data.message, "danger", "#alertMessageRegister");
            }
        },
        error: function () {
            mostrarAlerta(data.message, "danger", "#alertMessageRegister")
        }
    });
});
$(document).on('submit', '#formRgEditejercicio', function (e) {
    e.preventDefault();
    var csrftoken = getCookie('csrftoken');
    var enunciado = $('#preguntaEnunciadoEdit').val();
    var respuesta = $('#preguntaCorrectaEdit').val();

    var opci = JSON.stringify(opcionesDetalle);
    $.ajax({
        type: 'POST',
        url: '/create_ejercicio/',
        data: {
            "enunciado": enunciado,
            "opciones": opci,
            "respuesta": respuesta,
            "material_id": idMaterial,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
        success: function (data) {
            if (data.result === 'success') {
                opcionesDetalle = [];
                // Mostrar la alerta de éxito después de completar la redirección
                window.location.search = '?showAlert=true'; // Redirigir sin cambiar toda la URL
                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";
                // Obtener el valor del parámetro en la URL
                var params = new URLSearchParams(window.location.search);
                var showAlert = params.get('showAlert');

                if (showAlert === 'true') {
                    // Mostrar la alerta de éxito
                    mostrarAlerta("Se registro el material correctamente.", "success", "#alertMessage");

                    // Remover el parámetro de la URL para que no se acumule
                    history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                mostrarAlerta(data.message, "danger", "#alertMessageRegister");
            }
        },
        error: function () {
            mostrarAlerta(data.message, "danger", "#alertMessageRegister")
        }
    });
});

$(".btnAñadirOpciones").click(function () {
    var opcion = $('#preguntaOpcion').val();
    var opcion2 = $('#preguntaOpcionEdit').val();
    if (opcionesDetalle.length < 4) {
        if (opcion.trim() !== '') {
            opcionesDetalle.push(opcion);
            actualizarOpcionesMostradas('#preguntaOpcion', '#preguntaOpciones');
            $('#preguntaOpcion').val("");
            autosize.update($('#preguntaOpciones'));
        }
        if (opcion2.trim() !== '') {
            opcionesDetalle.push(opcion2);
            actualizarOpcionesMostradas('#preguntaOpcionEdit', '#preguntaOpcionesEdit');
            $('#preguntaOpcionEdit').val("");
            autosize.update($('#preguntaOpcionesEdit'));
        }
    }
    if (opcionesDetalle.length === 4) {
        if (opcion.trim() !== '') {
            const preguntaOpcionInput = document.getElementById('preguntaOpcion');
            $('#preguntaOpcion').val("");
            preguntaOpcionInput.disabled = true;
        }
        if (opcion2.trim() !== '') {
            const preguntaOpcionInput = document.getElementById('preguntaOpcionEdit');
            $('#preguntaOpcionEdit').val("");
            preguntaOpcionInput.disabled = true;
        }

    }
});

function actualizarOpcionesMostradas(op, opci) {
    var listaOpciones = opcionesDetalle.map(function (opcion, index) {
        return (index + 1) + '.- ' + opcion;
    }).join('\n'); // Unir las opciones con saltos de línea

    $(opci).val(listaOpciones); // Usar .val() en lugar de .html()
    $(opci).prop('disabled', true); // Deshabilitar el textarea después de actualizar
}
function restablecer() {
    console.log("Restableciendo campos...")
    // Restablecer los valores de los campos a sus valores iniciales
    $("#preguntaEnunciado").val('');
    $("#preguntaOpcion").val('');
    $("#preguntaOpciones").val('');
    $("#preguntaCorrecta").val('');
    opcionesDetalle = [];
    // Si estás usando el atributo 'disabled', habilita el campo de opciones

}

$(".btnEditMaterial").click(function () {
    var csrftoken = getCookie('csrftoken');
    var materialId = $(this).attr("vid");
    idMaterial = materialId;
    $.ajax({
        url: '/material_seleccionada/',
        type: 'GET',
        data: {
            "idMaterial": materialId,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            if (!botonAgregadoEdit) {
                // Código de evento aquí (si es necesario)
                // Crea un nuevo botón
                var nuevoBoton = document.createElement("button");
                nuevoBoton.type = "button";
                nuevoBoton.className = "btn btn-sm btn-success";
                nuevoBoton.dataset.bsToggle = "modal";
                nuevoBoton.dataset.bsTarget = "#modalRegistEdit-ejercicio";
                nuevoBoton.textContent = "Agregar Ejercicios";
                nuevoBoton.setAttribute("vid", materialId);

                // Encuentra el elemento <div> donde deseas agregar el botón
                var contenedor = document.getElementById("miDivEdit");

                // Agrega el botón al <div>
                contenedor.appendChild(nuevoBoton);

                // Marca el botón como agregado
                botonAgregadoEdit = true;
            }
            // Mostrar el nombre del archivo PDF seleccionado
            var pdfFileName = d.pdf.split('/').pop();
            $("#pdfFileEdit").html(" " + pdfFileName);
            $("label[for='pdfFileEdit']").attr("value", pdfFileName);

            // Actualizar el valor del enlace
            $("#nombreEnlaceEdit").val(d.enlace);

            // Obtener el select por su ID
            var selectUnidad = $("#selectEditMaterial");

            // Limpiar las opciones previas (si las hay)
            selectUnidad.empty();
            var temaSeleccionadoId = d.temas[0].id;
            idTema = temaSeleccionadoId
            d.temas_list.forEach(function (tema) {
                // Crear la opción y establecer los atributos
                var option = $('<option>', {
                    value: tema.id,
                    text: tema.nombre
                });
                // Si la unidad actual es la preseleccionada, establecer el atributo "selected"
                if (tema.id === temaSeleccionadoId) {
                    option.prop("selected", true);
                }
                // Agregar la opción al select
                selectUnidad.append(option);
            });


            // Actualizar la tabla de ejercicios (si es necesario)
            var tablaEjercicios = $("#tablaEjerciciosEdit");
            tablaEjercicios.empty();
            //var viewButtonCell = $(`<td style="text-align: center;">`).html();

            if (d.ejercicios.length > 0) {
                d.ejercicios.forEach(function (ejercicio) {
                    // Crear una nueva fila y celdas para la tabla de ejercicios
                    var newRow = $("<tr>");
                    var idCell = $("<td>").text(ejercicio.id);
                    var enunciadoCell = $("<td>").text(ejercicio.enunciado);
                    // Crear botones
                    var viewButton = $("<a>").addClass("btn btn-secondary")
                        .attr("href", "javascript:btnViewEjercicio(" + ejercicio.id + ");")
                        .html('<i class="fa-solid fa-eye" aria-hidden="true"></i>');

                    var deleteButton = $("<a>").addClass("btn btn-danger")
                        .attr("href", "javascript:confi_delet_ejercicio(" + ejercicio.id + ");")
                        .html('<i class="fa-solid fa-trash" aria-hidden="true"></i>');

                    var viewButtonCell = $("<td>").css("text-align", "center")
                        .append(viewButton, deleteButton);



                    // Agregar las celdas a la fila
                    newRow.append(idCell, enunciadoCell, viewButtonCell);

                    // Agregar la fila a la tabla de ejercicios
                    tablaEjercicios.append(newRow);
                });
            } else {
                tablaEjercicios.append('<p>No se encontraron ejercicios registrados.</p>');
            }

        } else {
            console.log('Error en la obtención de datos');
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log('Error en la solicitud AJAX');
    });
});
$(document).on('submit', '#formEditarMaterial', function (e) {


    var material_id = idMaterial;
    var enlace = $('#nombreEnlaceEdit').val();
    var archivoInput = document.getElementById('inputGroupFile02');
    var archivo = archivoInput.files[0];
    var tema_id = idTema;

    var formData = new FormData();
    formData.append('material_id', material_id);
    formData.append('enlace', enlace);
    formData.append('archivo_pdf', archivo);
    formData.append('tema_id', tema_id);
    formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

    $.ajax({
        type: 'POST',
        url: '/edit_material/',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (data) {
            if (data.result === '1') {
                // Mostrar la alerta de éxito después de completar la modificación
                mostrarAlerta("Se modificó el material correctamente.", "success", "#alertMessage");

                // Redirigir a la página adecuada si es necesario
                // window.location.href = '/ruta-de-redireccion/';
            } else {
                mostrarAlerta(data.message, "danger", "#alertMessageModify");
            }
        },
        error: function () {
            console.log("Error en la solicitud AJAX");
        }
    });
});


function actualizarFila_(selectorFila, selectorNombre, selectorUnidad, nuevoNombre, Seleccionada) {
    // Buscar la fila correspondiente en la tabla
    var fila = $(selectorFila);

    // Actualizar las celdas con los nuevos datos
    fila.find(selectorNombre).text(nuevoNombre);
    fila.find(selectorUnidad).text(Seleccionada);
}