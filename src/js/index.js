/* ==========================================================================
   TO-DO APP — LÓGICA PRINCIPAL (app.js)
   Organización del archivo:
   1. Referencias al DOM
   2. Estado de la aplicación
   3. Funciones de LocalStorage
   4. Funciones principales (agregar, completar, eliminar)
   5. Funciones de renderizado e interfaz
   6. Funciones de filtrado
   7. Manejadores de eventos
   8. Inicialización de la app
   ========================================================================== */


/* ==========================================================================
   1. REFERENCIAS AL DOM
   ========================================================================== */
const formTarea = document.querySelector('#form-tarea');
const inputTarea = document.querySelector('#input-tarea');
const listaTareasEl = document.querySelector('#lista-tareas');
const mensajeErrorEl = document.querySelector('#mensaje-error');
const contadorTareasEl = document.querySelector('#contador-tareas');
const estadoVacioEl = document.querySelector('#estado-vacio');
const botonesFiltro = document.querySelectorAll('.filtros__btn');
const btnLimpiarCompletadas = document.querySelector('#btn-limpiar-completadas');


/* ==========================================================================
   2. ESTADO DE LA APLICACIÓN
   ========================================================================== */

// Clave utilizada para guardar las tareas en LocalStorage
const CLAVE_STORAGE = 'todo-app-tareas';

// Arreglo que contiene todas las tareas (cada tarea es un objeto)
// Estructura de una tarea: { id, texto, completada }
let tareas = [];

// Filtro actualmente activo: 'todas' | 'pendientes' | 'completadas'
let filtroActivo = 'todas';


/* ==========================================================================
   3. FUNCIONES DE LOCALSTORAGE
   ========================================================================== */

/**
 * Guarda el arreglo de tareas actual en LocalStorage.
 */
function guardarLocalStorage() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tareas));
}

/**
 * Carga las tareas guardadas en LocalStorage (si existen)
 * y las asigna al estado de la aplicación.
 */
function cargarLocalStorage() {
  const tareasGuardadas = localStorage.getItem(CLAVE_STORAGE);
  tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
}


/* ==========================================================================
   4. FUNCIONES PRINCIPALES
   ========================================================================== */

/**
 * Agrega una nueva tarea a partir del texto ingresado por el usuario.
 * Evita agregar tareas vacías y muestra un mensaje de error si ocurre.
 */
function agregarTarea(textoIngresado) {
  const texto = textoIngresado.trim();

  if (texto === '') {
    mostrarError('Escribe una tarea antes de agregarla.');
    return;
  }

  const nuevaTarea = {
    id: Date.now().toString(),
    texto: texto,
    completada: false,
  };

  tareas.push(nuevaTarea);

  guardarLocalStorage();
  renderizarTareas();

  inputTarea.value = '';
  inputTarea.focus();
}

/**
 * Alterna el estado "completada" de una tarea según su id.
 * @param {string} idTarea
 */
function completarTarea(idTarea) {
  tareas = tareas.map((tarea) => {
    if (tarea.id === idTarea) {
      return { ...tarea, completada: !tarea.completada };
    }
    return tarea;
  });

  guardarLocalStorage();
  renderizarTareas();
}

/**
 * Elimina una tarea del arreglo según su id.
 * @param {string} idTarea
 */
function eliminarTarea(idTarea) {
  tareas = tareas.filter((tarea) => tarea.id !== idTarea);

  guardarLocalStorage();
  renderizarTareas();
}

/**
 * Elimina todas las tareas marcadas como completadas.
 */
function limpiarCompletadas() {
  tareas = tareas.filter((tarea) => !tarea.completada);

  guardarLocalStorage();
  renderizarTareas();
}


/* ==========================================================================
   5. FUNCIONES DE RENDERIZADO E INTERFAZ
   ========================================================================== */

/**
 * Crea y devuelve el elemento <li> correspondiente a una tarea.
 * @param {{id: string, texto: string, completada: boolean}} tarea
 * @returns {HTMLLIElement}
 */
