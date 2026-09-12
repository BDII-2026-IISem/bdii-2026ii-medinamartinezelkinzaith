# Semana 1: Diseño e implementación de DB — ActivaFit

**Base: MySQL (Docker) → replicación posterior en PostgreSQL, SQL Server y Oracle**

## Objetivo

Diseño e implementación progresiva de una base de datos relacional portable llamada **ActivaFit**, cuya construcción inicial es en **MySQL dentro de Docker**, con acceso remoto vía **DBeaver**, validando entidades, campos, claves y relaciones. Posteriormente se replicará el modelo en PostgreSQL, Microsoft SQL Server y Oracle.

> Nota: esta entrega se enfoca únicamente en las entidades **Business**. Las entidades de Auth (usuario, rol, usuario_rol) quedan fuera del alcance de esta semana.

------------------------------------------------------------------------

## SPEC

| Código | Descripción | Aplicación |
|----|----|----|
| SPEC-01 | Construir una base de datos denominada ActivaFit. | Base de datos para ActivaFit que maneje las entidades Business del dominio (memberships, attendance, routines, payments). |

------------------------------------------------------------------------

## Requerimientos

| Requerimiento | Requisitos | Estado para ActivaFit |
|----|----|----|
| REQ-SPEC1-01 | Identificar las entidades de Business | client, plan, membership, attendance, trainer, routine, exercise, routine_exercise, measurement, payment |
| REQ-SPEC1-02 | Definir campos, tipos de datos, obligatoriedad y valores predeterminados | Ver diccionario de datos abajo |
| REQ-SPEC1-03 | Definir las llaves primarias y restricciones | id como PK en todas las tablas; UNIQUE en client.document_number; status/created_at/updated_at obligatorios en todas las tablas |
| REQ-SPEC1-04 | Definir relaciones y llaves foráneas entre entidades | membership→client/plan; attendance→membership; routine→trainer/client; routine_exercise→routine/exercise; measurement→client/trainer |
| REQ-SPEC1-05 | Crear físicamente las tablas en MySQL y los otros motores |  |

### REQ-SPEC1-03 — Llaves primarias y restricciones

| Tabla            | Restricción                                        |
|------------------|----------------------------------------------------|
| Todas las tablas | `id` como PK (auto_increment)                      |
| client           | UNIQUE en `document_number`                        |
| Todas las tablas | `status`, `created_at` y `updated_at` obligatorios |

### REQ-SPEC1-04 — Relaciones y llaves foráneas

| Tabla origen     | Llave foránea | Tabla destino |
|------------------|---------------|---------------|
| memberships      | client_id     | clients       |
| memberships      | plan_id       | plans         |
| attendances      | membership_id | memberships   |
| routines         | trainer_id    | trainers      |
| routines         | client_id     | clients       |
| routine_exercise | routine_id    | routines      |
| routine_exercise | exercise_id   | exercises     |
| measurements     | client_id     | clients       |
| measurements     | trainer_id    | trainers      |

## Diccionario de datos (entidades Business)

### 🟢 plans

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único del plan. |
| name | varchar(100) | sí | — | Nombre comercial del plan. |
| description | varchar(255) | no | — | Detalle de lo que incluye el plan. |
| status | enum('active','inactive') | sí | default 'active' | Estado del plan. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

### 🟢 clients

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único del cliente. |
| document_type | enum('cc','ti','ce','pasaporte','ppt') | sí | — | Tipo de documento de identidad del cliente. |
| document_number | varchar(30) | sí | unique | Número de documento del cliente, no se repite. |
| name | varchar(150) | sí | — | Nombre completo del cliente. |
| phone | varchar(30) | no | — | Teléfono de contacto del cliente. |
| email | varchar(150) | sí | unique | Correo electrónico del cliente, no se repite. |
| status | enum('active','inactive') | sí | default 'active' | Estado del cliente en el sistema. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

### 🟢 trainers

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único del entrenador. |
| name | varchar(150) | sí | — | Nombre completo del entrenador. |
| description | varchar(255) | no | — | Especialidad o información adicional del entrenador. |
| status | enum('active','inactive') | sí | default 'active' | Estado del entrenador. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

### 🟢 exercises

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único del ejercicio. |
| name | varchar(150) | sí | — | Nombre del ejercicio. |
| description | varchar(255) | no | — | Explicación, técnica o información del ejercicio. |
| status | enum('active','inactive') | sí | default 'active' | Estado del ejercicio en el catálogo. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

### 🟡 memberships

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único de la membresía. |
| client_id | int, FK → clients.id | sí | — | Cliente al que pertenece la membresía. |
| plan_id | int, FK → plans.id | sí | — | Plan asociado a la membresía. |
| start_date | date | sí | — | Fecha en la que comienza la membresía. |
| end_date | date | sí | — | Fecha en la que termina la membresía. |
| status | enum('active','expired','cancelled') | sí | default 'active' | Estado actual de la membresía. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

**Nota:** `memberships` no necesita `name` ni `description`, porque esa información pertenece a `plans`. La membresía solamente relaciona al cliente con el plan y registra el período contratado.

### 🟡 attendance

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único del registro de asistencia. |
| client_id | int, FK → clients.id | sí | — | Cliente que realizó la entrada o salida. |
| attendance_date | datetime | sí | — | Fecha y hora en que se registró la asistencia. |
| type | enum('entrada','salida') | sí | — | Indica si el registro corresponde a una entrada o una salida. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora en que se creó el registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

**Nota:** se eliminaron `name`, `description` y `status` porque no son necesarios para registrar una entrada o salida. La tabla ahora utiliza directamente `attendance_date` y `type`.

