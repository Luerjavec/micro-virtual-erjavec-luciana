// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();

/********* Carga desde firebase *********/

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { auth, db, storage} from '../firebaseAuth.js'
import './dashboard.js'
import { doc, getDoc, getDocs, deleteDoc, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

/********* Funciones y variables de carga de usuarios ********/

let actualUser, userPerfil, userUid
const usuario = []
const users = []
let alumnos = []
const ejercicios = []

function buscaIntentos(ej) {
    const intentos = []
    alumnos.forEach(alumno => {
        const hayIntento = alumno.notas.filter(e => (e.id === ej))
        hayIntento.length > 0 && intentos.push(hayIntento)
    });
    return intentos.length
}

function buscaNotas(ej) {
    const intento = usuario[0].notas.filter(e => e.id === ej);
    intento.length === 0 && (intento.push({ nota: "incompleto", fecha: { seconds: 0 } }));
    return intento[0]
}

async function cargarUsuarios() {
    const usu = await getDocs(collection(db, "usuarios"));
    usu.forEach(async (user) => {
        users.push(user.data())
    });
    alumnos = users.filter(usuario => (usuario.perfil == "alumno"));
}


/********* Funciones que rigen la interaccion con el DOM *********/

const contenedorDashboard = document.querySelector("#contenedor-dashboard");
const crearDiv = document.querySelector("#crear-btn");
const crearBtn = document.querySelector("#crearBtn");

//MOSTRAR los ejercicios en tarjetas

async function mostrarEjercicios() {
    const ejerciciosSnapshot = await getDocs(collection(db, "ejercicios"));

    ejerciciosSnapshot.forEach(async ejercicio => {
        ejercicios.push(ejercicio.data());
        const fechaVencimiento = DateTime.fromSeconds(ejercicio.data().vencimiento.seconds);
        const vence = fechaVencimiento < now ? "Venció" : "Vence";
        let imagen;

        await getDownloadURL(ref(storage, (ejercicio.id + ".avif")))
        .then((url) => {
            imagen = url;
        })
        .catch((error) => {
          console.log(error)
        });


        //const imagen = `../../media/ejercicios/${ejercicio.data().imagen}`;

        let textRight, textLeft, icon, Btns, checkmark;

        if (userPerfil == "profesor") {
            textLeft = `Intentos: ${buscaIntentos(ejercicio.id)} alumnos`;
            textRight = `${vence} el ${fechaVencimiento.toLocaleString()}`;
            Btns = `<button class="ejercicio__edit edit-btn" id="${ejercicio.id}"><ion-icon name="settings"></ion-icon></button>
                    <button class="ejercicio__edit delete-btn" id="${ejercicio.id}"><ion-icon name="trash"></ion-icon></button>`
            icon = `<ion-icon name="eye"></ion-icon>`;
            checkmark = "checkmark"

        } else {
            const fechaNota = DateTime.fromSeconds(buscaNotas(ejercicio.id).fecha.seconds); // DateTime.fromISO(usuarios[indexUs].notas[ejercicio.num].fecha);
            textLeft = buscaNotas(ejercicio.id).nota === "incompleto" ? " Incompleto" : " Completo";
            textRight = `${buscaNotas(ejercicio.id).nota == "incompleto" ? " Incompleto" : (buscaNotas(ejercicio.id).nota + " (" + fechaNota.toLocaleString() + ")")} `;
            Btns = `<div class="vencimiento ${vence}"><ion-icon name="hourglass"></ion-icon> ${vence} el ${fechaVencimiento.toLocaleString()} </div>`;
            icon = `<ion-icon class="arrow" name="arrow-up"></ion-icon>`;
            checkmark = textLeft === " Incompleto" ? "close" : "checkmark"
        }

        contenedorDashboard.innerHTML += `
            <div class = "ejercicio">
                <div class="ejercicio-header">
                    <img src="${imagen}" alt="${ejercicio.data().titulo}" class="ejercicio__previewimg"></img>
                    <h3 class="ejercicio__titulo"> ${ejercicio.data().titulo}</h3>
                </div>
                <div class="ejercicio-detalles">
                    <h5 class="ejercicio__text-left"><ion-icon name="${checkmark}-circle"></ion-icon></ion-icon> ${textLeft}</h5>
                    <h5 class="ejercicio__text-right"><ion-icon name="flag"></ion-icon> ${textRight}</h5>
                </div>
                <div class="ejercicio-footer">
                    <div class="btn-container"> ${Btns} </div>
                    <button class="ejercicio__btn ver" id="${ejercicio.id}">${icon}</button>
                </div>
            </div>
            `;
    })
}

// VISUALIZACIÓN: Si alumno o profe quiere visualizar ejercicio, guardamos en la sesión cuál eligió para retomarlo en la plataforma

async function visualizarEjercicio() {
    const ejercicioBoton = document.querySelectorAll(".ejercicio__btn");
    ejercicioBoton.forEach(boton => {
        boton.addEventListener("click", async (e) => {
            const ejer = await getDoc(doc(db, "ejercicios", boton.id))
            const fechaVencimiento = DateTime.fromSeconds(ejer.data().vencimiento.seconds);

            if ((fechaVencimiento < now) && userPerfil == "alumno") {
                Swal.fire({
                    title: `Ejercicio vencido`,
                    text: `El ejercicio no puede ser resuelto porque venció`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else {
                sessionStorage.setItem("ejercicioElegido", JSON.stringify(boton.id)); //el id es igual al número de ejercicio
                window.location = "../plataforma.html";
            }
        })
    })

}


// EDITAR O ELIMINAR:
// - Si el profe quiere eliminar un ejercicio, lo seleccionamos y eliminamos del array de ejercicios y de usuarios.
// - Si el profe quiere editar un ejercicio, guardamos en la sesión CUÁL eligió y que eligió EDITARLO para retomarlo en la pagina de edición/creación.

async function editarEliminarEjercicio() {
    const editarBoton = document.querySelectorAll(".ejercicio__edit");
    editarBoton.forEach(boton => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.setItem("ejercicioElegido", JSON.stringify(boton.id)); //el id es igual al número de ejercicio
            let btnType = boton.classList.toString()
            if (btnType.includes("delete-btn")) {
                Swal.fire({
                    title: 'Eliminar',
                    text: '¿Estás seguro de eliminar el ejercicio?',
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'Eliminar'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await deleteDoc(doc(db, "ejercicios", boton.id));
                        await deleteObject(ref(storage, (boton.id + ".avif"))).then(() => {
                            console.log("eliminado")
                          }).catch((error) => {
                            console.log(error)
                          });

                        const allUsers = await getDocs(collection(db, "usuarios"));
                        allUsers.forEach(async (user) => {
                            if (user.data().perfil === "alumno") {
                                let notas = user.data().notas
                                let indice = user.data().notas.findIndex(element => element.id == boton.id)
                                let eliminar = (indice == (-1) ? 0 : 1)
                                notas.splice(indice, eliminar)
                                await updateDoc(doc(db, "usuarios", user.id),
                                    { notas: notas });
                            }
                        });
                        window.location = "dashboard-ejercicios.html"
                    }
                })

            } else if (btnType.includes("edit-btn")) {
                sessionStorage.setItem("accionEjercicios", JSON.stringify("editar"))
                window.location = "dashboard-crear.html"
            }
        })
    })
}

