function mostrarAlerta(mensaje, tipo,direccion) {
    var alertMessage = $(direccion);

    alertMessage.text(mensaje).removeClass("alert-success alert-danger").addClass("alert-" + tipo).show();

    // Ocultar la alerta después de un breve período de tiempo
    setTimeout(function () {
        alertMessage.hide();
    }, 3000); // 3000 milisegundos (3 segundos) de espera antes de ocultar
}


// Capturar el clic en el botón "Cancelar"
function restablecer() {
    console.log("Restableciendo campos...")
    // Restablecer los valores de los campos a sus valores iniciales
    $("#nombre").val('');
}
// Función para crear una llave de seguridad "crsftoken" y poder realizar una petición ajax
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}