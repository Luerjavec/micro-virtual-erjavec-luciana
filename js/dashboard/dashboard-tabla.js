/********* Carga desde firebase *********/

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { auth, db } from '../firebaseAuth.js'
import './dashboard.js'
import { doc, getDoc, getDocs, collection, } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

/********* Funciones y variables de carga de usuarios y ejercicios ********/

let actualUser, userPerfil, alumnos, userUid
const usuario = []
let ejUnidos
const users = []
const ejercicios = []
const ejerciciosUID = []

async function cargarUsuarios() {
    const usu = await getDocs(collection(db, "usuarios"));
    usu.forEach(async (user) => {
        users.push(user.data())
    });
    alumnos = users.filter(usuario => (usuario.perfil == "alumno"));
}

async function cargarEjercicios() {
    const ejerciciosSnapshot = await getDocs(collection(db, "ejercicios"));
    await ejerciciosSnapshot.forEach(async ejercicio => {
        ejerciciosUID.push(ejercicio.id)
        ejercicios.push({
            id: ejercicio.id,
            titulo: ejercicio.data().titulo,
            vencimiento: ejercicio.data().vencimiento,
            imagen: ejercicio.data().imagen,
            diafragma: ejercicio.data().diafragma,
            voltimetro: ejercicio.data().voltimetro,
            enfoque: ejercicio.data().enfoque,
            preguntas: ejercicio.data().preguntas,
        });
    })
}

/********* Funciones que rigen la interaccion con el DOM *********/

// Si es profesor: la tabla va a mostrar a los alumnos y promedio + un acordeón con la nota en cada ejercicio.
// Si es alumno: la tabla va a mostrar una lista de los ejercicios y sus notas

const tituloPrincipal = document.querySelector("#titulo-principal");
tituloPrincipal.innerText = userPerfil == "profesor" ? "Mis alumnos" : "Mis notas";
const tableHead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");

// Creación dinámica del header de las tablas según si es profe o alumno

let headers = userPerfil == "profesor" ? ["#", "Nombre", "Promedio"] : ["#", "Ejercicio", "Nota"];

function crearTabla(headers) {
    const cols = headers;
    let tags = "<tr>";
    for (let i = 0; i < cols.length; i++) {
        tags += `<th>${cols[i]}</th>`;
    }
    tags += "</tr>";
    tableHead.innerHTML = tags;
    userPerfil == "profesor" ? tableBodyProfe() : tableBodyAlumno();
}

// Creación dinámica del body de las tablas según si es profe o alumno

function tableBodyAlumno() {
    let tags = "";
    const ejerciciosOK = ejerciciosUID.filter(element => ejUnidos.includes(element));
    if (ejerciciosOK.length === 0) {
        tags += `<tr>
            <td></td>
            <td class="col-titulo"><ion-icon name="warning"></ion-icon> No estás unido a ningún ejercicio</td>
            <td></td>
        </tr>`;
    } else {
        ejercicios.map(ej => {
            if (ejerciciosOK.includes(ej.id) === true) {
                let titulo = ej.titulo
                let id = ej.id
                let num = ejercicios.findIndex(ejer => ejer.titulo === titulo)

                const intento = usuario[0].notas.filter(e => e.id === id);
                intento.length === 0 && (intento.push({ nota: "Incompleto" }));
                let nota = intento[0].nota

                tags += `<tr>
                <td>${num + 1}</td>
                <td class="col-titulo">${ej.titulo}</td>
                <td>${nota || "Incompleto"}</td>
            </tr>`;
            }
        })
    }
    tableBody.innerHTML = tags;
}

function tableBodyProfe() {
    let tags = "";
    if (alumnos.length === 0) {
        tags += `<tr>
            <td></td>
            <td class="col-titulo"><ion-icon name="warning"></ion-icon> No tenés ningún alumno</td>
            <td></td>
        </tr>`;
    } else {
        alumnos.map(u => {
            const numero = users.findIndex(i => i == u) + 1
            let notas = u.notas.map(n => n.nota);
            let promedio;
            if (u.perfil == "alumno") {
                promedio = notas.reduce((a, b) => a + b, 0) / u.notas.length || "-";
            } else {
                promedio = "-"
            }

            let notasDetalle = "";
            for (let i = 0; i < ejercicios.length; i++) {
                notasDetalle += `<p>${i + 1}) ${ejercicios[i].titulo}. || Nota: ${notas[i] || "Incompleto"}`;
            }

            tags += `<tr>
                <td>${numero}</td>
                <td>${u.nombre}</td>
                <td class="col-notas">
                <div class="accordion-item">
                    <h2 class="accordion-header-${u.perfil}" id="panelsStayOpen-heading${numero}">
                        <button class="accordion-button collapsed notas" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapse${numero}" aria-expanded="false" aria-controls="panelsStayOpen-collapse${numero}">
                            <ion-icon class="more-notas" name="chevron-down"></ion-icon> Promedio: ${promedio}
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapse${numero}" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-heading${numero}">
                        <div class="accordion-body">
                            ${notasDetalle}
                        </div>
                    </div>
                </div>
                </td>
            </tr>`;
        })
    }
    tableBody.innerHTML = tags;
}


/***************  Funcion MAIN **************/

async function mainTabla() {
    actualUser = await auth.currentUser;
    onAuthStateChanged(auth, async (user) => {
        const userFromFirestore = await getDoc(doc(db, "usuarios", user.uid));
        usuario.push(userFromFirestore.data())
        userPerfil = usuario[0].perfil;
        userUid = user.uid
        ejUnidos = (usuario[0].ejercicios);
        await cargarEjercicios()

        userPerfil == "profesor" && await cargarUsuarios()

        setTimeout(() => {
            crearTabla(headers);
        }, 2000);
    })
}

mainTabla()