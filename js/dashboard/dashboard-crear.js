// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();


/********* Carga desde firebase *********/

import { auth, db, storage } from '../firebaseAuth.js'
import './dashboard.js'
import { doc, addDoc, setDoc, query, where, updateDoc, getDoc, getDocs, collection, Timestamp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
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
const idEjercicio = JSON.parse(sessionStorage.getItem("ejercicioElegido"));
let ejercicio, imagen;
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
            const imgLength = reader.result.length - 'data:image/png;base64,'.length;
            const sizeInBytes = 4 * Math.ceil((imgLength / 3)) * 0.5624896334383812;
            const sizeInKb = sizeInBytes / 1000;
            if (sizeInKb > 6000) {
                Swal.fire({
                    title: `Imagen demasiado grande`,
                    html: `La imagen pesa ${Math.round((sizeInKb / 1000) * 100) / 100} MB. El máximo admitido es de 6 MB`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else {
                sessionStorage.setItem("imagen", reader.result); //contenido del archivo pasado a base64
                previewImg.className = "visible";
                previewImg.src = reader.result;
            }


        } catch (error) {
            console.log(error)
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

async function mostrarEditarEjercicio() {
    const ejercicioSnapshot = await getDoc(doc(db, "ejercicios", idEjercicio));
    ejercicio = ejercicioSnapshot.data()

    await getDownloadURL(ref(storage, (idEjercicio + ".avif")))
        .then((url) => {
            imagen = url;
            previewImg.src = imagen
        })
        .catch((error) => {
            imagen = (idEjercicio + ".avif")
            console.log(error)
        });

    crearBtn.innerHTML = "Editar ejercicio";
    crearTitle.innerHTML = "Editar ejercicio";
    nuevoTitulo.value = ejercicio.titulo;
    document.querySelector("#nuevo-vencimiento").value = new Date().toISOString().split('T')[0];
    nuevaPregunta.value = ejercicio.preguntas[0].pregunta;
    opc1.value = ejercicio.preguntas[0].opc1;
    opc2.value = ejercicio.preguntas[0].opc2;
    opc3.value = ejercicio.preguntas[0].opc3;
    previewImg.className = "visible";
}

// 3) Al tocar submit:
//  - Si está editando se edita un objeto existente en el array. Si está creando, se crea un objeto nuevo.
//  - El array modificado sobreescribe en el localstorage

function editarEjercicio() {
    const form = document.querySelector(".crear-form")
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        crearBtn.innerHTML = "Editando...";
        const fecha = document.querySelector("#nuevo-vencimiento").value;
        const fechaConvert = new Date(fecha).getTime()
        const nuevoVencimiento = Timestamp.fromMillis(fechaConvert)
        const nuevaImagen = sessionStorage.getItem("imagen");
        const imageName = idEjercicio + ".avif"
        const imageRef = await ref(storage, imageName);

        await updateDoc(doc(db, "ejercicios", idEjercicio), {
            titulo: nuevoTitulo.value,
            imagen: "img",
            diafragma: 100,
            enfoque: 0,
            voltimetro: 100,
            vencimiento: nuevoVencimiento,
            imagen: imageName,
            preguntas: [{
                pregunta: nuevaPregunta.value,
                opc1: opc1.value,
                opc2: opc2.value,
                opc3: opc3.value
            }]
        });

        if (nuevaImagen !== null) {
            await uploadString(imageRef, nuevaImagen, 'data_url').then((snapshot) => {
                alert('Uploaded');
            });
        }

        window.location = "dashboard-ejercicios.html";
    });
}

function crearEjercicio() {
    const form = document.querySelector(".crear-form");
    form.addEventListener("submit", async (e) => {
        crearBtn.innerHTML = "Creando...";
        e.preventDefault();
        const nuevaImagen = sessionStorage.getItem("imagen");
        const fecha = document.querySelector("#nuevo-vencimiento").value;
        const fechaConvert = new Date(fecha).getTime()
        const nuevoVencimiento = Timestamp.fromMillis(fechaConvert)

        const docRef = await addDoc(collection(db, "ejercicios"), {
            titulo: nuevoTitulo.value,
            imagen: "img",
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

        // límite de imagen para que sea menor a 8mb
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
            html: `<h5 style='color:#0a2451'>Creaste el ejercicio con la contraseña <b><u>${docRef.id}</u></b></h5>
            <h5 style='color:#0a2451'>Envíales la contraseña a tus alumnos para que se unan!</h5>`,
            icon: 'success',
            iconColor: 'green',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) { window.location = "dashboard-ejercicios.html" }
        })
    });
}


// Toma de decisiones según si se está editando o creando
async function mainCrearEditar() {
    accion.includes("editar") && mostrarEditarEjercicio();
    accion.includes("editar") ? editarEjercicio() : crearEjercicio();
}

mainCrearEditar()