window.onload = function() {
    // Obtener el ID de la película de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const peliculaId = urlParams.get('id');

    if (peliculaId) {
        // Si hay un ID, cargar los detalles de la película
        cargarDetallesPelicula(peliculaId);
        // Cargar las críticas de la película
        cargarCriticas(peliculaId);
    } else {
        // Si no hay ID, cargar la lista de todas las películas
        cargarPeliculas();
    }
};

// Función para cargar todas las películas
function cargarPeliculas() {
    fetch('https://backendpweb-production.up.railway.app/Peliculas')
        .then(response => response.json())
        .then(peliculas => {
            const ContenedorPeliculas = document.getElementById('movielist');
            ContenedorPeliculas.innerHTML = ''; // Limpiar contenido previo

            if (peliculas.length === 0) {
                ContenedorPeliculas.innerHTML = "<p>No se encontraron películas.</p>";
                return;
            }

            // Agregar las películas al DOM
            peliculas.forEach(pelicula => {
                const itemPelicula = document.createElement('div');
                itemPelicula.classList.add('movie'); // Agregar clase "movie"
                pelicula.PeliculaID = `${pelicula.PeliculaID}`;

                const tituloPelicula = document.createElement('h3');
                tituloPelicula.classList.add('movie-title');
                const enlace = document.createElement('a');
                enlace.href = `detalle-pelicula.html?id=${pelicula.PeliculaID}`;
                enlace.textContent = pelicula.Titulo;
                tituloPelicula.appendChild(enlace);
                itemPelicula.appendChild(tituloPelicula);

                ContenedorPeliculas.appendChild(itemPelicula);


            });
        })
        .catch(error => {
            console.error('Error al cargar las películas:', error);
        });
}

// Función para cargar los detalles de una película
function cargarDetallesPelicula(peliculaId) {
    fetch(`https://backendpweb-production.up.railway.app/Peliculas/${peliculaId}`)
        .then(response => response.json())
        .then(pelicula => {
            document.getElementById('movie-image').src = pelicula.Imagen || 'default-image.jpg';
            document.getElementById('movie-title').textContent = pelicula.Titulo;
            document.getElementById('movie-description').textContent = pelicula.Descripcion;
            document.getElementById('movie-genre').textContent = pelicula.Genero;
            document.getElementById('movie-duration').textContent = pelicula.Duracion;
            document.getElementById('movie-actor').textContent = pelicula.Actores.join(', ');
            document.getElementById('movie-director').textContent = pelicula.Director;
        })
        .catch(error => {
            console.error('Error al cargar los detalles de la película:', error);
        });
}

