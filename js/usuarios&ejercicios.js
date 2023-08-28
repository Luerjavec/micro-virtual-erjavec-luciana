//FIREBASE
console.log("usuariosyejercisios")


// Funciones para manejar fechas

const DateTime = luxon.DateTime;
const now = DateTime.now();

/********* Clases constructoras y funciones creadoras de usuarios *********/

// 1) Función constructora de usuarios

class Usuario {
    constructor(perfil, nombre, email, password) {
        this.perfil = perfil;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.notas = [];
    }
}

class Nota {
    constructor(nota, fecha) {
        this.nota = nota;
        this.fecha = fecha;
    }
}

// 2) función que agrega cada usuario nuevo al array de usuarios y lo guarda en localstorage

function usuarioToArray(perfil, nombre, email, password) {
    if ((usuarios.some(u => u.email == email) == false)) {
        const newUser = new Usuario(perfil, nombre, email, password);
        usuarios.push(newUser);
    }
    let index = usuarios.length - 1

    //Chequea si ya hay ejercicios cargados, y agrega un 0 como nota en los ejercicios en los que el usuario no tiene nota.
    let faltanNotas = ejercicios !== null ? (0 || ejercicios.length) - (usuarios[index].notas.length) : 0;
    if ((faltanNotas >= 0) && usuarios[index].perfil == "alumno") {
        for (let i = 0; i < faltanNotas; i++) {
            const nuevaNota = new Nota(0, now);
            usuarios[index].notas.push(nuevaNota);
        }
    }
    localStorage.setItem("usuariosMV", JSON.stringify(usuarios));
}

/********* Clases constructoras y funciones creadoras de ejerciciios *********/

// 1) Función constructora de usuarios

class Ejercicio {
    constructor(vencimiento, titulo, imagen, enfoque, voltimetro, diafragma) {
        this.num = 0;
        this.vencimiento = vencimiento;
        this.titulo = titulo;
        this.imagen = imagen;
        this.enfoque = enfoque;
        this.voltimetro = voltimetro;
        this.diafragma = diafragma;
        this.preguntas = [];
    }
}

class Pregunta {
    constructor(pregunta, opc1, opc2, opc3) {
        this.pregunta = pregunta;
        this.opc1 = opc1;
        this.opc2 = opc2;
        this.opc3 = opc3;
    }
}

function actualizarNum() {
    for (let i = 0; i < ejercicios.length; i++) {
        ejercicios[i].num = + i
    }
}

// 2) Función que agrega cada usuario nuevo al array de usuarios y lo guarda en localstorage

function ejercicioToArray(vencimiento, titulo, imagen, enfoque, voltimetro, diafragma, pregunta, opc1, opc2, opc3) {
    const nuevoEjercicio = new Ejercicio(vencimiento, titulo, imagen, enfoque, voltimetro, diafragma);
    ejercicios.push(nuevoEjercicio);
    actualizarNum();

    const nuevaPregunta = new Pregunta(pregunta, opc1, opc2, opc3);
    let index = ejercicios.length - 1
    ejercicios[index].preguntas.push(nuevaPregunta);

    localStorage.setItem("ejerciciosMV", JSON.stringify(ejercicios));

    const nuevaNota = new Nota(0, now);    //le pone de nota a todos los usuarios 0 por default
    usuarios.forEach(usuario => {
        usuario.perfil == "alumno" && usuario.notas.push(nuevaNota);
        localStorage.setItem("usuariosMV", JSON.stringify(usuarios));
    })
}


/********* INTERACCIÓN CON EL LOCALSTORAGE: Recupera usuarios y ejercicios del localstorage *********/

let usuarios = JSON.parse(localStorage.getItem("usuariosMV"));
let ejercicios = JSON.parse(localStorage.getItem("ejerciciosMV"));

// Si no hay, crea por primera vez los arrays e introduce algunos objetos de prueba, aunque se pueden crear durante la interacción
// Esto sólo ocurre en la página de registro

if (window.location.href.includes("registration.html") == true) {

    if (usuarios === null) {
        usuarios = [];
        usuarioToArray("profesor", "Adrián", "profe@gmail.com", "profe");
        usuarioToArray("alumno", "Luciana", "alumno@gmail.com", "alumno");
        usuarioToArray("alumno", "Álvaro", "alumno2@gmail.com", "alumno2");
        usuarioToArray("alumno", "Mariano", "alumno3@gmail.com", "alumno3");
        usuarioToArray("alumno", "Josefina", "alumno4@gmail.com", "alumno4");
    }

    if (ejercicios === null) {
        ejercicios = [];
        ejercicioToArray(DateTime.fromObject({year: 2023, month: 8, day: 1}), "Análisis y reconocimiento de tejido vegetal con tinción", "vegetal.avif", 0, 100, 100, "¿Qué tinción se utilizó?", "Safranina-Fast green", "Azul de anilina", "Violeta de Cresilo");
        ejercicioToArray(DateTime.fromObject({year: 2023, month: 8, day: 28}), "Microscopía de fluorescencia de quistes renales", "ej_fluorescencia.avif", 0, 100, 100, "¿Qué estructura se reconoce?", "Núcleos", "Tubulina", "Filamentos");
        ejercicioToArray(DateTime.fromObject({year: 2023, month: 9, day: 2}), "Visualización de preparado de aparato respiratorio", "laringe.avif", 0, 100, 100, "¿Qué tinción se utilizó?", "Hematoxilina-eosina", "Azul de metileno", "Violeta de Genciana");
        ejercicioToArray(DateTime.fromObject({year: 2023, month: 7, day: 30}), "Visualización de tejido conectivo con Alcian blue - PAS", "alcian-blue.avif", 0, 100, 100, "¿Qué estructura se reconoce en azul?", "Cartílago", "Epitelio", "Membrana");
        ejercicioToArray(DateTime.fromObject({year: 2023, month: 9, day: 17}), "Cálculo del índice mitótico en tinción de tejido vegetal", "mitosis.avif", 0, 100, 100, "¿Cuántas figuras mitóticas encuentra?", "10", "8", "5");

        //Cambio algunas notas y fechas random para que los datos sean más interesantes:
        
        
        usuarios.forEach(function (usuario, index, usuarios) {
            usuarios[index].notas.forEach(function (nota, index, notas) {
                const randomDay = DateTime.fromObject({year: 2023, month: 6, day: (Math.floor(Math.random() * (30 - 1) + 1))});
                
                notas[index] = {
                    nota: Math.floor(Math.random() * (10 - 0)),
                    fecha: randomDay
                }
            })
        })
        localStorage.setItem("usuariosMV", JSON.stringify(usuarios));
    }
}