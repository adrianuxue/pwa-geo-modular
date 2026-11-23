const btnAdjuntar = document.getElementById('btnAdjuntar');
const btnLimpiar = document.getElementById('btnLimpiar');
const btnConfirmarUbicacion = document.getElementById('btnConfirmarUbicacion');
const btnCancelarPrepermiso = document.getElementById('btnCancelarPrepermiso');
const btnGuardarManual = document.getElementById('btnGuardarManual');
const prepermisoCard = document.getElementById('prepermisoCard');
const resultado = document.getElementById('resultado');
const manualPanel = document.getElementById('manualPanel');
const statusText = document.getElementById('statusText');
const manualHelp = document.getElementById('manualHelp');
const zonaManual = document.getElementById('zonaManual');
const detalleManual = document.getElementById('detalleManual');
const manualResultado = document.getElementById('manualResultado');

function setStatus(mensaje) {
  statusText.textContent = mensaje;
}

function mostrarCargando(mensaje) {
  setStatus(mensaje);
  btnAdjuntar.disabled = true;
  btnAdjuntar.textContent = 'Obteniendo...';
}

function restaurarBotonAdjuntar() {
  btnAdjuntar.disabled = false;
  btnAdjuntar.textContent = 'Adjuntar mi ubicación';
}

function ocultarPrepermiso() {
  prepermisoCard.classList.add('hidden');
}

function mostrarPrepermiso() {
  prepermisoCard.classList.remove('hidden');
  manualPanel.classList.add('hidden');
  setStatus('Confirma si deseas compartir tu ubicación.');
}

function habilitarSelectorManualZona(mensaje) {
  manualPanel.classList.remove('hidden');
  if (mensaje) {
    manualHelp.textContent = mensaje;
  }
}

function formatearFecha(timestamp) {
  return new Date(timestamp).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
}

function obtenerEtiquetaPrecision(precisionMetros) {
  if (precisionMetros < 30) {
    return { texto: 'Precisión GPS Alta', clase: 'badge-ok' };
  }
  return { texto: 'Ubicación Aproximada (Wi-Fi / IP)', clase: 'badge-warn' };
}

function renderizarResultadoUbicacion(ubicacion) {
  const etiqueta = obtenerEtiquetaPrecision(ubicacion.precisionMetros);
  resultado.classList.remove('hidden');
  resultado.innerHTML = [
    '<h3>Coordenadas obtenidas</h3>',
    '<span class="badge ' + etiqueta.clase + '">' + etiqueta.texto + '</span>',
    '<div class="result-grid">',
    '  <div class="metric"><span class="label">Latitud</span><span class="value">' + ubicacion.latitud.toFixed(6) + '</span></div>',
    '  <div class="metric"><span class="label">Longitud</span><span class="value">' + ubicacion.longitud.toFixed(6) + '</span></div>',
    '  <div class="metric"><span class="label">Precisión (accuracy)</span><span class="value">' + ubicacion.precisionMetros + ' m</span></div>',
    '  <div class="metric"><span class="label">Timestamp</span><span class="value">' + formatearFecha(ubicacion.timestamp) + '</span></div>',
    '</div>'
  ].join('');
}

function mostrarMensajeError(mensaje) {
  resultado.classList.remove('hidden');
  resultado.innerHTML = '<h3>No se pudo obtener la ubicación</h3>' +
    '<span class="badge badge-error">Fallback activado</span>' +
    '<p>' + mensaje + '</p>';
}

function solicitarUbicacion() {
  ocultarPrepermiso();
  mostrarCargando('Obteniendo coordenadas...');

  return obtenerUbicacionActual({ enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 })
    .then((ubicacion) => {
      console.log('[Geo] Ubicación obtenida:', ubicacion);
      renderizarResultadoUbicacion(ubicacion);
      setStatus('Ubicación adjunta al reporte.');
      manualHelp.textContent = 'También puedes capturar una zona manual si deseas complementar el reporte.';
      manualPanel.classList.remove('hidden');
    })
    .catch((error) => {
      console.warn('[Geo] Error:', error.message);
      mostrarMensajeError(error.message);
      setStatus('No se pudo obtener ubicación automática.');
      habilitarSelectorManualZona('Usa el selector manual como Plan B. Si el permiso está bloqueado, reactívalo en la configuración del navegador/sitio.');
    })
    .finally(() => {
      restaurarBotonAdjuntar();
    });
}

function manejarClickAdjuntar() {
  manualResultado.textContent = '';
  consultarEstadoPermisoGeo().then((estado) => {
    console.log('[Geo] Estado de permiso:', estado);

    if (estado === 'granted') {
      solicitarUbicacion();
      return;
    }

    if (estado === 'prompt') {
      mostrarPrepermiso();
      return;
    }

    if (estado === 'denied') {
      setStatus('Permiso de ubicación bloqueado.');
      resultado.classList.remove('hidden');
      resultado.innerHTML = '<h3>Permiso bloqueado</h3>' +
        '<span class="badge badge-error">Acceso denegado</span>' +
        '<p>El navegador tiene bloqueada la ubicación para este sitio. Reactívalo en la configuración del sitio/navegador y vuelve a intentarlo, o usa la captura manual.</p>';
      habilitarSelectorManualZona('Permiso denegado. Reactiva la ubicación en la configuración del navegador y recarga, o captura tu zona manualmente.');
      return;
    }

    mostrarPrepermiso();
  });
}

function guardarZonaManual() {
  const zona = zonaManual.value;
  const detalle = detalleManual.value.trim();
  if (!zona) {
    manualResultado.style.color = '#b42318';
    manualResultado.textContent = 'Selecciona una zona antes de guardar.';
    return;
  }

  const textoDetalle = detalle ? ' (' + detalle + ')' : '';
  manualResultado.style.color = '#067647';
  manualResultado.textContent = 'Zona manual guardada: ' + zona + textoDetalle + '.';
  setStatus('Reporte con ubicación manual listo.');
}

function limpiarUI() {
  ocultarPrepermiso();
  resultado.classList.add('hidden');
  resultado.innerHTML = '';
  manualPanel.classList.add('hidden');
  zonaManual.value = '';
  detalleManual.value = '';
  manualResultado.textContent = '';
  manualHelp.textContent = 'Si no se puede obtener tu ubicación, selecciona tu zona manualmente.';
  restaurarBotonAdjuntar();
  setStatus('Listo para solicitar ubicación bajo demanda.');
}

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registro) => {
        console.log('[SW] Registrado:', registro.scope);
      })
      .catch((error) => {
        console.warn('[SW] Error de registro:', error);
      });
  });
}

btnAdjuntar.addEventListener('click', manejarClickAdjuntar);
btnConfirmarUbicacion.addEventListener('click', solicitarUbicacion);
btnCancelarPrepermiso.addEventListener('click', () => {
  ocultarPrepermiso();
  setStatus('Solicitud cancelada. Puedes intentarlo cuando lo decidas.');
  habilitarSelectorManualZona('Captura manual disponible si prefieres no compartir ubicación.');
});
btnGuardarManual.addEventListener('click', guardarZonaManual);
btnLimpiar.addEventListener('click', limpiarUI);

registrarServiceWorker();
