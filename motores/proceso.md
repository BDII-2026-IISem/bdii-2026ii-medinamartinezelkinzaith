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

#### Creacion de la tabla routines

``` sql
create table routines (
    id  int auto_increment primary key,
    name varchar(150) not null,
    description varchar(255),
    trainer_id  int not null,
    status   enum('active','inactive') not null,
    created_at  datetime not null ,
    updated_at  datetime not null,

    foreign key (trainer_id) references trainers(id)
);
```

![](images/clipboard-412163400.png)

#### Creacion de la tabla memberships

``` sql
create table memberships (
    id  int auto_increment primary key,
    client_id  int not null,
    plan_id    int not null,
    start_date date not null,
    end_date   date not null,
    status   enum('active','expired','cancelled') not null,
    created_at  datetime not null,
    updated_at  datetime not null,

    foreign key (client_id) references clients(id),
    foreign key (plan_id) references plans(id)
);
```

![](images/clipboard-1399066552.png)

#### Creacion de la tabla payments

``` sql
create table payments (
    id  int auto_increment primary key,
    client_id int not null,
    membership_id int not null,
    method   enum('efectivo','tarjeta','transferencia') not null,
    amount  decimal(10,2) not null,
    payment_date  datetime not null,
    status enum('pendiente','pagado','cancelado') not null,

    foreign key (client_id) references clients(id),
    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-1514290117.png)

#### Creacion de la tabla measurements

``` sql
create table measurements (
    id int auto_increment primary key,
    client_id  int not null,
    weight   decimal(5,2) not null,
    height   decimal(5,2) not null,
    body_fat decimal(5,2) not null,
    bmi      decimal(5,2) not null,
    created_at  datetime not null ,
    updated_at  datetime not null ,

    foreign key (client_id) references clients(id)
);
```

![](images/clipboard-3325664650.png)