function crearElementoTarea(tarea) {
  const li = document.createElement('li');
  li.classList.add('tarea');
  li.dataset.id = tarea.id;

  if (tarea.completada) {
    li.classList.add('tarea--completada');
  }

  // Checkbox para marcar como completada
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('tarea__checkbox');
  checkbox.checked = tarea.completada;
  checkbox.setAttribute('aria-label', `Marcar "${tarea.texto}" como completada`);
  checkbox.addEventListener('change', () => completarTarea(tarea.id));

  // Texto de la tarea
  const span = document.createElement('span');
  span.classList.add('tarea__texto');
  span.textContent = tarea.texto;

  // Botón para eliminar la tarea
  const btnEliminar = document.createElement('button');
  btnEliminar.classList.add('tarea__btn-eliminar');
  btnEliminar.innerHTML = '✕';
  btnEliminar.setAttribute('aria-label', `Eliminar "${tarea.texto}"`);
  btnEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(btnEliminar);

  return li;
}

/**
 * Renderiza en pantalla la lista de tareas según el filtro activo,
 * actualiza el contador y muestra/oculta el estado vacío.
 */
function renderizarTareas() {
  const tareasFiltradas = filtrarTareas(filtroActivo);

  // Limpiar la lista antes de volver a dibujarla
  listaTareasEl.innerHTML = '';

  tareasFiltradas.forEach((tarea) => {
    const elementoTarea = crearElementoTarea(tarea);
    listaTareasEl.appendChild(elementoTarea);
  });

  actualizarContador();
  actualizarEstadoVacio(tareasFiltradas.length);
}

/**
 * Actualiza el contador de tareas pendientes en el footer.
 */
function actualizarContador() {
  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  const texto = pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`;
  contadorTareasEl.textContent = texto;
}

/**
 * Muestra u oculta el mensaje de "no hay tareas" según corresponda.
 * @param {number} cantidadVisible
 */
function actualizarEstadoVacio(cantidadVisible) {
  estadoVacioEl.classList.toggle('estado-vacio--visible', cantidadVisible === 0);
}

/**
 * Muestra un mensaje de error temporal encima del formulario.
 * @param {string} texto
 */
function mostrarError(texto) {
  mensajeErrorEl.textContent = texto;
  mensajeErrorEl.classList.add('mensaje-error--visible');

  setTimeout(() => {
    mensajeErrorEl.classList.remove('mensaje-error--visible');
  }, 2500);
}


/* ==========================================================================
   6. FUNCIONES DE FILTRADO
   ========================================================================== */

/**
 * Devuelve el arreglo de tareas filtrado según el criterio indicado.
 * @param {'todas'|'pendientes'|'completadas'} filtro
 * @returns {Array}
 */
function filtrarTareas(filtro) {
  switch (filtro) {
    case 'pendientes':
      return tareas.filter((tarea) => !tarea.completada);
    case 'completadas':
      return tareas.filter((tarea) => tarea.completada);
    case 'todas':
    default:
      return tareas;
  }
}

/**
 * Cambia el filtro activo, actualiza los estilos de los botones
 * de filtro y vuelve a renderizar la lista de tareas.
 * @param {string} nuevoFiltro
 */
function cambiarFiltro(nuevoFiltro) {
  filtroActivo = nuevoFiltro;

  botonesFiltro.forEach((boton) => {
    const esActivo = boton.dataset.filtro === nuevoFiltro;
    boton.classList.toggle('filtros__btn--activo', esActivo);
  });

  renderizarTareas();
}


/* ==========================================================================
   7. MANEJADORES DE EVENTOS
   ========================================================================== */

formTarea.addEventListener('submit', (evento) => {
  evento.preventDefault();
  agregarTarea(inputTarea.value);
});

botonesFiltro.forEach((boton) => {
  boton.addEventListener('click', () => cambiarFiltro(boton.dataset.filtro));
});

btnLimpiarCompletadas.addEventListener('click', limpiarCompletadas);


/* ==========================================================================
   8. INICIALIZACIÓN DE LA APP
   ========================================================================== */

/**
 * Punto de entrada: carga las tareas guardadas y realiza
 * el primer renderizado de la interfaz.
 */
function inicializarApp() {
  cargarLocalStorage();
  renderizarTareas();
}

inicializarApp();