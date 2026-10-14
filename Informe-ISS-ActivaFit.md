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
| AC-00-02 | archivos del proyecto          | EVI-00-02 | PASS      |
| AC-00-03 | ausencia de modelos de negocio | EVI-00-02 | PASS      |

## ISS-01 — Settings y selección del motor

### Narrativa

Con el cimiento listo, ActivaFit necesita saber dónde guardar sus datos. En lugar de escribir esa decisión dentro del código, se optó por que el motor de base de datos se elija desde el archivo `.env`: cambiar de PostgreSQL a MySQL, SQL Server u Oracle pasa a ser cuestión de modificar una variable, sin tocar una sola línea de Python. La regla es simple: un solo motor por ejecución. En esta unidad se construyó esa pieza de configuración y se dejó el proyecto leyendo su entorno de forma ordenada y segura.

### Objetivo

Elegir un solo motor de base de datos por proceso, desde `.env`, sin escribir SQL.

### Requisitos

- ISS-00 superado y la terminal con `(.venv)` activo.
- Variables separadas para PostgreSQL, MySQL, SQL Server y Oracle. \### Construcción

**1. Confirmar el entorno**

Antes de instalar nada se verificó que `python` apuntara al entorno virtual. Instalar con el Python del sistema habría dejado los paquetes fuera del proyecto y `manage.py` no los habría encontrado.

``` bash
source .venv/bin/activate
which python
```

![](images/clipboard-1777259944.png)

**2. Instalar `python-dotenv` y los drivers de cada motor**

Se instaló `python-dotenv`, que permite leer el `.env`, y un driver por cada motor soportado. Django no trae esos drivers; sin ellos, `migrate` falla al importar el backend, aunque la configuración esté bien escrita.

``` bash
python -m pip install "python-dotenv==1.2.3"
python -m pip install "psycopg[binary]==3.3.6"
python -m pip install "mysqlclient==2.3.0"
python -m pip install "mssql-django==2.0.0"
python -m pip install "oracledb==26.0.1"
python -m pip freeze > requirements.txt
```

![](images/clipboard-4145321673.png)

![](images/clipboard-555381308.png)

**Incidencia durante la instalación de `mysqlclient`**

Al ejecutar `python -m pip install "mysqlclient==2.3.0"`, la instalación falló. Este paquete no es solo Python: necesita compilar una extensión en C y, para eso, requiere las librerías de desarrollo de MySQL y algunas herramientas de compilación en el sistema, que no estaban instaladas. El error indicaba que no se encontraba `pkg-config` o `mysql_config`.

Para solucionarlo se instalaron las dependencias del sistema con el siguiente comando:

> ``` bash
> sudo apt update 
> sudo apt install build-essential pkg-config default-libmysqlclient-dev python3.12-dev  
> ```
>
> ![](images/clipboard-834558492.png)

> Luego se repitió la instalación del paquete, esta vez con éxito:
>
> ``` bash
> python -m pip install "mysqlclient==2.3.0"   
> ```
>
> ![](images/clipboard-3964781957.png)

**3. Convertir `settings.py` en paquete**

`startproject` genera `settings.py` como archivo, pero se necesita un paquete con ese mismo nombre. Como un archivo y un paquete no pueden llamarse igual, se eliminó el archivo y se creó la carpeta.

``` bash
rm config/settings.py
mkdir -p config/settings
```

**4. Crear `.env.example` y copiarlo a `.env`**

Se creó `.env.example` como plantilla pública: solo contiene los nombres de las variables, sin secretos. Luego se copió a `.env`, que es donde van los valores reales y que nunca se versiona.

``` bash
cat > .env.example <<'EOF'
# Copie este archivo a .env y complete los valores.
# .env no se versiona.
 
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,testserver
 
# Motor activo. Uno solo por ejecución: postgresql | mysql | mssql | oracle
DB_ENGINE=postgresql
 
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
 
MYSQL_DB=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
 
MSSQL_DB=
MSSQL_USER=
MSSQL_PASSWORD=
MSSQL_HOST=127.0.0.1
MSSQL_PORT=1433
 
ORACLE_DB=
ORACLE_USER=
ORACLE_PASSWORD=
ORACLE_HOST=127.0.0.1
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=
 
# Laboratorio académico. En producción liste orígenes explícitos.
CORS_ALLOW_ALL_ORIGINS=True
EOF
cp .env.example .env
```

![](images/clipboard-333279842.png)

### Modificacion del .env

![](images/clipboard-1223643827.png)

**5. Crear `config/database.py`**

Se escribió el traductor entre el entorno y Django. Lee `DB_ENGINE` y devuelve un único `DATABASES["default"]`. Si el motor no es válido o falta una variable obligatoria, falla antes de intentar conectarse y con un mensaje claro.

``` bash
cat > config/database.py <<'EOF'
"""Selección del motor de base de datos a partir del entorno.
 
Un solo alias, default, queda activo en cada ejecución.
"""
 
from django.core.exceptions import ImproperlyConfigured
 
ALLOWED_ENGINES = ("postgresql", "mysql", "mssql", "oracle")
 
 
def database_from_environ(env):
    engine = str(env.get("DB_ENGINE", "postgresql")).strip().lower()
    if engine not in ALLOWED_ENGINES:
        allowed = ", ".join(ALLOWED_ENGINES)
        raise ImproperlyConfigured(
            f"DB_ENGINE='{engine}' no es válido. Valores permitidos: {allowed}."
        )
    builders = {
        "postgresql": _postgresql,
        "mysql": _mysql,
        "mssql": _mssql,
        "oracle": _oracle,
    }
    return {"default": builders[engine](env)}
 
 
def _required(env, key):
    value = env.get(key)
    if value is None or str(value).strip() == "":
        raise ImproperlyConfigured(
            f"Falta la variable de entorno {key} para DB_ENGINE={env.get('DB_ENGINE')}."
        )
    return str(value).strip()
 
 
def _postgresql(env):
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _required(env, "POSTGRES_DB"),
        "USER": _required(env, "POSTGRES_USER"),
        "PASSWORD": _required(env, "POSTGRES_PASSWORD"),
        "HOST": _required(env, "POSTGRES_HOST"),
        "PORT": _required(env, "POSTGRES_PORT"),
    }
 
 
def _mysql(env):
    return {
        "ENGINE": "django.db.backends.mysql",
        "NAME": _required(env, "MYSQL_DB"),
        "USER": _required(env, "MYSQL_USER"),
        "PASSWORD": _required(env, "MYSQL_PASSWORD"),
        "HOST": _required(env, "MYSQL_HOST"),
        "PORT": _required(env, "MYSQL_PORT"),
        "OPTIONS": {"charset": "utf8mb4"},
    }
 
 
def _mssql(env):
    return {
        "ENGINE": "mssql",
        "NAME": _required(env, "MSSQL_DB"),
        "USER": _required(env, "MSSQL_USER"),
        "PASSWORD": _required(env, "MSSQL_PASSWORD"),
        "HOST": _required(env, "MSSQL_HOST"),
        "PORT": _required(env, "MSSQL_PORT"),
        "OPTIONS": {
            "driver": "ODBC Driver 18 for SQL Server",
            "extra_params": "TrustServerCertificate=yes",
        },
    }
 
 
def _oracle(env):
    host = _required(env, "ORACLE_HOST")
    port = _required(env, "ORACLE_PORT")
    service = _required(env, "ORACLE_SERVICE_NAME")
    dsn = (
        f"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={host})(PORT={port}))"
        f"(CONNECT_DATA=(SERVICE_NAME={service})))"
    )
    return {
        "ENGINE": "django.db.backends.oracle",
        "NAME": dsn,
        "USER": _required(env, "ORACLE_USER"),
        "PASSWORD": _required(env, "ORACLE_PASSWORD"),
        "HOST": host,
        "PORT": "",
    }
EOF
```

![](images/clipboard-1661373047.png)

![](images/clipboard-317837314.png)

**6. Crear `config/settings/__init__.py`**

Se armó el paquete de configuración: carga el `.env`, exige la `SECRET_KEY` y delega la base de datos a `database.py`. Por ahora no incluye las apps de ActivaFit, DRF ni JWT; cada uno se añadirá en la unidad que lo necesite.

``` bash
cat > config/settings/__init__.py <<'EOF'
"""Configuración de ActivaFit.
 
El paquete sustituye al settings.py generado por startproject.
DJANGO_SETTINGS_MODULE sigue siendo config.settings.
"""
 
import os
from pathlib import Path
 
# python-dotenv, instalado en este ISS. Lee .env antes de SECRET_KEY y DATABASES.
from dotenv import load_dotenv
 
from config.database import database_from_environ
 
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
 
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "").strip()
if not SECRET_KEY:
    from django.core.exceptions import ImproperlyConfigured
 
    raise ImproperlyConfigured("Defina DJANGO_SECRET_KEY en el archivo .env.")
 
DEBUG = os.environ.get("DJANGO_DEBUG", "False").strip().lower() in {"1", "true", "yes", "on"}
 
ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]
 
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
 
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
 
ROOT_URLCONF = "config.urls"
 
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
 
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
 
DATABASES = database_from_environ(os.environ)
 
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
 
LANGUAGE_CODE = "es"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True
 
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
EOF
```

![](images/clipboard-3746391541.png)

![](images/clipboard-3375703747.png)

**7. Crear `config/project_python.py`**

Para que `python3 manage.py` funcione aunque no se haya activado el entorno, se añadió un pequeño ayudante que vuelve a lanzar el comando con el Python de `.venv`.

``` bash
cat > config/project_python.py <<'EOF'
"""Intérprete del proyecto.
 
Los paquetes se instalan dentro de .venv. El comando python3 manage.py
usa el Python del sistema y no ve esos paquetes.
use_project_python() vuelve a lanzar el mismo comando con .venv/bin/python.
"""
 
import os
import sys
from pathlib import Path
 
PROJECT_ROOT = Path(__file__).resolve().parent.parent
 
 
def use_project_python():
    """Reejecuta el proceso con el Python de .venv si aún no es ese intérprete."""
    venv_root = PROJECT_ROOT / ".venv"
    venv_python = venv_root / "bin" / "python"
    if not venv_python.is_file():
        return
    try:
        if Path(sys.prefix).resolve() == venv_root.resolve():
            return
    except OSError:
        return
    os.execv(venv_python, [str(venv_python), *sys.argv])
EOF
```

![](images/clipboard-189251204.png)

![](images/clipboard-3879789627.png)

**8. Parchear `manage.py`, `config/wsgi.py` y `config/asgi.py`**

Para terminar, se editaron los tres puntos de entrada del proyecto para que carguen el `.env` antes de que Django lea la configuración. Sin ese paso, `SECRET_KEY` y las credenciales aparecerían vacías.

Estos archivos ya existen; no se regeneran, se editan.

**Evidencia EVI-01-05.** Esta es la evidencia del reemplazo realizado anteriormente en los puntos de entrada del proyecto (`manage.py`, `config/wsgi.py` y `config/asgi.py`), donde se agregó la carga del archivo `.env` con `load_dotenv()`.

``` text
ARCHIVO: manage.py
 
UBICAR:
import os
import sys
 
REEMPLAZAR POR:


import sys
from pathlib import Path
 
_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
 
from config.project_python import use_project_python
 
use_project_python()
 
import os
 
# python-dotenv se instaló en este ISS, dentro de .venv.
from dotenv import load_dotenv
 
DEBAJO DE:
    """Run administrative tasks."""
 
AGREGAR:
    load_dotenv()
```

**Evidencia EVI-01-05a.** Reemplazo realizado anteriormente en `manage.py`: se agregó la ruta del proyecto, `use_project_python()` y `load_dotenv()`.

#### Antes del Reemplazo:

![](images/clipboard-3879789627.png)

#### Despues del Reemplazo:

![](images/clipboard-924338121.png)

**Evidencia EVI-01-05b.** Reemplazo realizado anteriormente en `config/wsgi.py`: se agregó `load_dotenv()` antes de definir `DJANGO_SETTINGS_MODULE`.

``` text
ARCHIVO: config/wsgi.py
 
UBICAR:
import os
 
from django.core.wsgi import get_wsgi_application
 
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
 
REEMPLAZAR POR:
import os
 
# python-dotenv (este ISS) carga .env en el intérprete que arrancó el proceso.
from dotenv import load_dotenv
 
from django.core.wsgi import get_wsgi_application
 
load_dotenv()
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
```

El mismo parche en `config/asgi.py`, cambiando `wsgi` por `asgi` y `get_wsgi_application` por `get_asgi_application`.

![](images/clipboard-1396406162.png)

![](images/clipboard-3915804096.png)

### Explicación

Con esto, ActivaFit quedó configurado para cambiar de motor con una sola variable. Cómo funciona cada pieza:

- **Intérprete:** `use_project_python()` permite `python3 manage.py runserver` sin activar el entorno. `pip` sigue exigiendo `source .venv/bin/activate`.
- **Lectura del entorno:** `load_dotenv()` no pisa variables ya existentes. Por eso `DB_ENGINE=mysql python manage.py test` cambia el motor sin editar `.env`.
- **Un alias:** solo existe `DATABASES["default"]`; el ORM no necesita saber qué motor responde.
- **Oracle:** el DSN se arma con `SERVICE_NAME` y `PORT` queda vacío; el driver es `oracledb`.
- **SQL Server:** `ENGINE` es `mssql`, el valor que registra `mssql-django`. Requiere ODBC Driver 18 instalado en la máquina.
- **Zona e idioma:** `LANGUAGE_CODE = "es"`, `TIME_ZONE = "America/Bogota"`, `USE_TZ = True`.

``` text
.env → DB_ENGINE → database_from_environ → DATABASES["default"] → ORM
```

### Criterios de aceptación

- AC-01-01: `postgresql`, `mysql`, `mssql` y `oracle` producen el `ENGINE` documentado.
- AC-01-02: un motor desconocido falla con `ImproperlyConfigured`.
- AC-01-03: si falta una variable obligatoria, la configuración falla antes de conectar.
- AC-01-04: el DSN de Oracle contiene `SERVICE_NAME`. \### Verificación

### GATE

| AC       | Verificación            | Evidencia | Resultado |
|----------|-------------------------|-----------|-----------|
| AC-01-01 | test por motor          | EVI-01-06 | PASS      |
| AC-01-02 | test de motor inválido  | EVI-01-06 | PASS      |
| AC-01-03 | test de variable vacía  | EVI-01-06 | PASS      |
| AC-01-04 | aserción `SERVICE_NAME` | EVI-01-06 | PASS      |

------------------------------------------------------------------------

## ISS-02 — Apps de ActivaFit

### Narrativa

Con el motor de base de datos configurado, ActivaFit necesita un lugar donde vivirá su lógica. En Django ese lugar son las apps: cada una agrupa un dominio del negocio. En esta unidad se crearon las apps del gimnasio dentro de un paquete `apps/`, para que la raíz del proyecto no se llene de carpetas sueltas. Todavía no se escribe ningún modelo: solo se levanta la estructura y se registra en la configuración.

### Objetivo

Crear las apps de negocio de ActivaFit con la CLI de Django y registrarlas dentro del paquete `apps`.

### Requisitos

- ISS-01 superado.

- Terminal con el entorno virtual (.venv) activo.

- Todavía no se escriben modelos. El Custom User del ISS-03 debe existir antes de ejecutar la primera migración.

### Construcción

Antes de ejecutar cualquier comando de este ISS se activó el entorno virtual y se confirmó que python apuntara a .venv. Así los comandos de Django usan las librerías instaladas en el proyecto y no las del sistema.

``` bash
    source .venv/bin/activate
    which python
```

![](images/clipboard-117842089.png)

**1. Crear los directorios y las apps con `startapp`**

`startapp` exige que el directorio destino ya exista. Por eso primero se crean las carpetas y luego se genera cada app. No se copian `models.py`, `admin.py` ni `views.py` a mano: la CLI los deja listos. El archivo `urls.py` no lo crea; aparecerá cuando haya endpoints.

``` bash
mkdir -p apps/client apps/trainer apps/plan apps/membership apps/routine apps/measurement  
python manage.py startapp client apps/client 
python manage.py startapp trainer apps/trainer 
python manage.py startapp plan apps/plan 
python manage.py startapp membership apps/membership  
python manage.py startapp routine apps/routine 
python manage.py startapp measurement apps/measurement 
```

![](images/clipboard-1418026366.png)![](images/clipboard-2951435710.png)

**2. Convertir `apps` en paquete**

Se creó `apps/__init__.py`, vacío, para que Python trate la carpeta `apps` como un paquete.

``` bash
mkdir -p apps cat > apps/__init__.py <<'EOF' EOF 
```

![](images/clipboard-3437556076.png)

![](images/clipboard-3248186314.png)

**3. Parchear el `apps.py` de cada app**

Cada `apps.py` ya existe, generado por `startapp`. Como las apps viven dentro de `apps/`, hay que indicarle a Django la ruta completa del paquete. Se mantiene el `label` corto para que las migraciones no arrastren el prefijo `apps.`.

``` bas
ARCHIVO: apps/client/apps.py  UBICAR:     name = "client"  REEMPLAZAR POR:     name = "apps.client"     label = "client" 
```

El mismo parche se repite en las demás apps:

| Archivo                    | `name`             | `label`       |
|----------------------------|--------------------|---------------|
| `apps/trainer/apps.py`     | `apps.trainer`     | `trainer`     |
| `apps/plan/apps.py`        | `apps.plan`        | `plan`        |
| `apps/membership/apps.py`  | `apps.membership`  | `membership`  |
| `apps/routine/apps.py`     | `apps.routine`     | `routine`     |
| `apps/measurement/apps.py` | `apps.measurement` | `measurement` |

: La clase de cada archivo conserva su nombre (`ClientConfig`, `TrainerConfig`, `PlanConfig`, `MembershipConfig`, `RoutineConfig`, `MeasurementConfig`).

**4. Registrar las apps en `config/settings/__init__.py`**

El archivo ya existe. Se agregan las apps al final de `INSTALLED_APPS`, todavía sin la app `security`, que llega en el ISS-03.

text

``` python
ARCHIVO: config/settings/__init__.py

DEBAJO DE:
    "django.contrib.staticfiles",

AGREGAR:
    "apps.client.apps.ClientConfig",
    "apps.trainer.apps.TrainerConfig",
    "apps.plan.apps.PlanConfig",
    "apps.membership.apps.MembershipConfig",
    "apps.routine.apps.RoutineConfig",
    "apps.measurement.apps.MeasurementConfig",
```

![](images/clipboard-2857987097.png)

#### Explicación

Django supone que una app está en la raíz del proyecto. Como en ActivaFit viven dentro de `apps/`, el `AppConfig.name` debe ser la ruta completa, por ejemplo `apps.client`. El `label` se deja en `client` para que las migraciones no arrastren el nombre del paquete. Cada app conserva un solo nombre, igual al dominio que representa.

``` text
apps/
├── client/        clientes del gimnasio
├── trainer/       entrenadores
├── plan/          planes de membresía
├── membership/    membresías, pagos y asistencias
├── routine/       ejercicios, rutinas y rutina-ejercicio
└── measurement/   medidas corporales
```

#### Criterios de aceptación

- AC-02-01: las apps fueron creadas con `startapp`.

- AC-02-02: `python manage.py check` no reporta apps mal registradas.

- AC-02-03: en este ISS todavía no hay modelos de negocio.

### Verificación

```         
python manage.py check 
```

Para el GATE, además, puedes mostrar el árbol de las apps:

```         
tree apps -I "__pycache__" 
```

![](images/clipboard-2535765618.png)

### GATE

| AC | Verificación | Evidencia | Resultado |
|------------------|------------------|------------------|------------------|
| AC-02-01 | directorios de las apps | árbol de `apps/` (EVI-02-01) | PASS |
| AC-02-02 | `manage.py check` | EVI-02-04 | PASS |
| AC-02-03 | este ISS no escribe modelos | revisión de los `models.py` vacíos | PASS |

## ISS-03 — Custom User antes de la primera migración

Hasta aquí ActivaFit tiene su configuración y sus apps, pero todavía no ha tocado la base de datos. Antes de la primera migración hay que tomar una decisión que no se puede deshacer fácilmente: definir el modelo de usuario propio del sistema. Django trae uno por defecto, pero cambiarlo después de migrar obliga a borrar tablas. Por eso, en esta unidad se creó el usuario personalizado de ActivaFit sobre `django.contrib.auth`, se declaró en la configuración y solo entonces se hizo la primera migración. Así, las credenciales del sistema quedan en una tabla propia (`users`), separada de los clientes del gimnasio.

**Objetivo**

Definir el usuario de ActivaFit sobre `django.contrib.auth` y fijar `AUTH_USER_MODEL` antes de migrar.

**Requisitos**

- ISS-02 superado.

- Terminal con el entorno virtual `.venv` activo.

- Decisión explícita entre `AbstractUser` y `AbstractBaseUser`: se eligió `AbstractUser`.

### Construcción

**Paso 0. Activar el entorno virtual**

Antes de ejecutar los comandos se activó el entorno y se confirmó que `python` apuntara a `.venv`.

``` bash
source .venv/bin/activate which python 
```

![](images/clipboard-117842089.png)

**Paso 1. Crear el paquete `apps/common` con `RecordStatus`**

El estado "activo / inactivo" lo usarán el usuario y, desde el ISS-04, las tablas del negocio. Por eso se guardó en un paquete compartido. `apps/common` no es una app: no se registra en `INSTALLED_APPS` ni se crea con `startapp`.

Archivo `apps/common/status.py`:

``` bash
mkdir -p apps/common
cat > apps/common/__init__.py <<'EOF'
EOF
cat > apps/common/status.py <<'EOF'

from django.db import models


class RecordStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
EOF
```

![](images/clipboard-2245701635.png)

![](images/clipboard-1235443289.png)

**Paso 2. Crear la app `security` con la CLI**

Como el directorio destino debe existir, primero se crea.

```         
mkdir -p apps/security
python manage.py startapp security apps/security 
```

![](images/clipboard-1373332445.png)

Luego se parchea `apps/security/apps.py`, igual que en las demás apps. Se busca la línea `name = "security"` y se reemplaza por estas dos:

```         
    name = "apps.security"     label = "security" 
```

![](images/clipboard-3892071475.png)

**Paso 3. Escribir el modelo de usuario**

El archivo `apps/security/models.py` ya existe y solo tiene un comentario. Se reemplaza todo su contenido por esto. En este ISS contiene únicamente el usuario; los demás modelos de seguridad se agregan después, en la fase de autenticación.

``` python
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from apps.common.status import RecordStatus


class ActivaFitUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("status", RecordStatus.INACTIVE)
        return super().create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("status", RecordStatus.ACTIVE)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField("correo electrónico", max_length=150, unique=True)
    status = models.CharField(
        max_length=8,
        choices=RecordStatus.choices,
        default=RecordStatus.INACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ActivaFitUserManager()

    class Meta:
        db_table = "users"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="users_status_valid",
            )
        ]

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        self.is_active = self.status == RecordStatus.ACTIVE
        super().save(*args, **kwargs)
```

`create_user` deja `status` en `inactive` si nadie lo indica. `create_superuser` lo fuerza a `active`, para que `save()` no desactive al superusuario.

![](images/clipboard-2499441210.png)

**Paso 4. Registrar la app y fijar `AUTH_USER_MODEL`**

En `config/settings/__init__.py`, la app de seguridad va delante de las de negocio. Se agrega esta línea justo encima de `"apps.client.apps.ClientConfig",`:

```         
    "apps.security.apps.SecurityConfig", 
```

Y debajo de la línea `DATABASES = database_from_environ(os.environ)` se agrega:

```         
AUTH_USER_MODEL = "security.User" 
```

![](images/clipboard-1291723589.png)

![](images/clipboard-53755586.png)

**Paso 5. Escribir el test de selección del motor**

El test prometido en el ISS-01 reemplaza el `tests.py` vacío que dejó `startapp`. Todavía no hay login, así que solo valida la selección del motor. Archivo `apps/security/tests.py`:

``` python
from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from config.database import database_from_environ


class DatabaseSelectionTests(SimpleTestCase):
    def _env(self, engine):
        return {
            "DB_ENGINE": engine,
            "POSTGRES_DB": "activafit",
            "POSTGRES_USER": "activafit",
            "POSTGRES_PASSWORD": "activafit",
            "POSTGRES_HOST": "127.0.0.1",
            "POSTGRES_PORT": "5432",
            "MYSQL_DB": "activafit",
            "MYSQL_USER": "activafit",
            "MYSQL_PASSWORD": "activafit",
            "MYSQL_HOST": "127.0.0.1",
            "MYSQL_PORT": "3306",
            "MSSQL_DB": "activafit",
            "MSSQL_USER": "activafit",
            "MSSQL_PASSWORD": "activafit",
            "MSSQL_HOST": "127.0.0.1",
            "MSSQL_PORT": "1433",
            "ORACLE_DB": "activafit",
            "ORACLE_USER": "activafit",
            "ORACLE_PASSWORD": "activafit",
            "ORACLE_HOST": "127.0.0.1",
            "ORACLE_PORT": "1521",
            "ORACLE_SERVICE_NAME": "FREEPDB1",
        }

    def test_postgresql_engine(self):
        config = database_from_environ(self._env("postgresql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.postgresql")

    def test_mysql_engine(self):
        config = database_from_environ(self._env("mysql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.mysql")
        self.assertEqual(config["default"]["OPTIONS"]["charset"], "utf8mb4")

    def test_mssql_engine(self):
        config = database_from_environ(self._env("mssql"))
        self.assertEqual(config["default"]["ENGINE"], "mssql")

    def test_oracle_uses_service_name(self):
        config = database_from_environ(self._env("oracle"))
        self.assertIn("SERVICE_NAME=FREEPDB1", config["default"]["NAME"])
        self.assertEqual(config["default"]["PORT"], "")

    def test_invalid_engine(self):
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ({"DB_ENGINE": "sqlite"})

    def test_missing_variable(self):
        env = self._env("postgresql")
        env["POSTGRES_DB"] = ""
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ(env)
```

![](images/clipboard-761348764.png)

**Paso 6. Generar la migración, migrar y probar**

Ahora sí se migra. La CLI escribe la migración; no se copia a mano.

```         
python manage.py makemigrations security
python manage.py migrate
python manage.py test apps.security.tests.DatabaseSelectionTests 
```

![](images/clipboard-3001923046.png)

![](images/clipboard-975977985.png)

Al ejecutar `createsuperuser`, Django te pide:

- **Username**

- **Email:** es obligatorio y único en ActivaFit, porque lo definimos así en el modelo.

- **Password:** se escribe dos veces y no se ve en pantalla.

![](images/clipboard-2636793564.png)

