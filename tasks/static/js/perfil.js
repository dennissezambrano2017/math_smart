var username="";
$(document).on('submit', '#formCanbiarContra', function (e) {
    e.preventDefault();
    var contraseña = $('#password1').val();
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        type: "POST",
        url: "/cambiar_contrasena/",
        data: {
            'contraseña': contraseña,
            'csrfmiddlewaretoken': csrftoken
        },
        dataType: 'json',
        success: function (data) {
            if (data.result === '1') {

                // Obtener la URL actual sin parámetros
                var currentUrl = window.location.href.split('?')[0];

                // Redirigir la página con el parámetro en la URL
                window.location.href = currentUrl + "?showAlert=true";

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
$(document).on('submit', '#formEditarUser', function (e) {
    e.preventDefault();
    var csrftoken = getCookie('csrftoken');
    var usuario_id = username;
    var usuario = $('#usernameEdit').val();
    var nombres = $('#firstnameEdit').val();
    var apellidos = $('#lastnameEdit').val();
    var email = $('#emailEdit').val();
    console.log("ajax"+usuario,nombres,apellidos,email)
    $.ajax({
        type: 'POST',
        url: '/edit_perfil/',
        data: {
            'usuario_id':usuario_id,
            'user': usuario,
            'nombres': nombres,
            'apellidos': apellidos,
            'email': email,
            'csrfmiddlewaretoken': csrftoken
        },
        success: function (response) {
            if (response.result === '1') {
                // Cerrar el modal de edición
                $("#modalEdit-Contenido").modal('hide');

                // Mostrar la alerta de éxito (si tienes la función mostrarAlerta definida)
                mostrarAlerta("El cambio se realizó correctamente.", "success", "#alertMessage");

                // Esperar un breve período de tiempo antes de ocultar la alerta y recargar la página
                setTimeout(function () {
                    $("#alertMessage").hide();
                    // Recargar la página o actualizar el contenido según sea necesario
                    location.reload();
                }, 3000);
            } else {
                // Mostrar la alerta de error
                mostrarAlerta(response.message, "danger", "#alertMessageModif");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Mostrar la alerta de error
            mostrarAlerta("Error en la solicitud.", "danger", "#alertMessage");
        }
    });
});
$(".searchButton").click(function(){
    username = $("#email").val();
    console.log(username)
    $.ajax({
        url: "/get_user_data/",  // Ruta de la vista en Django
        method: "GET",
        data: { username: username },
        success: function(data){
            if ('error' in data) {
                // Manejar el error si el usuario no se encuentra
            } else {
                // Llenar los campos del formulario con los datos recibidos
                $("#usernameEdit").val(data.email);
                $("#firstnameEdit").val(data.first_name);
                $("#lastnameEdit").val(data.last_name);
                $("#emailEdit").val(data.username);
                
                // Mostrar el modal
                $("#EditarUsuario").modal("show");
            }
        }
    });
});

$(document).ready(function () {
    
    // Obtener el valor del parámetro en la URL
    var params = new URLSearchParams(window.location.search);
    var showAlert = params.get('showAlert');

    if (showAlert === 'true') {
        // Mostrar la alerta de éxito
        mostrarAlerta("Se cambio correctamente la contraseña.", "success", "#alertMessage");

        // Remover el parámetro de la URL para que no se acumule
        history.replaceState({}, document.title, window.location.pathname);
    }
});
