import './usuarios&ejercicios.js'

// FIREBASE
import { db, auth } from './firebaseAuth.js'

//Crear usuarios nuevos 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js"

//Iniciar sesión con mail o google
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

import { doc, setDoc, } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

// Chequea si está registrado

// function loginCheck() {
//     onAuthStateChanged(auth, async (user) => {
//         console.log(user)
//         if (user) {
//             window.location = "./dashboard/dashboard-home.html";
//         }
//     })
// }

// loginCheck();

// Animaciones intercambiantes formulario inicio de sesión vs. olvide contraseña vs. crear cuenta

const registrationContainer = document.querySelector(".registration-container");
const olvidarLink = document.querySelector(".olvidar-link");
const loginGoogle = document.querySelector("#login-google");
const loginLink = document.querySelector(".login-link");
const loginBackLink = document.querySelector(".login-back-link");
const registerLink = document.querySelector(".register-link");

registerLink.addEventListener("click", () => {
    registrationContainer.classList.add("registrarse");
});
loginLink.addEventListener("click", (e) => {
    e.preventDefault()
    registrationContainer.classList.remove("registrarse");
});
olvidarLink.addEventListener("click", () => {
    registrationContainer.classList.add("olvidar");
});
loginBackLink.addEventListener("click", (e) => {
    e.preventDefault()
    registrationContainer.classList.remove("olvidar");
});


/********* Interaccion con el DOM para iniciar sesión o para registrarse *********/

const loginForm = document.querySelector(".login-form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    iniciarSesion();
});

loginGoogle.addEventListener("click", (e) => {
    e.preventDefault();
    iniciarSesionGoogle();
});

const registerForm = document.querySelector(".register-form");
registerForm.reset();
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    crearCuenta();
});

const btnOlvidar = document.querySelector("#olvidar-button");
const olvidarForm = document.querySelector(".olvidar-form");
olvidarForm.addEventListener("submit", function (e) {
    e.preventDefault();
    btnOlvidar.innerText = 'Enviando código...';
    recuperarContraseña();
});


/********* Funciones que manejan el inicio de sesión, registro y olvido de contraseña *********/

// 1) Contraseña olvidada: Si el email estaba registrado, crea una contraseña random, se la envía por mail y la cambia en el array.

let randomPassword = 0;

function recuperarContraseña() {
    const olvidarMail = document.querySelector("#olvidar-mail").value.toLowerCase();
    const usuarioExists = usuarios.some(u => u.email == olvidarMail);

    if (usuarioExists == false) {
        Swal.fire({
            title: `Mail no registrado`,
            text: `El mail ${olvidarMail} no se encuentra registrado`,
            icon: 'warning',
            iconColor: '#6a1635',
            confirmButtonText: 'OK'
        })
    } else {
        randomPassword = Math.random().toString(36).slice(2, 10);
        const indexUs = usuarios.findIndex(u => u.email == olvidarMail);
        usuarios[indexUs].password = randomPassword;
        localStorage.setItem("usuariosMV", JSON.stringify(usuarios));
        recuperacionEmail();
    }
};

function recuperacionEmail() {
    const mailRecuperar = document.querySelector("#olvidar-mail").value.toLowerCase();
    const templateParams = { olvidarMail: mailRecuperar, newPassword: randomPassword };
    const serviceID = 'default_service';
    const templateID = 'template_y06zeh9';

    emailjs.send(serviceID, templateID, templateParams)
        .then(() => {
            Swal.fire({
                title: `Código enviado`,
                text: `Listo! Te enviamos un mail con un código para recuperar tu contraseña`,
                icon: 'success',
                iconColor: '#0a5124',
                confirmButtonText: 'OK'
            }).then(result => {
                if (result.isConfirmed) {
                    olvidarForm.reset();
                }
            })
            btnOlvidar.innerText = 'Recuperar contraseña';
        }, (err) => {
            btnOlvidar.innerText = 'Recuperar contraseña';
            Swal.fire({
                title: `Error`,
                text: `Ocurrió un error. Intenta de nuevo más tarde.`,
                icon: 'error',
                iconColor: 'red',
                confirmButtonText: 'OK'
            })
        });
}


// 2) Crear usuario: Crea un usuario, lo guarda en array de usuarios y envía un mail de confirmación.

