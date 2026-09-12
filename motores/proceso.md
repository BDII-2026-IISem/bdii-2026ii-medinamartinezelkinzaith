# CREACION DE BASE DE DATOS

## 1. Base de Datos MySQL

### 1.1 Creacion de Base de Datos por el terminal de DBeaver

``` sql
create database ActivaFit;
```

![](images/clipboard-1166703788.png)

#### Creacion de la tabla clients

``` sql
create table clients (
    id  int auto_increment primary key,
    document_type   enum('CC', 'TI', 'CE', 'PASAPORTE', 'PPT') not null,
    document_number varchar(30) not null unique,
    name            varchar(150) not null,
    phone           varchar(30),
    email           varchar(150) not null unique,
    status          enum('active','inactive') not null ,
    created_at      datetime not null ,
    updated_at      datetime not null
);
```

![](images/clipboard-1643246823.png)

#### Creacion de la tabla plans

``` sql
create table plans (
    id          int auto_increment primary key,
    name        varchar(100) not null,
    description varchar(255),
    status      enum('active','inactive') not null ,
    created_at  datetime not null ,
    updated_at  datetime not null 
);
```

![](images/clipboard-3723460705.png)

#### Creacion de la tabla trainers

``` sql
create table trainers (
    id int auto_increment primary key,
    name  varchar(150) not null,
    phone   varchar(30),
    email    varchar(150) unique,
    specialty  varchar(150),
    status      enum('active','inactive') not null,
    created_at  datetime not null ,
    updated_at  datetime not null 
);
```

![](images/clipboard-1721801596.png){width="575"}

#### Creacion de la tabla exercises

``` sql
create table exercises (
    id   int auto_increment primary key,
    name   varchar(150) not null,
    description  varchar(255),
    muscle_group varchar(100),
    status  enum('active','inactive') not null ,
    created_at  datetime not null ,
    updated_at  datetime not null 
);
```

![](images/clipboard-4127326219.png)
