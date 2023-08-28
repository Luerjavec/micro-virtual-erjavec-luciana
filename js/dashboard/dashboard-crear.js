// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();


/********* Carga desde firebase *********/

import { auth, db, storage } from '../firebaseAuth.js'
import './dashboard.js'
import { doc, addDoc, setDoc, query, where, updateDoc, getDocs, collection, Timestamp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";


//upload CLOUD STORAGE


// setTimeout(() => {
//     getDownloadURL(ref(storage, 'ejercicios.avif'))
//   .then((url) => {
//     // `url` is the download URL for 'images/stars.jpg'

//     // This can be downloaded directly:
//     const xhr = new XMLHttpRequest();
//     xhr.responseType = 'blob';
//     xhr.onload = (event) => {
//       const blob = xhr.response;
//     };
//     xhr.open('GET', url);
//     xhr.send();

//     // Or inserted into an <img> element

//     previewImg.setAttribute('src', url);
//     console.log(previewImg)
//   })
//   .catch((error) => {
//     // Handle any errors
//   });

// }, 2000);



// Buscamos si en la pág anterior se eligió crear o editar un ejercicio

const accion = JSON.parse(sessionStorage.getItem("accionEjercicios"));
const numEjer = JSON.parse(sessionStorage.getItem("ejercicioElegido"));
const ejercicio = ejercicios[numEjer]
const previewImg = document.querySelector(".preview-img img");

/********* Interacción con el DOM - parte derecha: Carga de imagen *********/

const elegirImagenBtn = document.querySelector(".choose-img");
const elegirImagenInput = document.querySelector(".file-input");
const crearBtn = document.querySelector("#crear-ejercicio-button");
const crearTitle = document.querySelector("#titulo-principal");

function loadImage() {
    const file = elegirImagenInput.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
        e.preventDefault();
        try {
            sessionStorage.setItem("imagen", reader.result); //contenido del archivo pasado a base64
            previewImg.className = "visible";
            previewImg.src = reader.result;

        } catch {
            Swal.fire({
                title: `Sin espacio`,
                text: `No hay espacio para subir más imágenes. Elimine un ejercicio antes de crear uno nuevo`,
                icon: 'warning',
                iconColor: '#6a1635',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) { window.location = "dashboard-ejercicios.html" }
            })
        }
    })

    file && reader.readAsDataURL(file);
}


elegirImagenInput.addEventListener("change", loadImage);
elegirImagenBtn.addEventListener("click", () => elegirImagenInput.click());


/********* Interacción con el DOM - parte de izquierda: formulario *********/

// 1) Guardamos los inputs del formulario en variables

const nuevoTitulo = document.querySelector("#nuevo-titulo");
const nuevaPregunta = document.querySelector("#nueva-pregunta");
const opc1 = document.querySelector("#nueva-opc1");
const opc2 = document.querySelector("#nueva-opc2");
const opc3 = document.querySelector("#nueva-opc3");

// 2) Si está editando el ejercicio, mostramos el formulario ya completo con los datos previos del ejercicio.

function mostrarEditarEjercicio() {
    crearBtn.innerHTML = "Editar ejercicio";
    crearTitle.innerHTML = "Editar ejercicio";
    nuevoTitulo.value = ejercicio.titulo;
    document.querySelector("#nuevo-vencimiento").value = new Date().toISOString().split('T')[0];
    nuevaPregunta.value = ejercicio.preguntas[0].pregunta;
    opc1.value = ejercicio.preguntas[0].opc1;
    opc2.value = ejercicio.preguntas[0].opc2;
    opc3.value = ejercicio.preguntas[0].opc3;
    previewImg.className = "visible";
    previewImg.src = ejercicio.imagen.includes("base64") ? ejercicio.imagen : `../../media/ejercicios/${ejercicio.imagen}`;
}

// 3) Al tocar submit:
//  - Si está editando se edita un objeto existente en el array. Si está creando, se crea un objeto nuevo.
//  - El array modificado sobreescribe en el localstorage

function editarEjercicio() {
    const form = document.querySelector(".crear-form")
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nuevaImagen = sessionStorage.getItem("imagen");
        const fecha = document.querySelector("#nuevo-vencimiento").value;
        const nuevoVencimiento = DateTime.fromISO(fecha);

        ejercicio.titulo = nuevoTitulo.value;
        ejercicio.vencimiento = nuevoVencimiento;
        ejercicio.preguntas[0].pregunta = nuevaPregunta.value;
        ejercicio.preguntas[0].opc1 = opc1.value;
        ejercicio.preguntas[0].opc2 = opc2.value;
        ejercicio.preguntas[0].opc3 = opc3.value;
        ejercicio.imagen = nuevaImagen || ejercicio.imagen;

        localStorage.setItem("ejerciciosMV", JSON.stringify(ejercicios));
        sessionStorage.removeItem('imagen');
        window.location = "dashboard-ejercicios.html";
    });
}

function crearEjercicio() {
    const form = document.querySelector(".crear-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nuevaImagen = sessionStorage.getItem("imagen");
        const fecha = document.querySelector("#nuevo-vencimiento").value;
        const prueba = new Date(fecha).getTime()
        const nuevoVencimiento = Timestamp.fromMillis(prueba)

        const docRef = await addDoc(collection(db, "ejercicios"), {
            titulo: nuevoTitulo.value,
            imagen: "img",
            password: "123",
            diafragma: 100,
            enfoque: 0,
            voltimetro: 100,
            vencimiento: nuevoVencimiento,
            preguntas: [{
                pregunta: nuevaPregunta.value,
                opc1: opc1.value,
                opc2: opc2.value,
                opc3: opc3.value
            }]
        });

        const imageName = docRef.id + ".avif"
        const imageRef = await ref(storage, imageName);
        const imagen = nuevaImagen

        await updateDoc(doc(db, "ejercicios", docRef.id),
            { imagen: imageName });

        await uploadString(imageRef, imagen, 'data_url').then((snapshot) => {
            console.log('Uploaded');
        });

        const buscaAlumnos = query(collection(db, "usuarios"), where("perfil", "==", "alumno"));
        const alumnos = await getDocs(buscaAlumnos);
        alumnos.forEach(async (alumno) => {
            await setDoc(doc(db, "usuarios", alumno.id, "notas", docRef.id), {
                nota: 0,
                fecha: Timestamp.fromDate(new Date()),
            });
        });

        sessionStorage.removeItem('imagen');
        Swal.fire({
            title: `Ejercicio creado`,
            text: ``,
            icon: 'success',
            iconColor: 'green',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) { window.location = "dashboard-ejercicios.html" }
        })
    });
}


// Toma de decisiones según si se está editando o creando

accion.includes("editar") && mostrarEditarEjercicio();
accion.includes("editar") ? editarEjercicio() : crearEjercicio();