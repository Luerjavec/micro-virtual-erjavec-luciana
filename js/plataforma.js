// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();

/********* Carga desde firebase *********/

import { auth, db, storage } from './firebaseAuth.js'
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import './dashboard/dashboard.js'
import { doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";


/********* Variables globales *********/

let enfoque = 20;
let ejercicio, actualUser, imagen
let preguntas = []
const numEjer = JSON.parse(sessionStorage.getItem("ejercicioElegido")); // Buscamos cuál ejercicio eligió para mostrar la plataforma según ese ejercicio


/********* Carga de la plataforma *********/

// Mostramos la imagen y las preguntas correspondientes al ejercicio elegido.

const imagenEjercicio = document.querySelector("#ejercicio-img-display"); //debe ser global porque la usan casi todas las funciones

async function mostrarPlataforma() {
    await getDownloadURL(ref(storage, (numEjer + ".avif")))
    .then((url) => {
        imagen = url;
        imagenEjercicio.src = imagen
    })
    .catch((error) => {
      imagen = (numEjer + ".avif")
      console.log(error)
    });

     //ejercicio.imagen : `../media/ejercicios/${ejercicio.imagen}`;


    // SLIDER MICROMÉTRICO: hacer que el slider micro sea infinito
    $.fn.roundSlider.prototype.defaults.lap = 0;
    const infiniteSlider = $.fn.roundSlider.prototype._changeSliderValue;

    $.fn.roundSlider.prototype._changeSliderValue = function (newValue, angle) {
        const o = this.options;
        const startQuarter = o.max * 0.25;
        const endQuarter = o.max * 0.75;
        const preValue = o.value;
        if (preValue >= endQuarter && newValue <= startQuarter) this.options.lap++;
        if (preValue <= startQuarter && newValue >= endQuarter) this.options.lap--;
        infiniteSlider.apply(this, arguments);
    }

    $("#micrometricoSlider").roundSlider({
        startAngle: 92,
        width: 9,
        handleSize: "+9",
        radius: 32,
        value: 7.5,
        lap: 16,
        step: 0.1,
        max: 7.6,
        min: 0,
        handleShape: "round",
        showTooltip: false,
        editableTooltip: false,

    });

    $("#macrometricoSlider").roundSlider({  //creación de slider customizado a través de librería round-sliders
        sliderType: "min-range",
        handleShape: "round",
        width: 9,
        step: 0.1,
        radius: 52,
        value: 100 + enfoque,
        handleSize: "+9",
        startAngle: -70,
        endAngle: "+325",
        max: 136.8,
        min: 60.8,
        lineCap: "round",
        //circleShape: "pie",
        showTooltip: false,
        editableTooltip: false,
    });
    //$.fn.roundSlider.prototype._handleDragDistance = 90;
}

function mostrarPreguntas() {
    const preguntasTitulo = document.querySelector(".subtitulo-plataforma");
    preguntasTitulo.innerText = ejercicio.titulo;

    const preguntasLista = document.querySelector(".preguntas-lista");
    preguntas.forEach(pregunta => {
        preguntasLista.innerHTML += `
        <li>
            <div class="form-group">
                <label>${pregunta.pregunta}</label>
                <select id=pregunta class="form-select">
                    <option value="0">-Elegí la respuesta correcta-</option>
                    <option value="1">${pregunta.opc1}</option>
                    <option value="2">${pregunta.opc2}</option>
                    <option value="3">${pregunta.opc3}</option>
                </select>
            </div>
        </li>
            `;
    })
}


/********* Funciones que editan las imágenes ante interacción del usuario *********/

// 1) Definimos las variables globales principales con objetos del DOM

const platinaImg = document.querySelector(".microscopio-platina")
const luz = document.querySelector(".microscopio-luz")
const luzdfg = document.querySelector(".microscopio-luzdfg")
const platinaXSlider = document.querySelector("#platinaXSlider")
const platinaYSlider = document.querySelector("#platinaYSlider")
const voltimetroSlider = document.querySelector("#voltimetroSlider");
const diafragmaSlider = document.querySelector("#diafragmaSlider");
const objetivo = document.querySelector("#lenteObjetivo");
const imagenObjetivos = document.querySelector(".microscopio-objetivos");

let platinaX = platinaXSlider.value = 0;
let brightness = voltimetroSlider.value = 30;
let contrast = diafragmaSlider.value = 80;
let zoom = objetivo.value / 4;


// 2) Creamos funciones que cambien los valores de acuerdo a la interacción con el DOM

function aplicarFiltro() {
    imagenEjercicio.style.filter = `contrast(${contrast}%) brightness(${brightness}%) blur(${enfoque}px)`;
    imagenEjercicio.style.transform = `scale(${zoom})`;
    imagenEjercicio.style.left = parseFloat(platinaXSlider.value) * (objetivo.value / 4) + "px"
    imagenEjercicio.style.top = parseFloat(platinaYSlider.value) * (objetivo.value / 4) + "px"
}
aplicarFiltro(); // Aplicación de filtro inicial para que el enfoque tenga dificultad

function actualizarMicroscopio() {
    platinaImg.style.left = (parseFloat(platinaXSlider.value)) / 20 + (parseFloat(platinaYSlider.value)) / 27 + "px"
    platinaImg.style.top = (($("#macrometricoSlider").roundSlider("option", "value") - 200) / 8) + ((parseFloat(platinaXSlider.value)) / 40) + "px"
    luz.style.opacity = parseFloat(voltimetroSlider.value / 5) + 35 + "%";
    luzdfg.style.opacity = parseFloat(voltimetroSlider.value / 5) - parseFloat(diafragmaSlider.value / 5) + 40 + "%";
    imagenObjetivos.src = `../media/microscopio-obj${objetivo.value}.avif`;
}

function actualizarVistas() {
    contrast = diafragmaSlider.value;
    zoom = objetivo.value / 4;
    brightness = voltimetroSlider.value;
    if (diafragmaSlider.value < 80) {
        brightness = parseFloat(voltimetroSlider.value) + parseFloat(Math.pow(85 / (diafragmaSlider.value), 8.6));
    }
    if (diafragmaSlider.value > 95) {
        brightness = parseFloat(voltimetroSlider.value) - parseFloat(Math.pow((diafragmaSlider.value / 100), 10.7))
    }
    aplicarFiltro();
    actualizarMicroscopio();
}


// 3) Definimos los event listener

platinaYSlider.addEventListener("input", () => { actualizarVistas(); });
platinaXSlider.addEventListener("input", () => { actualizarVistas(); });
voltimetroSlider.addEventListener("input", () => { actualizarVistas(); });
diafragmaSlider.addEventListener("input", () => { actualizarVistas(); });
objetivo.addEventListener("input", () => { actualizarVistas(); });

// function alertasMicroMacro(num) {
//     if (num === 60.8) {
//         Swal.fire({
//             title: '¡Cuidado!',
//             text: 'La platina tocó el objetivo!',
//             icon: 'warning',
//             iconColor: '#6a1635',
//             confirmButtonText: 'Ok'
//         })
//         .then((result) => {
//             if (result.isConfirmed) {
//                 //$('#micrometricoSlider').roundSlider('setValue', (62 / 10));
//                 $('#macrometricoSlider').roundSlider('setValue', 60.8);
//             }
//         })
//     }
//     if (num === 136.8) {
//         Swal.fire({
//             title: '¡Cuidado!',
//             text: 'Llegaste al tope inferior del microscopio!',
//             icon: 'warning',
//             iconColor: '#6a1635',
//             confirmButtonText: 'Ok'
//         })
//         .then((result) => {
//             if (result.isConfirmed) {
//                 //$('#micrometricoSlider').roundSlider('setValue', (138 / 10));
//                 $('#macrometricoSlider').roundSlider('setValue', 136.8);
//             }
//         })
//     }
// }

$("#macrometricoSlider").roundSlider({
    update: function (e) {
        const lapValue = (e.value / 7.6);
        const microValue = (60.8 + (7.6 * (lapValue - 7))) - e.value;

        $('#micrometricoSlider').roundSlider("option", "lap", Math.floor(lapValue));
        $('#micrometricoSlider').roundSlider("option", "value", microValue);

        // console.log("evalue MACRO" + e.value)
        // console.log("lap MACRO: " + $('#micrometricoSlider').roundSlider("option", "lap"))
        // console.log("micro MACRO: " + $('#micrometricoSlider').roundSlider("option", "value"))

        enfoque = (e.value - 100) > 0 ? (e.value - 100) : (e.value - 100) * (-1);
        platinaImg.style.top = ((parseFloat(e.value) - 100) / 10) + ((parseFloat(platinaXSlider.value) + 0) / 40) + "px";

        if (enfoque >= 36.5) {
            Swal.fire({
                title: '¡Cuidado!',
                text: 'Llegaste al tope inferior del microscopio!',
                icon: 'warning',
                iconColor: '#6a1635',
                confirmButtonText: 'Ok'
            })
        }
        actualizarVistas();
    }
});


$("#micrometricoSlider").roundSlider({
    update: function (e) {
        let macroValue = (this.options.lap * this.options.max) + e.value;

        // console.log(macroValue-5)
        // console.log("MICRO desde micro : " + $('#micrometricoSlider').roundSlider("option", "value"));
        // console.log("lap desde micro : " + $('#micrometricoSlider').roundSlider("option", "lap"));

        $('#macrometricoSlider').roundSlider('setValue', macroValue - 5);

        enfoque = (macroValue - 105) > 0 ? (macroValue - 105) : (macroValue - 105) * (-1);
        platinaImg.style.top = ((parseFloat(macroValue) - 105) / 10) + ((parseFloat(platinaXSlider.value) + 0) / 40) + "px";
        if (enfoque >= 36.5) {
            Swal.fire({
                title: '¡Cuidado!',
                text: 'Llegaste al tope inferior del microscopio!',
                icon: 'warning',
                iconColor: '#6a1635',
                confirmButtonText: 'Ok'
            })
        }

        actualizarVistas();
    }
});

/********* Funciones que dan notas *********/

// La nota final sale del promedio del enfoque y la pregunta contestada por el alumno

function darNotaEnfoque() {
    //Defino rubrica aprobación, el valor es la nota y el índex del array es cuánto se alejó el usuario del valor ideal.
    const rubricaNotas = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

    let difVoltimetroIdeal = Math.round((ejercicio.voltimetro - voltimetroSlider.value) / 10); //(la nota baja 1 pto cada 10 unidades que se aleja)
    difVoltimetroIdeal < 0 && (difVoltimetroIdeal = difVoltimetroIdeal * (-1))

    let difDiafragmaIdeal = Math.round((ejercicio.diafragma - diafragmaSlider.value) / 10); //(la nota baja 1 pto cada 10 unidades que se aleja)
    difDiafragmaIdeal < 0 && (difDiafragmaIdeal = difDiafragmaIdeal * (-1))

    let difMacrometricoIdeal = Math.round(ejercicio.enfoque - (parseFloat($("#macrometricoSlider").roundSlider("option", "value") - 100))); //(la nota baja 1 pto cada 1 unidad que se aleja)
    difMacrometricoIdeal < 0 && (difMacrometricoIdeal = difMacrometricoIdeal * (-1));

    let notaVoltimetro = rubricaNotas[difVoltimetroIdeal] || 0;
    let notaDiafragma = rubricaNotas[difDiafragmaIdeal] || 0;
    let notaMacrometrico = rubricaNotas[difMacrometricoIdeal] || 0;

    return Math.round((notaVoltimetro + notaDiafragma + notaMacrometrico) / 3);
}

function darNotaPreguntas() {
    const opcion = document.querySelector("#pregunta"); //la opción correcta siempre es la 1
    let notaPreguntas = opcion.value == 1 ? 10 : 0;
    return notaPreguntas;
}

// Obtenemos la nota y fecha y la guardamos en las notas del usuario en el LocalStorage. Luego redirige al dashboard de ejercicios

async function notaToArray() {
    const respuesta = document.querySelector(".preguntas-form")

    respuesta.addEventListener("submit", (e) => {
        e.preventDefault();
        let notaEnfoque = darNotaEnfoque();
        let notaPreguntas = darNotaPreguntas();
        let notaFinal = Math.round((notaEnfoque + notaPreguntas) / 2);
        let fecha = Timestamp.fromDate(new Date());
        let nuevaNota = { id: numEjer, nota: notaFinal, fecha: fecha }

        onAuthStateChanged(auth, async (user) => {
            const userFromFirestore = await getDoc(doc(db, "usuarios", user.uid));
            if (userFromFirestore.data().perfil == "alumno") {
                let notas = userFromFirestore.data().notas
                let indice = userFromFirestore.data().notas.findIndex(element => element.id == numEjer)

                if (indice === (-1)) { //no tiene intentos en ese ejercicio, crear
                    notas.push(nuevaNota)
                } else { //tiene intentos, reemplazar
                    notas.splice(indice, 1, nuevaNota)
                }
                await updateDoc(doc(db, "usuarios", user.uid),
                    { notas: notas });
            }
            Swal.fire({
                title: `Te sacaste un ${notaFinal}`,
                html: `Nota enfoque: ${notaEnfoque}, Nota pregunta: ${notaPreguntas}. <br><b>Nota final: ${notaFinal}</b>`,
                icon: 'success',
                iconColor: '#0a5124',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location = "./dashboard/dashboard-ejercicios.html";
                }
            })
        })


    });
}


/***************  Funcion MAIN **************/

async function mainPlataforma() {

    const ejer = await getDoc(doc(db, "ejercicios", numEjer));
    ejercicio = ejer.data();
    preguntas = ejer.data().preguntas
    await mostrarPlataforma();
    await mostrarPreguntas();
    await notaToArray();
}

mainPlataforma()