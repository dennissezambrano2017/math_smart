const unidadSelect = document.getElementById("unidad-select");
const contenidoSelect = document.getElementById("contenido-select");
const temaSelect = document.getElementById("tema-select");
const mensajeVacio = document.getElementById("mensaje-vacio");
const miBoton = document.getElementById("filtrar");
function cargarContenidos() {

  const unidadId = unidadSelect.value;

  if (unidadId) {
    fetch(`/obtener_contenidos/?unidad_id=${unidadId}`)
      .then((response) => response.json())
      .then((data) => {
        contenidoSelect.innerHTML =
          "<option selected>Selecciona un contenido</option>";
        data.forEach((contenido) => {
          contenidoSelect.innerHTML += `<option value="${contenido.id}">${contenido.nombre}</option>`;
        });
      });
  } else {
    contenidoSelect.innerHTML =
      "<option selected>Selecciona un contenido</option>";
  }
}

function cargarTemas() {
  const contenidoId = contenidoSelect.value;

  if (contenidoId) {
    fetch(`/obtener_temas_contenido/?contenido_id=${contenidoId}`)
      .then((response) => response.json())
      .then((data) => {
        temaSelect.innerHTML = "<option selected>Selecciona un tema</option>";
        data.forEach((tema) => {
          temaSelect.innerHTML += `<option value="${tema.id}">${tema.nombre}</option>`;
        });
      });
  } else {
    temaSelect.innerHTML = "<option selected>Selecciona un tema</option>";
  }
}
unidadSelect.addEventListener("change", function () {
  miBoton.disabled = true;
});
contenidoSelect.addEventListener("change", function () {
  miBoton.disabled = true;
});
temaSelect.addEventListener("change", function () {
  miBoton.disabled = false;
});

function filtrarPuntuacion() {
  const temaId = temaSelect.value;
  if (temaId) {
    fetch(`/obtener_puntuacion_por_tema/?tema_id=${temaId}`)
      .then((response) => response.json())
      .then((data) => {
        const tableBody = document.querySelector("tbody");
        tableBody.innerHTML = "";  // Limpia la tabla antes de actualizarla
        if (data.length > 0) {
          mensajeVacio.style.display = "none";
          data.forEach((puntuacion) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${puntuacion.tema}</td>
            <td style="text-align: center;">${puntuacion.preguntas_respondidas}</td>
            <td style="text-align: center;">${puntuacion.puntaje}</td>
            <td>${puntuacion.fecha}</td>
          `;
            tableBody.appendChild(row);
          });
        } else {
          mensajeVacio.style.display = "block";
        }
      });
  }
}


