const SUPABASE_URL = "https://ecbwncafrhowiojrbpjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_wWwvm4DY2mZ5E97LHs2f7w_rsR_YKke";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del HTML
const formulario = document.getElementById('formulario');
const tabla = document.getElementById('tabla');
const titulo = document.getElementById('titulo');
const btnCancelar = document.getElementById('btnCancelar');

const campoId = document.getElementById('id');
const campoNombres = document.getElementById('nombres');
const campoApellidos = document.getElementById('apellidos');
const campoCorreo = document.getElementById('correo');
const campoCiclo = document.getElementById('ciclo');

let estudiantes = []; // copia local de lo que hay en la base de datos

// =============================================
// 2. READ — Leer y mostrar estudiantes
// =============================================
async function listar() {
  const { data, error } = await db
    .from('TB_Estudiante')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    alert('Error al leer: ' + error.message);
    return;
  }

  if (data.length === 0) {
    tabla.innerHTML = '<tr><td colspan="5">No hay estudiantes registrados</td></tr>';
    return;
  }

  estudiantes = data; // los guardamos para poder editarlos luego
  tabla.innerHTML = '';
  data.forEach(est => {
    tabla.innerHTML += `
      <tr>
        <td>${est.nombres}</td>
        <td>${est.apellidos}</td>
        <td>${est.correo}</td>
        <td>${est.ciclo}</td>
        <td>
          <button class="editar" onclick="editar(${est.id})">Editar</button>
          <button class="eliminar" onclick="eliminar(${est.id})">Eliminar</button>
        </td>
      </tr>`;
  });
}

// =============================================
// 3. CREATE y UPDATE — Guardar el formulario
// =============================================
formulario.addEventListener('submit', async (e) => {
  e.preventDefault(); // que la página no se recargue

  const estudiante = {
    nombres: campoNombres.value.trim(),
    apellidos: campoApellidos.value.trim(),
    correo: campoCorreo.value.trim(),
    ciclo: campoCiclo.value,
  };

  let respuesta;

  if (campoId.value === '') {
    // CREATE → INSERT
    respuesta = await db.from('TB_Estudiante').insert(estudiante);
  } else {
    // UPDATE → UPDATE ... WHERE id = ?
    respuesta = await db.from('TB_Estudiante').update(estudiante).eq('id', campoId.value);
  }

  if (respuesta.error) {
    alert('Error al guardar: ' + respuesta.error.message);
    return;
  }

  limpiar();
  listar();
});

// Pasar los datos de una fila al formulario
function editar(id) {
  const est = estudiantes.find(e => e.id === id);
  campoId.value = est.id;
  campoNombres.value = est.nombres;
  campoApellidos.value = est.apellidos;
  campoCorreo.value = est.correo;
  campoCiclo.value = est.ciclo;
  titulo.textContent = 'Editando estudiante';
  btnCancelar.classList.remove('oculto');
}

// =============================================
// 4. DELETE — Eliminar
// =============================================
async function eliminar(id) {
  if (!confirm('¿Seguro que deseas eliminar este estudiante?')) return;

  const { error } = await db.from('TB_Estudiante').delete().eq('id', id);

  if (error) {
    alert('Error al eliminar: ' + error.message);
    return;
  }
  listar();
}

// Dejar el formulario en modo "nuevo"
function limpiar() {
  formulario.reset();
  campoId.value = '';
  titulo.textContent = 'Nuevo estudiante';
  btnCancelar.classList.add('oculto');
}

btnCancelar.addEventListener('click', limpiar);

// Al abrir la página, mostrar la lista
listar();