### Explicación

Se prefirió `AbstractUser` sobre `AbstractBaseUser` porque ya resuelve el hash de contraseñas, los validadores, `set_password()`, `check_password()` y el admin. Reconstruir eso a mano sería rehacer el sistema de contraseñas.

El campo `status` manda sobre `is_active`. La columna `is_active` se conserva porque DRF y SimpleJWT deciden con ella si el usuario puede autenticarse. Los clientes del gimnasio (tabla `clients`) no tienen contraseña: no son usuarios del sistema

## Criterios de aceptación

- AC-03-01: `AUTH_USER_MODEL` apunta a `security.User`.

- AC-03-02: `Client` no tiene password.

- AC-03-03: un usuario `inactive` no inicia sesión.

- AC-03-04: una clave incorrecta responde 401 y la correcta no devuelve el hash.

## Verificación

`AuthFlowTests`.

## Evidencias

- EVI-03-01: migración `security.0001_initial` aplicada en MySQL.

- EVI-03-02: login por username y por email PASS.

## GATE

| **AC**   | **Verificación** | **Evidencia**                 | **Resultado** |
|:---------|:-----------------|:------------------------------|:--------------|
| AC-03-01 | settings         | `config/settings/__init__.py` | PASS          |
| AC-03-02 | modelo Client    | sin campo password            | PASS          |
| AC-03-03 | usuario inactivo | test 401                      | PASS          |
| AC-03-04 | `check_password` | test de login                 | PASS          |

### ISS-04 — Modelo Client

**Narrativa**

Con el usuario del sistema ya definido y migrado, llega el primer modelo de negocio de ActivaFit: el cliente del gimnasio. Antes de escribirlo se creó una base común que comparten todas las tablas del negocio, con las fechas de creación y actualización y el estado activo/inactivo, para no repetir esos campos en cada modelo. Luego se definió `Client` con los datos de la tabla `clients` del diagrama (tipo y número de documento, nombre, teléfono, correo y estado), y se generó su migración.

**Objetivo**

Persistir los clientes del gimnasio con el diccionario de la tabla `clients`.

**Requisitos**

- ISS-03 superado.

- Terminal con el entorno virtual `.venv` activo.

- Un solo `TextChoices` para `active` / `inactive` (`RecordStatus`, creado en el ISS-03).

#### Construcción

**Paso 0. Activar el entorno virtual**

``` bash
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Crear el modelo abstracto base**

`RecordStatus` ya está en `apps/common/status.py` desde el ISS-03. El modelo abstracto es un archivo nuevo. No es una app: no entra en `INSTALLED_APPS` y no genera migración propia. `TimeStampedModel` aporta `created_at` y `updated_at`. `ActivaFitModel` añade `status` con valor por defecto `inactive` y un `CheckConstraint` reutilizable. Las apps de negocio heredan esta clase, por eso la tabla `clients` tendrá esas columnas.

Archivo `apps/common/models.py`:

``` python
  from django.db import models
  
  from apps.common.status import RecordStatus
  
  
  class TimeStampedModel(models.Model):
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)
  
      class Meta:
          abstract = True
  
  
  class ActivaFitModel(TimeStampedModel):
      status = models.CharField(
          max_length=8,
          choices=RecordStatus.choices,
          default=RecordStatus.INACTIVE,
      )
  
      class Meta:
          abstract = True
  
      @classmethod
      def status_constraint(cls, name):
          return models.CheckConstraint(
              condition=models.Q(status__in=RecordStatus.values),
              name=name,
          )
```

![](images/clipboard-1769645683.png)

**Paso 2. Escribir el modelo `Client`**

El archivo `apps/client/models.py` lo creó `startapp` vacío. Se reescribe entero: el comentario inicial no se conserva. `Client` hereda las fechas y el estado. `name` exige al menos 2 caracteres. `phone` y `email` pueden ir vacíos. El correo es único y `save()` lo guarda en minúsculas. La combinación de tipo y número de documento es única, para que no haya dos clientes con el mismo documento. `db_table = "clients"` fija el nombre físico de la tabla.

``` python
from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Client(ActivaFitModel):
    document_number = models.CharField(max_length=30, validators=[MinLengthValidator(5)], unique=True,null=False)
    name = models.CharField(max_length=150, validators=[MinLengthValidator(2)], null=False)
    phone = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(max_length=150, null=False, unique=True)
    document_type = models.CharField(
        max_length=10,
        choices=[
            ("CC", "Cédula de ciudadanía"),
            ("CE", "Cédula de extranjería"),
            ("TI", "Tarjeta de identidad"),
            ("PASSPORT", "Pasaporte"),
        ],
        null=False,
    )
    class Meta:
        db_table = "clients"
        verbose_name = "cliente"
        verbose_name_plural = "clientes"
        ordering = ["name", "id"]
        constraints = [
            ActivaFitModel.status_constraint("clients_status_valid"),
            models.UniqueConstraint(
                fields=["document_type", "document_number"],
                name="clients_document_unique",
            ),
        ]

   
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)
```

Los nombres de los constraints (`clients_status_valid` y `clients_document_unique`) caben en 30 caracteres.

![](images/clipboard-1730558574.png)

![](images/clipboard-3862816016.png)

La migración la escribe la CLI:

``` bash
python manage.py makemigrations client 
python manage.py migrate 
```

![](images/clipboard-2002118202.png)

### Resultado

![](images/clipboard-4105727467.png)

## Criterios de aceptación

- AC-04-01: la tabla física es `clients`.

- AC-04-02: sin `status` en el alta, el valor es `inactive`.

- AC-04-03: `created_at` y `updated_at` se generan.

- AC-04-04: el email duplicado se rechaza.

- AC-04-05: un nombre de un carácter se rechaza.

![](images/clipboard-2855049704.png)

## GATE

| **AC**   | **Verificación**      | **Evidencia** | **Resultado** |
|:---------|:----------------------|:--------------|:--------------|
| AC-04-01 | `db_table`            | migración     | PASS          |
| AC-04-02 | POST sin status       | test de alta  | PASS          |
| AC-04-03 | timestamps            | test de alta  | PASS          |
| AC-04-04 | email duplicado = 400 | test          | PASS          |
| AC-04-05 | nombre corto = 400    | test          | PASS          |

### ISS-05 — Plan, Trainer, Exercise, Routine, RoutineExercise y Measurement

**Narrativa**

Con el modelo `Client` ya migrado, ActivaFit incorpora el resto de su catálogo y el seguimiento de cada cliente. Primero se modelaron las tablas que no dependen de otras: planes, entrenadores y ejercicios. Después, las que se apoyan en ellas: las rutinas (que pertenecen a un entrenador y a un cliente), las líneas de cada rutina (que enlazan una rutina con un ejercicio) y las medidas corporales. La regla de integridad de la unidad es que no se puede borrar un registro mientras otros dependan de él: un entrenador con rutinas, o una rutina con ejercicios asignados, no se elimina.

**Objetivo**

Modelar el catálogo del gimnasio y la integridad 1→N entre entrenadores, clientes, rutinas, ejercicios y medidas.

**Requisitos**

- ISS-04 superado.

- Terminal con el entorno virtual `.venv` activo.

- Eliminar un registro referenciado debe restringirse.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Modelo `Plan`**

El archivo `apps/plan/models.py` lo creó `startapp` vacío. Se reescribe entero.

``` python
from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Plan(ActivaFitModel):
    name = models.CharField(max_length=100, unique=True, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "plans"
        verbose_name = "plan"
        verbose_name_plural = "planes"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("plans_status_valid")]

    def __str__(self):
        return self.name
```

![](images/clipboard-4258787049.png)

**Paso 2. Modelo `Trainer`**

Archivo `apps/trainer/models.py`:

``` python
from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Trainer(ActivaFitModel):
    name = models.CharField(max_length=150, validators=[MinLengthValidator(2)])
    phone = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(max_length=150, null=True, blank=True, unique=True)
    specialty = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "trainers"
        verbose_name = "entrenador"
        verbose_name_plural = "entrenadores"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("trainers_status_valid")]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)
```

![](images/clipboard-2257538105.png)

**Paso 3. Modelos `Exercise`, `Routine` y `RoutineExercise`**

Los tres viven en la app `routine`. Archivo `apps/routine/models.py`. Las claves foráneas usan referencias en texto (`"client.Client"`) para no importar los modelos de otras apps. `RESTRICT` impide borrar el padre mientras existan hijos. Las columnas `name`, `description` y `muscle_group` de `routine_exercises` están en tu diagrama y se respetan tal cual.

``` python
from decimal import Decimal

from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Exercise(ActivaFitModel):
    name = models.CharField(max_length=120, unique=True, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)
    muscle_group = models.CharField(max_length=50)

    class Meta:
        db_table = "exercises"
        verbose_name = "ejercicio"
        verbose_name_plural = "ejercicios"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("exercises_status_valid")]

    def __str__(self):
        return self.name


class Routine(ActivaFitModel):
    trainer = models.ForeignKey(
        "trainer.Trainer",
        on_delete=models.RESTRICT,
        related_name="routines",
        db_column="trainer_id",
    )
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="routines",
        db_column="client_id",
    )
    name = models.CharField(max_length=120, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "routines"
        verbose_name = "rutina"
        verbose_name_plural = "rutinas"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("routines_status_valid")]

    def __str__(self):
        return self.name


class RoutineExercise(ActivaFitModel):
    routine = models.ForeignKey(
        Routine,
        on_delete=models.RESTRICT,
        related_name="routine_exercises",
        db_column="routine_id",
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.RESTRICT,
        related_name="routine_exercises",
        db_column="exercise_id",
    )
    sets = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    repetitions = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal("0"),
        validators=[MinValueValidator(Decimal("0"))],
    )
    rest_seconds = models.PositiveIntegerField(default=0)
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255, null=True, blank=True)
    muscle_group = models.CharField(max_length=50)

    class Meta:
        db_table = "routine_exercises"
        verbose_name = "ejercicio de rutina"
        verbose_name_plural = "ejercicios de rutina"
        ordering = ["routine", "id"]
        constraints = [
            ActivaFitModel.status_constraint("routine_ex_status_valid"),
            models.CheckConstraint(
                condition=models.Q(weight__gte=0),
                name="routine_ex_weight_non_neg",
            ),
        ]

    def __str__(self):
        return f"{self.routine_id} - {self.name}"
```

![](images/clipboard-1730141250.png)

**Paso 4. Modelo `Measurement`**

Como esta tabla no tiene `status`, así que hereda solo las fechas (`TimeStampedModel`). Archivo `apps/measurement/models.py`:

``` python
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Measurement(TimeStampedModel):
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="measurements",
        db_column="client_id",
    )
    trainer = models.ForeignKey(
        "trainer.Trainer",
        on_delete=models.RESTRICT,
        related_name="measurements",
        db_column="trainer_id",
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    body_fat = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "measurements"
        verbose_name = "medida"
        verbose_name_plural = "medidas"
        ordering = ["-created_at", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(weight__gt=0),
                name="measurements_weight_pos",
            ),
            models.CheckConstraint(
                condition=models.Q(height__gt=0),
                name="measurements_height_pos",
            ),
        ]

    def __str__(self):
        return f"Medida {self.id} - cliente {self.client_id}"
```

![](images/clipboard-89375844.png)

**Paso 5. Generar las migraciones y migrar**

Se generan juntas porque `routine` y `measurement` dependen de `client` y `trainer`. La CLI escribe las migraciones.

```         
python manage.py makemigrations plan trainer routine measurement
python manage.py migrate
```

![![](images/clipboard-600224042.png)](images/clipboard-600224042.png)

#### Explicación

`RESTRICT` impide borrar el padre mientras existan hijos; el intento de borrar al entrenador con una rutina lanza `RestrictedError`. Cada tabla guarda sus propios campos y las claves foráneas llevan el nombre físico del diagrama (`trainer_id`, `client_id`, `routine_id`, `exercise_id`). Los nombres de los constraints caben en 30 caracteres.

```         
Trainer 1 ───── N Routine N ───── 1 Client Routine 1 ───── N RoutineExercise N ───── 1 Exercise Client  1 ───── N Measurement N ───── 1 Trainer
```

#### Criterios de aceptación

- **AC-05-01:** `trainer_id` y `client_id` son obligatorios en `Routine` (y las demás claves foráneas).

- **AC-05-02:** borrar un registro con dependientes falla.

- **AC-05-03:** el nombre de plan, de ejercicio y el correo de entrenador son únicos.

- **AC-05-04:** `status` por defecto es `inactive`.

#### Verificación

La guía usa `ProductApiTests`, que dependen de la API (ISS-08 y siguientes). En este ISS se verifica con las pruebas del Paso 6.

#### GATE

- **AC-05-01:** campos `null=False` (EVI-05-03). **PASS**.

- **AC-05-02:** `RestrictedError` al borrar el entrenador (EVI-05-03). **PASS**.

- **AC-05-03:** `IntegrityError` por plan duplicado (EVI-05-03). **PASS**.

- **AC-05-04:** `status` por defecto `inactive` (EVI-05-03). **PASS**.

### ISS-06 — Membership, Payment y Attendance

**Narrativa**

Hasta aquí ActivaFit tiene sus catálogos y a sus clientes. Ahora entra el flujo del negocio: un cliente adquiere un plan y eso genera una membresía con fecha de inicio y de fin. Cada membresía recibe pagos y registra las asistencias del cliente al gimnasio. Clientes y planes no se relacionan con un muchos-a-muchos simple: la membresía es una entidad con sus propios datos (fechas, estado) y funciona como tabla intermedia explícita. También se dejó lista la anulación: anular una membresía la desactiva junto con sus pagos, pero conserva el historial de asistencias.

**Objetivo**

Representar la membresía, sus pagos y sus asistencias, con integridad entre clientes, planes y membresías.

**Requisitos**

- ISS-05 superado.

- Terminal con el entorno virtual `.venv` activo.

- `memberships` enlaza un cliente con un plan, con fechas de inicio y fin.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Crear el manager de membresías**

El archivo `apps/membership/managers.py` es nuevo. En este ISS el manager todavía no registra la membresía: solo existe para que el modelo cuelgue `objects` de una clase propia. El método `register` se agrega más adelante, cuando la operación sea transaccional.

``` python
from django.db import models


class MembershipQuerySet(models.QuerySet):
    pass


class MembershipManager(models.Manager.from_queryset(MembershipQuerySet)):
    pass
```

![](images/clipboard-3937050952.png)

**Paso 2. Escribir los modelos**

El archivo `apps/membership/models.py` ya existe, vacío. Se reescribe entero. No se usa `ManyToManyField`. Según tu diagrama, `payments` no tiene fechas de creación (por eso `Payment` define su propio `status`) y `attendances` no tiene `status` (por eso solo hereda las fechas).

``` python
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.utils import timezone

from apps.common.models import ActivaFitModel, TimeStampedModel
from apps.common.status import RecordStatus
from apps.membership.managers import MembershipManager


class Membership(ActivaFitModel):
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="memberships",
        db_column="client_id",
    )
    plan = models.ForeignKey(
        "plan.Plan",
        on_delete=models.RESTRICT,
        related_name="memberships",
        db_column="plan_id",
    )
    start_date = models.DateField()
    end_date = models.DateField()

    objects = MembershipManager()

    class Meta:
        db_table = "memberships"
        verbose_name = "membresía"
        verbose_name_plural = "membresías"
        ordering = ["-start_date", "-id"]
        constraints = [
            ActivaFitModel.status_constraint("memberships_status_valid"),
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="memberships_dates_valid",
            ),
        ]

    def __str__(self):
        return f"Membresía {self.pk}"

    def void(self):
        with transaction.atomic():
            membership = Membership.objects.select_for_update().get(pk=self.pk)
            if membership.status == RecordStatus.INACTIVE:
                return membership
            for payment in membership.payments.select_for_update():
                if payment.status != RecordStatus.ACTIVE:
                    continue
                payment.status = RecordStatus.INACTIVE
                payment.save(update_fields=["status"])
            membership.status = RecordStatus.INACTIVE
            membership.save(update_fields=["status", "updated_at"])
            return membership


class Payment(models.Model):
    membership = models.ForeignKey(
        Membership,
        on_delete=models.RESTRICT,
        related_name="payments",
        db_column="membership_id",
    )
    method = models.CharField(max_length=30)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    payment_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=8,
        choices=RecordStatus.choices,
        default=RecordStatus.INACTIVE,
    )

    class Meta:
        db_table = "payments"
        verbose_name = "pago"
        verbose_name_plural = "pagos"
        ordering = ["-payment_date", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="payments_status_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gte=0),
                name="payments_amount_non_neg",
            ),
        ]

    def __str__(self):
        return f"Pago {self.pk} - {self.amount}"


class Attendance(TimeStampedModel):
    membership = models.ForeignKey(
        Membership,
        on_delete=models.RESTRICT,
        related_name="attendances",
        db_column="membership_id",
    )
    attendance_date = models.DateTimeField(default=timezone.now)
    type = models.CharField(max_length=20)

    class Meta:
        db_table = "attendances"
        verbose_name = "asistencia"
        verbose_name_plural = "asistencias"
        ordering = ["-attendance_date", "-id"]

    def __str__(self):
        return f"Asistencia {self.pk}"
```

![](images/clipboard-776016491.png)

**Paso 3. Generar la migración y migrar**

```         
python manage.py makemigrations membership
python manage.py migrate
```

![](images/clipboard-1490164872.png)

`void()` ya está en el modelo porque la anulación es parte de su comportamiento. El endpoint que la llama llega en un ISS posterior. `register()` todavía no existe: se agrega más adelante dentro de `MembershipQuerySet`.

**Paso 4. Comprobar en el shell**

```         
python manage.py shell
```

``` python
from datetime import date, timedelta
from django.db import IntegrityError, transaction
from django.db.models import RestrictedError
from apps.client.models import Client
from apps.plan.models import Plan
from apps.membership.models import Membership, Payment, Attendance

c = Client.objects.create(document_type="CC", document_number="222", name="Cliente Prueba", email="prueba@mail.com")
p = Plan.objects.create(name="Plan Mensual")
m = Membership.objects.create(client=c, plan=p, start_date=date.today(), end_date=date.today() + timedelta(days=30))
pay = Payment.objects.create(membership=m, method="efectivo", amount=80000, status="active")
a = Attendance.objects.create(membership=m, type="entrada")
m.status
```

`m.status` debe mostrar `'inactive'`. Ahora el borrado restringido (pulsa Enter dos veces tras cada bloque):

![](images/clipboard-3917458662.png)

```         
try:
    p.delete()
except RestrictedError as e:
    print("Restringido:", e)
```

![](images/clipboard-1436113346.png)

Las fechas inválidas deben rechazarse:

```         
try:
    with transaction.atomic():
        Membership.objects.create(client=c, plan=p, start_date=date.today(), end_date=date.today() - timedelta(days=1))
except IntegrityError as e:
    print("Rechazado:", e)
```

![](images/clipboard-3699702407.png)

Y la anulación:

```         
m.status = "active"
m.save()
m.void()
m.refresh_from_db()
pay.refresh_from_db()
print(m.status, pay.status)
```

![](images/clipboard-3615357655.png)

Debe imprimir `inactive inactive`. Para limpiar, en este orden:

```         
Attendance.objects.all().delete()
Payment.objects.all().delete()
Membership.objects.all().delete()
Plan.objects.all().delete()
Client.objects.all().delete()
```

![](images/clipboard-1620457832.png)

#### Explicación

La membresía es la tabla intermedia explícita entre clientes y planes: guarda sus propios datos (fechas y estado) y por eso no se usa un `ManyToManyField`. Para navegar se usan `membership.payments.all()` y `membership.attendances.all()`. Todas las claves foráneas usan `RESTRICT`, así que no se puede borrar un plan, un cliente o una membresía mientras existan registros que dependan de ellos.

`void()` desactiva la membresía y sus pagos activos dentro de una transacción, y deja las asistencias intactas como historial. Solo la membresía y el pago tienen estado.

```         
Client 1 ───── N Membership N ───── 1 Plan Membership 1 ───── N Payment Membership 1 ───── N Attendance
```

#### Criterios de aceptación

- **AC-06-01:** existen las tablas `memberships`, `payments` y `attendances`.

- **AC-06-02:** las claves foráneas usan `RESTRICT`.

- **AC-06-03:** la fecha de fin no puede ser anterior a la de inicio.

- **AC-06-04:** anular una membresía desactiva la membresía y sus pagos.

- **AC-06-05:** no hay `ManyToManyField` entre clientes y planes.

#### Verificación

La guía comprueba estos criterios con la migración y con pruebas de venta. Aquí se verifican con la migración aplicada y las pruebas del shell del Paso 4. Para confirmar el nombre de las tablas:

```         
python manage.py sqlmigrate membership 0001
```

![](images/clipboard-2014086677.png)

#### GATE

- **AC-06-01:** `sqlmigrate` muestra las tres tablas. **PASS**.

- **AC-06-02:** `RestrictedError` al borrar el plan y la membresía. **PASS**.

- **AC-06-03:** `IntegrityError` con fechas inválidas. **PASS**.

- **AC-06-04:** `void()` deja `inactive inactive`. **PASS**.

- **AC-06-05:** no hay `ManyToManyField` en `membership/models.py`. **P**

### ISS-07 — Serializers y JSON camelCase

**Narrativa**

Los modelos ya existen y están migrados, pero la API todavía no sabe hablar con el exterior. En esta unidad se instaló Django REST Framework y se escribió una capa de traducción: los serializers convierten cada modelo de ActivaFit en JSON y validan los datos que llegan. Los nombres de los campos en Python siguen en `snake_case` (`created_at`), pero en el JSON de la API salen en `camelCase` (`createdAt`), que es lo que espera un frontend. Esa conversión ocurre solo en el borde HTTP; los modelos no se tocan.

**Objetivo**

Traducir los modelos a JSON sin renombrar los campos de Python.

**Requisitos**

- ISS-06 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 0. Activar el entorno e instalar los paquetes de la API**

Hasta aquí el proyecto solo tenía Django. Estos tres paquetes forman la API. Se instalan juntos porque el renderer camelCase y CORS se declaran en el mismo bloque `REST_FRAMEWORK`.

```         
source .venv/bin/activate
python -m pip install "djangorestframework==3.17.2" "djangorestframework-camel-case==1.4.2" "django-cors-headers==4.9.0"
python -m pip freeze > requirements.txt
```

- `djangorestframework` aporta los serializers, las vistas y el cliente de pruebas. Sin él, `from rest_framework import serializers` falla.

- `djangorestframework-camel-case` convierte `created_at` en `createdAt` al responder, y al revés al recibir.

`django-cors-headers` evita que un navegador en otro origen bloquee la API. En el laboratorio se permiten todos los orígenes; en producción se listan explícitamente.

![](images/clipboard-4012940233.png)

**Paso 1. Parchear `config/settings/__init__.py`**

El archivo ya existe. DRF entra ahora con permiso abierto (`AllowAny`), porque todavía no hay autenticación; un ISS posterior cambia ese valor.

Encima de `"apps.security.apps.SecurityConfig",` agrega:

```         
    "rest_framework",
    "corsheaders",
```

Encima de `"django.middleware.security.SecurityMiddleware",` agrega:

```         
    "corsheaders.middleware.CorsMiddleware",
```

![](images/clipboard-1173804665.png)

Debajo de `DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"` agrega:

``` python
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "True").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
        "djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
        "djangorestframework_camel_case.parser.CamelCaseFormParser",
        "djangorestframework_camel_case.parser.CamelCaseMultiPartParser",
    ],
    "DEFAULT_PAGINATION_CLASS": None,
}
```

![](images/clipboard-1479854514.png)

**Paso 2. Serializers de `client`**

Los archivos `serializers.py` no existen: `startapp` no los crea. Archivo `apps/client/serializers.py`:

``` python
from rest_framework import serializers

from apps.client.models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "document_type",
            "document_number",
            "name",
            "phone",
            "email",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 150},
            "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_email(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value.strip().lower()

    def validate(self, attrs):
        if attrs.get("phone") == "":
            attrs["phone"] = None
        return attrs
```

![](images/clipboard-3632260417.png)

**Paso 3. Serializers de `trainer` y `plan`**

Archivo `apps/trainer/serializers.py`:

``` python
from rest_framework import serializers

from apps.trainer.models import Trainer


class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "specialty",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 150},
            "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
            "specialty": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_email(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value.strip().lower()

    def validate(self, attrs):
        for field in ("phone", "specialty"):
            if attrs.get(field) == "":
                attrs[field] = None
        return attrs
```

![](images/clipboard-3430988937.png)

Archivo `apps/plan/serializers.py`:

``` python
from rest_framework import serializers

from apps.plan.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "name", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 100},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value
```

![](images/clipboard-1619383553.png)

**Paso 4. Serializers de `routine`**

Archivo `apps/routine/serializers.py`. Las rutinas exponen `trainer_id` y `client_id` escribibles, y `trainer_name` y `client_name` de solo lectura. En el JSON se verán como `trainerId`, `clientId`, `trainerName` y `clientName`.

``` python
from rest_framework import serializers

from apps.client.models import Client
from apps.routine.models import Exercise, Routine, RoutineExercise
from apps.trainer.models import Trainer


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "name", "description", "muscle_group", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 120},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value


class RoutineSerializer(serializers.ModelSerializer):
    trainer_id = serializers.PrimaryKeyRelatedField(
        source="trainer",
        queryset=Trainer.objects.all(),
    )
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
    )
    trainer_name = serializers.CharField(source="trainer.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Routine
        fields = [
            "id",
            "trainer_id",
            "trainer_name",
            "client_id",
            "client_name",
            "name",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "trainer_name", "client_name", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 120},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value


class RoutineExerciseSerializer(serializers.ModelSerializer):
    routine_id = serializers.PrimaryKeyRelatedField(
        source="routine",
        queryset=Routine.objects.all(),
    )
    exercise_id = serializers.PrimaryKeyRelatedField(
        source="exercise",
        queryset=Exercise.objects.all(),
    )

    class Meta:
        model = RoutineExercise
        fields = [
            "id",
            "routine_id",
            "exercise_id",
            "sets",
            "repetitions",
            "weight",
            "rest_seconds",
            "name",
            "description",
            "muscle_group",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value
```

![](images/clipboard-3191148772.png)

**Paso 5. Serializer de `measurement`**

Archivo `apps/measurement/serializers.py`. No incluye `status`, porque tu tabla `measurements` no lo tiene.