// Función para cargar las críticas de una película
function cargarCriticas(peliculaId) {
    fetch(`https://backendpweb-production.up.railway.app/Criticas/${peliculaId}`)
        .then(response => response.json())
        .then(criticas => {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = ''; // Limpiar las críticas previas

            if (criticas.length === 0) {
                reviewsList.innerHTML = '<p>No hay críticas para esta película aún.</p>';
                return;
            }

            // Mostrar las críticas
            criticas.forEach(critica => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.setAttribute('data-id', critica.CriticaID); // Agregar CriticaID al atributo
                reviewElement.innerHTML = `
                    <h5>${critica.Autor} - ${critica.Puntuacion} estrellas</h5>
                    <p>${critica.Comentario}</p>
                    <button class="delete-review-btn" data-id="${critica.CriticaID}">
                        <i class='far fa-trash-alt' style='font-size:24px'></i> Eliminar
                    </button>
                `;
                reviewsList.appendChild(reviewElement);
            });

            // Agregar funcionalidad para eliminar las críticas
            const deleteButtons = document.querySelectorAll('.delete-review-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const criticaID = event.target.closest('button').getAttribute('data-id');
                    eliminarCritica(criticaID); // Llamamos a la función para eliminar la crítica
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar las críticas:', error);
            alert('Hubo un error al cargar las críticas. Intenta nuevamente.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const reviewModal = document.getElementById('reviewModal');
    const leaveReviewBtn = document.getElementById('leaveReviewBtn');
    const closeReviewModal = document.getElementById('closeModal');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const movieReviewInput = document.getElementById('movieReview');
    const userNameInput = document.getElementById('userName');
    const ratingInputs = document.querySelectorAll('input[name="rating"]');

    leaveReviewBtn.addEventListener('click', () => {
        reviewModal.style.display = 'flex'; // Mostrar el modal
    });

    closeReviewModal.addEventListener('click', () => {
        reviewModal.style.display = 'none'; // Cerrar el modal
    });

    function getRating() {
        let rating = null;
        ratingInputs.forEach(input => {
            if (input.checked) {
                rating = input.value;
            }
        });
        return rating;
    }

    submitReviewBtn.addEventListener('click', () => {
        const rating = getRating();
        const review = movieReviewInput.value;
        const userName = userNameInput.value;

        if (rating && review && userName) {
            const urlParams = new URLSearchParams(window.location.search);
            const peliculaId = urlParams.get('id');

            // Obtener la fecha actual del cliente (navegador)
            const Fecha = new Date().toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD

            const reviewData = {
                PeliculaID: peliculaId,
                Autor: userName,
                Puntuacion: rating,
                Comentario: review,
                Fecha: Fecha  // La fecha del cliente
            };

            fetch('https://backendpweb-production.up.railway.app/Criticas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.errors) {
                    console.log('Errores de validación:', data.errors);
                    alert('Hay errores en los datos enviados.');
                } else {
                    console.log('Crítica enviada:', data);
                    // Mostrar la crítica en el DOM

                    const reviewElement = document.createElement('div');
                    reviewElement.classList.add('review');
                    reviewElement.innerHTML = `
                        <h5>${userName} - ${rating} estrellas</h5>
                        <p>${review}</p>
                        <button class="delete-review-btn" data-id="${data.CriticaID}">
                            <i class='far fa-trash-alt' style='font-size:24px' width='50%'></i> Eliminar
                        </button>
                    `;
                    document.getElementById('reviews-list').appendChild(reviewElement);

                    const deleteButton = reviewElement.querySelector('.delete-review-btn');
                    deleteButton.addEventListener('click', () => {
                        const criticaID = deleteButton.getAttribute('data-id');
                        eliminarCritica(criticaID); 
                    });

                    // Limpiar el formulario
                    movieReviewInput.value = '';
                    userNameInput.value = '';
                    ratingInputs.forEach(input => input.checked = false);

                    // Cerrar el modal
                    reviewModal.style.display = 'none';
                    location.reload();
                }
                
            })
            .catch(error => {
                console.error('Error al enviar la crítica:', error);
                alert('Hubo un error al enviar tu crítica. Intenta nuevamente.');
            });
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    // Función para eliminar una crítica
    
});


// Función para eliminar una crítica
function eliminarCritica(criticaID) {
    fetch(`https://backendpweb-production.up.railway.app/Criticas/${criticaID}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar la crítica');
        }
        return response.json();
    })
    .then(data => {
        console.log('Crítica eliminada con éxito:', data);

        // Eliminar la crítica del DOM
        const reviewElement = document.querySelector(`[data-id="${criticaID}"]`);
        if (reviewElement) {
            reviewElement.remove(); // Eliminar del DOM
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al eliminar la crítica');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const reviewModal = document.getElementById('reviewModal');
    const leaveReviewBtn = document.getElementById('leaveReviewBtn');
    const closeReviewModal = document.getElementById('closeModal');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const movieRatingInput = document.querySelector('input[name="rating"]:checked');
    const movieReviewInput = document.getElementById('movieReview');
    const userNameInput = document.getElementById('userName');

    // Mostrar el modal al hacer clic en "Dejar Crítica"
    leaveReviewBtn.addEventListener('click', () => {
        reviewModal.style.display = 'flex'; // Mostrar el modal
    });


    // Cerrar el modal al hacer clic en la "X"
    closeReviewModal.addEventListener('click', () => {
        reviewModal.style.display = 'none'; // Cerrar el modal
    });

    // Enviar crítica
    submitReviewBtn.addEventListener('click', () => {
        const rating = document.querySelector('input[name="rating"]:checked');
        const review = movieReviewInput.value;
        const userName = userNameInput.value;

        if (rating && review && userName) {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review');
            reviewElement.innerHTML = `<h5>${userName} - ${rating.value} estrellas</h5><p>${review}</p>`;
            document.getElementById('reviews-list').appendChild(reviewElement);

            // Limpiar los campos y cerrar el modal
            movieReviewInput.value = '';
            userNameInput.value = '';
            reviewModal.style.display = 'none';
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Función para cargar los directores y categorías
    const director = document.getElementById('director');
    const categoria = document.getElementById('categoria');
    const peliculas = document.getElementById('Peliculas');
    const cargarDatos = () => {
        fetch('https://backendpweb-production.up.railway.app/Peliculas')
            .then(response => response.json())
            .then(data => {
                // Limpiar las opciones previas
                director.innerHTML = '<option value="">Seleccione un director</option>';
                categoria.innerHTML = '<option value="">Seleccione una categoría</option>';
                peliculas.innerHTML = '<option value="">Seleccionar Pelicula A Editar</option>'

                // Cargar los directores en el selector
                data.forEach(pelicula => {
                    const option = document.createElement("option");
                    option.value = pelicula.DirectorId;
                    option.textContent = pelicula.Director;
                    director.appendChild(option);
                });

                // Cargar las categorías en el selector
                data.forEach(pelicula => {
                    const option = document.createElement("option");
                    option.value = pelicula.CategoriaId;
                    option.textContent = pelicula.Categoria;
                    categoria.appendChild(option);
                });

                data.forEach(pelicula =>{
                    const option = document.createElement("option");
                    option.value = pelicula.PeliculaID;
                    option.textContent = pelicula.Titulo;
                    peliculas.appendChild(option);
                })
            })
            .catch(error => {
                console.error('Error al cargar los datos:', error);
                alert('Hubo un error al cargar los directores y categorías.');
            });
    };

    // Cargar los datos automáticamente al cargar la página
    cargarDatos();
});

document.getElementById("btnAgregarPelicula").addEventListener("click", async function (event) {
    event.preventDefault();
    const formulario = document.getElementById("formAgregarPelicula");
    const datosForm = new FormData(formulario);

    // Convertir FormData a objeto simple
    const objetoDatos = Object.fromEntries(datosForm.entries());

    fetch('https://backendpweb-production.up.railway.app/Peliculas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objetoDatos)
    })
    .then(response => response.json())
    .then(dato => console.log(dato))
    .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', () => {

    // Manejar cambio en el select de Películas
    document.getElementById("Peliculas").addEventListener("change", handleSelectPeliculaChange);

    // Manejar el botón de Modificar
    document.getElementById("btnModificar").addEventListener("click", handleModificarPelicula);
});

// Función para manejar el cambio en el select de Películas
function handleSelectPeliculaChange(event) {
    const peliculaIdSeleccionada = event.target.value;

    if (peliculaIdSeleccionada) {
        // Solicitar detalles de la película seleccionada
        fetch(`https://backendpweb-production.up.railway.app/Peliculas/${peliculaIdSeleccionada}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los detalles de la película');
                }
                return response.json();
            })
            .then(pelicula => {
                // Llenar el formulario con los datos de la película
                document.getElementById('titulo').value = pelicula.Titulo || '';
                document.getElementById('titulo').textContent = pelicula.Titulo;
                document.getElementById('fechaEstreno').value = pelicula.FechaEstreno || '';
                document.getElementById('fechaEstreno').textContent = pelicula.FechaEstreno;
                document.getElementById('presupuesto').value = pelicula.Presupuesto || '';
                document.getElementById('presupuesto').textContent = pelicula.Presupuesto;
                document.getElementById('recaudacion').value = pelicula.Recaudacion || '';
                document.getElementById('recaudacion').textContent = pelicula.Recaudacion;
                document.getElementById('director').value = pelicula.DirectorID || '';
                document.getElementById('director').textContent = pelicula.Director;
                document.getElementById('categoria').value = pelicula.CategoriaID || '';
                document.getElementById('categoria').textContent = pelicula.Categoria
                document.getElementById('duracion').value = pelicula.DuracionMinutos || '';
                document.getElementById('duracion').textContent = pelicula.DuracionMinutos;
                document.getElementById('sinopsis').value = pelicula.Sinopsis || '';
                document.getElementById('sinopsis').textContent = pelicula.Sinopsis;
                document.getElementById('poster').value = pelicula.PosterImg || '';
                document.getElementById('poster').textContent = pelicula.PosterImg;
            })
            .catch(error => {
                console.error('Error al cargar los detalles de la película:', error);
                alert('Hubo un error al cargar los detalles de la película.');
            });
    } else {
        // Limpiar el formulario si no se selecciona ninguna película
        limpiarFormulario();
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('titulo').value = '';
    document.getElementById('fechaEstreno').value = '';
    document.getElementById('presupuesto').value = '';
    document.getElementById('recaudacion').value = '';
    document.getElementById('director').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('duracion').value = '';
    document.getElementById('sinopsis').value = '';
    document.getElementById('poster').value = '';
}

// Función para manejar la modificación de una película
function handleModificarPelicula(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del botón

    const peliculasSelect = document.getElementById('Peliculas');
    const peliculaIdSeleccionada = peliculasSelect.value;

    if (!peliculaIdSeleccionada) {
        alert('Por favor, selecciona una película para modificar.');
        return;
    }

    // Obtener los valores del formulario
    const titulo = document.getElementById('titulo').value.trim();
    const fechaEstreno = document.getElementById('fechaEstreno').value;
    const presupuesto = parseFloat(document.getElementById('presupuesto').value);
    const recaudacion = parseFloat(document.getElementById('recaudacion').value);
    const directorID = parseInt(document.getElementById('director').value, 10);
    const categoriaID = parseInt(document.getElementById('categoria').value, 10);
    const duracionMinutos = parseInt(document.getElementById('duracion').value, 10);
    const sinopsis = document.getElementById('sinopsis').value.trim();
    const posterImg = document.getElementById('poster').value.trim();

    // Validar los campos
    if (!titulo || !fechaEstreno || isNaN(presupuesto) || isNaN(recaudacion) ||
        isNaN(directorID) || isNaN(categoriaID) || isNaN(duracionMinutos) ||
        !sinopsis || !posterImg) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }

    // Crear el objeto con los datos actualizados
    const datosActualizados = {
        titulo: titulo,
        fechaEstreno: fechaEstreno,
        presupuesto: presupuesto,
        recaudacion: recaudacion,
        director: directorID,
        categoria: categoriaID,
        duracion: duracionMinutos,
        sinopsis: sinopsis,
        poster: posterImg
    };

    // Enviar la solicitud PUT al servidor
    fetch(`https://backendpweb-production.up.railway.app/Peliculas/${peliculaIdSeleccionada}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar la película');
        }
        return response.json();
    })
    .then(data => {
        alert('Película actualizada exitosamente.');
        console.log('Respuesta del servidor:', data);
        // Opcional: Actualizar el select de Películas o recargar la página
    })
    .catch(error => {
        console.error('Error al actualizar la película:', error);
        alert('Hubo un error al actualizar la película.');
    });
}

// Llamar la función para cargar los detalles de la película cuando la página se carga
window.onload = function() {
    /*loadMovieDetails();*/
    cargarPeliculas();
};
