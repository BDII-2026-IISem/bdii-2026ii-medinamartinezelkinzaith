# ActivaFit — Informe de ISS (Django + DRF)

**Estudiante:** Elkin Zaith Medina Martinez\
**Programa:** Ingeniería de Sistemas — Universidad de La Guajira\
**Proyecto:** ActivaFit — Sistema de gestión de gimnasio

------------------------------------------------------------------------

## Introducción

ActivaFit es un sistema de gestión para gimnasios. Su objetivo es centralizar en una sola API el registro de clientes, entrenadores y planes, el control de membresías y pagos, la asistencia, las rutinas de ejercicio y el seguimiento de medidas corporales de cada cliente.

Este informe cuenta, unidad por unidad (ISS), cómo se fue construyendo el backend con Django y Django REST Framework: qué se hizo en cada paso, por qué se hizo así y qué evidencia demuestra que quedó funcionando. Cada unidad cierra con un GATE, una tabla de criterios que confirma que se puede pasar a la siguiente.

## Modelo de datos de ActivaFit

Tablas: `clients`, `trainers`, `plans`, `memberships`, `payments`, `attendances`, `exercises`, `routines`, `routine_exercises`, `measurements`.

![](images/clipboard-872277677.png)

------------------------------------------------------------------------

### ISS-00 — Entorno y proyecto Django

### Narrativa

Todo proyecto empieza por el terreno donde se va a construir. Antes de escribir una sola línea de ActivaFit se preparó un entorno aislado, para que las librerías del sistema no se mezclaran con las del proyecto, y se generó el esqueleto de Django que sostendrá el resto del trabajo. En esta unidad todavía no existe ningún modelo ni ningún endpoint: solo el cimiento sobre el cual se levantará todo lo demás.

### Objetivo

Crear el entorno aislado y el proyecto Django `config` de ActivaFit, sin modelos todavía.

### Requisitos

- Python 3.12.
- El directorio del proyecto vacío.
- Red para instalar Django 5.2.17.

### Construcción

Primero se creó el entorno virtual y se activó. Dentro de él se instaló una versión fija de Django (5.2.17), de modo que cualquier persona que repita el proceso obtenga exactamente el mismo resultado. Después se generó el proyecto con `startproject config .`: el punto final hace que `manage.py` quede en la raíz y el paquete de configuración en `config/`, sin una carpeta duplicada. Por último, se guardaron las dependencias en `requirements.txt`.

``` bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install "Django==5.2.17"
django-admin startproject config .
python -m pip freeze > requirements.txt
python -m django --version
```

![](images/clipboard-2139513851.png)

Creación del `.gitignore`:

Django no crea un `.gitignore`, así que se añadió a mano. Su función es evitar que el entorno virtual, los secretos del `.env`, las bases de datos locales y los archivos temporales lleguen al repositorio.

``` bash
cat > .gitignore <<'EOF'
.venv/
__pycache__/
*.py[cod]
.env
db.sqlite3
*.log
.idea/
.vscode/
staticfiles/
media/
.pytest_cache/
htmlcov/
.coverage
EOF
```

![](images/clipboard-3627190849.png)

### Explicación

- **Django 5.2.17:** única librería de este ISS; trae el ORM, el admin, `startproject` y `manage.py`.
- **`.venv`:** aísla pip del sistema; el prompt queda `(.venv)`.
- **`django-admin startproject config .`:** deja `manage.py` en la raíz y el paquete de configuración en `config/`.
- **`.gitignore`:** archivo nuevo; deja fuera `.venv/` y `.env` del repositorio.
- `pip` siempre se usa con el entorno activo y como `python -m pip`.

### Criterios de aceptación

- AC-00-01: `python -m django --version` imprime 5.2.17.
- AC-00-02: existen `manage.py` y `config/urls.py`.
- AC-00-03: no hay modelos de negocio.

### Verificación

Para cerrar la unidad se comprobó la versión instalada y se ejecutó el chequeo del proyecto, que confirma que la estructura es válida aunque todavía no tenga lógica de negocio.

``` bash
python -m django --version
python manage.py check
```

#### ![](images/clipboard-916716743.png) 

### GATE

| AC       | Verificación                   | Evidencia | Resultado |
|----------|--------------------------------|-----------|-----------|
| AC-00-01 | versión de Django              | EVI-00-01 | PASS      |
| AC-00-02 | archivos del proyecto          | EVI-00-02 |  PASS     |
| AC-00-03 | ausencia de modelos de negocio | EVI-00-02 |  PASS     |