``` python
from rest_framework import serializers

from apps.client.models import Client
from apps.measurement.models import Measurement
from apps.trainer.models import Trainer


class MeasurementSerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
    )
    trainer_id = serializers.PrimaryKeyRelatedField(
        source="trainer",
        queryset=Trainer.objects.all(),
    )
    client_name = serializers.CharField(source="client.name", read_only=True)
    trainer_name = serializers.CharField(source="trainer.name", read_only=True)

    class Meta:
        model = Measurement
        fields = [
            "id",
            "client_id",
            "client_name",
            "trainer_id",
            "trainer_name",
            "weight",
            "height",
            "body_fat",
            "bmi",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client_name", "trainer_name", "created_at", "updated_at"]
```

![](images/clipboard-3288318075.png)

**Paso 6. Serializers de `membership`**

Archivo `apps/membership/serializers.py`. En este ISS la membresía y sus pagos solo se **leen**; el alta transaccional se agrega más adelante. La asistencia sí es escribible, porque es un registro simple.

``` python
from rest_framework import serializers

from apps.membership.models import Attendance, Membership, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "membership", "method", "amount", "payment_date", "status"]
        read_only_fields = fields


class MembershipSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id",
            "client",
            "client_name",
            "plan",
            "plan_name",
            "start_date",
            "end_date",
            "status",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AttendanceSerializer(serializers.ModelSerializer):
    membership_id = serializers.PrimaryKeyRelatedField(
        source="membership",
        queryset=Membership.objects.all(),
    )

    class Meta:
        model = Attendance
        fields = ["id", "membership_id", "attendance_date", "type", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
```

![](images/clipboard-1856947421.png)

**Paso 7. Verificar la configuración**

```         
python manage.py check
```

![](images/clipboard-3326648032.png)

#### Explicación

Los serializers no usan `fields = "__all__"`: cada campo expuesto se lista a propósito. Los correos en blanco se convierten en `None`, para que la unicidad del correo no choque con cadenas vacías. Los serializers de relaciones exponen el identificador escribible (`trainer_id`) y el nombre de solo lectura (`trainer_name`), así el cliente no necesita una segunda consulta para mostrar nombres.

La conversión de nombres ocurre solo en el borde HTTP:

```         
Python created_at  →  tabla created_at  →  JSON createdAt
```

El parser hace el camino inverso. No se renombra ningún campo del modelo.

#### Criterios de aceptación

- **AC-07-01:** el JSON de un cliente contiene `createdAt` y no `created_at`.

- **AC-07-02:** `Maria@Example.com` se guarda como `maria@example.com`.

- **AC-07-03:** la rutina informa `trainerName` y `clientName` sin pedir otra consulta.

#### Verificación

La guía comprueba esto con pruebas HTTP de la API, que dependen de las rutas y vistas de los ISS siguientes. Por ahora se verifica en la consola de Django, usando el mismo renderer que usará la API:

```         
python manage.py shell
```

```         
from apps.client.serializers import ClientSerializer
from apps.trainer.models import Trainer
from apps.routine.models import Routine
from apps.routine.serializers import RoutineSerializer
from djangorestframework_camel_case.render import CamelCaseJSONRenderer

s = ClientSerializer(data={"document_type": "CC", "document_number": "1234567890", "name": "Maria Lopez", "email": "Maria@Example.com"})
s.is_valid()
s.validated_data["email"]
c = s.save()
CamelCaseJSONRenderer().render(ClientSerializer(c).data)

t = Trainer.objects.create(name="Entrenador Prueba")
r = Routine.objects.create(name="Rutina A", trainer=t, client=c)
CamelCaseJSONRenderer().render(RoutineSerializer(r).data)
```

![](images/clipboard-2073724203.png)

- `s.validated_data["email"]` debe dar `'maria@example.com'` (AC-07-02).

- El primer `render` debe mostrar `createdAt` y `documentNumber` (AC-07-01).

- El segundo debe mostrar `trainerName` y `clientName` (AC-07-03).

Para limpiar:

```         
Routine.objects.all().delete()
Trainer.objects.all().delete()
c.delete()
```

![](images/clipboard-2761538668.png)

#### GATE

- **AC-07-01:** el render muestra `createdAt`. **PASS**.

- **AC-07-02:** el correo se guarda en minúsculas. **PASS**.

- **AC-07-03:** `trainerName` y `clientName` aparecen en la rutina. **PASS**.

### ISS-08 — Client con ModelViewSet

**Narrativa**

Con los serializers listos, llega el primer endpoint real de ActivaFit: el CRUD de clientes. En lugar de escribir a mano cada operación, se usó `ModelViewSet`, la vista de DRF que ya sabe listar, crear, consultar, actualizar y borrar. El único comportamiento propio es que borrar un cliente no elimina la fila: la desactiva, para conservar el historial de membresías, pagos y asistencias que dependen de él. Como es el primer endpoint, en esta unidad también se creó el `urls.py` de la app y se conectó al proyecto bajo el prefijo `/api/`. Por ahora la API es abierta, sin autenticación; la seguridad llega en unidades posteriores.

**Objetivo**

Publicar el CRUD de clientes con el tipo de vista que corresponde a un recurso homogéneo.

**Requisitos**

- ISS-07 superado.

- Terminal con el entorno virtual `.venv` activo.

En esta fase el CRUD se publica sin JWT: `permission_classes = [AllowAny]`. Más adelante se reemplaza por `IsAuthenticated` y `HasResourceAccess`. No se importa nada de `apps.security` todavía.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Escribir la vista**

El archivo `apps/client/views.py` ya existe. Se reescribe entero. La baja lógica se implementa con `perform_destroy`, que es el punto de extensión de DRF; no se reescribe `delete()`.

``` python
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.client.models import Client
from apps.client.serializers import ClientSerializer
from apps.common.status import RecordStatus


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [AllowAny]
    lookup_value_converter = "int"

    def get_queryset(self):
        queryset = super().get_queryset()
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset

    def perform_destroy(self, instance):
        instance.status = RecordStatus.INACTIVE
        instance.save(update_fields=["status", "updated_at"])
```

![](images/clipboard-3641985953.png)

**Paso 2. Crear las rutas de la app**

Las apps no traen `urls.py`. Se crea ahora porque es el primer endpoint. Archivo `apps/client/urls.py`:

``` python
from rest_framework.routers import SimpleRouter

from apps.client.views import ClientViewSet

router = SimpleRouter(use_regex_path=False)
router.register("clients", ClientViewSet, basename="client")

urlpatterns = router.urls
```

![](images/clipboard-1746047422.png)

**Paso 3. Conectar las rutas al proyecto**

El archivo `config/urls.py` ya existe; no se regenera, se edita. Se busca esta línea:

```         
from django.urls import path
```

Y se reemplaza por:

```         
from django.urls import include, path
```

Debajo de la línea `path("admin/", admin.site.urls),` se agrega:

``` python
    path("api/", include("apps.client.urls")),
```

![](images/clipboard-2969320724.png)

**Paso 4. Escribir las pruebas**

El archivo `apps/client/tests.py` también existe y se reescribe. Las pruebas son de acceso abierto: no hay usuario ni token. Cada cliente lleva su propio correo y su propio documento, porque ambos son únicos.

``` python
import json

from rest_framework import status
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus


class ClientApiTests(APITestCase):
    def test_create_defaults_and_persists(self):
        response = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "1234567890",
                "name": "María García",
                "email": "Maria@Example.com",
                "phone": "3001234567",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], RecordStatus.INACTIVE)
        self.assertEqual(response.data["email"], "maria@example.com")
        wire = json.loads(response.content)
        self.assertIn("createdAt", wire)
        self.assertNotIn("created_at", wire)
        stored = Client.objects.get(pk=response.data["id"])
        self.assertEqual(stored.name, "María García")

    def test_invalid_name_and_duplicate_email(self):
        invalid = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "1111111111",
                "name": "A",
                "email": "a@example.com",
            },
            format="json",
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "2222222222",
                "name": "Ana Ruiz",
                "email": "ana@example.com",
            },
            format="json",
        )
        duplicate = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "3333333333",
                "name": "Otra Ana",
                "email": "ana@example.com",
            },
            format="json",
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_soft_delete_keeps_the_row(self):
        created = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "4444444444",
                "name": "Pedro León",
                "email": "pedro@example.com",
            },
            format="json",
        )
        deleted = self.client.delete(f"/api/clients/{created.data['id']}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        stored = Client.objects.get(pk=created.data["id"])
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertEqual(Client.objects.count(), 1)

    def test_list_retrieve_and_update(self):
        created = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "5555555555",
                "name": "Luisa Mora",
                "email": "luisa@example.com",
                "phone": "111",
            },
            format="json",
        )
        pk = created.data["id"]
        listed = self.client.get("/api/clients/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        detail = self.client.get(f"/api/clients/{pk}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["name"], "Luisa Mora")
        updated = self.client.patch(
            f"/api/clients/{pk}/",
            {"phone": "222", "status": "active"},
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["status"], "active")
```

![](images/clipboard-878844823.png)

**Paso 5. Ejecutar las pruebas**

```         
python manage.py test apps.client
```

Debe terminar con `Ran 4 tests` y `OK`. Estas pruebas cubren el CRUD completo del cliente: alta, listado, detalle, actualización y baja lógica.

![](images/clipboard-81091512.png)

Una advertencia: a diferencia de las pruebas del ISS-03, estas sí usan base de datos, y Django crea una base temporal con el prefijo `test_`. Si usas MySQL o PostgreSQL y el usuario de tu `.env` no tiene permiso para crear bases de datos, la prueba fallará con un error de permisos. Se arregla otorgándole ese permiso al usuario.

#### Explicación

`ModelViewSet` automatiza `list`, `create`, `retrieve`, `update`, `partial_update` y `destroy`. El único comportamiento propio es la baja lógica, y la forma idiomática de cambiarla es `perform_destroy`.

`SimpleRouter.register` genera las dos rutas del CRUD:

```         
clients/              list, create
clients/<int:pk>/     retrieve, update, partial_update, destroy
```

`use_regex_path=False` pide convertidores de `path()` en lugar de expresiones regulares, y `lookup_value_converter = "int"` convierte el segmento en `<int:pk>`. No se usa `DefaultRouter` porque, además de esas rutas, publicaría una raíz de API que chocaría con la de las demás apps cuando se incluyan bajo el mismo `api/`.

El proyecto solo entrega el prefijo `api/`, y la app entrega el recurso `clients`; Django los concatena y resulta `/api/clients/`.

```         
GET/POST /api/clients/
GET/PUT/PATCH/DELETE /api/clients/<int:pk>/
        │
        ▼
   ClientViewSet
        │
        ▼
   ClientSerializer
        │
        ▼
   clients
```

El parámetro `?status=` filtra la lista. Sin él se listan también los clientes inactivos.

#### Cómo probarlo

La prueba es de capa HTTP, con acceso abierto. No hace falta `runserver`: `APITestCase` llama la ruta dentro del proceso y la base temporal se borra al terminar.

```         
python manage.py test apps.client
        │
        ▼
ClientApiTests                 sin usuario, sin Bearer, sin permisos
        │
        ├── POST   /api/clients/           201   status inactive, email en minúsculas
        ├── GET    /api/clients/           200   la fila aparece en la lista
        ├── GET    /api/clients/<id>/      200   el detalle conserva el nombre
        ├── PATCH  /api/clients/<id>/      200   phone y status cambian
        └── DELETE /api/clients/<id>/      204   la fila sigue, status inactive
```

Si además quieres verlo funcionando a mano, arranca el servidor y consulta la lista desde otra terminal:

```         
python manage.py runserver
```

```         
curl http://127.0.0.1:8000/api/clients/
```

Swagger todavía no existe; llega más adelante con OpenAPI.

![](images/clipboard-3066872824.png)

![](images/clipboard-3594348483.png)

![](images/clipboard-1031845180.png)

![](images/clipboard-2491080853.png)

#### Criterios de aceptación

- **AC-08-01:** un POST válido responde 201.

- **AC-08-02:** el registro queda en la tabla.

- **AC-08-03:** DELETE responde 204 y la fila sigue, con `status = inactive`.

- **AC-08-04:** el cuerpo inválido responde 400.

#### Verificación

Las pruebas de `ClientApiTests`, con el comando del Paso 5.

#### GATE

- **AC-08-01:** POST responde 201. **PASS**.

- **AC-08-02:** `Client.objects.get` encuentra el registro. **PASS**.

- **AC-08-03:** DELETE lógico, la fila permanece inactiva. **PASS**.

- **AC-08-04:** nombre inválido responde 400. **PASS**.

### ISS-09 — Catálogo y seguimiento con ModelViewSet

**Narrativa**

Con el CRUD de clientes funcionando, ActivaFit extiende el mismo patrón al resto de sus recursos homogéneos: planes, entrenadores, ejercicios, rutinas, ejercicios de rutina y medidas. Para no copiar `perform_destroy` y el filtro de estado en cada vista, se extrajo una vista base compartida, `CatalogViewSet`, que sigue siendo un `ModelViewSet`. Las medidas son la excepción: su tabla no tiene estado, así que no hay baja lógica posible y su vista usa el borrado real. El acceso sigue siendo abierto en esta fase; la seguridad llega en unidades posteriores.

**Objetivo**

Publicar los catálogos y el seguimiento de ActivaFit con el mismo criterio de CRUD homogéneo.

**Requisitos**

- ISS-08 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

**Paso 1. Crear la vista base compartida**

`apps/common` es un paquete, no una app, así que el archivo `views.py` es nuevo. Contiene la vista base con baja lógica y filtro `?status=`. Archivo `apps/common/views.py`:

``` python
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.common.status import RecordStatus


class CatalogViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    lookup_value_converter = "int"

    def get_queryset(self):
        queryset = super().get_queryset()
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset

    def perform_destroy(self, instance):
        instance.status = RecordStatus.INACTIVE
        instance.save(update_fields=["status", "updated_at"])
```

![](images/clipboard-3835384417.png)

**Paso 2. Escribir las vistas de cada app**

Los archivos `views.py` ya existen (los creó `startapp`) y se reescriben enteros. Las que tienen estado heredan de `CatalogViewSet`.

Archivo `apps/plan/views.py`:

``` python
from apps.common.views import CatalogViewSet
from apps.plan.models import Plan
from apps.plan.serializers import PlanSerializer


class PlanViewSet(CatalogViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
```

![](images/clipboard-2403227821.png)

Archivo `apps/trainer/views.py`:

``` python
from apps.common.views import CatalogViewSet
from apps.trainer.models import Trainer
from apps.trainer.serializers import TrainerSerializer


class TrainerViewSet(CatalogViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
```

![](images/clipboard-3484010475.png)

Archivo `apps/routine/views.py`:

``` python
from apps.common.views import CatalogViewSet
from apps.routine.models import Exercise, Routine, RoutineExercise
from apps.routine.serializers import (
    ExerciseSerializer,
    RoutineExerciseSerializer,
    RoutineSerializer,
)


class ExerciseViewSet(CatalogViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer


class RoutineViewSet(CatalogViewSet):
    queryset = Routine.objects.select_related("trainer", "client")
    serializer_class = RoutineSerializer


class RoutineExerciseViewSet(CatalogViewSet):
    queryset = RoutineExercise.objects.select_related("routine", "exercise")
    serializer_class = RoutineExerciseSerializer
```

![](images/clipboard-1067957080.png)

Archivo `apps/measurement/views.py`. Esta vista no hereda de `CatalogViewSet`, porque `measurements` no tiene `status`: no hay filtro por estado ni baja lógica, y el DELETE elimina la fila.

``` python
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.measurement.models import Measurement
from apps.measurement.serializers import MeasurementSerializer


class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.select_related("client", "trainer")
    serializer_class = MeasurementSerializer
    permission_classes = [AllowAny]
    lookup_value_converter = "int"
```

![](images/clipboard-1639043875.png)

**Paso 3. Crear las rutas de cada app**

Archivo `apps/plan/urls.py`:

``` python
from rest_framework.routers import SimpleRouter

from apps.plan.views import PlanViewSet

router = SimpleRouter(use_regex_path=False)
router.register("plans", PlanViewSet, basename="plan")

urlpatterns = router.urls
```

![](images/clipboard-3694826869.png)

Archivo `apps/trainer/urls.py`:

``` python
from rest_framework.routers import SimpleRouter

from apps.trainer.views import TrainerViewSet

router = SimpleRouter(use_regex_path=False)
router.register("trainers", TrainerViewSet, basename="trainer")

urlpatterns = router.urls
```

![](images/clipboard-569417487.png)

Archivo `apps/routine/urls.py`:

``` python
from rest_framework.routers import SimpleRouter

from apps.routine.views import ExerciseViewSet, RoutineExerciseViewSet, RoutineViewSet

router = SimpleRouter(use_regex_path=False)
router.register("exercises", ExerciseViewSet, basename="exercise")
router.register("routines", RoutineViewSet, basename="routine")
router.register("routine-exercises", RoutineExerciseViewSet, basename="routine-exercise")

urlpatterns = router.urls
```

![](images/clipboard-2865526007.png)

Archivo `apps/measurement/urls.py`:

``` python
from rest_framework.routers import SimpleRouter

from apps.measurement.views import MeasurementViewSet

router = SimpleRouter(use_regex_path=False)
router.register("measurements", MeasurementViewSet, basename="measurement")

urlpatterns = router.urls
```

![](images/clipboard-1924144893.png)

**Paso 4. Conectar las rutas al proyecto**

En `config/urls.py`, debajo de la línea `path("api/", include("apps.client.urls")),`, agrega:

``` python
    path("api/", include("apps.plan.urls")),
    path("api/", include("apps.trainer.urls")),
    path("api/", include("apps.routine.urls")),
    path("api/", include("apps.measurement.urls")),
```

Es el mismo mecanismo que con clientes: el proyecto solo conoce el prefijo `api/` y cede el resto a cada app.

![](images/clipboard-1263107558.png)

**Paso 5. Escribir las pruebas**

Los archivos `tests.py` ya existen y se reescriben. El acceso es abierto, sin token. Los datos de apoyo (cliente, entrenador) se crean con el ORM en `setUp`.

Archivo `apps/plan/tests.py`:

``` python
from rest_framework.test import APITestCase

from apps.common.status import RecordStatus
from apps.plan.models import Plan


class PlanApiTests(APITestCase):
    def test_crud_and_soft_delete(self):
        created = self.client.post(
            "/api/plans/",
            {"name": "Plan Mensual", "description": "Acceso mensual"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        pk = created.data["id"]
        self.assertEqual(self.client.get("/api/plans/").status_code, 200)
        detail = self.client.get(f"/api/plans/{pk}/")
        self.assertEqual(detail.data["name"], "Plan Mensual")
        updated = self.client.patch(f"/api/plans/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(updated.status_code, 200)
        deleted = self.client.delete(f"/api/plans/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Plan.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_duplicate_name(self):
        payload = {"name": "Plan Trimestral"}
        first = self.client.post("/api/plans/", payload, format="json")
        second = self.client.post("/api/plans/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)
        self.assertEqual(Plan.objects.count(), 1)
```

![](images/clipboard-3096246508.png)

Archivo `apps/trainer/tests.py`:

``` python
from rest_framework.test import APITestCase

from apps.common.status import RecordStatus
from apps.trainer.models import Trainer


class TrainerApiTests(APITestCase):
    def test_crud_and_soft_delete(self):
        created = self.client.post(
            "/api/trainers/",
            {"name": "Carlos Ruiz", "email": "Carlos@Example.com", "specialty": "Fuerza"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        self.assertEqual(created.data["email"], "carlos@example.com")
        pk = created.data["id"]
        detail = self.client.get(f"/api/trainers/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/trainers/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(updated.status_code, 200)
        deleted = self.client.delete(f"/api/trainers/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Trainer.objects.get(pk=pk).status, RecordStatus.INACTIVE)
```

![](images/clipboard-1321713073.png)

Archivo `apps/routine/tests.py`:

``` python
from django.db.models.deletion import RestrictedError
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus
from apps.routine.models import Exercise
from apps.trainer.models import Trainer


class RoutineApiTests(APITestCase):
    def setUp(self):
        self.gym_client = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
        )
        self.trainer = Trainer.objects.create(name="Entrenador Prueba")

    def test_exercise_crud_and_duplicate(self):
        payload = {"name": "Sentadilla", "muscleGroup": "Piernas"}
        created = self.client.post("/api/exercises/", payload, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        duplicate = self.client.post("/api/exercises/", payload, format="json")
        self.assertEqual(duplicate.status_code, 400)
        pk = created.data["id"]
        deleted = self.client.delete(f"/api/exercises/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Exercise.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_routine_with_lines_and_restriction(self):
        routine = self.client.post(
            "/api/routines/",
            {
                "trainerId": self.trainer.id,
                "clientId": self.gym_client.id,
                "name": "Rutina A",
            },
            format="json",
        )
        self.assertEqual(routine.status_code, 201)
        self.assertEqual(routine.data["status"], RecordStatus.INACTIVE)
        exercise = Exercise.objects.create(name="Press de banca", muscle_group="Pecho")
        line = self.client.post(
            "/api/routine-exercises/",
            {
                "routineId": routine.data["id"],
                "exerciseId": exercise.id,
                "sets": 3,
                "repetitions": 12,
                "name": "Press de banca",
                "muscleGroup": "Pecho",
            },
            format="json",
        )
        self.assertEqual(line.status_code, 201)
        self.assertEqual(line.data["sets"], 3)
        with self.assertRaises(RestrictedError):
            self.trainer.delete()

    def test_invalid_foreign_key(self):
        response = self.client.post(
            "/api/routines/",
            {"trainerId": 9999, "clientId": self.gym_client.id, "name": "Rutina B"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
```

![](images/clipboard-1217817558.png)

Archivo `apps/measurement/tests.py`:

``` python
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.measurement.models import Measurement
from apps.trainer.models import Trainer


class MeasurementApiTests(APITestCase):
    def setUp(self):
        self.gym_client = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
        )
        self.trainer = Trainer.objects.create(name="Entrenador Prueba")

    def test_crud_and_hard_delete(self):
        created = self.client.post(
            "/api/measurements/",
            {
                "clientId": self.gym_client.id,
                "trainerId": self.trainer.id,
                "weight": "70.50",
                "height": "175.00",
                "bodyFat": "18.50",
                "bmi": "23.00",
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertNotIn("status", created.data)
        pk = created.data["id"]
        detail = self.client.get(f"/api/measurements/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/measurements/{pk}/", {"weight": "69.00"}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["weight"], "69.00")
        deleted = self.client.delete(f"/api/measurements/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Measurement.objects.count(), 0)
```

![](images/clipboard-2543189504.png)

**Paso 6. Ejecutar las pruebas**

```         
python manage.py test apps.plan apps.trainer apps.routine apps.measurement
```

![](images/clipboard-482149800.png)

Debe terminar con `Ran 7 tests` y `OK`. Como en el ISS-08, Django crea una base temporal con el prefijo `test_`; si tu usuario de base de datos no puede crear bases, la prueba fallará por permisos.

#### Explicación

No se repite la discusión del ISS-08: estos recursos son del mismo tipo, CRUD homogéneo. Extraer `CatalogViewSet` evita copiar `perform_destroy` y el filtro en cada app, y no inventa una capa nueva: sigue siendo un `ModelViewSet`.

Las vistas con estado se desactivan en lugar de borrarse, para conservar el historial: un entrenador o un plan inactivo no desaparece de las rutinas y membresías que lo usan. La excepción son las medidas: su tabla no tiene `status`, así que su vista usa el borrado real de DRF, y no hay nada que dependa de ellas.

Los serializers de relaciones (`RoutineSerializer`, `RoutineExerciseSerializer`, `MeasurementSerializer`) exigen sus identificadores (`trainerId`, `clientId`, `routineId`, `exerciseId`). Si apuntan a un registro que no existe, DRF responde 400 antes de tocar la base. Y como las claves foráneas usan `RESTRICT`, no se puede borrar un entrenador mientras tenga rutinas.

```         
/api/plans/  /api/trainers/  /api/exercises/
/api/routines/  /api/routine-exercises/  /api/measurements/
        │
        ▼
 CatalogViewSet (o ModelViewSet en measurements)
        │
        ▼
 Serializer de cada recurso
        │
        ▼
 plans · trainers · exercises · routines · routine_exercises · measurements
```

![](images/clipboard-3000049576.png)

![](images/clipboard-905568021.png)

![](images/clipboard-1915694349.png)

![](images/clipboard-294191278.png)

#### Cómo probarlo

La prueba es de capa HTTP, con acceso abierto y sin `runserver`. Los datos de apoyo se crean con el ORM en `setUp`, sin pasar por la API.

```         
python manage.py test apps.plan apps.trainer apps.routine apps.measurement
        │
        ▼
PlanApiTests         POST · GET · PATCH · DELETE lógico · nombre duplicado = 400
TrainerApiTests      POST · email en minúsculas · PATCH · DELETE lógico
RoutineApiTests      ejercicios · rutina con trainerId/clientId · línea de rutina
                     · clave inexistente = 400 · borrar entrenador con rutinas = RestrictedError
MeasurementApiTests  POST · GET · PATCH · DELETE real (204 y la fila desaparece)
```

![](images/clipboard-2142602300.png)

Las membresías vigentes (ISS-10) y el registro de membresías (ISS-11) se prueban en sus propios ISS.

### ISS-10 — Membresías vigentes con ListAPIView

**Narrativa**

Hasta ahora la API de ActivaFit solo ofrece CRUD completos. Pero el gimnasio necesita responder una pregunta que no es un CRUD: ¿qué membresías están vigentes hoy? Es una lectura filtrada, de solo consulta, con varias condiciones a la vez. Para ese caso se usó `ListAPIView`, una vista de DRF que serializa un queryset y expone únicamente el GET, sin crear, actualizar ni borrar. El filtro vive en `get_queryset`, y el endpoint queda en `/api/memberships/active/`, como una colección distinta de las membresías individuales.

**Objetivo**

Publicar una lectura filtrada que no es el CRUD de la membresía.

**Requisitos**

- ISS-08 superado (la API de clientes ya funciona bajo `/api/`).

- Terminal con el entorno virtual `.venv` activo.

- El endpoint debe justificar `GenericAPIView`: no se crea para completar un cuadro.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Escribir la vista**

El archivo `apps/membership/views.py` ya existe (lo creó `startapp`, casi vacío). Se reescribe entero. `AllowAny` es el acceso abierto de esta fase; más adelante se reemplaza por autenticación y permisos por recurso.

``` python
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.membership.serializers import MembershipSerializer


class ActiveMembershipListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        today = timezone.localdate()
        return (
            Membership.objects.select_related("client", "plan")
            .prefetch_related("payments")
            .filter(
                status=RecordStatus.ACTIVE,
                client__status=RecordStatus.ACTIVE,
                plan__status=RecordStatus.ACTIVE,
                start_date__lte=today,
                end_date__gte=today,
            )
        )
```