// CREAR: Guardamos en la sesión que eligió CREAR un ejercicio para retomarlo en la pagina de edición/creación.

async function crearEjercicio() {
    const crearBoton = document.querySelector("#crearBtn")
    crearBoton.addEventListener("click", () => {
        sessionStorage.setItem("accionEjercicios", JSON.stringify("crear"))
        if (userPerfil === "profesor") {
            window.location = "dashboard-crear.html"
        }
    })
}


/***************  Funcion MAIN **************/

async function mainEjercicios() {
    actualUser = await auth.currentUser;
    onAuthStateChanged(auth, async (user) => {
        const userFromFirestore = await getDoc(doc(db, "usuarios", user.uid));
        usuario.push(userFromFirestore.data())
        userPerfil = usuario[0].perfil;
        userUid = user.uid

        if (userPerfil == "profesor") {
            crearBtn.innerHTML = '<ion-icon name="add-circle-outline"></ion-icon><p class="ejercicio__tiempo">Crear nuevo ejercicio</p>'
            crearDiv.classList.add("visible")

        } else {
            crearDiv.classList.add("oculto")
        };

        userPerfil == "profesor" && await cargarUsuarios()
        await mostrarEjercicios()
        setTimeout(() => {
            userPerfil == "profesor" && editarEliminarEjercicio()
            userPerfil == "profesor" && crearEjercicio()
        }, 1500);
        
        setTimeout(() => { visualizarEjercicio() }, 1500);;
    })
}

mainEjercicios()