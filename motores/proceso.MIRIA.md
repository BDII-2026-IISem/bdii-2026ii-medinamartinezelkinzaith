# Semana 1: Diseño e implementación de DB — ActivaFit

**Base: MySQL (Docker) → replicación posterior en PostgreSQL, SQL Server y Oracle**

## Objetivo

Diseño e implementación progresiva de una base de datos relacional portable llamada **ActivaFit**, cuya construcción inicial es en **MySQL dentro de Docker**, con acceso remoto vía **DBeaver**, validando entidades, campos, claves y relaciones. Posteriormente se replicará el modelo en PostgreSQL, Microsoft SQL Server y Oracle.

> Nota: esta entrega se enfoca únicamente en las entidades **Business**. Las entidades de Auth (usuario, rol, usuario_rol) quedan fuera del alcance de esta semana.

------------------------------------------------------------------------

## SPEC

| Código | Descripción | Aplicación |
|------------------------|------------------------|------------------------|
| SPEC-01 | Construir una base de datos denominada ActivaFit. | Base de datos para ActivaFit que maneje las entidades Business del dominio (memberships, attendance, routines, payments). |

------------------------------------------------------------------------

## Requerimientos

| Requerimiento | Requisitos | Estado para ActivaFit |
|------------------------|------------------------|------------------------|
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
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único del plan. |
| name | varchar(100) | sí | — | Nombre comercial del plan (ej. "Monthly", "Quarterly"). |
| description | varchar(255) | no | — | Detalle de lo que incluye el plan. |
| status | enum | sí | \_\_\_ | Estado del plan (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

### 🟢 Clients

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único del cliente. |
| document_type | char(5) | sí | — | Tipo de documento de identidad (CC, CE, TI, etc.). |
| document_number | varchar(30) | sí | UNIQUE | Número de documento del cliente, no se repite. |
| name | varchar(150) | sí | — | Nombre completo del cliente. |
| phone | varchar(30) | no | — | Teléfono de contacto. |
| email | varchar(150) | no | — | Correo electrónico de contacto. |
| status | enum | sí | \_\_\_ | Estado del cliente en el sistema (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

### 🟢 trainers

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único del entrenador. |
| name | varchar(150) | sí | — | Nombre completo del entrenador. |
| description | varchar(255) | no | — | Especialidad o notas sobre el entrenador. |
| status | enum | sí | \_\_\_ | Estado del entrenador (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

### 🟢 exercises

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único del ejercicio. |
| name | varchar(150) | sí | — | Nombre del ejercicio (ej. "Squat"). |
| description | varchar(255) | no | — | Explicación o técnica del ejercicio. |
| status | enum | sí | \_\_\_ | Estado del ejercicio en el catálogo (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

### 🟡 memberships

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único de la membresía. |
| name | varchar(100) | sí | — | Nombre de la membresía otorgada. |
| description | varchar(255) | no | — | Detalle o condiciones de la membresía. |
| status | enum | sí | \_\_ | Estado de la membresía (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |
| client_id | int, FK → client.id | sí | — | Cliente al que pertenece la membresía. |
| plan_id | int, FK → plan.id | sí | — | Plan sobre el que se creó la membresía. |

### 🟡 attendances

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | bigint, PK, auto_increment | sí | — | Identificador único del registro de asistencia. |
| name | varchar(100) | no | — | Etiqueta opcional del registro (ej. turno). |
| description | varchar(255) | no | — | Observaciones del ingreso. |
| status | enum | sí |  | Estado del registro (active/inactive, ej. anulado). |
| created_at | datetime | sí | default current_timestamp | Fecha y hora del check-in. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |
| membership_id | int, FK → membership.id | sí | — | Membresía validada para permitir el ingreso. |

### 🟡 routines

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único de la rutina. |
| name | varchar(100) | sí | — | Nombre de la rutina asignada. |
| description | varchar(255) | no | — | Objetivo o enfoque de la rutina. |
| status | enum | sí | \_\_\_ | Estado de la rutina (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |
| trainer_id | int, FK → trainer.id | sí | — | Entrenador que asignó la rutina. |
| client_id | int, FK → client.id | sí | — | Cliente al que se le asignó la rutina. |

### 🔵 routine_exercise

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único de la relación rutina-ejercicio. |
| routine_id | int, FK → routine.id | sí | — | Rutina a la que pertenece el ejercicio. |
| exercise_id | int, FK → exercise.id | sí | — | Ejercicio incluido en la rutina. |
| relation_data | varchar(255) | no | — | Series, repeticiones o carga sugerida. |
| status | enum | sí | \_\_\_ | Estado del ejercicio dentro de la rutina (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

### 🟡 measurements

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | int, PK, auto_increment | sí | — | Identificador único de la medición. |
| name | varchar(100) | no | — | Tipo de medición (ej. "Weight", "Body fat %"). |
| description | varchar(255) | no | — | Observaciones de la medición. |
| status | enum | sí | \_\_\_ | Estado del registro (active/inactive). |
| created_at | datetime | sí | default current_timestamp | Fecha en que se tomó la medición. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |
| client_id | int, FK → client.id | sí | — | Cliente al que se le hizo la medición. |
| trainer_id | int, FK → trainer.id | sí | — | Entrenador que tomó la medición. |

### 🔴 payments

| Campo | Tipo | Obligatorio | Default / Restricción | Descripción |
|---------------|---------------|---------------|---------------|---------------|
| id | bigint, PK, auto_increment | sí | — | Identificador único del pago. |
| reference_type | varchar(50) | sí | ej. 'membership' | Tipo de entidad a la que aplica el pago. |
| reference_id | int | sí | — | Id de la entidad referenciada (ej. la membresía pagada). |
| method | varchar(50) | sí | — | Medio de pago (cash, card, transfer). |
| amount | decimal(12,2) | sí | — | Valor pagado. |
| payment_date | datetime | sí | default current_timestamp | Fecha en que se registró el pago. |
| status | enum | sí | — | Estado del pago (pending, approved, rejected). |
| created_at | datetime | sí | default current_timestamp | Fecha de creación del registro. |
| updated_at | datetime | sí | default current_timestamp on update | Fecha de la última modificación. |

Este diseño cumple: - **FN1**: todos los atributos son atómicos, sin grupos repetitivos. - **FN2**: no hay tablas con clave compuesta y dependencias parciales (todas usan `id` como PK simple). - **FN3**: no hay dependencias transitivas — cada atributo no clave depende solo de la PK de su propia tabla.

------------------------------------------------------------------------

## Criterios de aceptación y evidencia esperada

| ID | Criterio de aceptación |
|------------------------------------|------------------------------------|
| AC-SPEC1-01 | Evidencia de las entidades Business identificadas (lista o diagrama) en el repo. |
| AC-SPEC1-02 | Evidencia del diccionario de datos completo (campos, tipos, obligatoriedad, defaults) en el repo. |
| AC-SPEC1-03 | Evidencia de llaves primarias y restricciones definidas (script o diagrama) en el repo. |
| AC-SPEC1-04 | Evidencia de relaciones y llaves foráneas definidas (diagrama ER) en el repo. |
| AC-SPEC1-05 | Evidencia de las tablas creadas físicamente en MySQL y los otros motores. |

## Issues de la semana

| ID | Descripción | REQ / SPEC |
|------------------------|------------------------|------------------------|
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
