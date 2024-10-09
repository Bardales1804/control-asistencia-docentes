$(document).ready(function() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        locale: 'es', // Establecer idioma español
        events: '/descansos', // Ruta para obtener eventos
        editable: false,
        eventRender: function(event, element) {
            element.bind('click', function() {
                alert('Descripción: ' + event.descripcion);
            });
        }
    });
function actualizarCalendario() {
    fetch('/actualizar-calendario')
      .then(response => response.json())
      .then(data => {
          // Aquí actualizas el calendario con los datos recibidos
          console.log(data); // Puedes usar este console.log para ver los datos en la consola
          
          // Lógica para actualizar el calendario (esto depende de cómo estés implementando el calendario)
          // Ejemplo: limpiar el calendario y volver a cargar los descansos
          calendario.clear();
          data.forEach(descanso => {
              // Supongamos que tienes una función para añadir descansos al calendario
              agregarDescansoAlCalendario(descanso);
          });
      });
}


    // Enviar el formulario
    $('#descansoForm').on('submit', function(e) {
        e.preventDefault();
        const fecha = $('#fecha').val();
        const tipo = $('#tipo').val();
        const descripcion = $('#descripcion').val();

        $.ajax({
            url: '/descansos',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ fecha, tipo, descripcion }),
            success: function() {
                $('#calendar').fullCalendar('refetchEvents'); // Recargar eventos
                $('#descansoForm')[0].reset(); // Resetear el formulario
            }
        });
    });
});