![](images/clipboard-273105842.png)

`select_related` y `prefetch_related` evitan una consulta extra por cada membresía al armar el nombre del cliente, el nombre del plan y los pagos.

**Paso 2. Crear las rutas de la app**

La app `membership` todavía no tiene `urls.py`. Se crea ahora, porque es su primer endpoint. Archivo `apps/membership/urls.py`:

``` python
from django.urls import path

from apps.membership.views import ActiveMembershipListAPIView

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
]
```

![](images/clipboard-164343602.png)

Cuando más adelante se agregue el router con el CRUD de membresías, esta ruta literal debe quedar **antes** de `router.urls`, con `urlpatterns += router.urls`. Con el convertidor `int`, la palabra `active` no cabe en `<int:pk>`, así que no habría choque; aun así, la ruta literal va primero para dejar claro que `active` es una colección distinta y no un identificador.

**Paso 3. Conectar las rutas al proyecto**

En `config/urls.py`, debajo de las líneas `path("api/", include(...))` que ya existan, agrega:

```         
    path("api/", include("apps.membership.urls")),
```

![](images/clipboard-3897234788.png)

**Paso 4. Escribir la prueba**

El archivo `apps/membership/tests.py` también existe, vacío. Se reescribe. Como todavía no hay una API para crear membresías, los datos de prueba se crean con el ORM en `setUp`, con todo activo y vigente. Después la prueba comprueba el filtro y vence la membresía cambiando su fecha de fin directamente en la tabla.

``` python
from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.plan.models import Plan


class MembershipAvailableTests(APITestCase):
    def setUp(self):
        today = timezone.localdate()
        self.client_obj = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
            status=RecordStatus.ACTIVE,
        )
        self.plan = Plan.objects.create(name="Plan Mensual", status=RecordStatus.ACTIVE)
        self.membership = Membership.objects.create(
            client=self.client_obj,
            plan=self.plan,
            start_date=today - timedelta(days=5),
            end_date=today + timedelta(days=25),
            status=RecordStatus.ACTIVE,
        )

    def test_active_membership_filter(self):
        available = self.client.get("/api/memberships/active/")
        self.assertEqual(available.status_code, 200)
        self.assertEqual(len(available.data), 1)
        self.assertEqual(available.data[0]["id"], self.membership.id)
        Membership.objects.filter(pk=self.membership.pk).update(
            end_date=timezone.localdate() - timedelta(days=1)
        )
        empty = self.client.get("/api/memberships/active/")
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.data, [])
        self.assertEqual(Membership.objects.count(), 1)
```

![](images/clipboard-798204262.png)

**Paso 5. Ejecutar la prueba**

```         
python manage.py test apps.membership.tests.MembershipAvailableTests
```

![](images/clipboard-2061502556.png)

Debe terminar con `Ran 1 test` y `OK`. El acceso sigue siendo abierto: el GET no envía token.

#### Explicación

`ListAPIView` es `GenericAPIView` más `ListModelMixin`. Automatiza la serialización de un queryset y deja el filtro en `get_queryset`. Solo ofrece GET, a diferencia de un `ModelViewSet`, que obligaría a apagar los demás métodos, o de una `APIView`, que reescribiría un ciclo que el mixin ya resuelve.

El filtro combina cinco condiciones: la membresía, el cliente y el plan deben estar activos, y la fecha de hoy debe caer entre el inicio y el fin. Por eso este endpoint no es un simple CRUD, y justifica tener su propia vista.

``` texinfo
GET /api/memberships/active/
        │
        ▼
  ListAPIView
        │
        ▼
  status active AND cliente active AND plan active
  AND start_date <= hoy <= end_date
```

#### Cómo probarlo

La prueba es de capa HTTP, con acceso abierto. Es un solo método de prueba: el GET comprueba que la membresía vigente aparece; luego, al poner su fecha de fin en el pasado, la lista queda vacía y la fila sigue existiendo en `memberships`.

```         
python manage.py test apps.membership.tests.MembershipAvailableTests
        │
        ▼
setUp: cliente active + plan active + membresía vigente
        │
        ▼
GET /api/memberships/active/     200   un elemento
        │
        ▼
end_date = ayer (directo en la tabla)
        │
        ▼
GET /api/memberships/active/     200   []
```

