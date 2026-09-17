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

#### 4.04 Creacion de la tabla trainers

``` sql
create table trainers (
    id  int identity(1,1) primary key,
    name varchar(150) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  datetime2 not null,
    updated_at  datetime2 not null
);
```

![](images/clipboard-4240828559.png)

#### 4.05 Creacion de la tabla exercises

``` sql
create table exercises (
    id int identity(1,1) primary key,
    name varchar(150) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at  datetime2 not null,
    updated_at  datetime2 not null
);
```

![](images/clipboard-675451759.png)

#### 4.06 Creacion de la tabla memberships

``` sql
create table memberships (
    id int identity(1,1) primary key,
    client_id   int not null,
    plan_id  int not null,
    start_date  date not null,
    end_date date not null,
    status varchar(20) not null
                check (status in ('active', 'expired', 'cancelled')),
    created_at  datetime2 not null,
    updated_at  datetime2 not null,

    foreign key (client_id) references clients(id),
    foreign key (plan_id) references plans(id)
);
```

![](images/clipboard-2218345579.png)

#### 4.07 Creacion de la tabla routines

``` sql
create table routines (
    id  int identity(1,1) primary key,
    name varchar(100) not null,
    description varchar(255),
    status varchar(20) not null
                check (status in ('active', 'inactive')),
    created_at datetime2 not null,
    updated_at datetime2 not null,
    trainer_id int not null,
    client_id int not null,

    foreign key (trainer_id) references trainers(id),
    foreign key (client_id) references clients(id)
);
```

![](images/clipboard-2683210246.png)

#### 4.08 Creacion de la tabla routine_exercises

``` sql
create table routine_exercises (
    id int identity(1,1) primary key,
    routine_id  int not null,
    exercise_id int not null,
    sets int not null,
    repetitions  int not null,
    weight decimal(10,2),
    rest_seconds int not null,
    
    foreign key (routine_id) references routines(id),
    foreign key (exercise_id) references exercises(id),
    
    unique (routine_id, exercise_id)
);
```

![](images/clipboard-1029328420.png)

#### 4.09 Creacion de la tabla measurements

``` sql
create table measurements (
    id  int identity(1,1) primary key,
    client_id int not null,
    trainer_id int not null,
    measurement_date date not null,
    weight  decimal(5,2) not null,
    height decimal(5,2) not null,
    body_fat decimal(5,2) not null,
    bmi  decimal(5,2) not null,
    created_at datetime2 not null,
    updated_at datetime2 not null,

    foreign key (client_id) references clients(id),
    foreign key (trainer_id) references trainers(id)
);
```

![](images/clipboard-2439476468.png)

#### 4.10 Creacion de la tabla attendance

