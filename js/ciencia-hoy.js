/* A través de Fetch traemos artículos de ciencia de "currentsapi"*/

const contenedorArticulos = document.querySelector("#contenedorArticulos");
const loaderArticulos = document.querySelector("#loader-articulos");

const url = 'https://api.currentsapi.services/v1/search?' +
    'language=es&' +
    'category=science&' +
    'category=technology&' +
    'apiKey=Ho4OqA2-4NGA9rESiDZrxFvUOX48zwO9wwop_8Kl3gmQzB1l';

fetch(url)
    .then((response) => {
        return response.json()
    })

    .then((result) => {
        const articulos = result.news;

        const articulosFiltrados = articulos.filter(articulo => {
            return (articulo.category.some(element => element == "technology") === true)})
            .slice(0, 15);

        articulosFiltrados.forEach(articulo => {
            const imagen = articulo.image || "../media/img-news-vacia.avif";

            contenedorArticulos.innerHTML +=
                `<article class="blog-article" >
                <div class="blog-article__img-box">
                    <img src=${imagen}>
                </div>
                <div class="blog-article__body">
                    <h5 class="blog-article__body__title">${articulo.title}</h5>
                    <p class="blog-article__body__text">${articulo.description}</p>
                    <a class="blog-article__body__btn" target="_blank" href="${articulo.url}">+ Leer el artículo</a>
                </div>
            </article>`;
        })

        loaderArticulos.classList.add("disabled")
    })

    .catch(() => {
        setTimeout(() => {
            contenedorArticulos.innerHTML =
                `<article class="blog-error" >
                    <h5 class="blog-error__text"><ion-icon name="warning"></ion-icon>No se cargaron los artículos. <br>
                    Por favor, intentalo más tarde</h5>
                </div>
            </article>`;
        }, "5000");
    })