Si quieres verlo a mano, arranca el servidor y abre [`http://127.0.0.1:8000/api/memberships/active/`](http://127.0.0.1:8000/api/memberships/active/) en el navegador. Mostrará `[]` hasta que existan membresías vigentes. Swagger llega más adelante, con la unidad de OpenAPI.

![](images/clipboard-3527626080.png)

#### Criterios de aceptación

- **AC-10-01:** una membresía vigente, con cliente y plan activos, aparece en la lista.

- **AC-10-02:** al vencer (fecha de fin pasada), desaparece de esta lista y sigue en la tabla.

#### Verificación

`MembershipAvailableTests.test_active_membership_filter`.

#### GATE

- **AC-10-01:** la membresía vigente aparece en la lista. **PASS**.

- **AC-10-02:** al vencer, la lista queda vacía y la fila permanece. **PASS**.

### ISS-11 — Registro de membresía con APIView

**Narrativa**

Hasta ahora todo era CRUD o consulta. Registrar una membresía es distinto: implica crear la membresía, crear sus pagos y comprobar que el cliente y el plan estén activos y que no haya otra membresía vigente que se cruce con las fechas. Si cualquier paso falla, no puede quedar nada a medias: ni una membresía sin pagos ni un pago huérfano. Por eso el registro se hizo como una sola transacción, dentro del manager del modelo, y se expuso con una `APIView` en `POST /api/memberships/`. El serializer valida la forma de los datos; el manager protege la regla de negocio, de modo que se cumple aunque otra vista llame al mismo método.

**Objetivo**

Registrar una membresía como una sola transacción: cliente, plan, fechas y pagos.

**Requisitos**

- ISS-10 superado (la app `membership` ya tiene `views.py` y `urls.py`).

- Terminal con el entorno virtual `.venv` activo.

- Si cualquier paso falla, no queda membresía ni pagos.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Escribir el registro en el manager**

El archivo `apps/membership/managers.py` ya existe, con `MembershipQuerySet` vacío. Se reescribe entero, conservando el manager que usa el modelo. El método `register` bloquea al cliente y al plan con `select_for_update` (así dos registros simultáneos del mismo cliente se ponen en fila) y toda la operación va dentro de `transaction.atomic()`.

``` python
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from apps.common.status import RecordStatus


class MembershipQuerySet(models.QuerySet):
    def register(self, *, client, plan, start_date, end_date, payments):
        if not payments:
            raise ValidationError({"payments": ["La membresía requiere al menos un pago."]})
        if end_date < start_date:
            raise ValidationError(
                {"end_date": ["La fecha de fin no puede ser anterior a la de inicio."]}
            )

        normalized = []
        for payment in payments:
            amount = Decimal(payment["amount"]).quantize(Decimal("0.01"))
            if amount < 0:
                raise ValidationError({"payments": ["El monto no puede ser negativo."]})
            normalized.append(
                {
                    "method": payment["method"],
                    "amount": amount,
                    "payment_date": payment.get("payment_date") or timezone.now(),
                }
            )

        with transaction.atomic():
            locked_client = client.__class__.objects.select_for_update().get(pk=client.pk)
            if locked_client.status != RecordStatus.ACTIVE:
                raise ValidationError({"client_id": ["El cliente debe estar active."]})

            locked_plan = plan.__class__.objects.select_for_update().get(pk=plan.pk)
            if locked_plan.status != RecordStatus.ACTIVE:
                raise ValidationError({"plan_id": ["El plan debe estar active."]})

            overlap = self.model.objects.filter(
                client=locked_client,
                status=RecordStatus.ACTIVE,
                start_date__lte=end_date,
                end_date__gte=start_date,
            ).exists()
            if overlap:
                raise ValidationError(
                    {
                        "start_date": [
                            "El cliente ya tiene una membresía vigente que se cruza con esas fechas."
                        ]
                    }
                )

            membership = self.model(
                client=locked_client,
                plan=locked_plan,
                start_date=start_date,
                end_date=end_date,
                status=RecordStatus.INACTIVE,
            )
            membership.save()

            for payment in normalized:
                membership.payments.create(
                    method=payment["method"],
                    amount=payment["amount"],
                    payment_date=payment["payment_date"],
                    status=RecordStatus.ACTIVE,
                )

            membership.status = RecordStatus.ACTIVE
            membership.save(update_fields=["status", "updated_at"])
            return membership


class MembershipManager(models.Manager.from_queryset(MembershipQuerySet)):
    pass
```

![](images/clipboard-1179246793.png)

Si algo falla dentro de `transaction.atomic()`, no queda ninguna fila. El modelo no se toca: `Membership.objects` ya usa este manager.

**Paso 2. Agregar los serializers de alta**

El archivo `apps/membership/serializers.py` ya tiene los serializers de lectura (ISS-07). Se parchea.

Reemplaza las dos primeras líneas de imports, es decir, `from rest_framework import serializers` y `from apps.membership.models import Attendance, Membership, Payment`, por este bloque:

``` python
from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.client.models import Client
from apps.membership.models import Attendance, Membership, Payment
from apps.plan.models import Plan
```

![](images/clipboard-3737744493.png)

Y al final del archivo agrega:

``` python
class PaymentInputSerializer(serializers.Serializer):
    method = serializers.CharField(max_length=30)
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.00"),
    )
    payment_date = serializers.DateTimeField(required=False)


class MembershipRegisterSerializer(serializers.Serializer):
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source="client",
    )
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=Plan.objects.all(),
        source="plan",
    )
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    payments = PaymentInputSerializer(many=True, allow_empty=False)

    def create(self, validated_data):
        try:
            return Membership.objects.register(
                client=validated_data["client"],
                plan=validated_data["plan"],
                start_date=validated_data["start_date"],
                end_date=validated_data["end_date"],
                payments=validated_data["payments"],
            )
        except DjangoValidationError as exc:
            if getattr(exc, "message_dict", None):
                raise serializers.ValidationError(exc.message_dict) from exc
            raise serializers.ValidationError(exc.messages) from exc
```

![](images/clipboard-4117024961.png)

**Paso 3. Escribir las vistas**

El archivo `apps/membership/views.py` ya existe con la vista de membresías vigentes (ISS-10). Se reescribe entero, conservándola. El permiso sigue siendo `AllowAny` en esta fase. El GET del listado y la anulación se agregan en el ISS-12.

``` python
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.membership.serializers import MembershipRegisterSerializer, MembershipSerializer


class ActiveMembershipListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        today = timezone.localdate()
        return (
            Membership.objects.select_related("client", "plan")
            .prefetch_related("payments")
            .filter(
                status=RecordStatus.ACTIVE,
                client__status=RecordStatus.ACTIVE,
                plan__status=RecordStatus.ACTIVE,
                start_date__lte=today,
                end_date__gte=today,
            )
        )


class MembershipRegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MembershipRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        membership = Membership.objects.select_related("client", "plan").prefetch_related(
            "payments"
        ).get(pk=membership.pk)
        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class MembershipCollectionAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        handler = MembershipRegisterAPIView()
        handler.request = request
        handler.format_kwarg = None
        handler.args = ()
        handler.kwargs = {}
        return handler.post(request)
```

La operación vive en `MembershipQuerySet.register`, invocada por `MembershipRegisterSerializer.create`. `MembershipRegisterAPIView.post` solo valida y responde 201. `MembershipCollectionAPIView.post` le entrega el `request` de DRF ya leído; no vuelve a llamar `as_view()`. Existe como colección para que el ISS-12 le agregue el GET en la misma ruta.

![](images/clipboard-1510582405.png)

**Paso 4. Agregar la ruta**

La membresía no usa router: un `SimpleRouter` sobre un viewset publicaría listar, crear, actualizar y borrar, y aquí el alta es una `APIView`. El archivo `apps/membership/urls.py` se reescribe entero, conservando la ruta del ISS-10:

``` python
from django.urls import path

from apps.membership.views import ActiveMembershipListAPIView, MembershipCollectionAPIView

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
    path("memberships/", MembershipCollectionAPIView.as_view(), name="membership-collection"),
]
```

`config/urls.py` no se toca: ya incluye `apps.membership.urls` desde el ISS-10. `path("memberships/", ...)` más el prefijo `api/` produce `POST /api/memberships/`, y el mismo path aceptará GET en el ISS-12.

![](images/clipboard-729441290.png)

**Paso 5. Agregar las pruebas**

El archivo `apps/membership/tests.py` ya tiene `MembershipAvailableTests` (ISS-10), y se conserva. Reemplaza la línea de imports `from apps.membership.models import Membership` por estas dos:

```         
from unittest.mock import patch  
from apps.membership.models import Membership, Payment
```

![](images/clipboard-2784541430.png)

Y al final del archivo agrega la nueva clase. Las pruebas son de acceso abierto y solo ejercitan `POST /api/memberships/`. El cliente y el plan del `setUp` se crean por el ORM, activos.

``` python
class MembershipRegisterTests(APITestCase):
    def setUp(self):
        self.buyer = Client.objects.create(
            document_type="CC",
            document_number="9876543210",
            name="Comprador",
            email="comprador@example.com",
            status=RecordStatus.ACTIVE,
        )
        self.plan = Plan.objects.create(name="Plan Mensual", status=RecordStatus.ACTIVE)

    def _payload(self, payments, start_date=None, end_date=None):
        today = timezone.localdate()
        return {
            "clientId": self.buyer.id,
            "planId": self.plan.id,
            "startDate": (start_date or today).isoformat(),
            "endDate": (end_date or today + timedelta(days=30)).isoformat(),
            "payments": payments,
        }

    def test_register_creates_membership_and_payments(self):
        response = self.client.post(
            "/api/memberships/",
            self._payload(
                [
                    {"method": "efectivo", "amount": "50000.00"},
                    {"method": "tarjeta", "amount": "30000.00"},
                ]
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "active")
        self.assertEqual(len(response.data["payments"]), 2)
        self.assertTrue(all(p["status"] == "active" for p in response.data["payments"]))
        self.assertEqual(Membership.objects.count(), 1)
        self.assertEqual(Payment.objects.count(), 2)

    def test_overlapping_dates_are_rejected(self):
        payload = self._payload([{"method": "efectivo", "amount": "50000.00"}])
        first = self.client.post("/api/memberships/", payload, format="json")
        second = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)
        self.assertEqual(Membership.objects.count(), 1)

    def test_payment_failure_rolls_back_the_membership(self):
        with patch.object(Payment, "save", side_effect=RuntimeError("fallo de pago")):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    "/api/memberships/",
                    self._payload([{"method": "efectivo", "amount": "50000.00"}]),
                    format="json",
                )
        self.assertEqual(Membership.objects.count(), 0)
        self.assertEqual(Payment.objects.count(), 0)

    def test_inactive_client_or_plan_is_rejected(self):
        payload = self._payload([{"method": "efectivo", "amount": "50000.00"}])
        self.plan.status = RecordStatus.INACTIVE
        self.plan.save()
        inactive_plan = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(inactive_plan.status_code, 400)
        self.plan.status = RecordStatus.ACTIVE
        self.plan.save()
        self.buyer.status = RecordStatus.INACTIVE
        self.buyer.save()
        inactive_client = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(inactive_client.status_code, 400)
        self.assertEqual(Membership.objects.count(), 0)

    def test_end_date_before_start_date_is_rejected(self):
        today = timezone.localdate()
        response = self.client.post(
            "/api/memberships/",
            self._payload(
                [{"method": "efectivo", "amount": "50000.00"}],
                start_date=today,
                end_date=today - timedelta(days=1),
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Membership.objects.count(), 0)
```

![](images/clipboard-2482056504.png)

**Paso 6. Ejecutar las pruebas**

```         
python manage.py test apps.membership.tests.MembershipRegisterTests
```

Debe terminar con `Ran 5 tests` y `OK`. Si quieres correr también la prueba del ISS-10, usa `python manage.py test apps.membership`, que debe dar `Ran 6 tests`.

![](images/clipboard-1209389958.png)

#### Explicación

Un `ModelViewSet.create` guardaría solo la cabecera y dejaría los pagos para otra petición, y eso no es atómico. La `APIView` existe porque el comportamiento es particular: varias filas (membresía y pagos), validación contra el estado del cliente y del plan, y una regla de no cruce de fechas.

El serializer sigue siendo el lugar de la validación de forma (tipos, montos no negativos, al menos un pago). El manager es el lugar de la invariante, para que también se cumpla si otra vista llama `Membership.objects.register`. No se creó una clase `MembershipService`. El bloqueo con `select_for_update` sobre el cliente hace que dos registros simultáneos del mismo cliente se procesen uno tras otro, y por eso la comprobación de cruce de fechas es fiable.

``` texinfo
POST /api/memberships/
      │
      ▼
MembershipCollectionAPIView
      │
      ▼
MembershipRegisterAPIView
      │
      ▼
Membership.objects.register
      │
      ▼
atomic → COMMIT o ROLLBACK
```

Además hice una prueba manual con el servidor encendido (`python manage.py runserver`). Primero activé un cliente y un plan, porque se crean `inactive` por defecto, y luego registré una membresía con `curl`:

```         
curl -X POST http://127.0.0.1:8000/api/memberships/ -H "Content-Type: application/json" -d '{"clientId":6,"planId":2,"startDate":"2026-10-12","endDate":"2026-11-11","payments":[{"method":"efectivo","amount":"50000.00"}]}'
```

La respuesta trajo la membresía en `"status":"active"` con su pago. Al repetir el mismo comando, el servidor respondió por el cruce de fechas, igual que en la prueba automática. Al terminar borré los datos de prueba desde el shell de Django.

```         
curl -X POST http://127.0.0.1:8000/api/plans/ -H "Content-Type: application/json" -d '{"name":"Plan Mensual","status":"active"}'
```

![](images/clipboard-3864524702.png)

Para el cliente, ya tienes uno de la prueba anterior; cambia `6` por su id y actívalo:

```         
curl -X PATCH http://127.0.0.1:8000/api/clients/6/ -H "Content-Type: application/json" -d '{"status":"active"}'
```

![](images/clipboard-1413986989.png)

![](images/clipboard-3889737715.png)

Esa membresía queda guardada en tu base de datos real. Si no la quieres, bórrala desde el shell de Django (`python manage.py shell`), en este orden:

```         
from apps.membership.models import Payment, Membership
Payment.objects.all().delete()
Membership.objects.all().delete()
```

![](images/clipboard-1171492095.png)

### ISS-12 — Consulta y anulación de membresías (y asistencias)

**Narrativa**

En esta unidad terminé la parte de membresías de la API. Ya podía registrar una membresía con sus pagos, pero me faltaba poder consultarla y anularla. La consulta es de solo lectura: listar las membresías y ver el detalle de una con sus pagos. La anulación no borra la fila, porque la membresía demuestra que el cliente estuvo inscrito y que pagó. Lo que hice fue marcarla como inactiva junto con sus pagos, y conservar las asistencias como historial. Al final agregué el CRUD de asistencias, que no tiene estado: ahí sí un DELETE elimina la fila, porque nada depende de una asistencia.

**Objetivo**

Leer una membresía con sus pagos y anularla sin borrar el histórico.

**Requisitos**

- ISS-11 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Reescribir las vistas**

En `apps/membership/views.py` agregué `MembershipReadViewSet`, que solo mezcla `RetrieveModelMixin`, `DestroyModelMixin` y `GenericViewSet`. No incluye `create` ni `update`: el alta ya tiene su `APIView` y las fechas y el estado no se editan por CRUD. `perform_destroy` llama a `membership.void()`, que ya escribí en el ISS-06. Al `MembershipCollectionAPIView` le agregué el `get` que lista las membresías, con el mismo queryset y serializer del viewset. Y agregué `AttendanceViewSet` para las asistencias. Reescribí el archivo entero, conservando lo del ISS-10 y el ISS-11:

``` python
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.status import RecordStatus
from apps.membership.models import Attendance, Membership
from apps.membership.serializers import (
    AttendanceSerializer,
    MembershipRegisterSerializer,
    MembershipSerializer,
)


class ActiveMembershipListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        today = timezone.localdate()
        return (
            Membership.objects.select_related("client", "plan")
            .prefetch_related("payments")
            .filter(
                status=RecordStatus.ACTIVE,
                client__status=RecordStatus.ACTIVE,
                plan__status=RecordStatus.ACTIVE,
                start_date__lte=today,
                end_date__gte=today,
            )
        )


class MembershipReadViewSet(
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Membership.objects.select_related("client", "plan").prefetch_related("payments")
    serializer_class = MembershipSerializer
    permission_classes = [AllowAny]
    lookup_value_converter = "int"

    def perform_destroy(self, instance):
        instance.void()


class MembershipRegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MembershipRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        membership = Membership.objects.select_related("client", "plan").prefetch_related(
            "payments"
        ).get(pk=membership.pk)
        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class MembershipCollectionAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        memberships = MembershipReadViewSet.queryset.all()
        return Response(MembershipSerializer(memberships, many=True).data)

    def post(self, request, *args, **kwargs):
        handler = MembershipRegisterAPIView()
        handler.request = request
        handler.format_kwarg = None
        handler.args = ()
        handler.kwargs = {}
        return handler.post(request)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("membership")
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]
    lookup_value_converter = "int"
```

![](images/clipboard-3386119176.png)

**Paso 2. Reescribir las rutas**

El `GET /api/memberships/` ya existe: es la misma ruta `memberships/` del ISS-11. El detalle sí es una ruta nueva. Un viewset no se publica con `as_view()` vacío: le pasé un diccionario que dice qué método HTTP llama a qué acción (GET a `retrieve` y DELETE a `destroy`), así no quedan enlazados `put`, `patch` ni `post`. Las asistencias sí usan un router, porque son un CRUD completo. Reescribí `apps/membership/urls.py` entero:

``` python
from django.urls import path
from rest_framework.routers import SimpleRouter

from apps.membership.views import (
    ActiveMembershipListAPIView,
    AttendanceViewSet,
    MembershipCollectionAPIView,
    MembershipReadViewSet,
)

router = SimpleRouter(use_regex_path=False)
router.register("attendances", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
    path("memberships/", MembershipCollectionAPIView.as_view(), name="membership-collection"),
    path(
        "memberships/<int:pk>/",
        MembershipReadViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
        name="membership-detail",
    ),
]

urlpatterns += router.urls
```

![](images/clipboard-4074431846.png)

`config/urls.py` no se toca: ya incluye `apps.membership.urls` desde el ISS-10.

**Paso 3. Agregar las pruebas**

En `apps/membership/tests.py` reemplacé la línea de imports `from apps.membership.models import Membership, Payment` por esta:

```         
from apps.membership.models import Attendance, Membership, Payment
```

Luego agregué estos tres métodos al final de la clase `MembershipRegisterTests`, sin tocar su `setUp`:

``` python
    def test_detail_includes_payments(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        detail = self.client.get(f"/api/memberships/{created.data['id']}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(len(detail.data["payments"]), 1)
        self.assertEqual(detail.data["payments"][0]["amount"], "50000.00")

    def test_list_returns_the_registered_membership(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        listed = self.client.get("/api/memberships/")
        self.assertEqual(listed.status_code, 200)
        self.assertTrue(any(row["id"] == created.data["id"] for row in listed.data))

    def test_void_deactivates_once_and_keeps_attendances(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        membership_id = created.data["id"]
        Attendance.objects.create(membership_id=membership_id, type="entrada")
        first = self.client.delete(f"/api/memberships/{membership_id}/")
        second = self.client.delete(f"/api/memberships/{membership_id}/")
        self.assertEqual(first.status_code, 204)
        self.assertEqual(second.status_code, 204)
        membership = Membership.objects.get(pk=membership_id)
        self.assertEqual(membership.status, RecordStatus.INACTIVE)
        self.assertEqual(Payment.objects.filter(status=RecordStatus.ACTIVE).count(), 0)
        self.assertEqual(Attendance.objects.count(), 1)
```

![](images/clipboard-1210866987.png)

Y al final del archivo agregué una clase nueva para las asistencias:

``` python
class AttendanceApiTests(APITestCase):
    def setUp(self):
        today = timezone.localdate()
        gym_client = Client.objects.create(
            document_type="CC",
            document_number="1122334455",
            name="Cliente Asistencia",
            email="asistencia@example.com",
            status=RecordStatus.ACTIVE,
        )
        plan = Plan.objects.create(name="Plan Asistencia", status=RecordStatus.ACTIVE)
        self.membership = Membership.objects.create(
            client=gym_client,
            plan=plan,
            start_date=today,
            end_date=today + timedelta(days=30),
            status=RecordStatus.ACTIVE,
        )

    def test_crud_and_hard_delete(self):
        created = self.client.post(
            "/api/attendances/",
            {"membershipId": self.membership.id, "type": "entrada"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        pk = created.data["id"]
        detail = self.client.get(f"/api/attendances/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/attendances/{pk}/", {"type": "salida"}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["type"], "salida")
        deleted = self.client.delete(f"/api/attendances/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Attendance.objects.count(), 0)

    def test_invalid_membership(self):
        response = self.client.post(
            "/api/attendances/",
            {"membershipId": 9999, "type": "entrada"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
```

![](images/clipboard-1663713384.png)

**Paso 4. Ejecutar las pruebas**

```         
python manage.py test apps.membership
```

![](images/clipboard-3734768500.png)

Debe terminar con `Ran 11 tests` y `OK`: uno del ISS-10, ocho de `MembershipRegisterTests` y dos de `AttendanceApiTests`.

#### Explicación

Anular no es `QuerySet.delete()`. Quise conservar la fila porque demuestra que la membresía existió y que se pagó. Por eso `DELETE /api/memberships/<id>/` llama a `void()`, que pasa la membresía y sus pagos activos a `inactive` dentro de una transacción. La segunda llamada ve la membresía ya inactiva y no hace nada, por eso el resultado es idempotente. Las asistencias no se tocan: son el historial de cuándo vino el cliente, y la tabla `attendances` ni siquiera tiene estado.

Usé un `GenericViewSet` con solo `Retrieve` y `Destroy`, y no un `ModelViewSet`, porque los datos de una membresía no se editan por CRUD: los pagos y las fechas nacen del registro, y el alta ya tiene su `APIView`. Con el diccionario de `as_view` publiqué solo esos dos métodos. En cambio, para las asistencias sí usé un `ModelViewSet` completo, con borrado real, porque no hay ninguna tabla que dependa de ellas.

```         
GET    /api/memberships/          lista
GET    /api/memberships/<id>/     detalle con pagos
DELETE /api/memberships/<id>/     void(): membresía y pagos → inactive
/api/attendances/                 CRUD completo, DELETE real
```

#### Cómo probarlo

Capa HTTP, con acceso abierto. Reutilizo el POST del ISS-11 y agrego las lecturas y la anulación. Los pagos no tienen ruta propia: viajan dentro de la membresía.

```         
python manage.py test apps.membership
        │
        ├── GET  /api/memberships/          200   la membresía recién creada está en la lista
        ├── GET  /api/memberships/<id>/     200   el detalle trae sus pagos con el monto
        ├── DELETE /api/memberships/<id>/   204
        │       ├── primera vez   membresía y pagos inactive, la asistencia sigue
        │       └── segunda vez   204 otra vez, sin cambios
        └── /api/attendances/               POST 201 · GET · PATCH · DELETE 204 · membresía inexistente 400
```

![](images/clipboard-3968422807.png)

![](images/clipboard-2268481233.png)

![](images/clipboard-2048660839.png)

![](images/clipboard-245553165.png)

#### Criterios de aceptación

- **AC-12-01:** el GET del detalle incluye los pagos con su monto.

- **AC-12-02:** el DELETE de una membresía responde 204.

- **AC-12-03:** la fila de `memberships` sigue existiendo en `inactive`, con sus pagos `inactive`.

- **AC-12-04:** anular dos veces no cambia nada más y las asistencias se conservan.

- **AC-12-05:** el CRUD de asistencias funciona, el DELETE elimina la fila y una membresía inexistente responde 400.

### ISS-13 — Django Admin

**Narrativa**

En esta unidad dejé el admin de Django listo para explorar los datos de ActivaFit. Ya tenía la API, pero me faltaba una forma cómoda de mirar las tablas, buscar un cliente, filtrar por estado o corregir un dato de catálogo sin armar una petición a mano. Registré las diez tablas de negocio con listas que se pueden filtrar, buscar y ordenar, y con formularios agrupados. Hay una regla que respeté: las membresías y los pagos no se crean ni se borran desde el admin, porque nacen de una transacción (`register`) que valida al cliente, al plan y las fechas, y se anulan con `void()`. Si las editara a mano en el admin me saltaría todas esas reglas.

**Objetivo**

Dejar las tablas de ActivaFit explorables en el admin: listas filtrables, con búsqueda y orden, y formularios agrupados. Las membresías y los pagos se inspeccionan, no se rearman desde aquí.

**Requisitos**

- ISS-12 superado.

- Terminal con el entorno virtual `.venv` activo.

- `django.contrib.admin` en `INSTALLED_APPS`, que `startproject` ya incluye, y la ruta `admin/` en `config/urls.py`, que existe desde el ISS-00.

#### Construcción

**Paso 0. Activar el entorno virtual**

```         
source .venv/bin/activate which python
```

![](images/clipboard-117842089.png)

**Paso 1. Crear el superusuario**

```         
python manage.py createsuperuser
```

Django pregunta usuario, correo y contraseña (dos veces). Los validadores rechazan una clave común o solo numérica, así que la contraseña debe cumplirlos. Mi `ActivaFitUserManager.create_superuser` fuerza `status=active`; sin eso el admin no me dejaría entrar, porque `is_active` se copia del estado. Si ya creaste un superusuario antes, este paso no hace falta.

![](images/clipboard-3522673968.png)

**Paso 2. Admin de `client`**

`startapp` ya creó `apps/client/admin.py` con un comentario, así que reescribí el archivo entero. `Client` no tiene contraseña: no es un usuario del sistema, así que el formulario no pide credenciales.

``` python
from django.contrib import admin

from apps.client.models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "document_type",
        "document_number",
        "email",
        "phone",
        "status",
        "created_at",
    )
    list_filter = ("status", "document_type")
    search_fields = ("name", "document_number", "email", "phone")
    list_editable = ("status",)
    ordering = ("name", "email")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Información del cliente",
            {"fields": ("document_type", "document_number", "name", "email", "phone")},
        ),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
```

![](images/clipboard-1852274450.png)

**Paso 3. Admin de `trainer` y `plan`**

Archivo `apps/trainer/admin.py`:

``` python
from django.contrib import admin

from apps.trainer.models import Trainer


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ("name", "specialty", "email", "phone", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "email", "phone", "specialty")
    list_editable = ("status",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Información del entrenador",
            {"fields": ("name", "specialty", "email", "phone")},
        ),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    ))
```

![](images/clipboard-2662137461.png)

Archivo `apps/plan/admin.py`:

``` python
from django.contrib import admin

from apps.plan.models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "description")
    list_editable = ("status",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "description", "status")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
```

![](images/clipboard-332302211.png)

**Paso 4. Admin de `routine`**

Archivo `apps/routine/admin.py`. Uso `autocomplete_fields` para elegir cliente, entrenador, rutina y ejercicio con un buscador en vez de un desplegable enorme. Django solo lo acepta si el admin del modelo relacionado define `search_fields`, y todos los míos lo hacen. `get_queryset` con `select_related` evita consultar las relaciones una vez por fila.

``` python
from django.contrib import admin

from apps.routine.models import Exercise, Routine, RoutineExercise


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("name", "muscle_group", "status", "created_at")
    list_filter = ("status", "muscle_group")
    search_fields = ("name", "description", "muscle_group")
    list_editable = ("status",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "description", "muscle_group", "status")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "trainer", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "client__name", "trainer__name")
    list_editable = ("status",)
    ordering = ("name",)
    autocomplete_fields = ("client", "trainer")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Información", {"fields": ("name", "description", "client", "trainer")}),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "trainer")


@admin.register(RoutineExercise)
class RoutineExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "routine",
        "exercise",
        "sets",
        "repetitions",
        "weight",
        "rest_seconds",
        "status",
    )
    list_filter = ("status", "muscle_group")
    search_fields = ("routine__name", "exercise__name", "name")
    list_editable = ("sets", "repetitions", "weight", "rest_seconds", "status")
    autocomplete_fields = ("routine", "exercise")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asignación", {"fields": ("routine", "exercise")}),
        ("Series y carga", {"fields": ("sets", "repetitions", "weight", "rest_seconds")}),
        ("Descripción", {"fields": ("name", "description", "muscle_group")}),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("routine", "exercise")
```

![](images/clipboard-3100253988.png)

**Paso 5. Admin de `measurement`**

Archivo `apps/measurement/admin.py`. Esta tabla no tiene `status`, así que no hay filtro de estado: uso `date_hierarchy` para recorrerla por fecha.

``` python
from django.contrib import admin

from apps.measurement.models import Measurement


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "trainer",
        "weight",
        "height",
        "body_fat",
        "bmi",
        "created_at",
    )
    search_fields = ("client__name", "trainer__name")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    autocomplete_fields = ("client", "trainer")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asignación", {"fields": ("client", "trainer")}),
        ("Medidas", {"fields": ("weight", "height", "body_fat", "bmi")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "trainer")
```

![](images/clipboard-1585880910.png)

**Paso 6. Admin de `membership`**

Archivo `apps/membership/admin.py`. Aquí aplico la regla de la unidad: la membresía y el pago son de solo lectura y no se agregan ni se borran. Una membresía creada en el admin no pasaría por la transacción que valida al cliente, al plan y el cruce de fechas, y un pago creado a mano tampoco. Además, cambiar el `status` desde la lista no desactivaría los pagos como lo hace `void()`. La asistencia, en cambio, es un registro simple sin reglas de transacción, así que sí se puede crear y editar desde el admin.

``` python
from django.contrib import admin

from apps.membership.models import Attendance, Membership, Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    can_delete = False
    show_change_link = True
    fields = ("method", "amount", "payment_date", "status")
    readonly_fields = ("method", "amount", "payment_date", "status")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "plan", "start_date", "end_date", "status")
    list_filter = ("status", "start_date", "plan")
    search_fields = ("client__name", "client__email", "plan__name")
    ordering = ("-start_date",)
    date_hierarchy = "start_date"
    readonly_fields = (
        "client",
        "plan",
        "start_date",
        "end_date",
        "status",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        ("Información de la membresía", {"fields": ("client", "plan", "status")}),
        ("Vigencia", {"fields": ("start_date", "end_date"), "classes": ("collapse",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    inlines = (PaymentInline,)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "plan")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("membership", "method", "amount", "payment_date", "status")
    list_filter = ("status", "method", "payment_date")
    search_fields = ("membership__client__name", "method")
    ordering = ("-payment_date", "id")
    readonly_fields = (
        "membership",
        "method",
        "amount",
        "payment_date",
        "status",
    )
    fieldsets = (
        ("Pago", {"fields": ("membership", "method", "amount", "payment_date")}),
        ("Estado", {"fields": ("status",)}),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "membership", "membership__client"
        )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("membership", "type", "attendance_date", "created_at")
    list_filter = ("type", "attendance_date")
    search_fields = ("membership__client__name", "type")
    ordering = ("-attendance_date",)
    date_hierarchy = "attendance_date"
    autocomplete_fields = ("membership",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asistencia", {"fields": ("membership", "type", "attendance_date")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "membership", "membership__client"
        )
```

![](images/clipboard-2724648489.png)

**Paso 7. Verificar**

```         
python manage.py check 
python manage.py runserver
```

![](images/clipboard-3506842402.png)

Con el servidor corriendo abrí [`http://127.0.0.1:8000/admin/`](http://127.0.0.1:8000/admin/), entré con el superusuario y abrí cada modelo de negocio.

![](images/clipboard-1413644355.png)

#### Explicación

Registré los modelos con `@admin.register`, que hace lo mismo que `admin.site.register(Modelo, Clase)` pero deja el registro pegado a la clase. Cada admin define lo mismo: `list_display` (las columnas), `list_filter` (la barra lateral), `search_fields` (el cuadro de búsqueda, donde el doble guion bajo cruza una relación, como `client__name`), `ordering` y, en los formularios, `fieldsets` para agruparlos con las fechas de auditoría plegadas.

`list_editable` me deja cambiar el estado desde la lista sin abrir la ficha. Django no permite que el primer campo de `list_display` sea editable, porque es el enlace a la ficha, por eso pongo primero `name` o `routine`. Para las membresías y los pagos apagué `has_add_permission` y `has_delete_permission` y puse todos los campos en `readonly_fields`: la membresía se crea con `POST /api/memberships/` y se anula con `DELETE`, que llama a `void()`. En las medidas y asistencias no hace falta ese cuidado, porque no hay una transacción detrás.

El admin usa sesión y CSRF, no es la API. Sirve para mirar y, en clientes y catálogos, para corregir datos, pero no reemplaza a la API. Tampoco registré el usuario de `security`: su admin llega más adelante con la parte de autenticación.

```         
/admin/
   │
   ├── Client, Trainer, Plan, Exercise, Routine, RoutineExercise   lista + formulario
   ├── Measurement                                                 lista + formulario, por fecha
   ├── Attendance                                                  lista + formulario
   └── Membership, Payment                                         solo lectura, sin alta ni borrado
```

#### Criterios de aceptación

- **AC-13-01:** las diez tablas de negocio están registradas, con `list_display`, `list_filter` (o `date_hierarchy`) y `search_fields`.

- **AC-13-02:** el formulario de cliente agrupa sus campos y no pide contraseña.

- **AC-13-03:** `Membership` y `Payment` no se agregan ni se borran desde el admin, y el inline de pagos no crea filas.

- **AC-13-04:** `Measurement` no ofrece filtro por estado, porque su tabla no tiene `status`.

- **AC-13-05:** `python manage.py check` no reporta errores de autocompletado.

#### Verificación

```         
python manage.py check
```

Y entrar a `/admin/` con el superusuario. En clientes, entrenadores, planes, ejercicios, rutinas, medidas y asistencias debe haber botón de agregar. En membresías y pagos, no.

#### GATE

- **AC-13-01:** las diez tablas aparecen en el admin. **PASS**

- **AC-13-02:** el formulario de cliente no tiene contraseña. **PASS**.

- **AC-13-03:** sin alta ni borrado en membresías y pagos. **PASS**.

- **AC-13-04:** medidas sin filtro de estado. **PASS**.

- **AC-13-05:** `check` sin errores. **PASS**.

### ISS-14 — OpenAPI

**Narrativa**

Con la API de ActivaFit funcionando, necesitaba un contrato que cualquiera pudiera consultar sin leer mi código. En lugar de escribir un archivo YAML a mano, que se desactualiza en cuanto cambio una vista, usé `drf-spectacular`, que lee mis vistas y mis serializers y genera el esquema OpenAPI por sí solo. Con ese esquema también quedó disponible Swagger UI, una página donde puedo probar cada endpoint desde el navegador. Como todavía no tengo autenticación, todo sigue en acceso abierto, y el único ajuste que tuve que hacer a mano fue describir con `extend_schema` las vistas que construyen su serializer por dentro, porque spectacular no puede adivinar su forma.

**Objetivo**

Publicar el contrato de la API en un esquema que se genere desde las vistas, no desde un YAML escrito a mano.

**Requisitos**

- ISS-13 superado.

- Terminal con el entorno virtual `.venv` activo.

- `drf-spectacular` 0.30.

#### Construcción

**Paso 0. Activar el entorno e instalar `drf-spectacular`**

Fijé la versión: sin pin, `pip` puede subir a una serie que ya no cubre mi versión de DRF.

```         
source .venv/bin/activate 
python -m pip install "drf-spectacular==0.30.0" 
python -m pip freeze > requirements.txt
```

![](images/clipboard-606298142.png)

El paquete se llama `drf-spectacular` en pip y `drf_spectacular` en Python. En los settings y en las rutas uso el nombre con guion bajo.

**Paso 1. Parchear `config/settings/__init__.py`**

El archivo ya existe y todavía no tiene JWT en `REST_FRAMEWORK`: eso llega más adelante. Aquí solo registro el esquema.

Debajo de `"rest_framework",` en `INSTALLED_APPS` agregué:

``` python
    "drf_spectacular",
```

Dentro de `REST_FRAMEWORK`, debajo de la lista `DEFAULT_PARSER_CLASSES`, agregué:

``` python
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
```

Y al final del archivo agregué:

``` python
SPECTACULAR_SETTINGS = {
    "TITLE": "ActivaFit API",
    "DESCRIPTION": "API REST de ActivaFit, sistema de gestión de gimnasio.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "CAMELIZE_NAMES": True,
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
        "drf_spectacular.contrib.djangorestframework_camel_case.camelize_serializer_fields",
    ],
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    "SWAGGER_UI_SETTINGS": {"persistAuthorization": True},
}
```

![](images/clipboard-1306214411.png)

`SERVE_PERMISSIONS` deja el esquema en acceso abierto. El hook `camelize_serializer_fields` alinea el esquema con el JSON camelCase (`createdAt`). `SERVE_INCLUDE_SCHEMA` en falso evita duplicar el esquema dentro de Swagger.

**Paso 2. Agregar las rutas del esquema**

El esquema no pertenece a una app de negocio, así que sus rutas van en el URLconf raíz, `config/urls.py`, y no en el `urls.py` de cada app.

Debajo de la línea `from django.urls import include, path` agregué:

``` python
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
```

Y debajo de `path("admin/", admin.site.urls),`, antes de los `include("apps....")`, agregué:

``` python
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
```

![](images/clipboard-203147138.png)

Quedan delante de los `include` de las apps. Son rutas literales y no chocan con `clients` ni `plans`, pero vivir en el proyecto deja claro que documentan la API completa y no un recurso en particular.

**Paso 3. Describir las vistas que construyen su serializer por dentro**

Spectacular lee serializers, querysets y `extend_schema`. Las vistas de registro de membresías construyen su serializer por dentro (`MembershipRegisterSerializer`), así que no se adivinan: hay que declararlas. Sin eso, `--validate` reportaba errores de serializer.

En `apps/membership/views.py` agregué este import debajo de los demás:

```         
from drf_spectacular.utils import extend_schema
```

Y decoré los métodos de las dos vistas de registro, reemplazando esas dos clases por estas versiones:

``` python
class MembershipRegisterAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=MembershipRegisterSerializer,
        responses={201: MembershipSerializer},
    )
    def post(self, request):
        serializer = MembershipRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        membership = Membership.objects.select_related("client", "plan").prefetch_related(
            "payments"
        ).get(pk=membership.pk)
        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class MembershipCollectionAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=MembershipSerializer(many=True))
    def get(self, request, *args, **kwargs):
        memberships = MembershipReadViewSet.queryset.all()
        return Response(MembershipSerializer(memberships, many=True).data)

    @extend_schema(
        request=MembershipRegisterSerializer,
        responses={201: MembershipSerializer},
    )
    def post(self, request, *args, **kwargs):
        handler = MembershipRegisterAPIView()
        handler.request = request
        handler.format_kwarg = None
        handler.args = ()
        handler.kwargs = {}
        return handler.post(request)
```

![](images/clipboard-1826402087.png)

**Paso 4. Generar y validar el esquema**

```         
python manage.py spectacular --file /tmp/activafit-schema.yml --validate
```

![](images/clipboard-3509973758.png)

Si termina sin errores, el esquema es válido. Puede mostrar algunos avisos (`Warning`) sobre tipos que no pudo deducir; los errores son lo que importa, y se revisan con el código de salida (`echo $?` debe mostrar `0`).

#### Explicación

Spectacular recorre mis vistas, lee sus serializers y sus querysets, y escribe OpenAPI. Los `ModelViewSet` y los `ListAPIView` se describen solos, porque tienen `serializer_class` y `queryset`. Una `APIView` que construye el serializer por dentro no se adivina: por eso las dos vistas de registro de membresías llevan `extend_schema`. Más adelante, el login, el refresh y el logout necesitarán lo mismo.

El esquema no hereda el permiso global del proyecto: `SERVE_PERMISSIONS` lo deja abierto aparte. Cuando agregue autenticación, esta documentación seguirá abierta, y solo los endpoints de negocio exigirán token.

```         
GET /api/schema/              el esquema OpenAPI
GET /api/schema/swagger-ui/   Swagger UI, para probar cada endpoint
GET /api/schema/redoc/        la misma documentación en formato Redoc
```

#### Cómo probarlo

Para ver el resultado hace falta el servidor. Los comportamientos de negocio (transacción, rollback, baja lógica) siguen afirmados por las pruebas automáticas de los ISS anteriores. Swagger sirve para recorrer la API a mano, sobre la misma capa abierta.

```         
python manage.py runserver
```

Abrí [`http://127.0.0.1:8000/api/schema/swagger-ui/`](http://127.0.0.1:8000/api/schema/swagger-ui/). No hay botón Authorize que pulsar: todavía no hay token. Ahí deben aparecer todos los recursos:

```         
swagger-ui                        sin token
      │
      ├── /api/clients/            POST, GET, GET/{id}, PATCH, DELETE
      ├── /api/trainers/           el mismo CRUD
      ├── /api/plans/              el mismo CRUD
      ├── /api/exercises/          el mismo CRUD
      ├── /api/routines/           el mismo CRUD
      ├── /api/routine-exercises/  el mismo CRUD
      ├── /api/measurements/       el mismo CRUD (DELETE real)
      ├── /api/attendances/        el mismo CRUD (DELETE real)
      ├── GET /api/memberships/active/
      └── /api/memberships/        POST y GET
          GET y DELETE /api/memberships/{id}/
                  │
                  └── payments     sin ruta propia, viajan dentro de la membresía
```

![](images/clipboard-1019123325.png)

![](images/clipboard-257307886.png)

![](images/clipboard-2522262333.png)

![](images/clipboard-322188096.png)

#### Criterios de aceptación

- **AC-14-01:** `spectacular --validate` termina sin errores.

- **AC-14-02:** Swagger y el esquema son accesibles sin Bearer.

- **AC-14-03:** el esquema describe el cuerpo en camelCase.

#### Verificación

`python manage.py spectacular --validate` salió con código 0 después de agregar los `extend_schema`. Además, abrí Swagger y comprobé que aparecían todos los recursos de la lista de arriba.

#### GATE

- **AC-14-01:** `--validate` sin errores. **PASS**.

- **AC-14-02:** `SERVE_PERMISSIONS` en `AllowAny`. **PASS**.

- **AC-14-03:** el hook camelCase está en `SPECTACULAR_SETTINGS`. **PASS**.

### ISS-15 — RefreshToken

**Narrativa**

Con la Fase I cerrada, empecé la parte de seguridad de ActivaFit. Lo primero que necesitaba era decidir cómo recordar las sesiones. El access token (el que se manda en cada petición) es un JWT y se verifica solo con su firma y su fecha de expiración, así que no necesita una fila en la base de datos. El refresh token (el que sirve para pedir un access nuevo) sí tiene que poder revocarse, y para eso necesita guardarse. Para guardarlo creé la tabla `refresh_tokens`, pero no guardo el token en claro: guardo su hash SHA-256. Así, si alguien viera la tabla, no podría usar esos valores como sesiones. Tampoco usé la lista negra de SimpleJWT: la rotación de tokens la implemento yo, con mi propia tabla.

**Objetivo**

Persistir la sesión de refresh sin guardar el token en claro y sin usar la lista negra (blacklist) de SimpleJWT como almacén.

**Requisitos**

- Cierre de la Fase I superado.

- Terminal con el entorno virtual `.venv` activo.

- El modelo `User` ya existe desde el ISS-03.

#### Construcción

**Paso 0. Activar el entorno e instalar SimpleJWT**

SimpleJWT entra aquí, antes del login. Solo lo uso para emitir y verificar el access token. No instalo `rest_framework_simplejwt.token_blacklist`: el refresh de ActivaFit vive en la tabla `refresh_tokens`, no en esa app.

```         
source .venv/bin/activate 
python -m pip install "djangorestframework-simplejwt==5.5.1" 
python -m pip freeze > requirements.txt
```

![](images/clipboard-1649738058.png)

El paquete en pip es `djangorestframework-simplejwt`, y en `INSTALLED_APPS` el nombre es `rest_framework_simplejwt`. `PyJWT` llega como dependencia, así que no lo instalo aparte.

**Paso 1. Crear `apps/security/tokens.py`**

Es un archivo nuevo. Genera el valor del refresh con `secrets.token_urlsafe` y calcula su hash SHA-256 en hexadecimal.

``` python
import hashlib
import secrets


def generate_refresh_value():
    return secrets.token_urlsafe(48)


def hash_token(raw_token):
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
```

![](images/clipboard-4158612146.png)

**Paso 2. Agregar el modelo `RefreshToken`**

El archivo `apps/security/models.py` ya tiene `User`, y no se reescribe. Primero reemplacé la primera línea de imports, `from django.contrib.auth.models import AbstractUser, UserManager`, por este bloque:

``` python
import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils import timezone
```

Las demás líneas de imports (`from django.db import models` y `from apps.common.status import RecordStatus`) se quedan como estaban. Después pegué la clase `RefreshToken` al final del archivo, debajo de `User`:

``` python
class RefreshToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="refresh_tokens",
        db_column="user_id",
    )
    token_hash = models.CharField(max_length=64, unique=True)
    family_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    replaced_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="replacements",
    )
    status = models.CharField(
        max_length=8,
        choices=RecordStatus.choices,
        default=RecordStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "refresh_tokens"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="refresh_tokens_status_valid",
            )
        ]

    def __str__(self):
        return f"{self.user} {self.family_id}"

    @property
    def is_usable(self):
        return (
            self.status == RecordStatus.ACTIVE
            and self.revoked_at is None
            and self.replaced_by_id is None
            and self.expires_at > timezone.now()
        )

    @classmethod
    def lifetime(cls):
        return settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

    @classmethod
    def default_expiry(cls):
        return timezone.now() + cls.lifetime()
```

![](images/clipboard-1019814411.png)

**Paso 3. Parchear `config/settings/__init__.py`**

Encima de la línea `import os` agregué:

```         
from datetime import timedelta
```

Debajo de `"rest_framework",` en `INSTALLED_APPS` agregué:

```         
    "rest_framework_simplejwt",
```

Y al final del archivo agregué:

``` python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}
```

![](images/clipboard-3088702608.png)

`ROTATE_REFRESH_TOKENS` y `BLACKLIST_AFTER_ROTATION` quedan en `False` porque la rotación es mía, no la de SimpleJWT. El `SIGNING_KEY` usa la `SECRET_KEY` que ya está definida más arriba en el archivo.

**Paso 4. Generar la migración y migrar**

```         
python manage.py makemigrations security 
python manage.py migrate
```

Debe crear la migración `0002` de `security` y aplicarla. La tabla se llama `refresh_tokens`.

![](images/clipboard-3210762538.png)

**Paso 5. Verificar el sistema**

```         
python manage.py check
```

![](images/clipboard-1733632345.png)

#### Explicación

El access token es un JWT: se verifica con la firma y la expiración, y no necesita una fila. El refresh tiene que poder revocarse, así que necesita estado en la base de datos. Si guardara el refresh en claro, la tabla serviría como si fuera la sesión misma. El hash SHA-256 no se puede invertir: para usarlo haría falta el valor original, que solo ve el cliente en la respuesta del login.

```         
refresh en claro  --solo en la respuesta--
        │
        ▼
SHA-256 → refresh_tokens.token_hash
```

Los campos `family_id` y `replaced_by` no se usan todavía: sirven para la rotación, que llega con el ISS-18. `family_id` agrupa todos los tokens que descienden de un mismo login, y `replaced_by` apunta al token que reemplazó a otro. La propiedad `is_usable` junta las condiciones para aceptar un refresh: activo, sin revocar, sin reemplazar y sin vencer.

El `status` de este modelo nace `active`, y es la excepción del proyecto: el token acaba de nacer de un login válido, mientras que el resto de entidades nace `inactive`. La clave foránea a `User` usa `RESTRICT`, así que no se puede borrar un usuario que tenga tokens.

#### Criterios de aceptación

- **AC-15-01:** después del login hay una fila y su `token_hash` no es el refresh devuelto.

- **AC-15-02:** el hash coincide con el SHA-256 del valor devuelto.

- **AC-15-03:** la respuesta del login no contiene `password`.

#### Verificación

La guía comprueba estos criterios con `AuthFlowTests.test_login_with_username_and_email`, pero esa prueba necesita el endpoint de login, que se construye en el ISS-17. Por ahora verifico el modelo y el hash en la consola de Django:

```         
python manage.py shell
```

```         
import hashlib
from apps.security.models import RefreshToken, User
from apps.security.tokens import generate_refresh_value, hash_token

user = User.objects.create_user(username="prueba_rt", email="rt@activafit.com", password="Prueba123*")
raw = generate_refresh_value()
rt = RefreshToken.objects.create(user=user, token_hash=hash_token(raw), expires_at=RefreshToken.default_expiry())
rt.token_hash != raw
len(rt.token_hash)
rt.token_hash == hashlib.sha256(raw.encode()).hexdigest()
rt.status
rt.is_usable
```

- `rt.token_hash != raw` debe dar `True`: lo guardado no es el valor en claro.

- `len(rt.token_hash)` debe dar `64`.

- La comparación con `hashlib` debe dar `True`: el hash coincide con el SHA-256 del valor.

- `rt.status` debe dar `'active'` y `rt.is_usable` debe dar `True`.

Para limpiar, en este orden, porque la clave foránea es `RESTRICT`:

```         
rt.delete() 
user.delete()
```

![](images/clipboard-615121721.png)

#### GATE

- **AC-15-01:** la fila existe y su hash es distinto del valor en claro (comprobado en el shell). **PASS parcial**, se completa con el login del ISS-17.

- **AC-15-02:** el hash coincide con el SHA-256 (comprobado en el shell). **PASS parcial**, se completa con el login del ISS-17.

- **AC-15-03:** la respuesta sin `password` depende del endpoint de login. **Pendiente** hasta el ISS-17.

### ISS-16 — Role, RoleUser, Resource y ResourceRole

**Narrativa**

Con la tabla de sesiones lista, me faltaba definir quién puede hacer qué en ActivaFit. Django ya trae grupos y permisos, pero la pregunta que necesito responder es otra: dado un método HTTP y una ruta (por ejemplo `DELETE api/memberships/<int:pk>/`), ¿el usuario tiene un rol activo que tenga ese recurso activo? Esa cadena no se expresa bien con las tablas de permisos de Django, así que modelé la mía con cuatro tablas: roles, la asignación de roles a usuarios, recursos (método más ruta) y la asignación de recursos a roles. Todas nacen `inactive`: un eslabón de la cadena no autoriza nada hasta que lo active a propósito, y así la regla de “negar por defecto” queda también en los datos y no solo en el código.

**Objetivo**

Modelar la matriz de autorización sin usar Groups ni Permissions de Django como regla de la API.

**Requisitos**

- ISS-15 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Agregar los modelos de autorización**

El archivo `apps/security/models.py` ya tiene `User` y `RefreshToken`. No lo reescribí: agregué estas cinco clases al final, debajo de `RefreshToken`. Los imports que necesitan (`models`, `settings` y `RecordStatus`) ya están desde los ISS anteriores.

Las tablas se llaman `roles`, `role_users`, `resources` y `resource_roles`. Todas tienen `status` con valor por defecto `inactive`. Las parejas `(role, user)`, `(resource, role)` y `(method, route)` son únicas, y las claves foráneas usan `RESTRICT`. `Resource.route` guarda el patrón de la ruta (`api/clients/<int:pk>/`), no el path con el id ya sustituido.

``` python
class HttpMethod(models.TextChoices):
    GET = "GET", "GET"
    POST = "POST", "POST"
    PUT = "PUT", "PUT"
    PATCH = "PATCH", "PATCH"
    DELETE = "DELETE", "DELETE"


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=8, choices=RecordStatus.choices, default=RecordStatus.INACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "roles"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="roles_status_valid",
            )
        ]

    def __str__(self):
        return self.name


class RoleUser(models.Model):
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, related_name="assignments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name="role_links"
    )
    status = models.CharField(
        max_length=8, choices=RecordStatus.choices, default=RecordStatus.INACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "role_users"
        constraints = [
            models.UniqueConstraint(fields=["role", "user"], name="role_user_unique"),
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="role_users_status_valid",
            ),
        ]


class Resource(models.Model):
    name = models.CharField(max_length=150)
    method = models.CharField(max_length=10, choices=HttpMethod.choices)
    route = models.CharField(max_length=255)
    status = models.CharField(
        max_length=8, choices=RecordStatus.choices, default=RecordStatus.INACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resources"
        constraints = [
            models.UniqueConstraint(fields=["method", "route"], name="resource_method_route_uniq"),
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="resources_status_valid",
            ),
        ]

    def __str__(self):
        return f"{self.method} {self.route}"


class ResourceRole(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.RESTRICT, related_name="grants")
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, related_name="grants")
    status = models.CharField(
        max_length=8, choices=RecordStatus.choices, default=RecordStatus.INACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resource_roles"
        constraints = [
            models.UniqueConstraint(fields=["resource", "role"], name="resource_role_unique"),
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="resource_roles_status_valid",
            ),
        ]
```

![](images/clipboard-4108806277.png)

`Resource.method` es un `TextChoices` con los métodos HTTP. Y `Resource.route` guarda el patrón, no el path real: cuando más adelante cargue los recursos, el patrón lo obtendré con `resolve(path).route`.

**Paso 2. Generar la migración y migrar**

```         
python manage.py makemigrations security
python manage.py migrate
```

Debe crear la siguiente migración de `security` (probablemente la `0003`) con las cuatro tablas nuevas.

![](images/clipboard-2724637828.png)

**Paso 3. Verificar el sistema**

```         
python manage.py check
```

![](images/clipboard-2100491443.png)

#### Explicación

Django ya tiene grupos y permisos, pero la pregunta de ActivaFit es distinta: dado un método y un patrón de ruta, ¿está activa toda la cadena de usuario a rol y de rol a recurso? Esa cadena no se expresa con `auth_permission`, por eso modelé la mía.

```         
User → RoleUser → Role → ResourceRole → Resource(method, route)
```

Un eslabón que nace `inactive` no autoriza. Hay que activarlo a propósito, y esa es la forma de negar por defecto también en los datos. Las restricciones únicas evitan filas repetidas: un usuario no puede tener dos veces el mismo rol, ni un rol el mismo recurso, ni existir dos recursos con el mismo método y la misma ruta. Y como las claves foráneas usan `RESTRICT`, no puedo borrar un rol que tenga usuarios o recursos asignados.

#### Criterios de aceptación

- **AC-16-01:** las cuatro tablas existen.

- **AC-16-02:** no se puede repetir la pareja rol-usuario ni la pareja recurso-rol.

- **AC-16-03:** la ruta de un recurso se guarda como patrón (`api/clients/<int:pk>/`), no como el ejemplo con el id sustituido.

#### Verificación

La guía comprueba estos criterios con el comando `seed_rbac`, que se construye mucho más adelante (ISS-24). Por ahora los verifico en la consola de Django:

```         
python manage.py showmigrations security 
python manage.py shell
```

`showmigrations` debe mostrar todas las migraciones de `security` con una `[X]`. Dentro del shell:

```         
from django.db import IntegrityError, transaction
from django.db.models import RestrictedError
from django.urls import resolve
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User

user = User.objects.create_user(username="prueba_rbac", email="rbac@activafit.com", password="Prueba123*")
role = Role.objects.create(name="Recepcionista")
resource = Resource.objects.create(name="Listar clientes", method="GET", route="api/clients/")
RoleUser.objects.create(role=role, user=user)
ResourceRole.objects.create(resource=resource, role=role)
role.status
resolve("/api/clients/1/").route
resolve("/api/memberships/1/").route
```

- `role.status` debe dar `'inactive'`.

- Las dos llamadas a `resolve` deben dar `'api/clients/<int:pk>/'` y `'api/memberships/<int:pk>/'`: ese es el patrón que guardaré en `Resource.route`.

![](images/clipboard-1619432037.png)

Ahora las parejas repetidas deben rechazarse (pulsa Enter dos veces tras cada bloque):

```         
try:
    with transaction.atomic():
        RoleUser.objects.create(role=role, user=user)
except IntegrityError as e:
    print("Rechazado:", e)
```

```         
try:
    with transaction.atomic():
        ResourceRole.objects.create(resource=resource, role=role)
except IntegrityError as e:
    print("Rechazado:", e)
```

```         
try:
    with transaction.atomic():
        Resource.objects.create(name="Otro", method="GET", route="api/clients/")
except IntegrityError as e:
    print("Rechazado:", e)
```

![](images/clipboard-2822569479.png)

Y el borrado restringido:

```         
try:
    role.delete()
except RestrictedError as e:
    print("Restringido:", e)
```

Para limpiar, en este orden por las claves foráneas:

```         
ResourceRole.objects.all().delete()
RoleUser.objects.all().delete()
Resource.objects.all().delete()
Role.objects.all().delete()
user.delete()
```

![](images/clipboard-209801750.png)

#### GATE

- **AC-16-01:** la migración está aplicada y las cuatro tablas existen. **PASS**.

- **AC-16-02:** `IntegrityError` al repetir las parejas. **PASS**.

- **AC-16-03:** `resolve(...).route` devuelve el patrón con `<int:pk>`. **PASS parcial**, se completa cuando construya el comando que carga los recursos (ISS-24).

### ISS-17 — Login OPEN

**Narrativa**

Con las tablas de sesiones y de permisos listas, construí la puerta de entrada de ActivaFit: el login. Es el primero de los tres niveles de acceso de la Fase II, el nivel OPEN: no pide ningún token, porque justamente su trabajo es entregar el primero. El usuario se identifica con su `username` o con su correo, más la contraseña, y si todo es correcto recibe un access token (el que usará en cada petición) y un refresh token (el que servirá para renovar la sesión). Los otros dos niveles llegan después: JWT con token para consultar el perfil (ISS-20) y JWT con token más permisos por rol para el negocio (ISS-22).

**Objetivo**

Demostrar la identidad por `username` o correo y entregar un access token y un refresh token.

**Requisitos**

- ISS-16 superado.

- Terminal con el entorno virtual `.venv` activo.

- El login no puede exigir un access token: todavía no existe.

#### Construcción

**Paso 1. Crear los serializers de autenticación**

El archivo `apps/security/serializers.py` no existe todavía. Lo creé ahora, con el serializer del login y los que van a usar el refresh y el logout en los ISS siguientes:

``` python
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if not attrs.get("username") and not attrs.get("email"):
            raise serializers.ValidationError(
                "Informe username o email junto con password."
            )
        return attrs


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    token_type = serializers.CharField()
    access_expires_in = serializers.IntegerField()
```

![](images/clipboard-2418501905.png)

**Paso 2. Crear la vista del login**

El archivo `apps/security/auth_views.py` tampoco existe. En este ISS solo tiene el login y dos funciones auxiliares (`token_payload` e `issue_refresh`) que el refresh y el logout van a reutilizar; esas dos vistas se agregan al final en los ISS-18 y ISS-19. Agregué además el decorador `extend_schema` de spectacular, para que `--validate` del ISS-14 siga pasando.

``` python
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

from apps.common.status import RecordStatus
from apps.security.models import RefreshToken
from apps.security.serializers import LoginSerializer, TokenPairSerializer
from apps.security.tokens import generate_refresh_value, hash_token

User = get_user_model()


def token_payload(user, raw_refresh):
    access = AccessToken.for_user(user)
    lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
    return {
        "access": str(access),
        "refresh": raw_refresh,
        "token_type": "Bearer",
        "access_expires_in": lifetime,
    }


def issue_refresh(user, family_id=None):
    raw_refresh = generate_refresh_value()
    stored = RefreshToken.objects.create(
        user=user,
        token_hash=hash_token(raw_refresh),
        family_id=family_id or uuid.uuid4(),
        expires_at=RefreshToken.default_expiry(),
        status=RecordStatus.ACTIVE,
    )
    return stored, raw_refresh


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: TokenPairSerializer},
        auth=[],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = _find_user(data.get("username"), data.get("email"))
        invalid = Response(
            {"detail": "Credenciales inválidas."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
        if user is None or user.status != RecordStatus.ACTIVE:
            return invalid
        if not user.check_password(data["password"]):
            return invalid
        _stored, raw_refresh = issue_refresh(user)
        return Response(token_payload(user, raw_refresh), status=status.HTTP_200_OK)


def _find_user(username, email):
    if username and email:
        return User.objects.filter(username=username, email__iexact=email).first()
    if username:
        return User.objects.filter(username=username).first()
    if email:
        return User.objects.filter(email__iexact=email).first()
    return None
```

![](images/clipboard-1962717143.png)

**Paso 3. Crear las rutas de `security`**

Archivo `apps/security/urls.py`:

``` python
from django.urls import path

from apps.security.auth_views import LoginAPIView

urlpatterns = [
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
]
```

![](images/clipboard-1121200552.png)

Y en `config/urls.py`, debajo de los demás `path("api/", include("apps...."))`, agregué:

```         
path("api/", include("apps.security.urls")),
```

La ruta `auth/login/` vive en la app `security`, y el proyecto solo agrega otro `include` bajo `api/`. El refresh, el logout, el perfil y el CRUD de la matriz se agregan a este mismo `urlpatterns` en los ISS siguientes; no se abre un segundo archivo de rutas.

**Paso 4. Crear los datos de apoyo para las pruebas**

El test necesita un usuario activo. Todavía no existe el archivo de ayudas de pruebas, así que lo creé ahora con solo lo necesario. El ISS-22 lo completará con más ayudas, sin borrar esto. Archivo `apps/common/testing.py`:

```         
from apps.common.status import RecordStatus
from apps.security.models import User

PASSWORD = "ActivaFit-Test-1"


def create_active_user(username="ana", email="ana@activafit.test", password=PASSWORD):
    return User.objects.create_user(
        username=username,
        email=email,
        password=password,
        status=RecordStatus.ACTIVE,
    )
```

![](images/clipboard-4096078610.png)

**Paso 5. Escribir las pruebas**

El archivo `apps/security/tests.py` ya tiene `DatabaseSelectionTests` desde el ISS-03; no lo reescribí. Debajo de la línea `from config.database import database_from_environ` agregué estos imports:

```         
from rest_framework import status
from rest_framework.test import APITestCase

from apps.common.status import RecordStatus
from apps.common.testing import PASSWORD, create_active_user
from apps.security.models import RefreshToken
from apps.security.tokens import hash_token
```

Y al final del archivo agregué la clase nueva. El login es abierto, así que el test no usa `force_authenticate`. La guía solo comprueba el usuario inactivo en el segundo test; yo le agregué el caso de la clave incorrecta, para cubrir el criterio AC-17-04 completo.

``` python
class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = create_active_user()

    def test_login_with_username_and_email(self):
        by_username = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(by_username.status_code, status.HTTP_200_OK)
        self.assertIn("access", by_username.data)
        self.assertIn("refresh", by_username.data)
        self.assertNotIn("password", by_username.data)
        stored = RefreshToken.objects.get()
        self.assertEqual(stored.token_hash, hash_token(by_username.data["refresh"]))

        by_email = self.client.post(
            "/api/auth/login/",
            {"email": "ANA@activafit.test", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(by_email.status_code, status.HTTP_200_OK)

    def test_inactive_user_and_bad_password_are_401(self):
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        inactive = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(inactive.status_code, status.HTTP_401_UNAUTHORIZED)

        self.user.status = RecordStatus.ACTIVE
        self.user.save()
        bad = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": "otra-clave"},
            format="json",
        )
        self.assertEqual(bad.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(bad.data["detail"], inactive.data["detail"])
```

![](images/clipboard-848032077.png)

**Paso 6. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.AuthFlowTests
```

Debe terminar con `Ran 2 tests` y `OK`. Si corres todo el módulo con `python manage.py test apps.security`, deben salir `Ran 8 tests` (los 6 de selección del motor y estos 2).

![](images/clipboard-759180218.png)

#### Explicación

Usé una `APIView` porque el flujo no es un alta de `User`: crear usuarios es otro endpoint y exigirá permisos por rol. El login consulta `users` y escribe en `refresh_tokens`; aunque es abierto, toca tablas de seguridad.

Vaciar `authentication_classes` evita que un Bearer vencido, enviado por costumbre, haga rechazar el login antes de leer el cuerpo. Usuario inexistente, usuario inactivo y clave incorrecta responden exactamente el mismo 401: no digo cuál de los tres falló, para no ayudar a quien intente adivinar cuentas. El access token sale de SimpleJWT, no se guarda en la base de datos y dura 60 minutos. El refresh se genera, se devuelve una sola vez en claro, y en la tabla queda solo su hash.

```         
POST /api/auth/login/
        │
        ▼
username o email
        │
        ▼
¿user active?
        │
        ▼
check_password()
        │
        ├── no → 401 "Credenciales inválidas."
        └── sí → AccessToken.for_user + hash del refresh
```

#### Cómo probarlo

Capa HTTP, acceso abierto. El test crea el usuario con `create_active_user` y llama al login sin autenticarse. La base de prueba aísla la fila de `refresh_tokens`: `RefreshToken.objects.get()` ve solo la de ese test.

```         
python manage.py test apps.security.tests.AuthFlowTests
        │
        ▼
POST /api/auth/login/          sin token
        │
        ├── username + password        200   access y refresh; el hash queda en refresh_tokens
        ├── correo en otro caso        200
        ├── usuario inactive           401
        └── clave distinta             401   el mismo mensaje
```

Para verlo a mano, con el servidor corriendo (`python manage.py runserver`) y un usuario activo (por ejemplo tu superusuario), en otra terminal:

```         
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"TU_USUARIO","password":"TU_CLAVE"}'
```

Debe responder con `access`, `refresh`, `tokenType` y `accessExpiresIn` (en camelCase). Si la clave es incorrecta, responde 401 con `Credenciales inválidas.` Ese refresh y esa fila quedan en tu base de datos real. Swagger también sirve: en `/api/schema/swagger-ui/` aparece `POST /api/auth/login/` y se puede pulsar sin autorizar nada.

![](images/clipboard-769792779.png)

![](images/clipboard-2237700124.png)

![](images/clipboard-4012853095.png)

![](images/clipboard-995857340.png)

#### Criterios de aceptación

- **AC-17-01:** `username` y `password` correctos responden 200 con `access` y `refresh`.

- **AC-17-02:** el correo, aunque venga en otras mayúsculas, también entra.

- **AC-17-03:** un usuario `inactive` responde 401.

- **AC-17-04:** una clave incorrecta responde 401.

- **AC-17-05:** el JSON no trae `password`.

#### Verificación

`AuthFlowTests.test_login_with_username_and_email` y `test_inactive_user_and_bad_password_are_401`, con el comando del Paso 6.

#### GATE

- **AC-17-01:** login con `username`. **PASS**.

- **AC-17-02:** login con correo. **PASS**.

- **AC-17-03:** usuario inactivo. **PASS**.

- **AC-17-04:** clave incorrecta. **PASS**.

- **AC-17-05:** sin `password` en la respuesta. **PASS**.

### ISS-18 — Refresh con rotación

**Narrativa**

El login me entregó un refresh token, pero un refresh que se puede usar mil veces es casi una contraseña de larga duración: si alguien lo roba, tiene la sesión para siempre. En esta unidad hice que cada refresh sirva una sola vez. Cuando el cliente lo presenta, le entrego un par nuevo y dejo marcado el viejo como reemplazado. Y si alguien presenta un token que ya fue reemplazado, asumo lo peor: que hay dos copias circulando. En ese caso apago toda la familia de tokens, incluida la que acababa de entregar al cliente legítimo, que tendrá que volver a hacer login. Prefiero molestar a un usuario honesto antes que dejar viva una sesión robada.

**Objetivo**

Cambiar el refresh en cada uso y tratar la reutilización de uno viejo como una revocación de toda la familia.

**Requisitos**

- SS-17 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Agregar la ruta**

En `apps/security/urls.py` cambié el import de las vistas, que ahora trae también `RefreshAPIView`:

```         
from apps.security.auth_views import LoginAPIView, RefreshAPIView
```

Y debajo de la ruta del login agregué:

``` python
path("auth/refresh/", RefreshAPIView.as_view(), name="auth-refresh"),
```

![](images/clipboard-1252122224.png)

`config/urls.py` no se toca: el `include` del ISS-17 ya entrega `api/` a esta lista.

**Paso 2. Agregar la vista a `auth_views.py`**

El archivo ya existe. Primero ajusté los imports. Debajo de la línea `from django.contrib.auth import get_user_model` agregué:

``` python
from django.db import transaction 
from django.utils import timezone
```

Y reemplacé la línea `from apps.security.serializers import LoginSerializer, TokenPairSerializer` por:

```         
from apps.security.serializers import LoginSerializer, RefreshSerializer,
TokenPairSerializer
```

Después agregué la clase nueva y una función auxiliar encima de `def _find_user`. La vista es abierta (sin autenticación, como el login) y busca el token por su hash dentro de una transacción, con `select_for_update` para que dos peticiones simultáneas con el mismo refresh no pasen las dos. Cuando devuelvo el 401 dentro del bloque `atomic`, la transacción se confirma, y por eso la revocación de la familia sí queda guardada.

``` python
class RefreshAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=RefreshSerializer,
        responses={200: TokenPairSerializer},
        auth=[],
    )
    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_hash = hash_token(serializer.validated_data["refresh"])
        invalid = Response(
            {"detail": "Refresh inválido."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
        now = timezone.now()

        with transaction.atomic():
            stored = RefreshToken.objects.select_for_update().filter(token_hash=token_hash).first()
            if stored is None:
                return invalid

            if (
                stored.replaced_by_id is not None
                or stored.revoked_at is not None
                or stored.status != RecordStatus.ACTIVE
            ):
                _revoke_family(stored.family_id, now)
                return invalid

            if stored.expires_at <= now:
                stored.status = RecordStatus.INACTIVE
                stored.save(update_fields=["status", "updated_at"])
                return invalid

            user = stored.user
            if user.status != RecordStatus.ACTIVE:
                stored.status = RecordStatus.INACTIVE
                stored.save(update_fields=["status", "updated_at"])
                return invalid

            new_stored, raw_refresh = issue_refresh(user, family_id=stored.family_id)
            stored.replaced_by = new_stored
            stored.save(update_fields=["replaced_by", "updated_at"])

        return Response(token_payload(user, raw_refresh), status=status.HTTP_200_OK)


def _revoke_family(family_id, now):
    RefreshToken.objects.filter(family_id=family_id, revoked_at__isnull=True).update(
        revoked_at=now,
        status=RecordStatus.INACTIVE,
        updated_at=now,
    )
```

![](images/clipboard-3020396059.png)

La decisión de cada caso queda así:

```         
no existe                         → 401
ya rotado, revocado o inactivo    → revoca la familia → 401
vencido                           → inactiva ese token → 401
usuario inactive                  → inactiva ese token → 401
vigente                           → emite otro par de la misma familia
                                    y marca el anterior replaced_by
```

**Paso 3. Agregar las pruebas**

Las pruebas siguen siendo abiertas y entran en la clase `AuthFlowTests` del ISS-17. Primero agregué dos imports al inicio de `apps/security/tests.py`, encima de las demás líneas de import:

```         
from datetime import timedelta  
from django.utils import timezone
```

Después agregué estos dos métodos al final de la clase `AuthFlowTests`. El primero es el de la guía. El segundo es mío: comprueba que un token vencido no revoca la familia y que un usuario inactivo no puede renovar.

``` python
    def test_refresh_rotates_and_reuse_revokes_family(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        first = login.data["refresh"]
        rotated = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        self.assertEqual(rotated.status_code, status.HTTP_200_OK)
        second = rotated.data["refresh"]
        self.assertNotEqual(first, second)
        reused = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        self.assertEqual(reused.status_code, status.HTTP_401_UNAUTHORIZED)
        after_reuse = self.client.post("/api/auth/refresh/", {"refresh": second}, format="json")
        self.assertEqual(after_reuse.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_expired_or_inactive_user_is_401(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        RefreshToken.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        expired = self.client.post(
            "/api/auth/refresh/", {"refresh": login.data["refresh"]}, format="json"
        )
        self.assertEqual(expired.status_code, status.HTTP_401_UNAUTHORIZED)
        stored = RefreshToken.objects.get()
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertIsNone(stored.revoked_at)

        second_login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        inactive = self.client.post(
            "/api/auth/refresh/", {"refresh": second_login.data["refresh"]}, format="json"
        )
        self.assertEqual(inactive.status_code, status.HTTP_401_UNAUTHORIZED)
```

![](images/clipboard-875525774.png)

**Paso 4. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.AuthFlowTests
```

![](images/clipboard-2972640237.png)

Debe terminar con `Ran 4 tests` y `OK`: los dos del login (ISS-17) y los dos de esta unidad. Si corres `python manage.py test apps.security`, deben salir 10 pruebas (las 6 de selección del motor más estas 4).

#### Explicación

Rotar el refresh sin detectar el reuso no sirve de mucho: el token robado seguiría vivo. Por eso, si llega un token que ya fue reemplazado, asumo que alguien más lo tiene y apago todos los de esa `family_id`, incluido el que acababa de entregar al cliente legítimo. Ese cliente tendrá que volver a iniciar sesión. Es una política que elegí yo, y no depende de la lista negra de SimpleJWT.

El vencimiento, en cambio, no revoca la familia: que un token haya caducado no demuestra que alguien lo copió, solo que el usuario tardó en volver. Por eso en ese caso solo desactivo ese token. El usuario inactivo recibe el mismo trato. Y en todos los casos de rechazo respondo con un 401 genérico, sin decir cuál fue el motivo.

La vista usa `select_for_update` dentro de una transacción para que dos peticiones simultáneas con el mismo refresh no puedan rotarlo las dos: la segunda espera, ve el token ya reemplazado y dispara la revocación.

#### Cómo probarlo

Capa HTTP, acceso abierto. El test hace login para obtener un refresh y no usa el access. Después hace tres POST a la misma ruta.

```         
python manage.py test apps.security.tests.AuthFlowTests
        │
        ▼
login  →  refresh A
        │
        ▼
POST /api/auth/refresh/   {refresh: A}     200   devuelve B, A queda con replaced_by
        │
        ▼
POST /api/auth/refresh/   {refresh: A}     401   reuso: se apaga la familia
        │
        ▼
POST /api/auth/refresh/   {refresh: B}     401   B también murió con la familia
```

También lo puedes ver a mano en Swagger (`/api/schema/swagger-ui/`), sin autorizar nada: haz login, copia el `refresh`, y llama tres veces a `POST /api/auth/refresh/` con A, otra vez con A y luego con B. Debes ver 200, 401 y 401.

```         
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"admin","password":"1234"}'
```

![](images/clipboard-1059731764.png)

Te responde algo como esto. Copia el valor de `refresh`: esa es tu llave **A**.

```         
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxODY1ODkyLCJpYXQiOjE3OTE4NjIyOTIsImp0aSI6IjhmMGM1OGRjNzFmNDQ0YmU5YTEyMmZkZDIwYmFlNWIyIiwidXNlcl9pZCI6IjIifQ.y8HfVtD8oYSbV8_DAn3mIGNcZSPndqhfqkjSI8fsrn0",
    "refresh": "q2yG_Nchvey_Y8EcF4T30ZMMdSuYHj5v-99cShYvwd-DeAgdH37scSICtJze8ulM",
    "tokenType": "Bearer",
    "accessExpiresIn": 3600
}
```

Ahora presenta la llave A (pega tu valor en lugar de `PEGA_AQUI_A`):

```         
curl -X POST http://127.0.0.1:8000/api/auth/refresh/ -H "Content-Type: application/json" -d '{"refresh":"q2yG_Nchvey_Y8EcF4T30ZMMdSuYHj5v-99cShYvwd-DeAgdH37scSICtJze8ulM"}'
```

![](images/clipboard-1945958738.png)

Debe responder 200 con un par nuevo. El `refresh` nuevo es la llave **B**. Guárdala.

Repite exactamente el mismo comando con la **A** otra vez:

```         
curl -X POST http://127.0.0.1:8000/api/auth/refresh/ -H "Content-Type: application/json" -d '{"q2yG_Nchvey_Y8EcF4T30ZMMdSuYHj5v-99cShYvwd-DeAgdH37scSICtJze8ulM"}'
```

![](images/clipboard-3763967992.png)

Ahora debe responder:

```         
{"detail":"Refresh inválido."}
```

Eso es el 401: la A ya estaba gastada. Por último, prueba la **B**:

```         
curl -X POST http://127.0.0.1:8000/api/auth/refresh/ -H "Content-Type: application/json" -d '{"refresh":"PEGA_AQUI_B"}'
```

![](images/clipboard-3763967992.png)

tambien debe responder:

```         
{"detail":"Refresh inválido."}
```

#### Criterios de aceptación

- **AC-18-01:** el segundo refresh es distinto del primero, y el primero responde 200 la primera vez.

- **AC-18-02:** reusar el primero responde 401.

- **AC-18-03:** el segundo, ya con la familia comprometida, también responde 401.

- **AC-18-04:** un refresh vencido responde 401 y no revoca la familia.

- **AC-18-05:** un usuario inactivo no puede renovar: responde 401.

#### Verificación

`test_refresh_rotates_and_reuse_revokes_family` y `test_refresh_expired_or_inactive_user_is_401`, con el comando del Paso 4.

#### GATE

- **AC-18-01:** rotación. **PASS**.

- **AC-18-02:** reuso. **PASS**.

- **AC-18-03:** familia revocada. **PASS**.

- **AC-18-04:** vencido sin revocar la familia. **PASS**.

- **AC-18-05:** usuario inactivo. **PASS**.

### ISS-19 — Logout

**Narrativa**

Con el login y el refresh listos, me faltaba la salida: cerrar la sesión. En ActivaFit una sesión vive en el refresh token, porque el access token es un JWT que no se guarda en ninguna tabla y se vence solo. Por eso el logout recibe el refresh y lo invalida: lo marco como inactivo y anoto cuándo fue revocado, y desde ese momento ya no sirve para pedir un access nuevo. Hay una excepción: si me presentan un refresh que ya había sido reemplazado en una rotación, no lo trato como un cierre normal, porque ese token ya no debería existir. Lo trato como reuso y apago toda su familia, igual que en el ISS-18.

**Objetivo**

Invalidar el refresh que se presenta, sin guardar el access token.

**Requisitos**

- ISS-18 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Agregar la vista de logout**

En `apps/security/auth_views.py` reemplacé la importación de serializers por esta, que ahora incluye `LogoutSerializer`:

``` python
from apps.security.serializers import (
    LoginSerializer,
    LogoutSerializer,
    RefreshSerializer,
    TokenPairSerializer,
)
```

Y agregué la clase nueva debajo de `_revoke_family` y encima de `def _find_user`. Es abierta, como el login y el refresh, porque la credencial de la sesión es el refresh y no el access. Si el hash no existe, responde 401. Si el token ya fue reemplazado, revoca la familia y responde 401. En cualquier otro caso lo deja inactivo, escribe `revoked_at` y responde 204.

``` python
class LogoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=LogoutSerializer,
        responses={204: None},
        auth=[],
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_hash = hash_token(serializer.validated_data["refresh"])
        invalid = Response(
            {"detail": "Refresh inválido."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
        now = timezone.now()

        with transaction.atomic():
            stored = RefreshToken.objects.select_for_update().filter(token_hash=token_hash).first()
            if stored is None:
                return invalid

            if stored.replaced_by_id is not None:
                _revoke_family(stored.family_id, now)
                return invalid

            stored.status = RecordStatus.INACTIVE
            stored.revoked_at = now
            stored.save(update_fields=["status", "revoked_at", "updated_at"])

        return Response(status=status.HTTP_204_NO_CONTENT)
```

![](images/clipboard-621314583.png)

Las tres decisiones quedan así:

```         
hash desconocido          → 401
token ya reemplazado      → revoca la familia → 401
en cualquier otro caso    → status inactive, revoked_at = ahora → 204
```

Un segundo logout del mismo token, si no fue rotado, vuelve a dejarlo inactivo y responde 204 otra vez.

**Paso 2. Agregar la ruta**

En `apps/security/urls.py` cambié el import de las vistas:

``` python
from apps.security.auth_views import LoginAPIView, LogoutAPIView, RefreshAPIView
```

Y debajo de la ruta del refresh agregué:

``` python
    path("auth/logout/", LogoutAPIView.as_view(), name="auth-logout"),
```

![](images/clipboard-1262670555.png)

**Paso 3. Agregar las pruebas**

Siguen siendo abiertas y entran en la clase `AuthFlowTests`. Agregué estos dos métodos al final de la clase. El primero es el de la guía, con una línea extra que comprueba que un segundo logout también responde 204. El segundo es mío: cubre los dos casos de rechazo (un token desconocido y uno ya rotado).

``` python
    def test_logout_invalidates_refresh(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        raw = login.data["refresh"]
        logout = self.client.post("/api/auth/logout/", {"refresh": raw}, format="json")
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)
        again = self.client.post("/api/auth/refresh/", {"refresh": raw}, format="json")
        self.assertEqual(again.status_code, status.HTTP_401_UNAUTHORIZED)
        second_logout = self.client.post("/api/auth/logout/", {"refresh": raw}, format="json")
        self.assertEqual(second_logout.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_unknown_or_rotated_token_is_401(self):
        unknown = self.client.post(
            "/api/auth/logout/", {"refresh": "no-existe"}, format="json"
        )
        self.assertEqual(unknown.status_code, status.HTTP_401_UNAUTHORIZED)

        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        first = login.data["refresh"]
        rotated = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        second = rotated.data["refresh"]
        reused_logout = self.client.post("/api/auth/logout/", {"refresh": first}, format="json")
        self.assertEqual(reused_logout.status_code, status.HTTP_401_UNAUTHORIZED)
        after = self.client.post("/api/auth/refresh/", {"refresh": second}, format="json")
        self.assertEqual(after.status_code, status.HTTP_401_UNAUTHORIZED)
```

![](images/clipboard-57732393.png)

**Paso 4. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.AuthFlowTests
```

![](images/clipboard-367036647.png)

Debe terminar con `Ran 6 tests` y `OK`: los dos del login, los dos del refresh y los dos del logout. Si corres `python manage.py test apps.security`, deben salir 12 pruebas, con las 6 de selección del motor.

#### Explicación

El logout no pide access token. La credencial de la sesión guardada es el refresh, y el access es un JWT que se vence solo y no está en ninguna tabla, así que no hay nada que limpiar del lado del access. Cerrar sesión en un dispositivo tampoco cierra las de otros dispositivos: cada login crea su propia familia de tokens, y el logout apaga solo el token que presento.

Si el valor que me llega ya fue rotado, no lo trato como un logout normal. Un token reemplazado ya no debería existir, así que alguien lo está presentando por segunda vez, y como en el refresh, apago toda su familia. Las respuestas de rechazo usan el mismo 401 genérico, sin decir si el token no existía o si estaba reemplazado.

#### Cómo probarlo

El comando es uno solo, y ese `OK` final es la comprobación:

```         
python manage.py test apps.security.tests.AuthFlowTests
```

Lo que hace la prueba, con la analogía de la llave de un solo uso:

```         
login → recibo la llave R
        │
        ▼
POST /api/auth/logout/    {refresh: R}    204   cierro la sesión (la llave queda anulada)
        │
        ▼
POST /api/auth/refresh/   {refresh: R}    401   intento usarla otra vez y el servidor la rechaza
```

Si prefieres verlo con tus propios ojos, usa dos terminales con el entorno activo. En la terminal 1 deja el servidor corriendo (`python manage.py runserver`). En la terminal 2, haz login con tu usuario y copia el valor de `refresh` de la respuesta:

```         
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"TU_USUARIO","password":"TU_CLAVE"}'
```

![](images/clipboard-2971856982.png)

Después cierra la sesión con ese refresh (pega el tuyo en lugar de `PEGA_AQUI_R`). El `-i` hace que `curl` muestre el código de estado, porque un 204 no trae cuerpo y sin eso no verías nada:

```         
curl -i -X POST http://127.0.0.1:8000/api/auth/logout/ -H "Content-Type: application/json" -d '{"refresh":"PEGA_AQUI_R"}'
```

![](images/clipboard-3501689037.png)

Debe mostrar `HTTP/1.1 204 No Content`. Y ahora intenta renovar con el mismo refresh:

```         
curl -i -X POST http://127.0.0.1:8000/api/auth/refresh/ -H "Content-Type: application/json" -d '{"refresh":"PEGA_AQUI_R"}'
```

![](images/clipboard-4201222836.png)

Debe mostrar `HTTP/1.1 401 Unauthorized` con `Refresh inválido.` Si te da 200, el logout no está anulando el token. En Swagger (`/api/schema/swagger-ui/`) puedes repetir lo mismo sin autorizar nada: login, logout con el refresh y refresh con el mismo valor. Con `curl` o con Swagger las filas quedan en tu base de datos real.

#### Criterios de aceptación

- **AC-19-01:** el logout responde 204.

- **AC-19-02:** ese refresh ya no puede renovar: el refresh siguiente responde 401.

- **AC-19-03:** un segundo logout del mismo token, si no fue rotado, también responde 204.

- **AC-19-04:** un token desconocido o ya rotado responde 401, y el rotado apaga la familia.

#### Verificación

`test_logout_invalidates_refresh` y `test_logout_unknown_or_rotated_token_is_401`, con el comando del Paso 4.

#### GATE

- **AC-19-01:** HTTP 204. **PASS**.

- **AC-19-02:** el refresh posterior responde 401. **PASS**.

- **AC-19-03:** el segundo logout responde 204. **PASS**.

- **AC-19-04:** desconocido o rotado responde 401, y la familia queda revocada. **PASS**.

### ISS-20 — Perfil JWT con token

**Narrativa**

Hasta ahora todos los endpoints de ActivaFit eran abiertos: el login, el refresh y el logout porque entregan o gastan tokens, y los de negocio porque todavía no había autenticación. En esta unidad empecé a exigir el access token con el segundo nivel de acceso, JWT con token. Para estrenarlo construí el perfil: un endpoint donde el usuario autenticado consulta y edita sus propios datos. El perfil responde a una sola pregunta, ¿quién es el que llama?, y no consulta la matriz de permisos; eso llega en el ISS-21. Además me aseguré de un detalle: aunque la firma del token siga siendo válida, si el usuario fue desactivado, el token deja de servir.

**Objetivo**

Responder quién es el llamador usando JWT: firma válida, vigencia y usuario activo. Sin consultar la matriz de permisos.

**Requisitos**

- ISS-19 superado.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Crear la autenticación propia**

El archivo `apps/security/authentication.py` es nuevo. Extiende la clase de SimpleJWT para volver a leer el `status` del usuario después de validar la firma. El access token dura 60 minutos, y sin esta comprobación un usuario desactivado seguiría entrando hasta que el token venza.

``` python
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from apps.common.status import RecordStatus


class ActivaFitJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user.status != RecordStatus.ACTIVE or not user.is_active:
            raise AuthenticationFailed(
                "El usuario no está active.",
                code="user_inactive",
            )
        return user
```

![](images/clipboard-3984707201.png)

**Paso 2. Activarla en `config/settings/__init__.py`**

Dentro del diccionario `REST_FRAMEWORK`, encima de `DEFAULT_PERMISSION_CLASSES`, agregué:

``` python
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.security.authentication.ActivaFitJWTAuthentication",
    ],
```

![](images/clipboard-429388744.png)

Con esto, toda la API lee el header `Authorization: Bearer ...` si viene. Los endpoints de negocio siguen en `AllowAny`, así que siguen funcionando sin token. El login, el refresh y el logout declaran `authentication_classes = []`, así que no cambian.

**Paso 3. Agregar el serializer del perfil**

El archivo `apps/security/serializers.py` ya existe. Primero agregué este import al inicio, debajo de `from rest_framework import serializers`:

``` python
from apps.security.models import User
```

Y agregué la clase nueva encima de `class LoginSerializer`. Expone `id`, `username`, `email`, `first_name`, `last_name` y `status`. El `username` y el `status` son de solo lectura (un usuario no puede darse de alta ni cambiarse el estado), y no incluye `password`.

``` python
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "status"]
        read_only_fields = ["id", "username", "status"]
```

![](images/clipboard-3953296738.png)

**Paso 4. Crear la vista del perfil**

El archivo `apps/security/rbac_views.py` es nuevo y en este ISS solo contiene el perfil. Los viewsets de la matriz se agregan en el ISS-23. `get_object` devuelve `request.user`: el perfil no lleva `pk` en la URL, porque el objeto es el usuario que llama.

``` python
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.security.serializers import ProfileSerializer


class ProfileAPIView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user
```

![](images/clipboard-3755075487.png)

**Paso 5. Agregar la ruta**

En `apps/security/urls.py` agregué este import debajo de los demás:

``` python
from apps.security.rbac_views import ProfileAPIView
```

Y debajo de la ruta del logout agregué:

``` python
    path("auth/profile/", ProfileAPIView.as_view(), name="auth-profile"),
```

![](images/clipboard-1081053834.png)

El perfil no va al router del ISS-23. Un `ModelViewSet` de usuarios expondría `/api/users/<int:pk>/`, que es otro recurso y exige permisos por rol.

**Paso 6. Agregar las pruebas**

En la clase `AuthFlowTests` agregué estos dos métodos al final. El primero es el de la guía, con una comprobación extra de que la respuesta no trae `password` (criterio AC-20-02). El segundo es mío: comprueba que el perfil no deja cambiar el `username` ni el `status`.

``` python
    def test_profile_requires_token_and_rejects_inactive_user(self):
        anonymous = self.client.get("/api/auth/profile/")
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        profile = self.client.get("/api/auth/profile/")
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["username"], "ana")
        self.assertNotIn("password", profile.data)
        patched = self.client.patch(
            "/api/auth/profile/",
            {"firstName": "Ana"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertEqual(patched.data["first_name"], "Ana")
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        denied = self.client.get("/api/auth/profile/")
        self.assertEqual(denied.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_patch_ignores_username_and_status(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        patched = self.client.patch(
            "/api/auth/profile/",
            {"username": "otro", "status": "inactive", "lastName": "Pérez"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertEqual(patched.data["username"], "ana")
        self.assertEqual(patched.data["last_name"], "Pérez")
        self.user.refresh_from_db()
        self.assertEqual(self.user.status, RecordStatus.ACTIVE)
```

![](images/clipboard-1570312855.png)

**Paso 7. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.AuthFlowTests
```

![](images/clipboard-3781084703.png)

Debe terminar con `Ran 8 tests` y `OK`: dos del login, dos del refresh, dos del logout y estas dos del perfil. Con `python manage.py test apps.security` salen 14 pruebas, que incluyen las 6 de selección del motor. Conviene correr también las de negocio, para confirmar que activar la autenticación por defecto no rompió nada: `python manage.py test apps.client apps.plan apps.trainer apps.routine apps.measurement apps.membership` debe seguir dando 22 pruebas en `OK`, porque esos endpoints continúan abiertos.

#### Explicación

```         
Bearer access
      │
      ▼
firma + vigencia
      │
      ▼
¿usuario active?
      ├── no → 401
      └── sí → IsAuthenticated → perfil
```

El segundo nivel de acceso, JWT con token, no ejecuta ningún permiso por rol. Un usuario autenticado lee su perfil aunque no tenga ningún rol asignado. Si ese mismo usuario llama a `/api/clients/` sin una concesión, el ISS-22 responderá 403: ahí el acceso pasa a ser JWT con token más permisos por rol.

Reescribí `get_user` porque SimpleJWT solo confía en la firma: un access token ya emitido seguiría siendo válido 60 minutos aunque yo desactive al usuario. Con mi clase, apenas el usuario deja de estar activo, el mismo token responde 401, no 403: el 401 significa “no sé quién eres” y el 403 “sé quién eres, pero no tienes permiso”.

La vista usa `RetrieveUpdateAPIView` porque el perfil solo lee y modifica un objeto, el que devuelve `get_object`. Con `http_method_names` dejé solo `get` y `patch`: no hay PUT, POST ni DELETE.

#### Cómo probarlo

Capa HTTP, nivel JWT con token. El test hace login para obtener el access y lo deja puesto en el header para el resto de las llamadas. No se usa ninguna concesión de la matriz, porque todavía no existe.

El comando es uno solo, y el `OK` final es la comprobación:

```         
python manage.py test apps.security.tests.AuthFlowTests
```

Lo que hace la prueba:

```         
GET   /api/auth/profile/                     sin header       401
login → access
GET   /api/auth/profile/                     con Bearer       200   username ana, sin password
PATCH /api/auth/profile/  {firstName: Ana}   con Bearer       200
usuario pasa a inactive
GET   /api/auth/profile/                     el mismo Bearer  401                     el mismo Bearer  401
```

Si quieres verlo con tus propios ojos, usa dos terminales con el entorno activo. En la terminal 1 deja el servidor corriendo (`python manage.py runserver`). En la terminal 2, primero prueba el perfil sin token:

```         
curl -i http://127.0.0.1:8000/api/auth/profile/
```

![](images/clipboard-3318636571.png)

![](images/clipboard-186256223.png)

Debe mostrar `HTTP/1.1 401 Unauthorized`. Ahora haz login y copia el valor de `access`:

```         
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"TU_USUARIO","password":"TU_CLAVE"}'
```

![](images/clipboard-3696052293.png)

Y llama al perfil con ese token, pegando el tuyo en lugar de `PEGA_AQUI_ACCESS`:

```         
curl -i http://127.0.0.1:8000/api/auth/profile/ -H "Authorization: Bearer PEGA_AQUI_ACCESS"
```

![](images/clipboard-4031876365.png)

Debe mostrar `200 OK` con tus datos y sin `password`. Y para editar tu nombre:

```         
curl -X PATCH http://127.0.0.1:8000/api/auth/profile/ -H "Authorization: Bearer PEGA_AQUI_ACCESS" -H "Content-Type: application/json" -d '{"firstName":"Ana"}'
```

![](images/clipboard-2042517171.png)

Ese cambio queda guardado en tu usuario real. En Swagger (`/api/schema/swagger-ui/`), por ahora solo puedes ver que `GET /api/auth/profile/` sin header responde 401: el botón Authorize para pegar el token se registra en el ISS-24.

#### Criterios de aceptación

- **AC-20-01:** sin header, GET del perfil responde 401.

- **AC-20-02:** con un access válido responde 200 y no incluye `password`.

- **AC-20-03:** el PATCH de `firstName` se guarda.

- **AC-20-04:** si el usuario pasa a `inactive`, el mismo access responde 401.

- **AC-20-05:** el PATCH no puede cambiar `username` ni `status`.

#### Verificación

`test_profile_requires_token_and_rejects_inactive_user` y `test_profile_patch_ignores_username_and_status`, con el comando del Paso 7.

#### GATE

- **AC-20-01:** anónimo, 401. **PASS**.

- **AC-20-02:** perfil sin `password`. **PASS**.

- **AC-20-03:** PATCH guardado. **PASS**.

- **AC-20-04:** usuario desactivado, 401. **PASS**.

- **AC-20-05:** `username` y `status` de solo lectura. **PASS**.

### ISS-21 — HasResourceAccess

Con el perfil ya protegido por JWT, me faltaba la otra mitad de la seguridad: la autorización. Saber quién es el usuario no basta para saber qué puede hacer. Escribí una clase de permiso, `HasResourceAccess`, que responde esa pregunta mirando la matriz que modelé en el ISS-16: toma el método HTTP y el patrón de la ruta de la petición y comprueba que exista una cadena completa y activa desde el usuario hasta ese recurso (usuario, asignación de rol, rol, concesión y recurso). Si falta un solo eslabón, o alguno está inactivo, el acceso se niega. No hay permisos implícitos: todo lo que no esté concedido de forma explícita queda prohibido.

**Objetivo**

Autorizar por método y patrón de ruta, con negación por defecto. Es la mitad de autorización del acceso JWT con token más permisos por rol. Sola no autentica: el JWT ya tuvo que identificar al usuario.

**Requisitos**

- ISS-20 superado.

- Los modelos del ISS-16 existen.

- Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Crear la clase de permiso**

El archivo `apps/security/permissions.py` es nuevo. Compara `request.method` con `request.resolver_match.route` (el patrón, no la URL real) y exige que estén activos el usuario, la asignación del rol, el rol, la concesión y el recurso. `HEAD` se evalúa como `GET`. `OPTIONS`, si ya hay un usuario activo, no busca recurso: es el preflight del navegador, no una operación de negocio.

``` python
from rest_framework.permissions import BasePermission

from apps.common.status import RecordStatus
from apps.security.models import ResourceRole


class HasResourceAccess(BasePermission):
    message = "No tiene autorización para ejecutar esta operación."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "status", None) != RecordStatus.ACTIVE:
            return False
        if request.method.upper() == "OPTIONS":
            return True

        match = request.resolver_match
        if match is None:
            return False
        method = request.method.upper()
        if method == "HEAD":
            method = "GET"
        return ResourceRole.objects.filter(
            status=RecordStatus.ACTIVE,
            resource__status=RecordStatus.ACTIVE,
            resource__method=method,
            resource__route=match.route,
            role__status=RecordStatus.ACTIVE,
            role__assignments__user=user,
            role__assignments__status=RecordStatus.ACTIVE,
        ).exists()
```

![](images/clipboard-3912762071.png)

**Paso 2. Ajustar los imports de las pruebas**

Todavía no puedo probar la clase contra `/api/clients/`, porque ese endpoint sigue abierto hasta el ISS-22. Así que la pruebo con una vista de prueba mínima (`ProbeView`), declarada dentro de `apps/security/tests.py`, que usa la misma autenticación y el mismo permiso que usarán los endpoints reales. Primero ajusté los imports del archivo. Reemplacé estas líneas:

```         
from django.test import SimpleTestCase
```

por

```         
from django.test import SimpleTestCase, TestCase 
from django.urls import resolve
```

La línea de `rest_framework.test`:

```         
from rest_framework.test import APITestCase
```

por

```         
from rest_framework.response import Response 
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate from rest_framework.views import APIView
```

Y la línea de los modelos:

```         
from apps.security.models import RefreshToken
```

por

```         
from apps.security.authentication import ActivaFitJWTAuthentication 
from apps.security.models import RefreshToken, Resource, ResourceRole, Role, RoleUser 
from apps.security.permissions import HasResourceAccess
```

**Paso 3. Agregar las pruebas**

Al final de `apps/security/tests.py` agregué la vista de prueba y la clase nueva. `_call` arma una petición a una ruta real, le pone el `resolver_match` (lo que haría el servidor) y, si le paso un usuario, lo deja autenticado con `force_authenticate`. Sin usuario, la petición llega anónima y DRF responde 401; con usuario pero sin concesión, responde 403.

``` python
class ProbeView(APIView):
    authentication_classes = [ActivaFitJWTAuthentication]
    permission_classes = [HasResourceAccess]

    def get(self, request, *args, **kwargs):
        return Response({"ok": True})


class HasResourceAccessTests(TestCase):
    def setUp(self):
        self.user = create_active_user(username="recepcion", email="recepcion@activafit.test")
        self.role = Role.objects.create(name="Recepcionista", status=RecordStatus.ACTIVE)
        self.assignment = RoleUser.objects.create(
            role=self.role, user=self.user, status=RecordStatus.ACTIVE
        )
        self.resource = Resource.objects.create(
            name="Listar clientes",
            method="GET",
            route="api/clients/",
            status=RecordStatus.ACTIVE,
        )

    def _grant(self, resource=None):
        return ResourceRole.objects.create(
            resource=resource or self.resource,
            role=self.role,
            status=RecordStatus.ACTIVE,
        )

    def _call(self, path="/api/clients/", method="get", user=None):
        request = getattr(APIRequestFactory(), method)(path)
        request.resolver_match = resolve(path)
        if user is not None:
            force_authenticate(request, user=user)
        return ProbeView.as_view()(request)

    def test_denied_without_grant_and_unauthenticated(self):
        anonymous = self._call()
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
        no_grant = self._call(user=self.user)
        self.assertEqual(no_grant.status_code, status.HTTP_403_FORBIDDEN)

    def test_grant_allows_get_and_head(self):
        self._grant()
        allowed = self._call(user=self.user)
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
        head = self._call(method="head", user=self.user)
        self.assertEqual(head.status_code, status.HTTP_200_OK)

    def test_each_inactive_link_returns_403(self):
        grant = self._grant()
        for link in (self.role, self.assignment, grant, self.resource):
            with self.subTest(link=link.__class__.__name__):
                link.status = RecordStatus.INACTIVE
                link.save()
                denied = self._call(user=self.user)
                self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
                link.status = RecordStatus.ACTIVE
                link.save()
        self.assertEqual(self._call(user=self.user).status_code, status.HTTP_200_OK)

    def test_route_pattern_matches_any_id(self):
        detail = Resource.objects.create(
            name="Detalle de cliente",
            method="GET",
            route="api/clients/<int:pk>/",
            status=RecordStatus.ACTIVE,
        )
        self._grant(detail)
        for path in ("/api/clients/15/", "/api/clients/16/"):
            with self.subTest(path=path):
                response = self._call(path=path, user=self.user)
                self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_options_needs_no_resource(self):
        response = self._call(method="options", user=self.user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

![](images/clipboard-2523343784.png)

**Paso 4. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.HasResourceAccessTests
```

![](images/clipboard-3408279675.png)

Debe terminar con `Ran 5 tests` y `OK`. Con `python manage.py test apps.security` salen 19 pruebas: 6 de selección del motor, 8 de autenticación y estas 5.

### ISS-22 — RBAC sobre el negocio

**Narrativa**

Hasta ahora ActivaFit tenía dos mundos separados: un negocio completo pero abierto, y una seguridad completa pero sin conectar. En esta unidad los uní. Cambié todas las vistas del negocio para que exijan identidad (`IsAuthenticated`) y permiso por rol (`HasResourceAccess`), y cambié el permiso por defecto del proyecto, que pasó de abierto a autenticado. No toqué la forma de ninguna operación: registrar una membresía sigue siendo lo mismo, pero ahora solo puede hacerlo quien tenga el recurso concedido. El efecto más visible es que las pruebas que escribí en la Fase I, que llamaban a la API sin token, empezaron a fallar con 401 o 403, y las arreglé creando un usuario con las concesiones que necesita cada una. Ese fallo inicial fue justo la prueba de que el candado quedó puesto.

**Objetivo**

Pasar el negocio de la Fase I al tercer acceso, JWT con token más permisos por rol. Hasta aquí esos endpoints no pedían JWT.

**Requisitos**

-  ISS-21 superado.

-  Terminal con el entorno virtual `.venv` activo.

-  Las pruebas de negocio, que en la Fase I no enviaban token, ahora crean un usuario y llaman `grant()` o `grant_crud()`.

#### Construcción

**Paso 1. Cambiar el permiso en las vistas del negocio**

El cambio es el mismo en cuatro archivos: `apps/common/views.py` (la vista base que usan planes, entrenadores, ejercicios y rutinas), `apps/client/views.py`, `apps/measurement/views.py` y `apps/membership/views.py`. En cada uno hay dos reemplazos.

Reemplaza la línea de import:

```         
from rest_framework.permissions import AllowAny
```

por estas dos:

```         
from rest_framework.permissions import IsAuthenticated  
from apps.security.permissions import HasResourceAccess
```

Y reemplaza **todas** las apariciones de:

```         
permission_classes = [AllowAny]
```

por:

```         
permission_classes = [IsAuthenticated, HasResourceAccess]
```

![](images/clipboard-292160470.png)

En `apps/membership/views.py` hay cinco apariciones: `ActiveMembershipListAPIView`, `MembershipReadViewSet`, `MembershipRegisterAPIView`, `MembershipCollectionAPIView` y `AttendanceViewSet`. En `apps/common/views.py` hay una, en `CatalogViewSet`, y con eso quedan cubiertas las apps `plan`, `trainer` y `routine`. En `apps/client/views.py` y en `apps/measurement/views.py` hay una cada una. Busca con `grep -rn "AllowAny" apps` para confirmar que no quede ninguna fuera del login, el refresh y el logout, que deben seguir abiertos.

![](images/clipboard-1830549462.png)

**Paso 2. Cambiar el permiso por defecto del proyecto**

En `config/settings/__init__.py`, dentro de `REST_FRAMEWORK`, reemplaza:

```         
        "rest_framework.permissions.AllowAny",
```

por:

```         
        "rest_framework.permissions.IsAuthenticated",
```

Con esto, cualquier vista nueva que olvide declarar permisos queda cerrada, no abierta. La documentación de Swagger no se cierra: `SPECTACULAR_SETTINGS` ya tiene su propio `SERVE_PERMISSIONS` abierto desde el ISS-14.

**Paso 3. Ampliar las ayudas de prueba**

El archivo `apps/common/testing.py` ya tiene `PASSWORD` y `create_active_user` desde el ISS-17. Reemplaza estas dos líneas de import:

```         
from apps.common.status import RecordStatus from apps.security.models import User
```

por este bloque:

```         
from django.urls import resolve  
from apps.common.status import RecordStatus 
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User
```

Y agrega al final del archivo, debajo de `create_active_user`, las dos ayudas nuevas. `grant` crea el rol, la asignación al usuario, el recurso (usando el patrón de la ruta que devuelve `resolve`) y la concesión, todo activo. `grant_crud` concede de una vez las cinco operaciones de un CRUD.

``` python
def grant(user, method, path, role_name=None):
    role, _created = Role.objects.get_or_create(
        name=role_name or f"test-role-{user.pk}",
        defaults={"description": "Rol de prueba", "status": RecordStatus.ACTIVE},
    )
    RoleUser.objects.get_or_create(
        role=role,
        user=user,
        defaults={"status": RecordStatus.ACTIVE},
    )
    match = resolve(path)
    resource, _created = Resource.objects.get_or_create(
        method=method.upper(),
        route=match.route,
        defaults={
            "name": f"{method.upper()} {match.route}",
            "status": RecordStatus.ACTIVE,
        },
    )
    ResourceRole.objects.get_or_create(
        resource=resource,
        role=role,
        defaults={"status": RecordStatus.ACTIVE},
    )
    return role


def grant_crud(user, collection, detail):
    grant(user, "GET", collection)
    grant(user, "POST", collection)
    for method in ("GET", "PUT", "PATCH", "DELETE"):
        grant(user, method, detail)
```

![](images/clipboard-4043000281.png)

**Paso 4. Actualizar las pruebas del negocio**

En cada archivo de pruebas agrego el import de las ayudas y un bloque al inicio de `setUp` que crea un usuario, concede las rutas y se autentica. Los métodos de prueba no se reescriben.

**Clientes.** En `apps/client/tests.py`, debajo de `from apps.common.status import RecordStatus`, agrega:

```         
from apps.common.testing import create_active_user, grant_crud
```

Dentro de `ClientApiTests`, encima del primer método, agrega este `setUp`:

``` python
    def setUp(self):
        self.user = create_active_user()
        grant_crud(self.user, "/api/clients/", "/api/clients/1/")
        self.client.force_authenticate(user=self.user)
```

Y al final de esa misma clase agrega la prueba del 403 y el 401, que es la que demuestra la negación por defecto:

``` python
    def test_missing_grant_is_403_and_missing_identity_is_401(self):
        outsider = create_active_user(username="sin_permiso", email="sin@activafit.test")
        self.client.force_authenticate(user=outsider)
        denied = self.client.get("/api/clients/")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(user=None)
        anonymous = self.client.get("/api/clients/")
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
```

![](images/clipboard-301449168.png)

**Planes.** En `apps/plan/tests.py`, debajo de `from apps.common.status import RecordStatus`:

```         
from apps.common.testing import create_active_user, grant_crud
```

Y dentro de `PlanApiTests`, encima del primer método:

``` python
    def setUp(self):
        self.user = create_active_user()
        grant_crud(self.user, "/api/plans/", "/api/plans/1/")
        self.client.force_authenticate(user=self.user)
```

![](images/clipboard-3972151111.png)

**Entrenadores.** Igual en `apps/trainer/tests.py`: el mismo import, y dentro de `TrainerApiTests`:

``` python
    def setUp(self):
        self.user = create_active_user()
        grant_crud(self.user, "/api/trainers/", "/api/trainers/1/")
        self.client.force_authenticate(user=self.user)
```

![](images/clipboard-4040634605.png)

**Rutinas.** En `apps/routine/tests.py`, debajo de `from apps.common.status import RecordStatus`, el import:

```         
from apps.common.testing import create_active_user, grant_crud
```

`RoutineApiTests` ya tiene un `setUp`. Conservalo y agrega estas líneas al inicio, encima de `self.gym_client = ...`:

``` python
        self.user = create_active_user()
        grant_crud(self.user, "/api/exercises/", "/api/exercises/1/")
        grant_crud(self.user, "/api/routines/", "/api/routines/1/")
        grant_crud(self.user, "/api/routine-exercises/", "/api/routine-exercises/1/")
        self.client.force_authenticate(user=self.user)
```

![](images/clipboard-4264035123.png)

**Medidas.** En `apps/measurement/tests.py`, debajo de `from apps.client.models import Client`:

```         
from apps.common.testing import create_active_user, grant_crud
```

Y en el `setUp` de `MeasurementApiTests`, encima de `self.gym_client = ...`:

``` python
        self.user = create_active_user()
        grant_crud(self.user, "/api/measurements/", "/api/measurements/1/")
        self.client.force_authenticate(user=self.user)
```

![](images/clipboard-3778211919.png)

**Membresías y asistencias.** En `apps/membership/tests.py`, debajo de `from apps.common.status import RecordStatus`:

```         
from apps.common.testing import create_active_user, grant, grant_crud
```

En el `setUp` de `MembershipAvailableTests`, al inicio:

``` python
        self.user = create_active_user()
        grant(self.user, "GET", "/api/memberships/active/")
        self.client.force_authenticate(user=self.user)
```

En el `setUp` de `MembershipRegisterTests`, al inicio:

``` python
        self.user = create_active_user()
        grant(self.user, "GET", "/api/memberships/")
        grant(self.user, "POST", "/api/memberships/")
        grant(self.user, "GET", "/api/memberships/1/")
        grant(self.user, "DELETE", "/api/memberships/1/")
        self.client.force_authenticate(user=self.user)
```

Y en el `setUp` de `AttendanceApiTests`, al inicio:

``` python
        self.user = create_active_user()
        grant_crud(self.user, "/api/attendances/", "/api/attendances/1/")
        self.client.force_authenticate(user=self.user)
```

Para la membresía no concedo PUT ni PATCH, porque el detalle no los publica.

![](images/clipboard-3876440842.png)

**Incidencia al conectar los permisos al negocio**

Al ejecutar las pruebas de las seis apps después de cambiar los permisos, 22 de las 23 pasaron y una falló: `test_missing_grant_is_403_and_missing_identity_is_401`. Esperaba un 403 para un usuario sin concesión, pero recibió un 200, lo que significaba que el endpoint de clientes seguía abierto. Era la única prueba que distinguía un endpoint abierto de uno cerrado, por eso fue la única en fallar.

Con `grep -rn "AllowAny" apps` encontré que `apps/client/views.py`, `apps/measurement/views.py` y `apps/membership/views.py` todavía tenían `AllowAny`. Los cambié por `IsAuthenticated` y `HasResourceAccess`, y confirmé que `AllowAny` solo quedaba en el login, el refresh y el logout, que deben seguir abiertos.

![](images/clipboard-182519742.png)

![](images/clipboard-2187993255.png)

**Paso 5. Ejecutar las pruebas**

```         
python manage.py test apps.client apps.plan apps.trainer apps.routine apps.measurement apps.membership
```

![](images/clipboard-2699551570.png)

Debe terminar con `Ran 23 tests` y `OK`: 5 de clientes, 2 de planes, 1 de entrenadores, 3 de rutinas, 1 de medidas y 11 de membresías. Las mismas pruebas de la Fase I siguen pasando, ahora con usuario y concesiones.

Después corre las de seguridad, para confirmar que nada se rompió:

```         
python manage.py test apps.security
```

![](images/clipboard-2696834664.png)

Debe dar `Ran 19 tests` y `OK`, o 26 si ya pegaste `RbacTests`.

#### Explicación

Este ISS no cambia la forma de ninguna operación del negocio: cambia quién puede ejecutarla. Una prueba que antes hacía un POST directo ahora falla con 401 o 403 hasta que concede el método y la ruta. Ese fallo es la prueba de que el cierre quedó puesto, y por eso arreglé las pruebas creando un usuario y concediéndole las rutas, en lugar de debilitar el permiso.

Con el cambio, la API queda en tres niveles de acceso:

```         
OPEN                    login, refresh, logout, esquema (Swagger)
                        AllowAny y authentication_classes vacías

JWT con token           perfil
                        IsAuthenticated

JWT con token + RBAC    clientes, planes, entrenadores, ejercicios, rutinas,
                        medidas, membresías, asistencias
                        IsAuthenticated + HasResourceAccess
```

Un detalle que conviene tener presente: el superusuario del admin tampoco tiene acceso a la API de negocio por serlo. La autorización es negar por defecto, así que hasta que su rol tenga recursos concedidos recibirá 403 como cualquier otro usuario. El perfil, en cambio, sigue funcionando sin ningún rol, porque solo exige identidad.

#### Cómo probarlo

El comando es uno solo, y el `OK` final es la comprobación:

```         
python manage.py test apps.client apps.plan apps.trainer apps.routine apps.measurement apps.membership
```

Lo que hace cada prueba ahora, antes de llamar a la API:

```         
setUp
  create_active_user              crea un usuario activo
  grant / grant_crud              crea rol, asignación, recurso y concesión
  force_authenticate              se identifica como ese usuario
        │
        ▼
el mismo POST, GET, PATCH o DELETE de la Fase I
        │
        ├── con concesión      200, 201 o 204, como antes
        └── sin concesión      403, y sin usuario 401
```

Si quieres verlo con tus propios ojos, usa dos terminales con el entorno activo. En la terminal 1 deja el servidor corriendo (`python manage.py runserver`). En la terminal 2, primero llama a un endpoint del negocio sin token:

```         
curl -i http://127.0.0.1:8000/api/clients/
```

Debe mostrar `HTTP/1.1 401 Unauthorized`, algo que en el ISS-08 respondía 200. Ahora haz login, copia el `access` y llama con él:

```         
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"TU_USUARIO","password":"TU_CLAVE"}'
curl -i http://127.0.0.1:8000/api/clients/ -H "Authorization: Bearer PEGA_AQUI_ACCESS"
```

![](images/clipboard-986422927.png)

Debe mostrar `HTTP/1.1 403 Forbidden`: sabe quién eres, pero no tienes ninguna concesión. Ver el 200 a mano necesita datos en la matriz de permisos, que se cargan con la semilla del ISS-24; hasta entonces ese caso lo cubren las pruebas. Swagger sigue el mismo comportamiento: sin token los endpoints del negocio responden 401. El botón Authorize se registra en el ISS-24.

#### Criterios de aceptación

-  **AC-22-01:** las pruebas de clientes, planes, entrenadores, rutinas, medidas y membresías siguen en PASS con un usuario concedido.

-  **AC-22-02:** sin concesión, clientes responde 403, y sin identidad responde 401.

-  **AC-22-03:** el perfil sigue sin consultar la matriz.

#### Verificación

La suite de las seis apps de negocio y `test_missing_grant_is_403_and_missing_identity_is_401`. Para AC-22-03, el usuario de `AuthFlowTests` lee su perfil sin tener ningún rol, y `ProfileAPIView` sigue con `permission_classes = [IsAuthenticated]`.

#### GATE

-  **AC-22-01:** negocio con RBAC, 23 pruebas en OK. **PASS**.

-  **AC-22-02:** negación por defecto, 403 sin concesión y 401 sin identidad. **PASS**.

-  **AC-22-03:** el perfil sigue en JWT con token. **PASS**.

### ISS-23 — CRUD de la matriz

**Narrativa**

Con el negocio protegido, quedaba una pregunta práctica: ¿cómo se llenan las tablas de seguridad? Hasta ahora las crearon mis pruebas a mano. En esta unidad construí su CRUD por la API para que los roles, los usuarios y los permisos se puedan administrar desde ahí. La clave es que las cinco tablas no son iguales. Usuarios, roles y recursos son CRUD normales. Pero `RoleUser` y `ResourceRole` son las dos mitades de la autorización: la primera dice qué rol tiene un usuario y la segunda qué método y qué ruta puede ejecutar ese rol. `HasResourceAccess` exige las dos, así que el valor de esta unidad se ve en la prueba: un usuario recién creado recibe 403 en cada eslabón que falta y solo entra cuando la cadena queda completa. La contraseña, además, nunca viaja de vuelta ni se guarda en claro.

**Objetivo**

Administrar la matriz de permisos y usarla para autorizar. El CRUD crea cada fila, `RoleUser` asigna el rol al usuario y `ResourceRole` asigna el recurso al rol. Con los dos enlaces activos, ese usuario puede ejecutar la ruta concedida.

**Requisitos**

-  ISS-22 superado.

-  Terminal con el entorno virtual `.venv` activo.

#### Construcción

**Paso 1. Agregar los serializers de la matriz**

En `apps/security/serializers.py` reemplacé la línea de import de los modelos:

```         
from apps.security.models import User
```

por este bloque:

``` python
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from apps.security.models import Resource, ResourceRole, Role, RoleUser, User
```

Y agregué estas clases al final del archivo. La contraseña es `write_only`: se recibe, pero nunca se devuelve. Antes de guardarla pasa por los validadores de Django (largo mínimo, claves comunes, solo numéricas), y se guarda con `set_password`, que genera el hash. Los demás serializers exponen el identificador escribible y el nombre de solo lectura, igual que en el ISS-07.

``` python
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "status",
            "password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_password(self, value):
        try:
            validate_password(value, user=self.instance)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 100},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }


class RoleUserSerializer(serializers.ModelSerializer):
    role_id = serializers.PrimaryKeyRelatedField(source="role", queryset=Role.objects.all())
    user_id = serializers.PrimaryKeyRelatedField(source="user", queryset=User.objects.all())
    role_name = serializers.CharField(source="role.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = RoleUser
        fields = [
            "id",
            "role_id",
            "role_name",
            "user_id",
            "username",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "role_name", "username", "created_at", "updated_at"]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ["id", "name", "method", "route", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ResourceRoleSerializer(serializers.ModelSerializer):
    resource_id = serializers.PrimaryKeyRelatedField(
        source="resource", queryset=Resource.objects.all()
    )
    role_id = serializers.PrimaryKeyRelatedField(source="role", queryset=Role.objects.all())
    resource_name = serializers.CharField(source="resource.name", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = ResourceRole
        fields = [
            "id",
            "resource_id",
            "resource_name",
            "role_id",
            "role_name",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "resource_name", "role_name", "created_at", "updated_at"]
```

![](images/clipboard-4251345900.png)

**Paso 2. Agregar los viewsets**

El archivo `apps/security/rbac_views.py` ya tiene el perfil. Lo reescribí entero, conservándolo. Los cinco viewsets heredan de `CatalogViewSet` (baja lógica, filtro `?status=` y permisos `IsAuthenticated` más `HasResourceAccess`). Solo `UserViewSet` sobrescribe la baja: al desactivar a un usuario hay que guardar también `is_active`, porque Django y SimpleJWT lo leen.

``` python
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.common.status import RecordStatus
from apps.common.views import CatalogViewSet
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User
from apps.security.serializers import (
    ProfileSerializer,
    ResourceRoleSerializer,
    ResourceSerializer,
    RoleSerializer,
    RoleUserSerializer,
    UserSerializer,
)


class ProfileAPIView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class UserViewSet(CatalogViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_destroy(self, instance):
        instance.status = RecordStatus.INACTIVE
        instance.save(update_fields=["status", "is_active", "updated_at"])


class RoleViewSet(CatalogViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class RoleUserViewSet(CatalogViewSet):
    queryset = RoleUser.objects.select_related("role", "user")
    serializer_class = RoleUserSerializer


class ResourceViewSet(CatalogViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer


class ResourceRoleViewSet(CatalogViewSet):
    queryset = ResourceRole.objects.select_related("resource", "role")
    serializer_class = ResourceRoleSerializer
```

![](images/clipboard-1975516977.png)

**Paso 3. Agregar las rutas**

El CRUD se suma al `urls.py` que ya tiene el login, el refresh, el logout y el perfil: no hay un segundo archivo ni otro `include`. Reescribí `apps/security/urls.py` entero. `urlpatterns += router.urls` agrega las diez rutas del CRUD detrás de las cuatro de `auth/`, y el perfil se queda fuera del router a propósito: no tiene `pk` en la URL.

``` python
from django.urls import path
from rest_framework.routers import SimpleRouter

from apps.security.auth_views import LoginAPIView, LogoutAPIView, RefreshAPIView
from apps.security.rbac_views import (
    ProfileAPIView,
    ResourceRoleViewSet,
    ResourceViewSet,
    RoleUserViewSet,
    RoleViewSet,
    UserViewSet,
)

router = SimpleRouter(use_regex_path=False)
router.register("users", UserViewSet, basename="user")
router.register("roles", RoleViewSet, basename="role")
router.register("role-users", RoleUserViewSet, basename="role-user")
router.register("resources", ResourceViewSet, basename="resource")
router.register("resource-roles", ResourceRoleViewSet, basename="resource-role")

urlpatterns = [
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshAPIView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutAPIView.as_view(), name="auth-logout"),
    path("auth/profile/", ProfileAPIView.as_view(), name="auth-profile"),
]

urlpatterns += router.urls
```

![](images/clipboard-1172105263.png)

**Paso 4. Agregar las pruebas**

Estos endpoints son de acceso JWT con token más permisos por rol: crear un rol no es abierto, ni basta con traer el token. Por eso la prueba nace ya con `grant_crud`. Primero ajusté dos imports en `apps/security/tests.py`. Reemplacé:

``` python
from apps.common.testing import PASSWORD, create_active_user
```

por:

``` python
from apps.common.testing import PASSWORD, create_active_user, grant_crud
```

Y reemplacé:

``` python
from apps.security.models import RefreshToken, Resource, ResourceRole, Role, RoleUser
```

por:

``` python
from apps.security.models import RefreshToken, Resource, ResourceRole, Role, RoleUser, User
```

Después agregué esta clase al final del archivo. El `setUp` solo concede la matriz a un usuario administrador, para poder escribirla. La prueba de la cadena no llama a `grant` para el usuario nuevo: lo crea el propio POST, y después entro como él a `GET /api/clients/` para ver su efecto, eslabón por eslabón.

``` python
class SecurityMatrixApiTests(APITestCase):
    NEW_PASSWORD = "Vitalidad-Plan-77"

    def setUp(self):
        self.admin = create_active_user(username="admin_matriz", email="admin@activafit.test")
        for collection in ("users", "roles", "role-users", "resources", "resource-roles"):
            grant_crud(self.admin, f"/api/{collection}/", f"/api/{collection}/1/")
        self.client.force_authenticate(user=self.admin)

    def test_role_crud(self):
        created = self.client.post(
            "/api/roles/",
            {"name": "Recepcion", "description": "Atiende la entrada"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        pk = created.data["id"]
        self.assertEqual(self.client.get("/api/roles/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(f"/api/roles/{pk}/").status_code, status.HTTP_200_OK)
        patched = self.client.patch(f"/api/roles/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(patched.data["status"], RecordStatus.ACTIVE)
        deleted = self.client.delete(f"/api/roles/{pk}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Role.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_user_role_resource_chain(self):
        role = self.client.post(
            "/api/roles/", {"name": "recepcion", "status": "active"}, format="json"
        )
        self.assertEqual(role.status_code, status.HTTP_201_CREATED)
        user = self.client.post(
            "/api/users/",
            {
                "username": "recep1",
                "email": "recep1@activafit.test",
                "password": self.NEW_PASSWORD,
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(user.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", user.data)
        recep = User.objects.get(pk=user.data["id"])

        def clients_as(who):
            self.client.force_authenticate(user=who)
            code = self.client.get("/api/clients/").status_code
            self.client.force_authenticate(user=self.admin)
            return code

        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        link = self.client.post(
            "/api/role-users/",
            {"roleId": role.data["id"], "userId": user.data["id"], "status": "active"},
            format="json",
        )
        self.assertEqual(link.status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post(
            "/api/role-users/",
            {"roleId": role.data["id"], "userId": user.data["id"], "status": "active"},
            format="json",
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        resource = self.client.post(
            "/api/resources/",
            {
                "name": "Listar clientes",
                "method": "GET",
                "route": "api/clients/",
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(resource.status_code, status.HTTP_201_CREATED)
        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        grant = self.client.post(
            "/api/resource-roles/",
            {
                "resourceId": resource.data["id"],
                "roleId": role.data["id"],
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(grant.status_code, status.HTTP_201_CREATED)
        self.assertEqual(clients_as(recep), status.HTTP_200_OK)

        self.client.force_authenticate(user=recep)
        denied = self.client.post(
            "/api/clients/",
            {"document_type": "CC", "document_number": "1234567890", "name": "Cliente"},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_password_is_hashed_hidden_and_soft_deleted(self):
        created = self.client.post(
            "/api/users/",
            {
                "username": "hash1",
                "email": "hash1@activafit.test",
                "password": self.NEW_PASSWORD,
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", created.data)
        pk = created.data["id"]
        stored = User.objects.get(pk=pk)
        self.assertNotEqual(stored.password, self.NEW_PASSWORD)
        self.assertTrue(stored.check_password(self.NEW_PASSWORD))

        weak = self.client.post(
            "/api/users/",
            {"username": "weak1", "email": "weak1@activafit.test", "password": "123"},
            format="json",
        )
        self.assertEqual(weak.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(user=None)
        login = self.client.post(
            "/api/auth/login/",
            {"username": "hash1", "password": self.NEW_PASSWORD},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin)
        deleted = self.client.delete(f"/api/users/{pk}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        stored.refresh_from_db()
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertFalse(stored.is_active)

        self.client.force_authenticate(user=None)
        blocked = self.client.post(
            "/api/auth/login/",
            {"username": "hash1", "password": self.NEW_PASSWORD},
            format="json",
        )
        self.assertEqual(blocked.status_code, status.HTTP_401_UNAUTHORIZED)
```

![](images/clipboard-2560815354.png)

**Paso 5. Ejecutar las pruebas**

```         
python manage.py test apps.security.tests.SecurityMatrixApiTests
```

![](images/clipboard-3435149901.png)

Debe terminar con `Ran 3 tests` y `OK`. Después comprueba que no rompiste nada:

```         
python manage.py test apps.security 
python manage.py test apps.client apps.plan apps.trainer apps.routine apps.measurement apps.membership
```

![](images/clipboard-1425952215.png)

La primera debe dar `Ran 22 tests` (o 29 si pegaste `RbacTests`) y la segunda `Ran 23 tests`, las dos en `OK`. .

#### Explicación

El CRUD de cada tabla de seguridad es homogéneo: listar, crear, leer, actualizar y dar de baja. Por eso son `ModelViewSet`, a través de `CatalogViewSet`, que además da la baja lógica y el filtro `?status=`. La contraseña cabe en el serializer: `write_only`, validada por los validadores de Django y guardada con `set_password`.

Las tablas `role_users` y `resource_roles` no son un CRUD más. `RoleUser` dice qué rol tiene el usuario y `ResourceRole` dice qué método y qué ruta puede ese rol. `HasResourceAccess` exige los dos enlaces, y que el rol, el recurso y la concesión estén `active`. Un usuario creado por aquí nace `inactive` si el cuerpo no envía el estado, y hasta que alguien lo active el login responde 401.

```         
User ── RoleUser ── Role ── ResourceRole ── Resource
recep1             recepcion               GET api/clients/
        │
        ▼
HasResourceAccess
        │
        └── los cuatro eslabones active → la ruta responde
```

#### Cómo probarlo

El comando es uno solo, y el `OK` final es la comprobación. Antes de la prueba hay un detalle que conviene entender: en este punto no puedes llamar a estos endpoints a mano, porque todos exigen una concesión y todavía nadie la tiene en la base de datos real. Es un problema del huevo y la gallina que se resuelve con la semilla del ISS-24. Por eso la prueba le concede la matriz a un administrador directamente, y después hace el resto por la API.
