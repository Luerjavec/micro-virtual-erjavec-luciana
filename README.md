# Preentrega3-ErjavecLuciana
Tercera preentrega - curso javascript coder

El proyecto puede visualizarse en:
https://luerjavec.github.io/PF-ErjavecLuciana-JS/

<h1 style="color:Indigo;"><b><u>Microscopio virtual</u></b></h1>
<p style="text-align: justify">Esta app web intenta simular un microscopio virtual de biología.
    <br>
    Los microscopios funcionan como editores de video, mediante distintos controladores tipo ruedita o slider van
    cambiando el brillo (mediante el voltímetro), contraste (mediante el diafragma), enfoque o blur (mediante el
    macrométrico), posición de la imagen (mediante la platina, en X e Y).
    <br>La idea de la app es que los alumnos puedan practicar el uso del microscopio, y que se les otorgue una nota de acuerdo a cómo lo hicieron. Y que luego los profes puedan ver cómo le fue a cada alumno.</p>
    <br>
<h2><b><i>Usuarios para pruebas:</i></b></h2>

Se puede crear un nuevo usuario, o usar los de prueba:
<ul>
    <li> Mail: profe@gmail.com, contraseña: profe</li>
    <li> Mail: alumno@gmail.com, contraseña alumno</li>
</ul>

<h2><b><i>Páginas que usan JavaScript en este proyecto:</i></b></h2>

<h3 style="color:DarkCyan;"><b>✦ Página "ciencia hoy"</b></h3>
<p style="text-align: justify">Trae noticias a través de la API currentnews usando el método fetch y las muestra
    como tarjetas.</p>

<h3 style="color:DarkCyan"><b>✦ Página "contacto"</b></h3>
<p style="text-align: justify">Toma los datos del formulario de contacto y envía un mail a través de la librería
    Email.js</p>

<h3 style="color:DarkCyan"><b>✦ Página "inciar sesión/registrarse"</b></h3>
<ul>
    <li>
        <p style="text-align: justify"> Iniciar sesión: chequea si el mail y contraseña coinciden con algún usuario
            de la base de datos e inicia sesión,
            guarda el número de usuario en el SesionStorage para recuperarlos en la plataforma.</p>
    </li>
    <li>
        <p style="text-align: justify"> Registrar usuario nuevo: Toma los datos del formulario y los guarda en el
            array de usuarios, además envía un mail
            de confirmación a través de la librería Email.js</p>
    </li>
    <li>
        <p style="text-align: justify"> Recuperar contraseña: Si el mail estaba registrado, genera una contraseña
            random y se la envía por mail a través
            de la librería Email.js.</p>
    </li>
</ul>

<p style="text-align: justify">Luego de que el usuario inicia sesión, ingresa al Dashboard. El menú lateral
    del Dashboard se presenta
    diferente si el usuario es alumno o profesor.</p>

<h3 style="color:RoyalBlue;"><b>✦ Dashboard → inicio</b></h3>
<p style="text-align: justify">Le da la bienvenida al usuario que ingresó usando las propiedades de nombre y tipo de
    perfil.</p>

<h3 style="color:RoyalBlue;"><b>✦ Dashboard → Ejercicios</b></h3>
<p style="text-align: justify">Muestra la lista de ejercicios disponibles en tarjetas a través de una plantilla html
    dinámica.</p>
<ul>
    <li>
        <p style="text-align: justify"> Si el perfil es alumno: Las tarjetas muestran si completó o no el
            ejercicio, su nota y fecha. El botón de
            la esquina redirige al usuario a la plataforma para resolver el ejercicio. El id del botón es igual al
            índice del dentro del array de ejercicios, y se guarda en el SesionStorage para recuperarlo en la
            plataforma.</p>
    </li>
    <li>
        <p style="text-align: justify"> Si el perfil es profesor: Las tarjetas muestran la fecha de vencimiento
            del ejercicio y cuantos alumnos
            lo completaron. Tiene tres botones: uno para ingresar a la plataforma y previsualizar el ejercicio; otro
            para eliminar el ejercicio (elimina el ejercicio del array) y otro para editarlo (redirige a la prima de
            edición de ejercicios). Además, el profesor tiene disponible una tarjeta de “Crear ejercicio”, que
            redirige a una página para crear
            ejercicios.</p>
    </li>
</ul>

<h3 style="color:RoyalBlue;"><b>✦ Dashboard → Tabla</b></h3>
<p style="text-align: justify">Crea una lista dinámica de 4 columnas de acuerdo al perfil.
    - Si el perfil es alumno, muestra los ejercicios disponibles, si lo completó o no y su nota.
    - Si el perfil es docente, muestra una lista de alumnos, sus notas y su promedio.</p>

<h3 style="color:RoyalBlue;"><b>✦ Plataforma</b></h3>
<p style="text-align: justify">Muestra la imagen del ejercicio elegido y las preguntas correspondientes. Ajustando
    los controles de la izquierda (diafragma, voltímetro, macrométrico, platina) va cambiando la visualización de la
    imagen central y también el movimiento del microscopio. La plataforma le da una nota, que se calcula según qué
    tan alejado estuvo el enfoque del alumno del enfoque ideal. Además, a la derecha hay una pregunta. </p>
La nota final del ejercicio es el promedio entre la nota del enfoque y la nota de la pregunta y se guarda en el
array de usuarios y en el localStorage
