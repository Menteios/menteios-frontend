---
title: "Manual de Usuario — Menteios"
subtitle: "Sistema de gestión para consultorio"
date: "Julio 2026"
---

# Manual de Usuario — Menteios

## 1. Introducción

**Menteios** es la aplicación de escritorio para la gestión del consultorio. Permite administrar la información de pacientes y las citas agendadas desde una sola pantalla, sin depender de hojas de cálculo ni papel.

Este manual describe cada pantalla de la aplicación y cómo usarla paso a paso.

> **Nota:** en esta versión la aplicación funciona con información de prueba (datos de ejemplo). Los módulos de **Sesiones** y **Reportes** todavía están en construcción y aparecerán marcados como "Próximamente".

## 2. Abrir la aplicación

1. Abre Menteios desde el acceso directo de escritorio o el menú de inicio.
2. Se abrirá una ventana con la pantalla de **inicio de sesión**.

## 3. Inicio de sesión

En la pantalla de inicio de sesión encontrarás:

- **Usuario**: escribe tu nombre de usuario.
- **Contraseña**: escribe tu contraseña. Puedes hacer clic en **¿Olvidaste tu contraseña?** si no la recuerdas.
- **Recordarme contraseña**: marca esta casilla si quieres que la aplicación recuerde tu sesión.
- Botón **Iniciar sesión**: confirma tus datos y entra al sistema.

Al final de la pantalla también hay un enlace **¿No tienes cuenta? Crea una** para el alta de nuevos usuarios.

## 4. Pantalla de Inicio (Resumen general)

Es la primera pantalla que ves después de iniciar sesión. Muestra un panorama general del consultorio:

### 4.1 Tarjetas de resumen

En la parte superior hay 4 tarjetas con información clave:

| Tarjeta | Qué muestra | Al hacer clic |
|---|---|---|
| **Pacientes** | Total de pacientes registrados | Te lleva al módulo de Pacientes |
| **Citas del día** | Cuántas citas hay agendadas para hoy (se actualiza en tiempo real) | Te lleva al módulo de Citas |
| **Sesiones** | Sesiones realizadas esta semana | Te lleva a Sesiones (próximamente) |
| **Reportes** | Reportes disponibles | Te lleva a Reportes (próximamente) |

### 4.2 Tabla de próximas citas

Debajo de las tarjetas, la tabla **"Próximas citas"** lista todas las citas agendadas ordenadas por fecha y hora, mostrando:

- Nombre del paciente
- Fecha
- Monto de la consulta
- Tipo de terapia (con una etiqueta de color)

## 5. Módulo de Pacientes

Aquí se administra la información de cada paciente del consultorio.

### 5.1 Buscar un paciente

Usa el campo **"Buscar paciente..."** en la parte superior; la lista se filtra automáticamente mientras escribes el nombre.

### 5.2 Ver el detalle de un paciente

Haz clic en el ícono de **ojo** 👁 en la tarjeta del paciente para abrir una ventana de solo lectura con:

- Nombre, edad, teléfono
- Diagnóstico
- Área a trabajar
- Plan de ejecución
- Estado (Activo / Inactivo)

### 5.3 Registrar un nuevo paciente

1. Haz clic en el botón **"Nuevo paciente"** (arriba a la derecha).
2. Completa el formulario:
   - **Nombre**
   - **Edad**
   - **Teléfono** (10 dígitos)
   - **Diagnóstico**
   - **Área a trabajar**
   - **Plan de ejecución** (ej. "12 sesiones - Técnicas cognitivo-conductuales")
3. Haz clic en **Guardar**.
4. Verás una notificación confirmando que el paciente se guardó correctamente, y aparecerá al final de la lista con estado **Activo**.

### 5.4 Editar un paciente

1. Haz clic en el ícono de **lápiz** ✏️ en la tarjeta del paciente.
2. El formulario se abre con los datos actuales ya cargados.
3. Modifica lo necesario y haz clic en **Guardar cambios**.

## 6. Módulo de Citas

Este módulo combina un calendario mensual con la agenda del día seleccionado.

### 6.1 Navegar el calendario

- Usa las flechas **◀ ▶** para moverte entre meses, o los menús desplegables de mes/año para saltar directamente.
- Los días con citas agendadas se marcan con un punto debajo del número.
- Haz clic en cualquier día para ver su agenda en el panel derecho.

### 6.2 Ver la agenda del día

El panel derecho muestra todas las citas del día seleccionado, ordenadas por hora, con el nombre del paciente y la hora de la cita.

Al pasar el cursor sobre una cita aparecen dos íconos:

- **WhatsApp** 💬 (verde): abre WhatsApp Web con el número de teléfono del paciente ya cargado, para escribirle directamente (recordatorio de cita, confirmación, etc.).
- **Papelera** 🗑 (rojo): inicia la cancelación de la cita (ver sección 6.4).

### 6.3 Agendar una nueva cita

1. Haz clic en **"Nueva cita"** (arriba a la derecha).
2. Completa el formulario:
   - **Paciente**: selecciona de la lista de pacientes registrados.
   - **Fecha** y **Hora**.
   - **Tipo de terapia**: elige una opción de la lista, o selecciona **"Otro (Especificar...)"** para escribir un tipo de terapia personalizado.
3. Haz clic en **Guardar**.

La cita aparecerá de inmediato en el calendario, en la agenda del día correspondiente y en la tabla "Próximas citas" de la pantalla de Inicio.

### 6.4 Cancelar una cita

1. En la agenda del día, pasa el cursor sobre la cita y haz clic en el ícono de **papelera** 🗑.
2. Se abre una ventana de confirmación con el nombre del paciente.
3. Haz clic en **Eliminar** para confirmar, o **Cancelar** para no borrar la cita.

> La cita solo se elimina al confirmar — hacer clic en la papelera no borra nada por sí solo.

## 7. Sesiones y Reportes

Estas dos secciones aparecen en el menú lateral, pero todavía están en desarrollo. Al entrar verás un aviso de **"Próximamente"** indicando que la pantalla está en construcción.

## 8. Preguntas frecuentes

**¿Los datos que veo son reales?**
Por ahora no: la aplicación usa información de prueba mientras se conecta con el sistema real (backend). La forma en que se ve y organiza la información no cambiará cuando eso ocurra.

**¿Puedo usar la aplicación sin conexión a internet?**
Sí, ya que aún no depende de un servidor externo. Esto cambiará cuando se conecte a una base de datos real.

**El botón de WhatsApp no abre nada, ¿qué hago?**
Verifica que tengas WhatsApp Web configurado en tu navegador predeterminado y que el paciente tenga un número de teléfono válido registrado.
