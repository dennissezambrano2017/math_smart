document.addEventListener('DOMContentLoaded', function () {
    var openModalButton = document.getElementById('openModalButton');
    openModalButton.addEventListener('click', function () {
        var search = "Potenciación de números reales con exponente entero";
        console.log(search)
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
            },error: function (xhr, textStatus, errorThrown) {
                console.log('Error:', errorThrown);
            }
        });
    });
});