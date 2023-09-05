// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();

//Importaciones de firebase

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

import { auth, db } from '../firebaseAuth.js'

import { doc, collection, getDocs, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

//let currUser = auth.currentUser;
let user, userUid, userEmail, userName, userPerfil, isAdmin

// setTimeout(() => {
//     let currUser = auth.currentUser;
//     console.log(auth.currentUser)
// }, 1500);


async function mainDashboard() {
    user = await auth.currentUser;
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userUid = user.uid;
            userEmail = user.email;
            userEmail = user.email;
            userName = user.displayName

            const userFromFirestore = await getDoc(doc(db, "usuarios", user.uid));

            if (userFromFirestore.exists()) {
                userPerfil = userFromFirestore.data().perfil;
                isAdmin = userFromFirestore.data().isAdmin || false;
                console.log(isAdmin)
            } else {
                console.log("No such document!");
            }
            window.location.href.includes("dashboard") == true && (mostrarMenuLateral(), cerrarSesion(), bienvenida())
            // ...
        } else {
            Swal.fire({
                title: `Sesión caducada`,
                text: `Volvé a iniciar sesión para acceder`,
                icon: 'warning',
                iconColor: '#6a1635',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location = "../registration.html";
            })
        }
    })

}

// Botón salir del menú, hace que vuelva a la página de registro

function cerrarSesion() {
    const salir = document.querySelector("#salir");
    salir.addEventListener("click", () => {
        Swal.fire({
            title: `Salir`,
            text: `¿Estás seguro de que querés cerrar la sesión?`,
            icon: 'warning',
            iconColor: '#6a1635',
            confirmButtonText: 'Salir'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth)
                    .then(() => {
                        window.location = "../registration.html";
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                // sessionStorage.removeItem("ejercicioElegido");
            }
        })
    })
}


/********* Mostramos el menú lateral *********/
// Dependiendo si es profe o alumno el menú de la izquierda cambia un poquito

function mostrarMenuLateral() {
    const account = document.querySelector(".account-name");
    account.innerHTML = `<ion-icon name="person"></ion-icon> Sesión: ${userName.charAt(0).toUpperCase() + userName.slice(1)}`;
    
    const inicio = document.querySelector("#inicio"); 
    inicio.innerHTML = '<ion-icon name="home"></ion-icon> Inicio';

    const ejercicios = document.querySelector("#ejercicios");
    ejercicios.innerHTML = '<ion-icon name="extension-puzzle"></ion-icon> Ejercicios';
    
    const notasAlumnos = document.querySelector("#notas");
    const autorizar = document.querySelector("#autorizar");

    userPerfil == "profesor" && (notasAlumnos.innerHTML = '<ion-icon name="people"></ion-icon> Mis Alumnos');
    userPerfil == "alumno" && (notasAlumnos.innerHTML = '<ion-icon name="analytics"></ion-icon> Mis notas');
    
    if (isAdmin == true) {
        autorizar.classList.remove("d-none")
        autorizar.innerHTML = '<ion-icon name="people"></ion-icon> Autorizar cuentas'
    }
}


/********* Dashboard - inicio *********/
// Sólo si estamos en la página de inicio, le da la bienvenida

function bienvenida() {
    if (window.location.href.includes("dashboard-home.html") == true) {
        const bienvenida = document.querySelector("#bienvenida");
        const perfil = document.querySelector("#perfil");
        //str + str.slice(1)
        let mostrarPerfil = isAdmin === true ? "Administrador" : userPerfil.charAt(0).toUpperCase() + userPerfil.slice(1)
        
        bienvenida.innerText = `¡Bienvenido al microscopio virtual ${userName.charAt(0).toUpperCase() + userName.slice(1)}! `
        perfil.innerText = `Perfil : ${mostrarPerfil}` 
    }
}


mainDashboard();










//TRAER EJERCICIOS DE FIREBASE - OK)!!!!!!!!!!!

/*
const ejerciciosSnapshot = await getDocs(collection(db, "ejercicios"));
const preguntas = await getDocs(collection(db, "ejercicios", "ID", "preguntas"));

//ejemplo para traer valores de c/u
ejerciciosSnapshot.forEach(async (ej) => {
    console.log(ej.id);
    console.log(ej.data().titulo)
    console.log(ej.data().imagen)
    const preguntas = await getDocs(collection(db, "ejercicios", ej.id, "preguntas"));
    console.log(preguntas.docs.map(pregunta => ({ id: pregunta.id, ...pregunta.data() })))
});


*/