``` sql
create table attendance (
    id  int identity(1,1) primary key,
    membership_id  int not null,
    attendance_date  datetime2 not null,
    type varchar(10) not null
                     check (type in ('entrada', 'salida')),
    created_at datetime2 not null,
    updated_at datetime2 not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-3342849632.png)

#### 4.11 Creacion de la tabla payments

``` sql
create table payments (
    id  bigint identity(1,1) primary key,
    membership_id  int not null,
    method varchar(50) not null,
    amount  decimal(12,2) not null,
    payment_date  datetime2 not null,
    status varchar(20) not null
                   check (status in ('pending', 'approved', 'rejected')),
    created_at  datetime2 not null,
    updated_at datetime2 not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-2072861861.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de SQL Server por terminal de DBeaver, como resultado tenemos las 10 tablas creadas correctamente.

### 5. Creacion de Base de Datos se SQL Server de forma visual por el gestor SQl Server Management Studio 20

#### 5.1 Creamos la base de datos ActivaFit visualmente

![![](images/clipboard-2822520301.png)](images/clipboard-3587529285.png)

#### 5.2 Creacion de la tabla clients

**Le asigno al id Primary key y a los atributos document y email como unique:**

![](images/clipboard-4208933048.png)

**Le incorpore el check a los atributos document y status:**

![](images/clipboard-2686705270.png)

**Evidencia de la creacion:**

![](images/clipboard-479026640.png)

#### 5.3 Creacion de la tabla plans

![**Evidencia de la creacion:**](images/clipboard-3263982201.png)

![](images/clipboard-3644717188.png)

#### 5.04 Creacion de la tabla trainers

![](images/clipboard-2058576316.png)

**Evidencia de la creacion:**

![](images/clipboard-2810755926.png)

#### 5.05 Creacion de la tabla exercises

![](images/clipboard-2990630229.png)

**Evidencia de la creacion:**

![](images/clipboard-1219069162.png)

#### 5.06 Creacion de la tabla memberships

![](images/clipboard-2493615953.png)

**Agregue las llaves foraneas correspondientes :**

![](images/clipboard-201923255.png)

![](images/clipboard-2062043764.png)

**Agregue el check del estado de la memberships :**

![](images/clipboard-2149157778.png)

**Evidencia de la creacion:**

![](images/clipboard-3584953215.png)

#### 5.07 Creacion de la tabla routines

![](images/clipboard-2512379918.png)

**Agregue las llaves foraneas correspondientes :**

![](images/clipboard-229507101.png)

![](images/clipboard-3031092794.png)

**Agregue el check del estado de la routines:**

![](images/clipboard-1164945039.png)

**Evidencia de la creacion:**

![](images/clipboard-2681044734.png)

#### 5.08 Creacion de la tabla routine_exercises

![](images/clipboard-104718864.png)

**Agregue las llaves foraneas correspondientes :**

![](images/clipboard-3352920502.png)

![](images/clipboard-3376390507.png)

**Evidencia de la creacion:**

![](images/clipboard-2395288846.png)

#### 5.09 Creacion de la tabla measurements

![](images/clipboard-2539753900.png)

**Agregue las llaves foraneas correspondientes :**

![![](images/clipboard-3900198757.png)](images/clipboard-405897033.png)

**Evidencia de la creacion:**

![](images/clipboard-91252222.png)

#### 5.10 Creacion de la tabla attendances

![](images/clipboard-2804534999.png)

**Agregue las llaves foranea correspondiente :**

![](images/clipboard-2775571780.png)

**Agregue el check del type de la attendances:**

![](images/clipboard-2898305530.png)

**Evidencia de la creacion:**

![](images/clipboard-4211434544.png)

#### 5.11 Creacion de la tabla payments

![](images/clipboard-89239555.png)

**Agregue las llaves foranea correspondiente :**

![](images/clipboard-557438206.png)

**Agregue el check del status de la payments:**

![](images/clipboard-2581187303.png)

**Evidencia de la creacion:**

![](images/clipboard-1293099417.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de SQL Server por la parte visual en SQl Server Management Studio 20, como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-3495912535.png)

## 6. Creacion de la Base de Datos Oracle

#### 6.1 Creacion de Base de Datos por el terminal de DBeaver

![](images/clipboard-3386198360.png)

**Evidencia de la creacion:**

![](images/clipboard-3504977349.png)

#### 6.2 Creacion de la tabla clients

``` sql
create table clients (
    id  number generated always as identity primary key,
    document_type   varchar2(20) not null
                    check (document_type in ('cc', 'ti', 'ce', 'pasaporte', 'ppt')),
    document_number varchar2(30) not null unique,
    name  varchar2(150) not null,
    phone  varchar2(30),
    email  varchar2(150) not null unique,
    status varchar2(20) not null
                    check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-323542112.png)

#### 6.3 Creacion de la tabla plans

``` sql
create table plans (
    id  number generated always as identity primary key,
    name  varchar2(100) not null,
    description varchar2(255),
    status varchar2(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-2090666198.png)

#### 6.4 Creacion de la tabla trainers

``` sql
create table trainers (
    id  number generated always as identity primary key,
    name varchar2(150) not null,
    description varchar2(255),
    status varchar2(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-1182439407.png)

#### 6.5 Creacion de la tabla exercises

``` sql
create table exercises (
    id number generated always as identity primary key,
    name varchar2(150) not null,
    description varchar2(255),
    status varchar2(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null
);
```

![](images/clipboard-3272769202.png)

#### 6.6 Creacion de la tabla memberships

``` sql
create table memberships (
    id number generated always as identity primary key,
    client_id  number not null,
    plan_id  number not null,
    start_date  date not null,
    end_date  date not null,
    status varchar2(20) not null
                check (status in ('active', 'expired', 'cancelled')),
    created_at  timestamp not null,
    updated_at  timestamp not null,

    foreign key (client_id) references clients(id),
    foreign key (plan_id) references plans(id)
);
```

![](images/clipboard-2770841604.png)

#### 6.7 Creacion de la tabla routines

``` sql
create table routines (
    id  number generated always as identity primary key,
    name varchar2(100) not null,
    description varchar2(255),
    status varchar2(20) not null
                check (status in ('active', 'inactive')),
    created_at  timestamp not null,
    updated_at  timestamp not null,
    trainer_id  number not null,
    client_id   number not null,

    foreign key (trainer_id) references trainers(id),
    foreign key (client_id) references clients(id)
);
```

![](images/clipboard-4144225013.png)

#### 6.8 Creacion de la tabla routine_exercises

``` sql
create table routine_exercises (
    id number generated always as identity primary key,
    routine_id   number not null,
    exercise_id  number not null,
    sets number not null,
    repetitions  number not null,
    weight number(10,2),
    rest_seconds number not null,

    foreign key (routine_id) references routines(id),
    foreign key (exercise_id) references exercises(id),

    unique (routine_id, exercise_id)
);
```

![](images/clipboard-2098797240.png)

#### 6.9 Creacion de la tabla measurements

``` sql
create table measurements (
    id number generated always as identity primary key,
    client_id number not null,
    trainer_id  number not null,
    measurement_date date not null,
    weight number(5,2) not null,
    height number(5,2) not null,
    body_fat  number(5,2) not null,
    bmi number(5,2) not null,
    created_at timestamp not null,
    updated_at timestamp not null,

    foreign key (client_id) references clients(id),
    foreign key (trainer_id) references trainers(id)
);
```

![](images/clipboard-746689674.png)

#### 6.10 Creacion de la tabla attendance

``` sql
create table attendance (
    id number generated always as identity primary key,
    membership_id   number not null,
    attendance_date  timestamp not null,
    type varchar2(10) not null
                     check (type in ('entrada', 'salida')),
    created_at timestamp not null,
    updated_at  timestamp not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-232333838.png)

#### 6.11 Creacion de la tabla payments

``` sql
create table payments (
    id number(19) generated always as identity primary key,
    membership_id  number not null,
    method  varchar2(50) not null,
    amount  number(12,2) not null,
    payment_date   timestamp not null,
    status         varchar2(20) not null
                   check (status in ('pending', 'approved', 'rejected')),
    created_at  timestamp not null,
    updated_at  timestamp not null,

    foreign key (membership_id) references memberships(id)
);
```

![](images/clipboard-3602404027.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de Oracle por terminal de DBeaver, como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-1957317663.png)

## 7.  Creacion de Base de Datos se Oracle de forma visual por el gestor Oracle SQl Developer.

#### 7.1 Creacion de Base de Datos 

![](images/clipboard-3386198360.png)

![](images/clipboard-2195175290.png)

#### 7.2 Creacion de la tabla clients

![](images/clipboard-841045882.png)

**Le asigno al id Primary key y a los atributos document y email como unique:**

![](images/clipboard-2601978683.png)

**Le incorpore el check a los atributos document_type y status:**

![](images/clipboard-3617451271.png)

**Evidencia de la creacion:**

![](images/clipboard-1802855528.png)

#### 7.3 Creacion de la tabla plans

![](images/clipboard-730709519.png)

**Le incorpore el check a el atributo status:**

![](images/clipboard-1182494572.png)

**Evidencia de la creacion:**

![](images/clipboard-1781978781.png)

#### 7.4 Creacion de la tabla trainers

![](images/clipboard-1443033239.png)

**Le incorpore el check a el atributo status:**

![](images/clipboard-3569558521.png)

**Evidencia de la creacion:**

![](images/clipboard-859231931.png)

#### 7.5 Creacion de la tabla exercises

![](images/clipboard-756300373.png)

**Le incorpore el check a el status:**

![](images/clipboard-335847896.png)

**Evidencia de la creacion:**

![](images/clipboard-3866047636.png)

#### 7.6 Creacion de la tabla memberships

![](images/clipboard-1485942782.png)

**Le asigno al id Primary key y las llaves foraneas correspondientes y tambien le asigne el check al status :**

![](images/clipboard-1685938857.png)

![](images/clipboard-3782232052.png)

![](images/clipboard-2222847825.png)

**Evidencia de la creacion:**

![](images/clipboard-1370208128.png)

#### 7.7 Creacion de la tabla routines

![](images/clipboard-3625339284.png)

**Le asigno al id Primary key y las llaves foraneas correspondientes y tambien le asigne el check al status :**

![](images/clipboard-4017508413.png)

![![](images/clipboard-3243895842.png)](images/clipboard-420794136.png)

**Evidencia de la creacion:**

![](images/clipboard-3382350302.png)

#### 7.8 Creacion de la tabla routine_exercises

![](images/clipboard-631196359.png)

**Le asigno unique a las dos llaves foraneas :**

![](images/clipboard-1821613772.png)

**Le asigno al id Primary key y las llaves foraneas correspondientes**

![](images/clipboard-2867023139.png)

![](images/clipboard-95989818.png)

**Evidencia de la creacion:**

![](images/clipboard-3533526240.png)

#### 7.9 Creacion de la tabla measurements

![](images/clipboard-824265531.png)

**Le asigno unique a las dos llaves foraneas :**

![![](images/clipboard-3063336491.png)](images/clipboard-357845725.png)

**Evidencia de la creacion:**

![](images/clipboard-502275262.png)

#### 7.10 Creacion de la tabla attendance

![](images/clipboard-1163921126.png)

**Le asigno al id Primary key y la llave foranea correspondientes y tambien le asigne el check al type:**

![](images/clipboard-1362040320.png)

![](images/clipboard-2763779419.png)

**Evidencia de la creacion:**

![](images/clipboard-2933390066.png)

#### 7.11 Creacion de la tabla payments

![](images/clipboard-3797100511.png)

**Le asigno al id Primary key y la llave foranea correspondiente y tambien le asigne el check al status:**

![](images/clipboard-615396824.png)

![](images/clipboard-641634273.png)

**Evidencia de la creacion:**

![](images/clipboard-2434509978.png)

#### Conclusion

Con esto se ha finalizado las creacion de la base de datos de Oracle por la parte visual enOracle SQl Developer, como resultado tenemos las 10 tablas creadas correctamente.

![](images/clipboard-2777569894.png)

**Conclusion Final**

La creación de **ActivaFit** en MySQL, PostgreSQL, SQL Server y Oracle me permitió aprender y fortalecer mis conocimientos. Además, la práctica de crear las tablas, relaciones y restricciones fue muy satisfactoria, ya que me ayudó a tener más práctica con **DBeaver** y las **herramientas visuales nativas** de cada motor.

### Presentado por:

**Elkin Zaith Medina Martinez**

**Estudiante de Ingeniería de Sistemas**

**Universidad de La Guajira**
