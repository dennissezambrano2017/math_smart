// sobrescritura del submit del formulario registrar unidad
$(document).on('submit', '#formRgContenido', function (e) {
    e.preventDefault();

    var nombre = $('#nombreContenido').val();
    var descripcion = $('#descripcionContenido').val();
    var unidad_id = $('#selectRegisterContenido').val();
    console.log(nombre + descripcion + unidad_id)
    $.ajax({
        type: 'POST',
        url: '/create_contenido/',  // Ruta para registrar el contenido (ajusta según tu proyecto)
        data: {
            'nombre': nombre,
            'descripcion': descripcion,
            'unidad_id': unidad_id,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        },
        dataType: 'json',
        success: function (data) {
            if (data.result === 'success') {
                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";
            } else {
                mostrarAlerta(data.message, "danger", "#alertMessageRegister");
            }
        },
        error: function () {
            mostrarAlerta(d.message, "danger", "#alertMessage")
        }
    });
});
$(".btnObtenerContenido").click(function () {
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/unidad_seleccionada/',
        type: 'GET',
        data: {
            "idContenido": $(this).attr("vid"),
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            $("#nombreContenidoMod").val(d.nombre);
            $("#descripcionEdContenido").val(d.descripcion);
            $("#txtIdContenido").val(d.contenido_id);
            var unidadPreseleccionadaId = d.unidad_id;
            var selectUnidad = $("#selectModContenido");

            // Iterar a través de los datos y agregar opciones al select
            $.each(d.unidades, function (index, unidad) {
                // Crear la opción y establecer los atributos
                var option = $('<option>', {
                    value: unidad.id,
                    text: unidad.nombre
                });

                // Si la unidad actual es la preseleccionada, establecer el atributo "selected"
                if (unidad.id === unidadPreseleccionadaId) {
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
// sobrescritura del submit del formulario modificar unidad
$(document).on('submit', '#formModContenido', function (e) {
    var data = new FormData(this);
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/edit_contenido/',
        data: data,
        contentType: false,
        processData: false,
    }).done(function (d) {
        if (d.result === '1') {
            // Cerrar el modal de edición
            $("#modalEdit-Contenido").modal('hide');

            // Mostrar la alerta de éxito
            mostrarAlerta("El cambio se realizó correctamente.", "success", "#alertMessage");

            // Esperar un breve período de tiempo antes de ocultar la alerta y recargar la página
            setTimeout(function () {
                $("#alertMessage").hide();
            }, 3000);

            var contenidoId = $("#txtIdContenido").val();
            var nuevoNombre = $("#nombreContenidoMod").val();
            var nuevaDescripcion = $("#descripcionEdContenido").val();
            var unidadSeleccionada = $("#selectModContenido option:selected").text();

            // Llamar a la función genérica de actualización
            actualizarFila(
                "tr[data-id='" + contenidoId + "']",
                ".nombre-contenido",
                ".descripcion-contenido",
                ".unidad-contenido",
                nuevoNombre,
                nuevaDescripcion,
                unidadSeleccionada
            );

        } else {
            // Mostrar la alerta de error
            mostrarAlerta(d.message, "danger", "#alertMessageModif");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Mostrar la alerta de error
        mostrarAlerta(d.message, "danger", "#alertMessage");
        
    }).always(function (data) {
        mostrarAlerta(d.message, "danger","#alertMessageModif");
    });
});

var idElim=0
function confi_delet_contenido(id)
{
    // Obtener una referencia al modal
    var modal = $('#modalDelet');

    // Activar el modal
    modal.modal('show');
    idElim=id;
}
// función para eliminar un contenido luego de haberse confirmado la acción
function delete_contenido(){
    console.log(idElim)
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/eliminar_contenido/', 
        type: 'POST',
        data: {"idContenido": idElim,
        csrfmiddlewaretoken: csrftoken },
        dataType: 'json',
    }).done(function (d) {
        if(d.result == '1'){
            mostrarAlerta(d.message, "danger","#alertMessage");
        }else{
            mostrarAlerta(d.message, "danger","#alertMessag");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        mostrarAlerta(d.message,"danger","#alertMessage")
    }).always(function (data) {
    });
}

function actualizarFila(selectorFila, selectorNombre, selectorDescripcion, selectorUnidad, nuevoNombre, nuevaDescripcion, unidadSeleccionada) {
    // Buscar la fila correspondiente en la tabla
    var fila = $(selectorFila);

    // Actualizar las celdas con los nuevos datos
    fila.find(selectorNombre).text(nuevoNombre);
    fila.find(selectorDescripcion).text(nuevaDescripcion);
    fila.find(selectorUnidad).text(unidadSeleccionada);
}

$(document).ready(function () {
    // Obtener el elemento select
    var selectUnidad = $('#selectRegisterContenido');

    // Lógica para cargar los datos de unidades en el select
    $.ajax({
        url: '/obtener_unidades/',  
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


// Capturar el clic en el botón "Cancelar"
function restablecer() {
    console.log("Restableciendo campos...1")
    // Restablecer los valores de los campos a vacío
    $("#nombreContenido").val('');
    $("#descripcionContenido").val('');
    $("#nombreTema").val('');
    
    $('#preguntaOpciones').val('');
    $('#preguntaEnunciado').val('');
};