function confirmacionEmail() {
    const serviceID = 'default_service';
    const templateID = 'template_egkspow';

    emailjs.sendForm(serviceID, templateID, registerForm)
        .then(() => {
        }, (err) => {
            Swal.fire({
                title: `Error`,
                text: `Ocurrió un error, por favor intenta de nuevo más tarde`,
                icon: 'error',
                iconColor: 'red',
                confirmButtonText: 'OK'
            })
        });
}

//cuenta inicial


function crearCuenta() {
    const registerNombre = document.querySelector("#register-user").value.toLowerCase();
    const registerMail = document.querySelector("#register-mail").value.toLowerCase();
    const registerPassword = document.querySelector("#register-password").value;
    const registerPerfil = document.querySelector('input[name=perfil]:checked').value;

    createUserWithEmailAndPassword(auth, registerMail, registerPassword)
        .then(async (userCredential) => {
            const user = userCredential.user; // esto es == que auth.currentUser
            updateProfile(user, {
                displayName: registerNombre
            }).then(() => {
                console.log("nombre creado")
            }).catch((error) => { console.log(error) });

            await setDoc(doc(db, "usuarios", user.uid), { nombre: registerNombre, perfil: registerPerfil, notas: [] });

            //confirmacionEmail();

            Swal.fire({
                title: `Cuenta creada`,
                text: `Listo ${registerNombre}, ya podés usar tu cuenta para iniciar sesión. Te enviamos un mail de bienvenida`,
                icon: 'success',
                iconColor: '#0a5124',
                confirmButtonText: 'OK'
            }).then(result => {
                if (result.isConfirmed) {
                    registerForm.reset();
                }
            })
        })
        .catch((error) => {
            console.log(error)
            if (error.code === "auth/invalid-email") {
                Swal.fire({
                    title: `Mail inválido`,
                    text: `Por favor, ingresá un mail válido`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else if (error.code === "auth/weak-password") {
                Swal.fire({
                    title: `Contraseña insegura`,
                    text: `La contraseña debe tener al menos 6 caracteres`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else if (error.code === "auth/email-already-in-use") {
                Swal.fire({
                    title: `Mail existente`,
                    text: `El mail ${registerMail} ya se encuentra registrado`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else {
                Swal.fire({
                    title: `Error`,
                    text: `Ocurrió un error, por favor intenta de nuevo más tarde`,
                    icon: 'error',
                    iconColor: 'red',
                    confirmButtonText: 'OK'
                })
            }
        });
};


//     usuarioToArray(registerPerfil, registerNombre, registerMail, registerPassword);

// 3) Iniciar sesión: Si el usuario y contraseña son correctas, inicia sesión y guarda usuario para recuperarlo en dashboard

function iniciarSesion() {
    const loginMail = document.querySelector("#login-mail").value;
    const loginPassword = document.querySelector("#login-password").value;

    signInWithEmailAndPassword(auth, loginMail, loginPassword)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            sessionStorage.setItem("sesionMV", JSON.stringify(user)); /////////////////////////
            window.location = "./dashboard/dashboard-home.html";
        })
        .catch((error) => {
            console.log(error)
            if (error.code === "auth/user-not-found") {
                Swal.fire({
                    title: `Usuario no registrado`,
                    text: `El mail no está asociado a una cuenta existente`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else if (error.code === "auth/wrong-password") {
                Swal.fire({
                    title: `Contraseña incorrecta`,
                    text: `La contraseña es incorrecta`,
                    icon: 'warning',
                    iconColor: '#6a1635',
                    confirmButtonText: 'OK'
                })
            } else {
                Swal.fire({
                    title: `Error`,
                    text: `Ocurrió un error, por favor intenta de nuevo más tarde`,
                    icon: 'error',
                    iconColor: 'red',
                    confirmButtonText: 'OK'
                })
            }
        });
};


// 4) Iniciar sesión con Google

function iniciarSesionGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            const userName = user.displayName;

            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error.code + error.message)
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });

};

    // if (userExists == true && usuarios[indexUs].password == loginPassword) {
    //     sessionStorage.setItem("sesionMV", JSON.stringify(indexUs));
    //     window.location = "./dashboard/dashboard-home.html";