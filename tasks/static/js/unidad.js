// sobrescritura del submit del formulario registrar unidad
$(document).on('submit', '#formRgUnidad', function (e) {
    var data = new FormData(this);
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/create_unidad/',
        data: data,
        contentType: false,
        processData: false,
    }).done(function (d) {
        if (d.result === '1') {
            // Obtener la URL actual sin parámetros
            var currentUrl = window.location.href.split('?')[0];

            // Redirigir la página con el parámetro en la URL
            window.location.href = currentUrl + "?showAlert=true";

            $("#nombre").val("");
        } else {
            mostrarAlerta(d.message, "danger","#alertMessageRegister");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        mostrarAlerta(d.message,"danger","#alertMessage")
    }).always(function (data) {
    });
});

$(".btnObtenerUnidad").click(function () {
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/obtener_unidad/',
        type: 'GET',
        data: {
            "idUnidad": $(this).attr("vid"),
            csrfmiddlewaretoken: csrftoken
        },
        dataType: 'json',
    }).done(function (d) {
        if (d.result == '1') {
            $("#txtEdUnidadNombre").val(d.nombre);
            $("#txtIdUnidad").val(d.id);
        } else {
            show_modal("Mensaje informativo",
                "Error al obtener la unidad, por favor intente nuevamente.",
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
                '<button type="button" class="btn btn-sm btn-primary text-white" data-dismiss="modal">Aceptar</button>');
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
    }).always(function (data) {
    });
});

// sobrescritura del submit del formulario modificar unidad
$(document).on('submit', '#formModUnidad', function (e) {
    var data = new FormData(this);
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/edit_unidad/',
        data: data,
        contentType: false,
        processData: false,
    }).done(function (d) {
        if (d.result === '1') {
            // Cerrar el modal de edición
            $("#modalEdit-Unidad").modal('hide');

            // Mostrar la alerta de éxito
            mostrarAlerta("El cambio se realizó correctamente.", "success","#alertMessage");

            // Esperar un breve período de tiempo antes de ocultar la alerta y recargar la página
            setTimeout(function () {
                $("#alertMessage").hide();
            }, 3000);

            // Actualizar la fila de la tabla con los nuevos datos
            var idUnidad = $("#txtIdUnidad").val(); // Obtiene el ID de la unidad del formulario
            var nuevoNombre = $("#txtEdUnidadNombre").val(); // Obtiene el nuevo nombre de la unidad del formulario
            actualizarFilaTabla(idUnidad, nuevoNombre);

        } else {
            // Mostrar la alerta de error
            mostrarAlerta(d.message, "danger","#alertMessageEdit");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Mostrar la alerta de error
        mostrarAlerta(d.message, "danger","#alertMessage");
    }).always(function (data) {
    });
});

var idElim=0
function confi_delet_unidad(id)
{
    // Obtener una referencia al modal
    var modal = $('#modalDelet');

    // Activar el modal
    modal.modal('show');
    idElim=id;
}
// función para eliminar un unidad luego de haberse confirmado la acción
function delete_unidad(){
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: '/eliminar_unidad/', 
        type: 'POST',
        data: {"idUnidad": idElim,
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

function actualizarFilaTabla(idUnidad, nuevoNombre) {
    // Buscar la fila correspondiente a idUnidad en la tabla y actualizar el nombre
    var fila = $("tr[data-id='" + idUnidad + "']");
    fila.find(".nombre-unidad").text(nuevoNombre);
}

$(document).ready(function () {
    // Obtener el valor del parámetro en la URL
    var params = new URLSearchParams(window.location.search);
    var showAlert = params.get('showAlert');

    if (showAlert === 'true') {
        // Mostrar la alerta de éxito
        mostrarAlerta("Se registro la Unidad correctamente.", "success","#alertMessage");

        // Remover el parámetro de la URL para que no se acumule
        history.replaceState({}, document.title, window.location.pathname);
    }
});



