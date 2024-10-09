document.addEventListener('DOMContentLoaded', function() {
    const searchDocenteBtn = document.getElementById('searchDocenteBtn');
    const searchCodigoInput = document.getElementById('searchCodigo');
    const docenteInfo = document.getElementById('docenteInfo');
    const docenteCodigo = document.getElementById('docenteCodigo');
    const docenteNombre = document.getElementById('docenteNombre');
    const docenteApellido = document.getElementById('docenteApellido');
    const addHorarioBtn = document.getElementById('addHorarioBtn');
    const horariosForm = document.getElementById('horariosForm');
    const horariosTable = document.getElementById('horariosTable').getElementsByTagName('tbody')[0];
    const horariosTableContainer = document.getElementById('horariosTableContainer');
    const horariosFormContainer = document.getElementById('horariosFormContainer');

    // Función para buscar un docente por código
    searchDocenteBtn.onclick = async function() {
        const codigo = searchCodigoInput.value.trim();
        
        if (codigo) {
            try {
                const response = await fetch(`/api/docentes/${codigo}`);
                if (!response.ok) {
                    throw new Error('Docente no encontrado');
                }
                const docente = await response.json();
                mostrarDocente(docente);
                cargarHorarios(codigo);
            } catch (error) {
                alert(error.message);
                limpiarDocente();
            }
        } else {
            alert('Por favor, ingresa un código.');
        }
    };

    // Función para mostrar la información del docente
    function mostrarDocente(docente) {
        docenteCodigo.textContent = docente.Codigo;
        docenteNombre.textContent = docente.Nombres;
        docenteApellido.textContent = docente.Apellidos;
        docenteInfo.style.display = 'block';
        addHorarioBtn.style.display = 'inline-block';
    }

    // Función para limpiar la información del docente
    function limpiarDocente() {
        docenteCodigo.textContent = '';
        docenteNombre.textContent = '';
        docenteApellido.textContent = '';
        docenteInfo.style.display = 'none';
        addHorarioBtn.style.display = 'none';
        horariosTableContainer.style.display = 'none';
        horariosTable.innerHTML = '';
    }

    // Función para cargar los horarios del docente
    async function cargarHorarios(codigo) {
        try {
            const response = await fetch(`/api/horarios/${codigo}`);
            if (!response.ok) {
                throw new Error('Error al obtener los horarios');
            }
            const horarios = await response.json();
            mostrarHorarios(horarios);
        } catch (error) {
            alert(error.message);
        }
    }

    // Función para mostrar los horarios en la tabla
    function mostrarHorarios(horarios) {
        horariosTable.innerHTML = '';
        if (horarios.length > 0) {
            horariosTableContainer.style.display = 'block';
            horarios.forEach(horario => {
                const row = horariosTable.insertRow();
                row.innerHTML = `
                    <td>${horario.Id_horario}</td>
                    <td>${horario.Dia_de_la_semana}</td>
                    <td>${horario.Hora_entrada}</td>
                    <td>${horario.Hora_salida}</td>
                    <td class="action-buttons">
                        <button class="delete-button" onclick="deleteHorario(${horario.Id_horario})">🗑️ Eliminar</button>
                    </td>
                `;
            });
        } else {
            horariosTableContainer.style.display = 'none';
            alert('No se encontraron horarios para este docente.');
        }
    }

    // Función para manejar el envío del formulario de horarios
    horariosForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const formMode = document.getElementById('formMode').value;
        const idHorario = document.getElementById('formIdHorario').value;
        const codigoDocente = document.getElementById('formCodigoDocente').value || docenteCodigo.textContent;
        const dia = document.getElementById('dia').value.trim();
        const horaEntrada = document.getElementById('hora_entrada').value;
        const horaSalida = document.getElementById('hora_salida').value;

        if (!dia || !horaEntrada || !horaSalida) {
            alert('Por favor, completa todos los campos.');
            return;
        }
    
        const data = {
            Codigo: parseInt(codigoDocente),
            Dia_de_la_semana: dia,
            Hora_entrada: horaEntrada,
            Hora_salida: horaSalida
        };
    
        if (formMode === 'add') {
            // Crear un nuevo horario
            fetch('/api/horarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Error al crear el horario');
                }
                return response.json();
            }).then(() => {
                alert('Horario creado exitosamente');
                horariosForm.reset();
                horariosFormContainer.style.display = 'none';
                cargarHorarios(codigoDocente);
            }).catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al crear el horario');
            });
        } else if (formMode === 'edit') {
            // Actualizar un horario existente
            fetch(`/api/horarios/${idHorario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar el horario');
                }
                return response.json();
            }).then(() => {
                alert('Horario actualizado exitosamente');
                horariosForm.reset();
                horariosFormContainer.style.display = 'none';
                document.getElementById('formMode').value = 'add';
                document.getElementById('formIdHorario').value = '';
                cargarHorarios(codigoDocente);
            }).catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al actualizar el horario');
            });
        }
    });

    // Función global para editar un horario
    window.editHorario = function(id, dia, horaEntrada, horaSalida) {
        document.getElementById('formMode').value = 'edit';
        document.getElementById('formIdHorario').value = id;
        document.getElementById('dia').value = dia;
        document.getElementById('hora_entrada').value = horaEntrada;
        document.getElementById('hora_salida').value = horaSalida;
        horariosFormContainer.style.display = 'block';
    };

    // Función global para eliminar un horario
    window.deleteHorario = function(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este horario?')) {
            fetch(`/api/horarios/${id}`, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar el horario');
                }
                return response.json();
            }).then(() => {
                alert('Horario eliminado exitosamente');
                const codigoDocente = docenteCodigo.textContent;
                cargarHorarios(codigoDocente);
            }).catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al eliminar el horario');
            });
        }
    };
});
