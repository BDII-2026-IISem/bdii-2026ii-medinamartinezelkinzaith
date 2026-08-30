# Instalacion -> Contenedores de Bases de Datos en WSL con Docker

Este documento explica paso a paso la arquitectura, los requisitos previos y el proceso de instalación mediante Docker para los cuatro motores de bases de datos relacionales implementados en tu entorno de desarrollo.

---

## 📋 Requisitos Previos

* Sistema con soporte para **Docker** y **Docker Compose**.
* Entorno de terminal configurado en Linux o WSL 2 (Windows Subsystem for Linux).
* Estructura de directorios base creada en el host para garantizar la persistencia de los datos:

```text
~/ia-lab/
├── data/
│   ├── postgres/
│   ├── mysql/
│   ├── mssql/
│   └── oracle/
└── services/
    └── motores-bd/
```

## 🛠️ Proceso General de Instalación

Para desplegar cualquiera de los motores, la metodología estándar consiste en crear una carpeta dedicada para el servicio, definir su configuración en un archivo `docker-compose.yml` y ejecutar el contenedor en segundo plano.

## 🚀 Instalación por Motor de Base de Datos


## 1. MySQL

Sistema de gestión de bases de datos relacional ampliamente utilizado en arquitecturas web.

- **Paso 1:** Crea la carpeta de servicio:

```bash
mkdir -p ~/ia-lab/services/motores-bd/mysql && cd ~/ia-lab/services/motores-bd/mysql
```

- **Paso 2:** Crea el archivo `.env`:

```bash
nano .env
```

- **Paso 3:** Crea el archivo `docker-compose.yml`:

```bash
nano docker-compose.yml
```

- **Paso 4:** Crea el archivo `README.md`:

```bash
nano README.md
```

- **Paso 5:** Despliega el contenedor:

```bash
docker compose up -d
```

- **Paso 6:** Realiza la conexión local al motor:

```bash
docker exec -it mysql-server mysql -u root -p
```

- **Paso 7:** Realiza la creación remota de la base de datos.

- **Paso 8:** Crea el backup de la base de datos:

- **Paso 9:** Realiza la conexión con DBeaver utilizando el host, puerto, usuario y contraseña configurados.

---

## 2. PostgreSQL

Motor de base de datos relacional de código abierto altamente extensible.

- **Paso 1:** Crea la carpeta de servicio:

```bash
mkdir -p ~/ia-lab/services/motores-bd/postgres && cd ~/ia-lab/services/motores-bd/postgres
```

- **Paso 2:** Crea el archivo `.env`:

```bash
nano .env
```

- **Paso 3:** Crea el archivo `docker-compose.yml`:

```bash
nano docker-compose.yml
```

- **Paso 4:** Crea el archivo `README.md`:

```bash
nano README.md
```

- **Paso 5:** Despliega el contenedor:

```bash
docker compose up -d
```

- **Paso 6:** Realiza la conexión local al motor:

```bash
sudo docker exec -it postgres-server psql -U postgres -d ActivaFit
```

- **Paso 7:** Realiza la creación remota de la base de datos.

- **Paso 8:** Crea el backup de la base de datos:


- **Paso 9:** Realiza la conexión con DBeaver utilizando el host, puerto, usuario y contraseña configurados.

---


## 3. Microsoft SQL Server (MSSQL)

Motor de base de datos empresarial desarrollado por Microsoft.

- **Paso 1:** Crea la carpeta de servicio:

```bash
mkdir -p ~/ia-lab/services/motores-bd/mssql && cd ~/ia-lab/services/motores-bd/mssql
```

- **Paso 2:** Crea el archivo `.env`:

```bash
nano .env
```

- **Paso 3:** Crea el archivo `docker-compose.yml`:

```bash
nano docker-compose.yml
```

- **Paso 4:** Crea el archivo `README.md`:

```bash
nano README.md
```

- **Paso 5:** Despliega el contenedor:

```bash
docker compose up -d
```

- **Paso 6:** Realiza la conexión local al motor:

```bash
sudo docker exec -it mssql-server /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'Elkin1234!' -C
```

- **Paso 7:** Realiza la creación remota de la base de datos.

- **Paso 8:** Crea el backup de la base de datos:

- **Paso 9:** Realiza la conexión con DBeaver utilizando el host, puerto, usuario y contraseña configurados.

---

## 4. Oracle Database (Express Edition)

Base de datos relacional de nivel corporativo orientada a sistemas de misión crítica.

- **Paso 1:** Crea la carpeta de servicio:

```bash
mkdir -p ~/ia-lab/services/motores-bd/oracle && cd ~/ia-lab/services/motores-bd/oracle
```

- **Paso 2:** Crea el archivo `.env`:

```bash
nano .env
```

- **Paso 3:** Crea el archivo `docker-compose.yml`:

```bash
nano docker-compose.yml
```

- **Paso 4:** Crea el archivo `README.md`:

```bash
nano README.md
```

- **Paso 5:** Despliega el contenedor:

```bash
docker compose up -d
```

- **Paso 6:** Realiza la conexión local al motor:

```bash
docker exec -it oracle-server sqlplus system/1234@//localhost:1521/ActivaFit
```

- **Paso 7:** Realiza la creación remota de la base de datos o del esquema/usuario.

- **Paso 8:** Crea el backup de la base de datos mediante Oracle Data Pump:


- **Paso 9:** Realiza la conexión con DBeaver utilizando el host, puerto, usuario, contraseña y Service Name configurados.



### Presentado por : 

**ELKIN ZAITH MEDINA MARTINEZ**  
**Estudiante de Ingeniería de Sistemas**  
**Universidad de La Guajira** 