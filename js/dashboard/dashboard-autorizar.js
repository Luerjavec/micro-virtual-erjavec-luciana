/********* Carga desde firebase *********/

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { auth, db } from '../firebaseAuth.js'
import './dashboard.js'
import { doc, getDoc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

/********* Funciones y variables de carga de usuarios y ejercicios ********/

let actualUser, profesores, userUid
const usuario = []
const users = []

async function cargarUsuarios() {
    const usu = await getDocs(collection(db, "usuarios"));
    console.log(usu)
    usu.forEach(async (user) => {
        console.log(user.id)
        users.push({
            id: user.id,
            nombre: user.data().nombre,
            perfil: user.data().perfil,
            authorized: user.data().authorized
        })
    });
    profesores = users.filter(usuario => (usuario.perfil == "profesor"));
}

/********* Funciones que rigen la interaccion con el DOM *********/

const tableHead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");

// Creación dinámica del header de las tablas según si es profe o alumno

let headers = ["Nombre", "¿Autorizado?", "Autorizar"];

async function crearTabla(headers) {
    const cols = headers;
    let tags = "<tr>";
    for (let i = 0; i < cols.length; i++) {
        tags += `<th>${cols[i]}</th>`;
    }
    tags += "</tr>";
    tableHead.innerHTML = tags;
    await tableBodyAdmin();
}

// Creación dinámica del body de las tablas según si es profe o alumno

function tableBodyAdmin() {
    let tags = "";

    profesores.forEach(u => {
        let ynauth = u.authorized === true ? "Si" : "No";
        let yesAuth = u.authorized === true ? "selected" : "";
        let noAuth = u.authorized === false ? "selected" : "";
        console.log(u.nombre + u.authorized)
        tags += `<tr>
                <td>${u.nombre}</td>
                <td>${ynauth}</td>
                <td>
                    <form class="autorizacion-form" id="${u.id}">
                        <div class="form-group">
                            <select class="form-control auth ${u.id}" name="autorizacion">
                                <option class="option" value="true" ${yesAuth}>Si</option>
                                <option class="option" value="false" ${noAuth}>No</option>
                            </select>
                        </div>
                        <button class="btn" id="save-auth-btn" type="submit"> Guardar</button>
                    </form>
                </td>
            </tr>`;
    })

    tableBody.innerHTML = tags;
    document
}

function guardarCambios() {
    const authorizeForm = document.querySelectorAll(".autorizacion-form");
    authorizeForm.forEach(async (form) => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            let authorizedState = document.querySelector(`.${form.id}`).value;
            let authorizedBoolean = authorizedState === "true" ? true : false;
            let usuarioChanged = profesores.find((prof) => prof.id === form.id)
            await updateDoc(doc(db, "usuarios", form.id), {
                authorized: authorizedBoolean,
            });
            if (authorizedBoolean === true) {
                Swal.fire({
                    title: `Cambios guardados`,
                    text: `Usuario "${usuarioChanged.nombre}" autorizado como perfil docente`,
                    icon: 'success',
                    iconColor: 'green',
                    confirmButtonText: 'OK'
                })
            } else if (authorizedBoolean === false) {
                Swal.fire({
                    title: `Cambios guardados`,
                    text: `Usuario "${usuarioChanged.nombre}" desautorizado como perfil docente`,
                    icon: 'warning',
                    iconColor: 'red',
                    confirmButtonText: 'OK'
                })
            }
    })
})
    
}


/***************  Funcion MAIN **************/

async function mainTabla() {
    actualUser = await auth.currentUser;
    onAuthStateChanged(auth, async (user) => {
        const userFromFirestore = await getDoc(doc(db, "usuarios", user.uid));
        usuario.push(userFromFirestore.data())
        userUid = user.uid

        await cargarUsuarios()

        setTimeout(() => {
            crearTabla(headers);
        }, 1800);
        setTimeout(() => {
            guardarCambios();
        }, 2000);

    })
}

mainTabla()