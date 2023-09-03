$(document).on('submit', '#formRgTema', function (e) {
    e.preventDefault();

    var nombre = $('#nombreTema').val();
    var contenido_id = $('#selectRegisterTema').val();
    //console.log(nombre + contenido_id)
    $.ajax({
        type: 'POST',
        url: '/create_tema/',
        data: {
            'nombre': nombre,
            'contenido_id': contenido_id,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        },
        dataType: 'json',
        success: function (data) {
            if (data.result === 'success') {
                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";
                // Obtener el valor del parámetro en la URL
                var params = new URLSearchParams(window.location.search);
                var showAlert = params.get('showAlert');

                if (showAlert === 'true') {
                    // Mostrar la alerta de éxito
                    mostrarAlerta("Se registro el tema correctamente.", "success", "#alertMessage");

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

$(".btnObtenerTema").click(function () {
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/contenido_seleccionada/',
        type: 'GET',
        data: {
            "idTema": $(this).attr("vid"),
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            $("#nombreTemaModi").val(d.nombre);
            $("#txtIdTema").val(d.tema_id);
            console.log(d.nombre + d.tema_id + d.contenido_id)
            var PreseleccionadaId = d.contenido_id;
            var selectUnidad = $("#selectRegisterTemaModi");

            // Iterar a través de los datos y agregar opciones al select
            $.each(d.contenidos, function (index, contenido) {
                // Crear la opción y establecer los atributos
                var option = $('<option>', {
                    value: contenido.id,
                    text: contenido.nombre

                });
                // Si la unidad actual es la preseleccionada, establecer el atributo "selected"
                if (contenido.id === PreseleccionadaId) {
                    option.prop("selected", true);
                }

                // Agregar la opción al select
                selectUnidad.append(option);
            });
        } else {
            console.log('error')
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
    }).always(function (data) {
    });
});

$(document).on('submit', '#formModTema', function (e) {
    var data = new FormData(this);
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/edit_tema/',
        data: data,
        contentType: false,
        processData: false,
    }).done(function (d) {
        if (d.result === '1') {
            // Cerrar el modal de edición
            $("#modalEdit-Tema").modal('hide');

            // Mostrar la alerta de éxito
            mostrarAlerta("El cambio se realizó correctamente.", "success", "#alertMessage");

            // Esperar un breve período de tiempo antes de ocultar la alerta y recargar la página
            setTimeout(function () {
                $("#alertMessage").hide();
            }, 3000);

            var temaId = $("#txtIdTema").val();
            var nuevoNombre = $("#nombreTemaModi").val();
            var contenidoSeleccionada = $("#selectRegisterTemaModi option:selected").text();
            console.log(temaId, nuevoNombre, contenidoSeleccionada)
            // Llamar a la función genérica de actualización
            actualizarFila_(
                "tr[data-id='" + temaId + "']",
                ".nombre-tema",
                ".contenido-tema",
                nuevoNombre,
                contenidoSeleccionada
            );

        } else {
            // Mostrar la alerta de error
            mostrarAlerta(d.message, "danger", "#alertMessageModif");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Mostrar la alerta de error
        mostrarAlerta(d.message, "danger", "#alertMessage");

    }).always(function (data) {
    });
});

function actualizarFila_(selectorFila, selectorNombre, selectorUnidad, nuevoNombre, Seleccionada) {
    // Buscar la fila correspondiente en la tabla
    var fila = $(selectorFila);

    // Actualizar las celdas con los nuevos datos
    fila.find(selectorNombre).text(nuevoNombre);
    fila.find(selectorUnidad).text(Seleccionada);
}

function confi_delet_tema(id) {
    // Obtener una referencia al modal
    var modal = $('#modalDelet');

    // Activar el modal
    modal.modal('show');
    idElim = id;
}
// función para eliminar un contenido luego de haberse confirmado la acción
function delete_tema() {
    console.log(idElim)
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/eliminar_tema/',
        type: 'POST',
        data: {
            "idTema": idElim,
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {

            mostrarAlerta(d.message, "success", "#alertMessage");
        } else {
            mostrarAlerta(d.message, "danger", "#alertMessag");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        mostrarAlerta(d.message, "danger", "#alertMessage")
    }).always(function (data) {
    });
}

$(document).ready(function () {
    // Obtener el elemento select
    var selectContenido = $('#selectRegisterTema');
    // Lógica para cargar los datos de unidades en el select
    $.ajax({
        url: '/obtener_contenido/',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // Iterar a través de los datos y agregar opciones al select
            $.each(data, function (index, contenido) {
                selectContenido.append($('<option>', {
                    value: contenido.id,
                    text: contenido.nombre
                }));
            });
        },
        error: function () {
            console.log('Error al cargar los datos de contenido.');
        }
    });


});
