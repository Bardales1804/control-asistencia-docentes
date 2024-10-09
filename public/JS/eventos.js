const form = document.getElementById('evento-form');
const eventosTable = document.getElementById('eventos-table').getElementsByTagName('tbody')[0];

// Función para cargar eventos
async function loadEventos() {
    const response = await fetch('/api/eventos');
    const eventos = await response.json();
    eventosTable.innerHTML = ''; // Limpiar tabla

    eventos.forEach(evento => {
        const row = eventosTable.insertRow();
        row.innerHTML = `
            <td>${evento.Id_evento}</td>
            <td>${evento.Codigo}</td>
            <td>${evento.Titulo}</td>
            <td>${evento.Fecha_inicio}</td>
            <td>${evento.Fecha_fin}</td>
            <td>${evento.Lugar}</td>
            <td>${evento.Observaciones}</td>
            <td>${evento.Descripcion}</td>
            <td>
                <button class="delete-button" onclick="deleteEvento(${evento.Id_evento})">🗑️ Eliminar</button>
            </td>
        `;
    });
}

const agregarEventoBtn = document.getElementById('agregar-evento-btn');
        const eventoForm = document.getElementById('evento-form');

        // Función para mostrar/ocultar el formulario
        agregarEventoBtn.addEventListener('click', function() {
            if (eventoForm.style.display === 'none' || eventoForm.style.display === '') {
                eventoForm.style.display = 'block'; // Mostrar el formulario
            } else {
                eventoForm.style.display = 'none'; // Ocultar el formulario
            }
        });

// Función para editar un evento
function editEvento(id_evento) {
    const row = eventosTable.rows[id_evento].cells;
    document.getElementById('Id_evento').value = row[0].innerText;
    document.getElementById('Codigo').value = row[1].innerText;
    document.getElementById('Titulo').value = row[2].innerText;
    document.getElementById('Fecha_inicio').value = row[3].innerText;
    document.getElementById('Fecha_fin').value = row[4].innerText;
    document.getElementById('Lugar').value = row[5].innerText;
    document.getElementById('Observaciones').value = row[6].innerText;
    document.getElementById('Descripcion').value = row[7].innerText;
}

// Función para eliminar un evento
async function deleteEvento(id_evento) {
    await fetch(`/api/eventos/${id_evento}`, {
        method: 'DELETE',
    });
    loadEventos();
}

// Manejar envío del formulario
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    await fetch('/api/eventos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    loadEventos();
    form.reset();
});


// Cargar eventos al inicio
loadEventos();
