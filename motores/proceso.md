# CREACION DE BASE DE DATOS

## 1. Base de Datos MySQL

#### 1.1 Creacion de Base de Datos por el terminal de DBeaver

``` sql
create database ActivaFit;
```

![](images/clipboard-1166703788.png)

#### 1.2 Creacion de la tabla clients

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

#### 1.3 Creacion de la tabla plans

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

#### 1.4 Creacion de la tabla trainers

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

#### 1.5 Creacion de la tabla exercises

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

#### 1.6 Creacion de la tabla routines

``` sql
create table routines (
    id   int auto_increment primary key,
    name   varchar(100) not null,
    description varchar(255),
    status   enum('active', 'inactive') not null,
    created_at  datetime not null,
    updated_at  datetime not null,
    trainer_id  int not null,
    client_id   int not null,

    foreign key (trainer_id) references trainers(id),
    foreign key (client_id) references clients(id)
);
```

![](images/clipboard-2365311546.png)

#### 1.7 Creacion de la tabla memberships

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

#### 1.8 Creacion de la tabla payments

``` sql
create table payments (
    id  int auto_increment primary key
    membership_id int not null,
    method   enum('efectivo','tarjeta','transferencia') not null,
    amount  decimal(10,2) not null,
    payment_date  datetime not null,
    status enum('pendiente','pagado','cancelado') not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-159935643.png)

#### 1.9 Creacion de la tabla measurements

``` sql
create table measurements (
    id int auto_increment primary key,
    client_id  int not null,
    trainer_id       int not null,
    weight   decimal(5,2) not null,
    height   decimal(5,2) not null,
    body_fat decimal(5,2) not null,
    bmi      decimal(5,2) not null,
    created_at  datetime not null ,
    updated_at  datetime not null ,

    foreign key (client_id) references clients(id),
    foreign key (trainer_id) references trainers(id)
);
```

![](images/clipboard-3186829574.png)

#### 1.10 Creacion de la tabla routine_exercises

``` sql
create table routine_exercises (
    id int auto_increment primary key,
    routine_id   int not null,
    exercise_id  int not null,
    sets  int not null,
    repetitions  int not null,
    weight decimal(10,2),
    rest_seconds int not null,

    foreign key (routine_id) references routines(id),
    foreign key (exercise_id) references exercises(id),

    unique (routine_id, exercise_id)
);
```

![](images/clipboard-1479490080.png)

#### 1.11 Creacion de la tabla attendances

``` sql
create table attendances (
    id  int auto_increment primary key,
    membership_id int not null,
    attendance_date datetime not null,
    type  enum('entrada', 'salida') not null,
    created_at  datetime not null,
    updated_at  datetime not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-349628118.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de MySQL por terminal de DBeaver, como resultado tenemos las 10 tablas creadas correctamente.

### 2. Creacion de Base de Datos de forma visual por el gestor MySQL workbench

#### 2.1 Creamos la base de datos ActivaFit visualmente

![](images/clipboard-2318688189.png)

**como resultado tenemos esto:**

![](images/clipboard-4058489044.png)

#### 2.2 Creacion de la tabla clients

![](images/clipboard-2352197269.png)

![](images/clipboard-1641418169.png)

**Evidencia de la creacion:**

![](images/clipboard-3041759457.png)

#### 2.3 Creacion de la tabla plans

![](images/clipboard-847439316.png)

![](images/clipboard-2433541301.png)

**como resultado tenemos esto:**

![](images/clipboard-958377814.png)

#### 2.4 Creacion de la tabla trainers

![![](images/clipboard-1340346191.png)](images/clipboard-698143492.png)

**Evidencia de la creacion:**

#### 2.5 Creacion de la tabla exercises

![](images/clipboard-939901527.png)

![](images/clipboard-3757525269.png)

**como resultado tenemos esto:**

![](images/clipboard-926617714.png)

#### 2.6 Creacion de la tabla routines

![](images/clipboard-2210857206.png)

![](images/clipboard-2687860994.png)

**Evidencia de la creacion:**

![](images/clipboard-451871268.png)

#### 2.7 Creacion de la tabla memberships

![](images/clipboard-2995360096.png)

![](images/clipboard-1005660322.png)

**Evidencia de la creacion:**

![](images/clipboard-3250348148.png)

#### 2.8 Creacion de la tabla payments

![](images/clipboard-2096240331.png)

![](images/clipboard-344960225.png)

**Evidencia de la creacion:**

![](images/clipboard-1240304935.png)

#### 2.9 Creacion de la tabla measurements

![](images/clipboard-3714315477.png)

![](images/clipboard-4027589991.png)

**Evidencia de la creacion:**

![](images/clipboard-3322728818.png)

#### 2.10 Creacion de la tabla routine_exercises

![](images/clipboard-3739625507.png)

![](images/clipboard-1349867308.png)

**Evidencia de la creacion:**

![](images/clipboard-1953397107.png)

#### 2.11 Creacion de la tabla attendances

![](images/clipboard-2007665871.png)

![](images/clipboard-2501143948.png)

**Evidencia de la creacion:**

![](images/clipboard-1306994848.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de MySQL por la parte visual en workbench , como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-79835802.png)

## 2. Base de Datos PostgreSQL

#### 2.01 Creacion de Base de Datos por el terminal de DBeaver

``` sql
CREATE DATABASE ActivaFit;
```

![](images/clipboard-4762363.png)

#### 2.02 Creacion de la tabla clients

``` sql
create table clients (     
id  serial primary key,     document_type   varchar(20) not null                     check (document_type in ('cc', 'ti', 'ce', 'pasaporte', 'ppt')),     document_number varchar(30) not null unique,     name varchar(150) not null,     phone varchar(30),     email  varchar(150) not null unique,     status varchar(20) not null                     check (status in ('active', 'inactive')),     created_at  timestamp not null,     updated_at  timestamp not null 
);
```

![](images/clipboard-342759490.png)

#### 2.03 Creacion de la tabla plans

``` sql
create table plans (
    id  serial primary key,
    name varchar(100) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-3073352376.png)

#### 2.04 Creacion de la tabla trainers

``` sql
create table trainers (
    id serial primary key,
    name varchar(150) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-757270587.png)

#### 2.05 Creacion de la tabla exercises

``` sql
create table exercises (
    id  serial primary key,
    name   varchar(150) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-3933759883.png)

#### 2.06 Creacion de la tabla memberships

``` sql
create table memberships (
    id  serial primary key,
    client_id   int not null,
    plan_id int not null,
    start_date date not null,
    end_date  date not null,
    status  varchar(20) not null
                check (status in ('active', 'expired', 'cancelled')),
    created_at  timestamp not null,
    updated_at  timestamp not null,

    foreign key (client_id) references clients(id),
    foreign key (plan_id) references plans(id)
);
```

![](images/clipboard-3437604535.png)

#### 2.07 Creacion de la tabla routines

``` sql
create table routines (
    id   serial primary key,
    name  varchar(100) not null,
    description varchar(255),
    status  varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null,
    trainer_id  int not null,
    client_id   int not null,

    foreign key (trainer_id) references trainers(id),
    foreign key (client_id) references clients(id)
);
```

![](images/clipboard-1188268238.png)

#### 2.08 Creacion de la tabla routine_exercises

``` sql
create table routine_exercises (
    id serial primary key,
    routine_id   int not null,
    exercise_id  int not null,
    sets  int not null,
    repetitions  int not null,
    weight  numeric(10,2),
    rest_seconds int not null,
    
    foreign key (routine_id) references routines(id),
    foreign key (exercise_id) references exercises(id),
    
    unique (routine_id, exercise_id)
);
```

![](images/clipboard-2687466327.png)

#### 2.09 Creacion de la tabla measurements

``` sql
create table measurements (
    id  serial primary key,
    client_id  int not null,
    trainer_id  int not null,
    measurement_date date not null,
    weight  numeric(5,2) not null,
    height  numeric(5,2) not null,
    body_fat  numeric(5,2) not null,
    bmi  numeric(5,2) not null,
    created_at timestamp not null,
    updated_at timestamp not null,

    foreign key (client_id) references clients(id),
    foreign key (trainer_id) references trainers(id)
);
```

![](images/clipboard-2163255009.png)

#### 2.10 Creacion de la tabla attendance

``` sql
create table attendance (
    id  serial primary key,
    membership_id    int not null,
    attendance_date  timestamp not null,
    type   varchar(10) not null
                     check (type in ('entrada', 'salida')),
    created_at timestamp not null,
    updated_at timestamp not null,
    
    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-2002916067.png)

#### 2.11 Creacion de la tabla payments

``` sql
create table payments (
    id  bigserial primary key,
    membership_id  int not null,
    method  varchar(50) not null,
    amount   numeric(12,2) not null,
    payment_date   timestamp not null,
    status   varchar(20) not null
                   check (status in ('pending', 'approved', 'rejected')),
    created_at  timestamp not null,
    updated_at  timestamp not null,
    
    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-705174275.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de PostgreSQL por terminal de DBeaver, como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-3941958658.png)

### 3. Creacion de Base de Datos de forma visual por el gestor PostgreSQl PgAdmin 4

#### 3.1 Creamos la base de datos ActivaFit visualmente

![](images/clipboard-799357560.png)

![](images/clipboard-2252747237.png)

#### 3.2 Creacion de la tabla clients

![](images/clipboard-1798360835.png)

![](images/clipboard-876171928.png)

**Evidencia de la creacion:**

![](images/clipboard-2929991967.png)

#### 3.3 Creacion de la tabla plans

![](images/clipboard-230197181.png)

![](images/clipboard-955048420.png)

**Evidencia de la creacion:**

![](images/clipboard-1031764890.png)

#### 3.4 Creacion de la tabla trainers

![![](images/clipboard-3322067236.png)](images/clipboard-379063030.png)

**Evidencia de la creacion:**

![](images/clipboard-181348190.png)

#### 3.5 Creacion de la tabla exercises

![](images/clipboard-2036772742.png)

![**Evidencia de la creacion:**](images/clipboard-4121695770.png)

![](images/clipboard-3498405521.png)

#### 3.6 Creacion de la tabla memberships

![](images/clipboard-2164151234.png)

![![](images/clipboard-2640788177.png)](images/clipboard-38512490.png)

**Evidencia de la creacion:**

![](images/clipboard-653908283.png)

#### 3.7 Creacion de la tabla routines

![![](images/clipboard-1187831768.png)](images/clipboard-101146499.png)

![](images/clipboard-3220484876.png)

**Evidencia de la creacion:**

![](images/clipboard-3961352358.png)

#### 3.8 Creacion de la tabla routine_exercises

![](images/clipboard-1443890919.png)

![](images/clipboard-3657537561.png)

**Evidencia de la creacion:**

![](images/clipboard-2586164657.png)

#### 3.9 Creacion de la tabla measurements

![](images/clipboard-299832404.png)

![](images/clipboard-3375153567.png)

**Evidencia de la creacion:**

![](images/clipboard-84465217.png)

#### 3.10 Creacion de la tabla attendance

![](images/clipboard-1426066314.png)

![](images/clipboard-3605289134.png)

![](images/clipboard-80141095.png)

**Evidencia de la creacion:**

![](images/clipboard-477661619.png)

#### 3.11 Creacion de la tabla payments

![](images/clipboard-281976588.png)

![](images/clipboard-1656078856.png)

![](images/clipboard-3777043621.png)

**Evidencia de la creacion:**

![](images/clipboard-376184768.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de PostgreSQL por la parte visual en PgAdmin , como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-328763604.png)

## 4. Base de Datos SQL Server

#### 4.01 Creacion de Base de Datos por el terminal de DBeaver

``` sql
create database ACTIVAFIT1;
```

![](images/clipboard-3799741589.png)

#### 4.02 Creacion de la tabla clients

``` sql
create table clients (
    id   int identity(1,1) primary key,
    document_type   varchar(20) not null
                    check (document_type in ('cc', 'ti', 'ce', 'pasaporte', 'ppt')),
    document_number varchar(30) not null unique,
    name  varchar(150) not null,
    phone  varchar(30),
    email  varchar(150) not null unique,
    status varchar(20) not null
                    check (status in ('active', 'inactive')),
    created_at datetime2 not null,
    updated_at datetime2 not null
);
```

![](images/clipboard-1366345519.png)

#### 4.03 Creacion de la tabla plans

``` sql
create table plans (
    id  int identity(1,1) primary key,
    name varchar(100) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  datetime2 not null,
    updated_at  datetime2 not null
);
```

![](images/clipboard-3180916921.png)
