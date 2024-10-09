// permisos.js

document.addEventListener('DOMContentLoaded', function() {
    const apiPermisosUrl = '/api/permisos';
    const apiDocentesUrl = '/api/docentes';

    const searchPermisoBtn = document.getElementById('searchPermisoBtn');
    const addPermisoBtn = document.getElementById('addPermisoBtn');
    const permisosForm = document.getElementById('permisosForm');
    const permisosFormContainer = document.getElementById('permisosFormContainer');
    const permisosTableContainer = document.getElementById('permisosTableContainer');
    const permisosTableBody = document.getElementById('permisosTable').getElementsByTagName('tbody')[0];
    const docenteInfo = document.getElementById('docenteInfo');

    // Elementos para mostrar información del docente
    const docenteCodigo = document.getElementById('docenteCodigo');
    const docenteNombres = document.getElementById('docenteNombres');
    const docenteApellidos = document.getElementById('docenteApellidos');

    let currentDocenteCodigo = null;

    // Función para buscar docente por código
    searchPermisoBtn.onclick = async function() {
        const codigo = document.getElementById('searchCodigo').value.trim();
        if (!codigo) {
            alert('Por favor, ingresa un código de docente.');
            return;
        }

        try {
            const response = await fetch(`${apiDocentesUrl}/${codigo}`);
            if (!response.ok) {
                throw new Error('Docente no encontrado');
            }
            const docente = await response.json();
            mostrarDocente(docente);
            cargarPermisos(docente.Codigo);
        } catch (error) {
            alert(error.message);
            limpiarDocenteInfo();
            permisosTableContainer.style.display = 'none';
            permisosFormContainer.style.display = 'none';
        }
    };

    // Función para mostrar información del docente
    function mostrarDocente(docente) {
        docenteCodigo.innerText = docente.Codigo;
        docenteNombres.innerText = docente.Nombres;
        docenteApellidos.innerText = docente.Apellidos;
        docenteInfo.style.display = 'block';
        permisosTableContainer.style.display = 'block';
        currentDocenteCodigo = docente.Codigo;
    }

    // Función para limpiar la información del docente
    function limpiarDocenteInfo() {
        docenteCodigo.innerText = '';
        docenteNombres.innerText = '';
        docenteApellidos.innerText = '';
        docenteInfo.style.display = 'none';
    }

    // Función para cargar permisos del docente
    async function cargarPermisos(codigo) {
        try {
            const response = await fetch(`${apiPermisosUrl}/docente/${codigo}`);
            const permisos = await response.json();
            permisosTableBody.innerHTML = '';

            permisos.forEach(permiso => {
                const row = permisosTableBody.insertRow();
                row.innerHTML = `
                    <td>${permiso.Id_permiso}</td>
                    <td>${permiso.Fecha_permiso}</td>
                    <td>${permiso.Motivo}</td>
                    <td>${permiso.Descripcion}</td>
                    <td class="action-buttons">
                        <button class="update-button" onclick="editPermiso(${permiso.Id_permiso})">✏️ Actualizar</button>
                        <button class="delete-button" onclick="deletePermiso(${permiso.Id_permiso})">🗑️ Eliminar</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar permisos:', error);
        }
    }

    // Función para mostrar el formulario para agregar un permiso
    addPermisoBtn.onclick = function() {
        if (!currentDocenteCodigo) {
            alert('Debes buscar y seleccionar un docente primero.');
            return;
        }
        permisosFormContainer.style.display = 'block';
        permisosForm.reset();
        document.getElementById('permisoId').value = '';
        document.getElementById('permisoCodigo').value = currentDocenteCodigo;
        document.getElementById('formTitle').innerText = 'Agregar Permiso';
    };

    // Manejar el envío del formulario de permisos
    permisosForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const permisoId = document.getElementById('permisoId').value;
        const Codigo = document.getElementById('permisoCodigo').value;
        const Fecha_permiso = document.getElementById('fecha_permiso').value;
        const Motivo = document.getElementById('motivo').value.trim();
        const Descripcion = document.getElementById('descripcion').value.trim();

        if (!Fecha_permiso || !Motivo || !Descripcion) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        const permisoData = { Codigo, Fecha_permiso, Motivo, Descripcion };

        try {
            if (permisoId) {
                // Actualizar permiso existente
                const response = await fetch(`${apiPermisosUrl}/${permisoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(permisoData)
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el permiso.');
                }

                alert('Permiso actualizado con éxito.');
            } else {
                // Crear nuevo permiso
                const response = await fetch(apiPermisosUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(permisoData)
                });

                if (!response.ok) {
                    throw new Error('Error al crear el permiso.');
                }

                alert('Permiso creado con éxito.');
            }

            permisosFormContainer.style.display = 'none';
            permisosForm.reset();
            cargarPermisos(Codigo);
        } catch (error) {
            console.error('Error al guardar el permiso:', error);
            alert(error.message);
        }
    });

    // Función para editar un permiso
    window.editPermiso = async function(id) {
        try {
            const response = await fetch(`${apiPermisosUrl}/id/${id}`);
            if (!response.ok) {
                throw new Error('Permiso no encontrado.');
            }
            const permiso = await response.json();
            document.getElementById('permisoId').value = permiso.Id_permiso;
            document.getElementById('permisoCodigo').value = permiso.Codigo;
            document.getElementById('fecha_permiso').value = permiso.Fecha_permiso;
            document.getElementById('motivo').value = permiso.Motivo;
            document.getElementById('descripcion').value = permiso.Descripcion;
            document.getElementById('formTitle').innerText = 'Actualizar Permiso';
            permisosFormContainer.style.display = 'block';
        } catch (error) {
            console.error('Error al editar permiso:', error);
            alert(error.message);
        }
    };

    // Función para eliminar un permiso
    window.deletePermiso = async function(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
            return;
        }

        try {
            const response = await fetch(`${apiPermisosUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el permiso.');
            }

            alert('Permiso eliminado con éxito.');
            cargarPermisos(currentDocenteCodigo);
        } catch (error) {
            console.error('Error al eliminar permiso:', error);
            alert(error.message);
        }
    };
});
