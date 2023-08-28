// Formulario de contacto -> Envía mail  a través de Email.js

function sendEmail() {
    const btn = document.getElementById('btnContacto');

    document.getElementById('contactForm')
        .addEventListener('submit', function (event) {
            event.preventDefault();

            btn.innerText = 'Enviando...';

            const serviceID = 'default_service';
            const templateID = 'template_y8t9q5g';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    btn.innerText = 'Enviar';
                    Swal.fire({
                        title: `Gracias por tu consulta`,
                        text: `Te enviamos un mail. Nuestro equipo se contactará con vos a la brevedad`,
                        icon: 'success',
                        iconColor: 'green',
                        confirmButtonText: 'OK'
                    })
                }, (err) => {
                    btn.innerText = 'Enviar';
                    console.log(JSON.stringify(err));
                });
        });
}

sendEmail();