### 🟡 routines

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único de la rutina. |
| name | varchar(100) | sí | — | Nombre de la rutina asignada. |
| description | varchar(255) | no | — | Objetivo o enfoque de la rutina. |
| status | enum('active','inactive') | sí | default 'active' | Estado de la rutina. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |
| trainer_id | int, FK → trainers.id | sí | — | Entrenador que asignó la rutina. |
| client_id | int, FK → clients.id | sí | — | Cliente al que se le asignó la rutina. |

### 🔵 routine_exercises

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único de la relación entre rutina y ejercicio. |
| routine_id | int, FK → routines.id | sí | — | Rutina a la que pertenece el ejercicio. |
| exercise_id | int, FK → exercises.id | sí | — | Ejercicio incluido en la rutina. |
| sets | int | sí | — | Número de series que debe realizar el cliente. |
| repetitions | int | sí | — | Número de repeticiones por serie. |
| weight | decimal(10,2) | no | — | Peso sugerido o utilizado para el ejercicio. Puede quedar vacío si el ejercicio no utiliza peso. |
| rest_seconds | int | sí | — | Tiempo de descanso en segundos entre series. |
| unique(routine_id, exercise_id) | restricción UNIQUE | — | — | Evita registrar el mismo ejercicio dos veces dentro de una misma rutina. |

**Nota:** `weight` queda como opcional porque existen ejercicios que pueden realizarse sin peso, como flexiones o abdominales.

### 🟡 measurements

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | int, PK, auto_increment | sí | — | Identificador único de la medición. |
| client_id | int, FK → clients.id | sí | — | Cliente al que pertenece la medición. |
| measurement_date | date | sí | — | Fecha en que se realizó la medición física. |
| weight | decimal(5,2) | sí | — | Peso del cliente. |
| height | decimal(5,2) | sí | — | Altura del cliente. |
| body_fat | decimal(5,2) | sí | — | Porcentaje de grasa corporal. |
| bmi | decimal(5,2) | sí | — | Índice de masa corporal del cliente. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora en que se registró la medición. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

**Nota:** se eliminan `name`, `description` y `status`. La medición ya tiene campos específicos para almacenar peso, altura, grasa corporal e índice de masa corporal.

### 🔴 payments

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|----|----|----|----|----|
| id | bigint, PK, auto_increment | sí | — | Identificador único del pago. |
| reference_type | varchar(50) | sí | — | Tipo de entidad a la que corresponde el pago, por ejemplo una membresía. |
| reference_id | int | sí | — | Identificador de la entidad relacionada con el pago. |
| method | varchar(50) | sí | — | Medio utilizado para realizar el pago, como efectivo, tarjeta o transferencia. |
| amount | decimal(12,2) | sí | — | Valor monetario del pago. |
| payment_date | datetime | sí | default current_timestamp | Fecha y hora en que se registró el pago. |
| status | enum('pending','approved','rejected') | sí | — | Estado del pago. |
| created_at | datetime | sí | default current_timestamp | Fecha y hora de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update current_timestamp | Fecha y hora de la última modificación. |

Este diseño cumple: - **FN1**: todos los atributos son atómicos, sin grupos repetitivos. - **FN2**: no hay tablas con clave compuesta y dependencias parciales (todas usan `id` como PK simple). - **FN3**: no hay dependencias transitivas — cada atributo no clave depende solo de la PK de su propia tabla.

------------------------------------------------------------------------

## Criterios de aceptación y evidencia esperada

| ID | Criterio de aceptación |
|----|----|
| AC-SPEC1-01 | Evidencia de las entidades Business identificadas (lista o diagrama) en el repo. |
| AC-SPEC1-02 | Evidencia del diccionario de datos completo (campos, tipos, obligatoriedad, defaults) en el repo. |
| AC-SPEC1-03 | Evidencia de llaves primarias y restricciones definidas (script o diagrama) en el repo. |
| AC-SPEC1-04 | Evidencia de relaciones y llaves foráneas definidas (diagrama ER) en el repo. |
| AC-SPEC1-05 | Evidencia de las tablas creadas físicamente en MySQL y los otros motores. |

## Issues de la semana

| ID | Descripción | REQ / SPEC |
|----|----|----|
| ISS-S01-01 | Identificar y documentar las entidades Business | REQ-SPEC1-01 |
| ISS-S01-02 | Definir diccionario de datos (campos, tipos, obligatoriedad, defaults) | REQ-SPEC1-02 |
| ISS-S01-03 | Definir llaves primarias y restricciones | REQ-SPEC1-03 |
| ISS-S01-04 | Definir relaciones y llaves foráneas entre entidades | REQ-SPEC1-04 |
| ISS-S01-05 | Levantar MySQL y los otros motores en Docker, conectar DBeaver y crear físicamente las tablas | REQ-SPEC1-05 |

**Definition of Ready (DoR):** REQ y AC asociados y observables. **Definition of Done (DoD):** evidencia en repo + Issue en Hecho + bitácora.

## Dependencias entre Issues

| Issue      | Depende de |
|------------|------------|
| ISS-S01-01 | —          |
| ISS-S01-02 | ISS-S01-01 |
| ISS-S01-03 | ISS-S01-02 |
| ISS-S01-04 | ISS-S01-03 |
| ISS-S01-05 | ISS-S01-04 |

## Evidencia esperada

- Captura del contenedor Docker de MySQL corriendo.
- Captura de la conexión remota en DBeaver.
- Captura de las tablas creadas en DBeaver.
