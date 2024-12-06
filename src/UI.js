

function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex"; // Muestra el modal
}


document.getElementById("loginLink").addEventListener("click", openLoginModal);


function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
   
}


function search() {
    let query = document.getElementById("searchInput").value;
    let resultsContainer = document.getElementById("searchResults");

    if (query === "") {
        resultsContainer.innerHTML = "<p>Por favor, ingresa un término de búsqueda.</p>";
        return;
    }

    // Aquí puedes agregar tu lógica de búsqueda o integración con una API.
    let mockResults = [
        { title: "Inception", type: "Película", year: 2010 },
        { title: "Leonardo DiCaprio", type: "Actor", year: "" },
        { title: "Christopher Nolan", type: "Director", year: "" }
    ];

    let filteredResults = mockResults.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

    if (filteredResults.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    } else {
        resultsContainer.innerHTML = filteredResults.map(item => `
            <div class="result-item">
                <h3>${item.title}</h3>
                <p>${item.type} ${item.year ? `(${item.year})` : ''}</p>
            </div>
        `).join('');
    }
}
let slideIndex = 0; // Índice para controlar la posición de la imagen

function moveSlide(n) {
    const slides = document.querySelectorAll('.carousel-item');
    const totalSlides = slides.length;
    if (totalSlides === 0) {
        console.log('No se han cargado películas en el carrusel');
        return; // Si no hay elementos en el carrusel, no hagas nada
    }

    slideIndex += n;

    if (slideIndex >= totalSlides) {
        slideIndex = 0;
    }

    if (slideIndex < 0) {
        slideIndex = totalSlides - 1;
    }

    const carousel = document.querySelector('.carousel');
    carousel.style.transform = `translateX(-${slideIndex * 100}%)`;
}

// Función para cargar las películas en el carrusel
let currentIndex = 0;

function loadCarousel() {
    // Realizamos la petición al servidor para obtener las primeras 5 películas
    fetch('https://backendpweb-production.up.railway.app/api/carrusel')
        .then(response => response.json())
        .then(peliculas => {
            // Obtener el contenedor del carrusel
            const carousel = document.getElementById('carousel');
            const carouselItemsContainer = document.createElement('div');
            carouselItemsContainer.classList.add('carousel-items');

            // Limpiar cualquier contenido previo en el carrusel
            carousel.innerHTML = '';
            carousel.appendChild(carouselItemsContainer);

            // Iterar sobre las películas y crear los elementos HTML correspondientes
            peliculas.forEach(pelicula => {
                // Crear el contenedor de cada item del carrusel
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                
                // Crear el contenido para cada película
                const img = document.createElement('img');
                img.src = pelicula.Imagen || './img/DefaultImg.JPEG';  // Usar imagen por defecto si no existe el poster
                img.alt = pelicula.Titulo;

                const caption = document.createElement('div');
                caption.classList.add('carousel-caption');
                
                const titulo = document.createElement('h3');
                titulo.textContent = pelicula.Titulo;

                const descripcion = document.createElement('p');
                descripcion.textContent = pelicula.Descripcion;

                // Agregar el contenido al contenedor del carrusel
                caption.appendChild(titulo);
                caption.appendChild(descripcion);
                carouselItem.appendChild(img);
                carouselItem.appendChild(caption);
                
                // Agregar el item al contenedor de items
                carouselItemsContainer.appendChild(carouselItem);
            });

            // Inicializar los botones de navegación
            updateCarousel();

            setInterval(function() {
                if (currentIndex < peliculas.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0; // Volver al primer item al llegar al final
                }
                updateCarousel();
            }, 5000); // Desplazarse cada 5 segundos
        
        })
        .catch(error => {
            console.error('Error al cargar las películas:', error);
        });
}

// Función para mover el carrusel
function updateCarousel() {
    const carouselItemsContainer = document.querySelector('.carousel-items');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const totalItems = carouselItems.length;

    // Desplazar el carrusel
    const offset = -currentIndex * 100;  // Ajuste para mostrar un solo item a la vez
    carouselItemsContainer.style.transform = `translateX(${offset}%)`;

    // Botón de navegación "siguiente"
    document.querySelector('.next').onclick = function() {
        if (currentIndex < totalItems - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    };

    // Botón de navegación "anterior"
    document.querySelector('.prev').onclick = function() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalItems - 1;
        }
        updateCarousel();
    };
}

// Llamar a la función cuando la página cargue
window.onload = loadCarousel;
