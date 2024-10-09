document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('docentesForm');
    const docentesTable = document.getElementById('docentesTable').getElementsByTagName('tbody')[0];

    // URL base de tu API en Railway
    const apiBaseUrl = 'https://control-asistencia-docentes.onrender.com/';  // Reemplaza con tu URL real

    // Función para cargar los datos de los docentes desde la API
    function loadDocentes() {
        fetch(`${apiBaseUrl}/docentes`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                docentesTable.innerHTML = '';
                data.forEach(docente => {
                    const row = docentesTable.insertRow();
                    row.innerHTML = `
                        <td>${docente.Codigo}</td>
                        <td>${docente.Nombres}</td>
                        <td>${docente.Apellidos}</td>
                        <td>${docente.Fecha_nacimiento}</td>
                        <td>${docente.Telefono}</td>
                        <td>${docente.Correo_electronico}</td>
                        <td>${docente.Fecha_ingreso}</td>
                        <td class="action-buttons">
                            <button class="update-button" onclick="editDocente(${docente.Codigo})">✏️ Actualizar</button>
                            <button class="delete-button" onclick="deleteDocente(${docente.Codigo})">🗑️ Eliminar</button>
                        </td>
                    `;
                });
            })
            .catch(error => console.error('Error al cargar docentes:', error));
    }

    // Función para manejar el envío del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const formData = new FormData(form);
        const mode = document.getElementById('formMode').value;
        const codigo = document.getElementById('formCodigo').value;
    
        const data = {
            Codigo: formData.get('codigo'),
            Nombres: formData.get('nombres'),
            Apellidos: formData.get('apellidos'),
            Fecha_nacimiento: formData.get('fecha_nacimiento'),
            Correo_electronico: formData.get('correo_electronico'),
            Telefono: formData.get('telefono'),
            Fecha_ingreso: formData.get('fecha_ingreso'),
        };
    
        if (mode === 'add') {
            fetch(`${apiBaseUrl}/docentes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(() => {
                loadDocentes();
                form.reset();
                document.getElementById('formMode').value = 'add';
                document.getElementById('formCodigo').value = '';
            }).catch(error => console.error('Error al crear el docente:', error));
        } else {
            fetch(`${apiBaseUrl}/docentes/${codigo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar docente');
                }
                return response.json();
            }).then(() => {
                loadDocentes();
                form.reset();
                document.getElementById('formMode').value = 'add';
                document.getElementById('formCodigo').value = '';
            }).catch(error => console.error('Error en la actualización:', error));
        }
    });

    // Función para editar un docente
    window.editDocente = function(codigo) {
        fetch(`${apiBaseUrl}/docentes/${codigo}`)
            .then(response => response.json())
            .then(docente => {
                document.getElementById('codigo').value = docente.Codigo;
                document.getElementById('nombres').value = docente.Nombres;
                document.getElementById('apellidos').value = docente.Apellidos;
                document.getElementById('fecha_nacimiento').value = docente.Fecha_nacimiento;
                document.getElementById('telefono').value = docente.Telefono;
                document.getElementById('correo_electronico').value = docente.Correo_electronico;
                document.getElementById('fecha_ingreso').value = docente.Fecha_ingreso;
                document.getElementById('formMode').value = 'edit';
                document.getElementById('formCodigo').value = docente.Codigo;
            });
    };

    // Función para eliminar un docente
    window.deleteDocente = function(codigo) {
        fetch(`${apiBaseUrl}/docentes/${codigo}`, {
            method: 'DELETE',
        }).then(() => loadDocentes())
          .catch(error => console.error('Error al eliminar docente:', error));
    };

    // Cargar los docentes al iniciar
    loadDocentes();
});
