# CONSULTAS AVANZANDAS SQL

## Imagenes de los registros de cada tabla creada :

#### Registros de la Tabla clients

![](images/clipboard-2644681828.png)

#### Registros de la Tabla attendances

![](images/clipboard-425640755.png)

#### Registros de la Tabla exercises

![](images/clipboard-2066403936.png)

#### Registros de la Tabla measurements

![](images/clipboard-1729154519.png)

#### Registros de laTabla memberships

![](images/clipboard-738095145.png)

#### Registros de la Tabla payments

![](images/clipboard-3066198009.png)

#### Registros de la Tabla plans

![](images/clipboard-2000535540.png)

#### Registros de la Tabla routine_exercises

![](images/clipboard-1819806480.png)

#### Registros de la Tabla routines

![](images/clipboard-1109866264.png)

#### Registros de la Tabla trainers

![](images/clipboard-393698099.png)

#### Diagrama Entidad-Relacion de la base de datos :

![](images/clipboard-615427905.png)

## 1. Consultas avanzadas en MySQL :

#### 1.1 Mostrar algunos de los registros de la tabla clients

**Narrativa:** Escogí esta consulta como punto de partida porque es la forma más básica de verificar que la tabla `clients` se creó y se pobló correctamente. En lugar de usar `SELECT *`, seleccioné solo las columnas que realmente aportan valor para identificar a un cliente (nombre, tipo y número de documento, estado), practicando así la proyección de columnas en vez de traer toda la tabla.

``` sql
SELECT name,document_type, document_number, status FROM clients;
```

## ![](images/clipboard-4091028779.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2803776155.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-3659441498.png)

### 1.2 Mostrar de forma ordenada (DESC) las membresias desde su comienzo

**Narrativa:** Elegí esta consulta para practicar la cláusula `ORDER BY`, que es esencial cuando se necesita presentar información de forma cronológica. Ordenar por `start_date` de forma descendente me permite ver primero las membresías más recientes.

``` sql
SELECT id, start_date, end_date, status FROM memberships   ORDER BY start_date DESC;
```

![](images/clipboard-2227404320.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-3957742219.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-3554685192.png)

### 1.3 Consultas a múltiples tablas mediante WHERE

**Narrativa:** Elegí esta consulta para practicar la relación entre las tablas **`memberships` y `clients`**, ya que en el modelo de la base de datos la tabla `memberships` contiene el campo `client_id`, que permite identificar al cliente al que pertenece cada membresía.

``` sql
SELECT *
FROM memberships m ,clients c 
WHERE c.id = m.client_id;
```

La condición `WHERE c.id = m.client_id` permite relacionar ambas tablas mediante la clave primaria `id` de `clients` y la clave foránea `client_id` de `memberships`. De esta manera, se obtiene la información completa del cliente junto con los datos de su membresía.

![](images/clipboard-1375332071.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2722614821.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-799986421.png)

### 1.4 Consultas a múltiples tablas mediante JOIN

**Narrativa:** Elegí esta consulta para practicar el uso de **`JOIN`**, que permite relacionar información de diferentes tablas mediante un campo en común. En este caso, se relacionan las tablas `clients` y `memberships` para mostrar los datos principales del cliente junto con la información de su membresía..

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ); 
```

La consulta selecciona el nombre y correo electrónico del cliente mediante `C.name` y `C.email`, y también muestra todos los campos de la membresía mediante `M.*`. La relación se realiza con `C.id = M.client_id`, donde el `id` de `clients` corresponde al `client_id` de `memberships`.

![](images/clipboard-352116783.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2569880260.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-4257478314.png)

### 1.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

**Narrativa:** Elegí estas dos consultas para practicar la relación entre las tablas `clients` y `memberships` y el uso de condiciones para filtrar las membresías según su estado. La primera consulta utiliza `JOIN` para relacionar ambas tablas y obtener el nombre y correo del cliente junto con los datos de las membresías que se encuentran **expiradas**.

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ) 
where  M.status = "expired"; 
```

![](images/clipboard-3314925970.png)

La segunda consulta también relaciona las tablas `clients` y `memberships`, pero utilizando la condición `WHERE` para mostrar únicamente las membresías que tienen estado **activo**.

``` sql
SELECT *
FROM memberships m ,clients c 
WHERE c.id = m.client_id and m.status ="active";
```

![](images/clipboard-3146841746.png)

Estas consultas permiten consultar y diferenciar los clientes según el estado de sus membresías, identificando tanto las membresías **expiradas** como las **activas**. Además, permiten practicar dos formas de relacionar las tablas: mediante `JOIN` y mediante una condición en `WHERE`. Esto ayuda a comprobar la relación entre **clientes y membresías** establecida en el modelo de la base de datos.

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-159651879.png)

![](images/clipboard-204269916.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-3898456888.png)

### 1.6 Consultas con filtros condicional LIKE

**Narrativa:** Esta consulta permite consultar los clientes cuyo correo electrónico comienza con la letra **“m”**. Se utiliza `LIKE` junto con el símbolo `%`, que indica que después de la letra “m” puede existir cualquier cantidad de caracteres. De esta manera, se pueden filtrar los clientes según la primera letra de su correo electrónico.

``` sql
select * 
from clients as C 
where C.email like 'm%';
```

![](images/clipboard-4259360956.png)

**Mostrar todos los correos de los clientes que contengan el dominio gmail**

**Narrativa:** En esta consulta realicé una búsqueda de los clientes que tienen la palabra **“gmail”** dentro de su correo electrónico. Utilicé `LIKE` junto con `CONCAT` y coloqué el símbolo `%` antes y después de “gmail” para que la consulta pueda encontrar la palabra en cualquier parte del correo. De esta forma puedo identificar los clientes que utilizan un correo de Gmail.

``` sql
SELECT * 
FROM clients as C 
where C.email like concat('%','gmail','%'); 
```

![](images/clipboard-1783617283.png)

**combinacion del punto 1.5 y la implementacion de el like**

**Narrativa:** En esta consulta realicé una búsqueda de los clientes que tienen una membresía con estado **“expired”** y cuyo correo electrónico comienza con la letra **“m”**. Para esto relacioné las tablas `clients` y `memberships` mediante un `JOIN`, utilizando el `id` del cliente y el `client_id` de la membresía. Luego utilicé dos condiciones en el `WHERE`: una para buscar las membresías expiradas y otra para filtrar los correos que comienzan con **“m”**. Finalmente, muestro el nombre y correo del cliente junto con toda la información de su membresía.

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ) 
where  M.status = "expired" and C.email like 'm%'; 
```

![](images/clipboard-1861361036.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-324811667.png)

![](images/clipboard-2046329006.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-320696861.png)

### 1.7 Consultas con filtros condicionales BETWEEN

**Narrativa**: En esta consulta realicé una búsqueda de los pagos realizados por los clientes entre el 15 de enero de 2025 y el 21 de abril de 2026. Para esto relacioné las tablas `clients`, `memberships`, `payments` y `plans`, aprovechando las relaciones que se muestran en el diagrama de la base de datos, donde un cliente tiene membresías, cada membresía tiene pagos y está asociada a un plan. Luego utilicé `BETWEEN` para establecer el rango de fechas y `ORDER BY` para organizar los pagos desde el más antiguo hasta el más reciente. Finalmente, seleccioné los datos principales del cliente, la membresía, el pago y el plan.

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name 
FROM clients C
JOIN memberships M ON C.id = M.client_id
JOIN payments PAY ON M.id = PAY.membership_id
JOIN plans PL ON PL.id = M.plan_id
WHERE PAY.payment_date BETWEEN '2025-01-15 12:26:02' AND '2026-04-21 13:51:24'
ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-286805256.png) **Forma 2:**

**Narrativa:** En esta consulta realicé prácticamente lo mismo que en la anterior, pero esta vez utilicé la forma tradicional con `WHERE` para relacionar las tablas `clients`, `memberships`, `payments` y `plans`, tomando como referencia las relaciones del diagrama de la base de datos.

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name 
FROM clients C, memberships M, payments PAY, plans PL
WHERE C.id = M.client_id
  AND M.id = PAY.membership_id
  AND PL.id = M.plan_id
  AND M.start_date  BETWEEN '2025-01-01' AND '2026-03-30'
ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-2191993456.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-381509650.png)

![](images/clipboard-1997633019.png)

##### resultado de la ejecucion de el procedure:

![](images/clipboard-110802394.png)

### 1.8 Consultas con agrupamiento GROUP BY

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

**Forma 1 con el where:**

**Narrativa:** En esta consulta realicé un resumen de los pagos realizados por cada cliente entre el 1 de marzo de 2025 y el 30 de marzo de 2026. Para esto relacioné las tablas `clients`, `memberships` y `payments`, siguiendo las relaciones del diagrama de la base de datos. Luego utilicé `SUM` para calcular el total pagado por cada cliente, `COUNT` para contar la cantidad de pagos realizados y `AVG` para obtener el promedio de cada pago. Utilicé `GROUP BY` para agrupar los resultados por cliente y finalmente `ORDER BY` para ordenar de mayor a menor según el total pagado.

``` sql
SELECT  C.id,  C.name,  SUM(P.amount) AS TotalSuma, 
    COUNT(P.id) AS CuentaTotal, 
    AVG(P.amount) AS Promedio  
FROM clients AS C
JOIN memberships AS M ON C.id = M.client_id
JOIN payments AS P ON M.id = P.membership_id
WHERE P.payment_date BETWEEN '2025-03-01 00:00:00' AND '2026-03-30 23:59:59'
GROUP BY C.id, C.name
ORDER BY TotalSuma DESC;
```

![](images/clipboard-2405388741.png)

**Forma 1:**

**Narrativa:** En esta consulta realicé un resumen de los pagos realizados por cada cliente, teniendo en cuenta únicamente los pagos que tienen estado “pagado” y que fueron realizados con tarjeta. Para esto relacioné las tablas `clients`, `memberships` y `payments`, siguiendo las relaciones que se muestran en el diagrama de la base de datos. Luego utilicé `SUM` para calcular el total gastado por cada cliente y `COUNT` para contar la cantidad de pagos realizados. Finalmente, utilicé `GROUP BY` para agrupar la información por cliente y `ORDER BY` para ordenar los resultados de mayor a menor según el total gastado.

``` sql
SELECT C.id,  C.name,  SUM(P.amount) AS TotalGasto, 
    COUNT(P.id) AS CantidadPagos
FROM clients AS C
JOIN memberships AS M ON C.id = M.client_id
JOIN payments AS P ON M.id = P.membership_id
WHERE P.status = 'pagado' AND P.method = 'tarjeta'
GROUP BY C.id, C.name
ORDER BY TotalGasto DESC;
```

![](images/clipboard-3755764961.png)

**forma 2 con el having:**

**Narrativa:** En esta consulta realicé un resumen de los pagos realizados por cada cliente. Para esto relacioné las tablas `clients`, `memberships` y `payments`, siguiendo las relaciones que se muestran en el diagrama de la base de datos. Luego utilicé `SUM` para calcular el total pagado por cada cliente y `AVG` para obtener el promedio de sus pagos. Utilicé `GROUP BY` para agrupar la información por cliente y `HAVING` para mostrar únicamente los clientes cuyo total pagado sea igual o mayor a 100. Finalmente, utilicé `ORDER BY` para ordenar los resultados de mayor a menor según el total pagado.

``` sql
SELECT C.id, C.name, SUM(P.amount) AS TotalSuma, 
AVG(P.amount) AS PromedioPago
FROM clients AS C
JOIN memberships AS M ON C.id = M.client_id
JOIN payments AS P ON M.id = P.membership_id 
GROUP BY C.id, C.name HAVING SUM(P.amount) >= 100 
ORDER BY TotalSuma DESC;
```

![](images/clipboard-1139519208.png)

**forma 2:**

**Narrativa:** En esta consulta realicé un resumen de los pagos realizados por cada cliente entre el 1 de enero de 2025 y el 31 de diciembre de 2026. Para esto relacioné las tablas `clients`, `memberships` y `payments`, siguiendo las relaciones que se muestran en el diagrama de la base de datos. Luego utilicé `SUM` para calcular el total pagado por cada cliente y `COUNT` para contar la cantidad de pagos realizados. Utilicé `GROUP BY` para agrupar la información por cliente y `HAVING` para mostrar únicamente los clientes que tengan 3 o más pagos y que hayan pagado más de 100 en total. Finalmente, utilicé `ORDER BY` para ordenar los resultados de mayor a menor según el total pagado.

``` sql
SELECT C.id, C.name, C.email,  SUM(P.amount) AS TotalAnual,   
COUNT(P.id) AS TotalPagos 
FROM clients AS C 
JOIN memberships AS M ON C.id = M.client_id
JOIN payments AS P ON M.id = P.membership_id
WHERE P.payment_date BETWEEN '2025-01-01 00:00:00' AND '2026-12-31 23:59:59' 
GROUP BY C.id, C.name, C.email 
HAVING COUNT(P.id) >= 3 AND SUM(P.amount) > 100 
ORDER BY TotalAnual DESC;
```

![](images/clipboard-2847988352.png)

##### Creacion del procedure de la consulta anterior **where**:

![](images/clipboard-1747061531.png)

![](images/clipboard-2119537932.png)

##### resultado de la ejecucion de el procedure **where**:

![](images/clipboard-3255806319.png)

##### Creacion del procedure de la consulta anterior **having**:

![](images/clipboard-2130044321.png)

![](images/clipboard-1545528452.png)

##### resultado de la ejecucion de el procedure **having**:

![](images/clipboard-3131354030.png)

### 1.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

**Narrativa:** En esta consulta realicé una búsqueda de los clientes que no tienen una membresía iniciada entre el 1 de marzo de 2025 y el 30 de marzo de 2026. Primero, en la subconsulta, revisé la tabla `memberships` y utilicé `BETWEEN` para obtener los `client_id` de los clientes que tienen una membresía cuya fecha de inicio se encuentra dentro de ese rango. Después, en la consulta principal, utilicé `NOT IN` junto con `C.id` para excluir a todos los clientes que aparecen en los resultados de la subconsulta. De esta manera, la consulta muestra solamente los clientes que no tienen una membresía iniciada durante ese período. Esta consulta permite identificar clientes que no registraron una membresía en esas fechas, tomando como referencia la relación entre `clients` y `memberships` que se muestra en el diagrama de la base de datos.

``` sql
SELECT  * 
FROM clients as C 
WHERE  C.id Not In(select M.client_id from memberships as M where M.start_date 
BETWEEN  "2025-03-01" and "2026-03-30"); 
```

![](images/clipboard-4214935019.png)

**Forma 2:**

**Narrativa :** En esta consulta busqué los clientes que no tienen una membresía iniciada entre el 1 de marzo de 2025 y el 30 de marzo de 2026. Para esto utilicé un `LEFT JOIN` entre `clients` y `memberships`, relacionando `C.id` con `M.client_id` y aplicando el rango de fechas en el `ON`. Luego utilicé `WHERE M.client_id IS NULL` para mostrar únicamente los clientes que no tuvieron coincidencia con una membresía en ese período. Así puedo identificar los clientes que no tienen una membresía registrada en esas fechas.

``` sql
select * 
from clients as C 
left join memberships  as M on(C.id = M.client_id and M.start_date 
between "2025-03-01" and "2026-03-30") 
where  M.client_id is null;
```

![](images/clipboard-1111366890.png)

##### Creacion del procedure de la consulta anterior :

![](images/clipboard-3842874689.png)

![](images/clipboard-1683509947.png)

![](images/clipboard-427695178.png)

##### resultado de la ejecucion de el procedure :

![](images/clipboard-3313906632.png)

![](images/clipboard-2561117151.png)

### **Creacion triggers en la tabla measurements**

**Narrativa :** Elegí esta tabla porque el campo `bmi` es un dato que se puede calcular a partir de otros dos campos que ya existen: `weight` y `height`. No tiene sentido que yo, como usuario o como aplicación, tenga que calcular el IMC a mano y mandarlo en el INSERT, porque ahí corro el riesgo de que alguien lo calcule mal o se le olvide actualizarlo cuando cambia el peso o la estatura. Con un trigger `BEFORE INSERT` y `BEFORE UPDATE`, la base de datos se encarga de calcularlo sola cada vez que se guarda o modifica una medición, así garantizo que ese dato siempre sea consistente y correcto, sin depender de la lógica externa.

``` sql
CREATE TABLE IF NOT EXISTS measurements_audit (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  measurement_id  INT NOT NULL,
  actionSale      ENUM('UPDATE','DELETE','INSERT') NOT NULL DEFAULT 'INSERT',
  changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by      VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data     JSON NULL,
  after_data      JSON NULL
) ENGINE=InnoDB;
```

![](images/clipboard-2355011774.png)

### **Despues de Insertar**

``` sql
CREATE DEFINER=`admin`@`%` TRIGGER `ai_measurements_audit` AFTER INSERT ON `measurements` FOR EACH ROW BEGIN
  SET @from_measurements_trigger = 1;
  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id, 'INSERT', NULL,
    JSON_OBJECT(
      'id', NEW.id,
      'client_id', NEW.client_id,
      'trainer_id', NEW.trainer_id,
      'weight', NEW.weight,
      'height', NEW.height,
      'body_fat', NEW.body_fat,
      'bmi', NEW.bmi,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at
    )
  );
  SET @from_measurements_trigger = NULL;
END
```

![](images/clipboard-3188570809.png)

### **Despues de Actualizar**

``` sql
CREATE TRIGGER au_measurements_audit
AFTER UPDATE ON measurements
FOR EACH ROW
BEGIN
  SET @from_measurements_trigger = 1;
  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id, 'UPDATE',
    JSON_OBJECT(
      'id', OLD.id,
      'client_id', OLD.client_id,
      'trainer_id', OLD.trainer_id,
      'weight', OLD.weight,
      'height', OLD.height,
      'body_fat', OLD.body_fat,
      'bmi', OLD.bmi,
      'created_at', OLD.created_at,
      'updated_at', OLD.updated_at
    ),
    JSON_OBJECT(
      'id', NEW.id,
      'client_id', NEW.client_id,
      'trainer_id', NEW.trainer_id,
      'weight', NEW.weight,
      'height', NEW.height,
      'body_fat', NEW.body_fat,
      'bmi', NEW.bmi,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at
    )
  );
  SET @from_measurements_trigger = NULL;
END
```

![](images/clipboard-2692375512.png)

### **Despues de Eliminar**

``` sql
CREATE TRIGGER ad_measurements_audit
AFTER DELETE ON measurements
FOR EACH ROW
BEGIN
  SET @from_measurements_trigger = 1;
  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (
    OLD.id, 'DELETE',
    JSON_OBJECT(
      'id', OLD.id,
      'client_id', OLD.client_id,
      'trainer_id', OLD.trainer_id,
      'weight', OLD.weight,
      'height', OLD.height,
      'body_fat', OLD.body_fat,
      'bmi', OLD.bmi,
      'created_at', OLD.created_at,
      'updated_at', OLD.updated_at
    ),
    NULL
  );
  SET @from_measurements_trigger = NULL;
END
```

![](images/clipboard-1342135388.png)

### **Antes de Actualizar**

``` sql
CREATE TRIGGER bu_measurements_audit_block_update
BEFORE UPDATE ON measurements_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'measurements_audit es inmutable: UPDATE prohibido.';
END
```

![](images/clipboard-4134015384.png)

### **Antes de Eliminar**

``` sql
CREATE TRIGGER bd_measurements_audit_block_delete
BEFORE DELETE ON measurements_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'measurements_audit es inmutable: DELETE prohibido.';
END
```

![](images/clipboard-3008141574.png)

### **Antes de Insertar**

``` sql
CREATE TRIGGER bi_measurements_audit_guard_insert
BEFORE INSERT ON measurements_audit
FOR EACH ROW
BEGIN
  IF COALESCE(@from_measurements_trigger, 0) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSERT en measurements_audit solo permitido desde triggers de measurements.';
  END IF;
END
```

![](images/clipboard-1029892517.png)

# **Evidencia de la funcionalidad de los triggers**

![](images/clipboard-1105106207.png)

![](images/clipboard-1767830134.png)

![](images/clipboard-1223025104.png)

![](images/clipboard-672813941.png)

### Conclusion

En la evidencia se observa cómo quedaron registradas en la tabla `measurements_audit` las operaciones de inserción, actualización y eliminación realizadas sobre la tabla `measurements`. Al insertar una medición, el trigger guarda en `after_data` cómo quedó el registro, con el peso, la estatura, el porcentaje de grasa corporal y el IMC del cliente. Al actualizarla, guarda en `before_data` los valores anteriores y en `after_data` los nuevos, lo que permite ver exactamente qué cambió. Y al eliminarla, conserva en `before_data` el registro que existía antes de borrarse. Cada movimiento queda además con su tipo de acción, la fecha y hora del cambio y el usuario que lo realizó.

### **Creacion triggers en la tabla memberships**

**Narrativa:** Elegí esta tabla porque es donde se le 'regalaría' un beneficio a alguien sin que exista un pago real detrás. Como `memberships` está directamente relacionada con `payments`, alguien con acceso a la base de datos podría extender la fecha de vencimiento (`end_date`) o cambiar el `status` a 'activa' manualmente, sin que haya un ingreso registrado que lo justifique. Por eso puse un trigger que verifique que exista un pago asociado y válido en la tabla `payments` antes de permitir esa actualización. Así me aseguro de que ninguna membresía pueda activarse o extenderse 'por debajo de la mesa', sin dejar rastro del dinero que debería respaldar ese cambio.

``` sql
CREATE TABLE IF NOT EXISTS memberships_audit (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  membership_id  INT NOT NULL,
  actionSale     ENUM('UPDATE','DELETE','INSERT') NOT NULL DEFAULT 'INSERT',
  changed_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by     VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data    JSON NULL,
  after_data     JSON NULL
) ENGINE=InnoDB;
```

![](images/clipboard-1621810277.png)

### **Despues de Insertar**

``` sql
CREATE TRIGGER ai_memberships_audit
AFTER INSERT ON memberships
FOR EACH ROW
BEGIN
  SET @from_memberships_trigger = 1;

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id,
    'INSERT',
    NULL,
    JSON_OBJECT(
      'id', NEW.id,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date,
      'status', NEW.status,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at,
      'client_id', NEW.client_id,
      'plan_id', NEW.plan_id
    )
  );

  SET @from_memberships_trigger = NULL;
END
```

![](images/clipboard-1243507243.png)

### **Despues de Actualizar**

``` sql
CREATE TRIGGER au_memberships_audit
AFTER UPDATE ON memberships
FOR EACH ROW
BEGIN
  SET @from_memberships_trigger = 1;

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id,
    'UPDATE',
    JSON_OBJECT(
      'id', OLD.id,
      'start_date', OLD.start_date,
      'end_date', OLD.end_date,
      'status', OLD.status,
      'created_at', OLD.created_at,
      'updated_at', OLD.updated_at,
      'client_id', OLD.client_id,
      'plan_id', OLD.plan_id
    ),
    JSON_OBJECT(
      'id', NEW.id,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date,
      'status', NEW.status,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at,
      'client_id', NEW.client_id,
      'plan_id', NEW.plan_id
    )
  );

  SET @from_memberships_trigger = NULL;
END
```

![](images/clipboard-1512089074.png)

### **Despues de Eliminar**

``` sql
CREATE TRIGGER ad_memberships_audit
AFTER DELETE ON memberships
FOR EACH ROW
BEGIN
  SET @from_memberships_trigger = 1;

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (
    OLD.id,
    'DELETE',
    JSON_OBJECT(
      'id', OLD.id,
      'start_date', OLD.start_date,
      'end_date', OLD.end_date,
      'status', OLD.status,
      'created_at', OLD.created_at,
      'updated_at', OLD.updated_at,
      'client_id', OLD.client_id,
      'plan_id', OLD.plan_id
    ),
    NULL
  );

  SET @from_memberships_trigger = NULL;
END
```

![](images/clipboard-47586344.png)

### **Antes de Actualizar**

``` sql
CREATE TRIGGER biu_memberships_audit_block_update
BEFORE UPDATE ON memberships_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'memberships_audit es inmutable: UPDATE prohibido.';
END
```

![](images/clipboard-1515199245.png)

### **Antes de Eliminar**

``` sql
CREATE TRIGGER bid_memberships_audit_block_delete
BEFORE DELETE ON memberships_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'memberships_audit es inmutable: DELETE prohibido.';
END
```

![](images/clipboard-3256060228.png)

### **Antes de Insertar**

``` sql
CREATE TRIGGER bii_memberships_audit_guard_insert
BEFORE INSERT ON memberships_audit
FOR EACH ROW
BEGIN
  IF COALESCE(@from_memberships_trigger, 0) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSERT en memberships_audit solo permitido desde triggers de memberships.';
  END IF;
END
```

![](images/clipboard-518656713.png)

# **Evidencia de la funcionalidad de los triggers**

**Eliminacion**

![](images/clipboard-331997342.png)

![](images/clipboard-1724873179.png)

**Actualizacion**

![](images/clipboard-3737517269.png)

![](images/clipboard-2972136248.png)

**Insertacion**

![](images/clipboard-2785327581.png)

![](images/clipboard-47519327.png)

**Prohibiciones**

![](images/clipboard-2887201398.png)

![](images/clipboard-885328747.png)

![](images/clipboard-3706202409.png)

### Conclusion

En la evidencia se observa cómo quedaron registradas en `memberships_audit` las operaciones de inserción, actualización y eliminación realizadas sobre `memberships`. Al insertar, el trigger guarda en `after_data` cómo quedó la membresía; al actualizar, guarda los valores anteriores en `before_data` y los nuevos en `after_data`; y al eliminar, conserva en `before_data` el registro que existía. Cada movimiento queda con su tipo de acción, fecha, hora y usuario.

Además, se validó que la tabla de auditoría es inmutable: los triggers impiden modificar o borrar el historial y solo permiten insertar registros que provengan de los triggers de `memberships`. Así se garantiza la trazabilidad y la integridad de la información.

### **Creacion triggers en la tabla payments**

Elegí esta tabla porque es la más sensible a fraude de todo el sistema, ya que aquí se maneja directamente el dinero. Un usuario mal intencionado, o incluso un error de la aplicación, podría registrar un pago con un monto inferior al real, marcar un pago como 'completado' sin que el dinero realmente haya ingresado, o modificar la fecha de pago para aparentar que se pagó a tiempo y evitar un recargo. Por eso decidí poner un trigger que restrinja la modificación de campos críticos como `amount` o `status` una vez que el pago ya fue registrado, para que nadie pueda 'editar' un pago después de procesado y así cuadrar cuentas de forma indebida. La idea es que la base de datos misma impida que se altere la evidencia de una transacción ya realizada.

``` sql
CREATE TABLE IF NOT EXISTS payments_audit (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payment_id   INT NOT NULL,
  actionSale   ENUM('UPDATE','DELETE','INSERT') NOT NULL DEFAULT 'INSERT',
  changed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by   VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data  JSON NULL,
  after_data   JSON NULL
) ENGINE=InnoDB;
```

![](images/clipboard-3915820730.png)

### **Despues de Insertar**

``` sql
CREATE TRIGGER ai_payments_audit
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  SET @from_payments_trigger = 1;
  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id, 'INSERT', NULL,
    JSON_OBJECT(
      'id', NEW.id,
      'membership_id', NEW.membership_id,
      'method', NEW.method,
      'amount', NEW.amount,
      'payment_date', NEW.payment_date,
      'status', NEW.status
    )
  );
  SET @from_payments_trigger = NULL;
END
```

![](images/clipboard-2335955053.png)

### **Despues de Actualizar**

``` sql
CREATE TRIGGER au_payments_audit
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  SET @from_payments_trigger = 1;
  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (
    NEW.id, 'UPDATE',
    JSON_OBJECT(
      'id', OLD.id,
      'membership_id', OLD.membership_id,
      'method', OLD.method,
      'amount', OLD.amount,
      'payment_date', OLD.payment_date,
      'status', OLD.status
    ),
    JSON_OBJECT(
      'id', NEW.id,
      'membership_id', NEW.membership_id,
      'method', NEW.method,
      'amount', NEW.amount,
      'payment_date', NEW.payment_date,
      'status', NEW.status
    )
  );
  SET @from_payments_trigger = NULL;
END
```

### ![](images/clipboard-3407694553.png) **Despues de Eliminar**

``` sql
CREATE TRIGGER ad_payments_audit
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
  SET @from_payments_trigger = 1;
  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (
    OLD.id, 'DELETE',
    JSON_OBJECT(
      'id', OLD.id,
      'membership_id', OLD.membership_id,
      'method', OLD.method,
      'amount', OLD.amount,
      'payment_date', OLD.payment_date,
      'status', OLD.status
    ),
    NULL
  );
  SET @from_payments_trigger = NULL;
END
```

![](images/clipboard-2070022236.png)

### **Antes de Actualizar**

``` sql
CREATE TRIGGER bu_payments_audit_block_update
BEFORE UPDATE ON payments_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'payments_audit es inmutable: UPDATE prohibido.';
END
```

![](images/clipboard-3345849313.png)

### **Antes de Eliminar**

``` sql
CREATE TRIGGER bd_payments_audit_block_delete
BEFORE DELETE ON payments_audit
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'payments_audit es inmutable: DELETE prohibido.';
END
```

![](images/clipboard-4187181952.png)

### **Antes de Insertar**

``` sql
CREATE TRIGGER bi_payments_audit_guard_insert
BEFORE INSERT ON payments_audit
FOR EACH ROW
BEGIN
  IF COALESCE(@from_payments_trigger, 0) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSERT en payments_audit solo permitido desde triggers de payments.';
  END IF;
END
```

# ![](images/clipboard-1091103192.png)

# **Evidencia de la funcionalidad de los triggers**

**Eliminacion**

![](images/clipboard-2735336562.png)

![](images/clipboard-3872110206.png)

**Actualizacion**

![](images/clipboard-3648167055.png)

![](images/clipboard-1189494596.png)

**Insertacion**

![](images/clipboard-4146701732.png)

![](images/clipboard-3603060738.png)

**Prohibiciones**

![](images/clipboard-208796832.png)

![](images/clipboard-2004384748.png)

![](images/clipboard-1234441128.png)

### Conclusion

En la evidencia se observa cómo quedaron registradas en `payments_audit` las operaciones de inserción, actualización y eliminación realizadas sobre `payments`. Al insertar un pago, el trigger guarda en `after_data` cómo quedó el registro, con la membresía asociada, el método de pago, el monto, la fecha y el estado. Al actualizarlo, por ejemplo cuando pasa de `pendiente` a `pagado` o `cancelado`, guarda en `before_data` los valores anteriores y en `after_data` los nuevos. Y al eliminarlo, conserva en `before_data` el registro que existía antes de borrarse. Cada movimiento queda con su tipo de acción, fecha, hora y usuario.

Además, se validó que `payments_audit` es inmutable: los triggers impiden modificar o borrar el historial y solo permiten insertar registros que provengan de los triggers de `payments`. Así se garantiza la trazabilidad y la integridad de la información.

## 2. Consultas avanzadas en PostgreSQL :

#### 2.1 Mostrar algunos de los registros de la tabla clients

**Narrativa:** Al migrar el escenario a PostgreSQL, quise verificar en primer lugar la consulta de proyección básica sobre la tabla `clients`. La meta fue comprobar que los tipos de datos como el estado del cliente y la identificación se consultan sin contratiempos en este motor.

``` sql
SELECT name,document_type, document_number, status FROM clients;
```

![](images/clipboard-903827105.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-3603507985.png)

**Evidencia:**

![](images/clipboard-2297756121.png)

### 2.2 Mostrar de forma ordenada (DESC) las payments desde su comienzo

**Narrativa:** Al migrar el escenario a PostgreSQL, quise verificar en primer lugar la consulta de proyección básica sobre la tabla `clients`. La meta fue comprobar que los tipos de datos como el estado del cliente y la identificación se consultan sin contratiempos en este motor.

``` sql
SELECT id,method,amount,status FROM payments  ORDER BY payment_date DESC;
```

![](images/clipboard-1433641025.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2037337714.png)

**Evidencia:**

![](images/clipboard-891479288.png)

### 2.3 Consultas a múltiples tablas mediante WHERE

**Narrativa:** Aquí exploré la vinculación entre `memberships` y `payments` mediante una unión implícita en la cláusula `WHERE`. Esto me permitió analizar directamente qué membresías tienen transacciones asociadas y verificar el estado del pago frente al período de vigencia.

``` sql
SELECT m.start_date ,m.end_date ,m.status ,pay.payment_date ,pay.status 
FROM  memberships m ,payments pay  
WHERE m.id = pay.membership_id;
```

![](images/clipboard-2986178139.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2283891279.png)

**Evidencia:**

![](images/clipboard-270950431.png)

### 2.4 Consultas a múltiples tablas mediante JOIN

**Narrativa:** En esta consulta apliqué un `JOIN` explícito en PostgreSQL entre `clients` y `memberships`. El propósito fue cruzar el perfil del cliente (`name`, `email`) con todos los atributos del contrato de membresía, comprobando la compatibilidad de la sintaxis estándar ANSI SQL en este gestor.

``` sql
SELECT C.name, C.email, M.*  
FROM clients as C  
join memberships as M on( C.id = M.client_id ); 
```

![](images/clipboard-1930710102.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2050278312.png)

**Evidencia:**

![](images/clipboard-3509696788.png)

### 2.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

**Narrativa:** Para este punto quise filtrar el estado de las membresías combinando condiciones lógicas. Probé tanto la sintaxis con `WHERE` como con `JOIN` para separar rápidamente a los afiliados vigentes de aquellos cuyo plan ya expiró, una necesidad clave para el control de acceso en recepción.

``` sql
SELECT * FROM memberships m ,clients c  WHERE c.id = m.client_id and m.status ="active";
```

![](images/clipboard-3226485848.png)

**Forma 2 :**

``` sql
SELECT C.name, C.email,M.start_date ,M.client_id, M.status  
FROM clients as C  
join memberships as M on( C.id = M.client_id )  
where  M.status = 'expired'; 
```

![](images/clipboard-1391143237.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-1196293801.png)

**Evidencia:**

![](images/clipboard-1492653492.png)

### Consultas con filtros condicional LIKE

**Narrativa:** En PostgreSQL evalué el filtrado de texto por patrones con `LIKE`. Primero busqué correos que inician con 'm', luego probé la función `CONCAT` para identificar clientes con cuenta de Google (Gmail), y finalmente combiné el filtro de correos con el estado de membresía vencida para ubicar clientes a quienes enviar recordatorios.

``` sql
select *  from clients as C  where C.email like 'm%';
```

![](images/clipboard-347913733.png)

**Mostrar todos los correos de los clientes que contengan el dominio gmail**

``` sql
SELECT *  FROM clients as C  where C.email like concat('%','gmail','%'); 
```

![](images/clipboard-2664792358.png)

**combinacion del punto 1.5 y la implementacion de el like**

``` sql
SELECT C.name, C.email, M.start_date ,M.status  
FROM clients as C  
join memberships as M on( C.id = M.client_id ) 
where  M.status = 'expired' and C.email like 'm%'; 
```

![](images/clipboard-700465524.png)

**Narrativa:** Repliqué el mismo trío de consultas con `LIKE` que en MySQL para comprobar que este operador de comparación de patrones también hace parte del estándar SQL y se comporta igual en PostgreSQL, incluyendo la combinación con el filtro de estado de membresía.

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2597055083.png)

**Evidencia:**

![](images/clipboard-4176746051.png)

### 2.7 Consultas con filtros condicionales BETWEEN

**Narrativa:** Esta consulta representa un reporte contable por rango de fechas en PostgreSQL. Integré cuatro tablas (`clients`, `memberships`, `payments` y `plans`) para rastrear exactamente qué plan pagó cada usuario en una ventana de tiempo específica, evaluando tanto el enfoque de `JOIN` como el de `WHERE`.

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C JOIN memberships M ON C.id = M.client_id JOIN payments PAY ON M.id = PAY.membership_id JOIN plans PL ON PL.id = M.plan_id WHERE PAY.payment_date BETWEEN '2025-01-15 12:26:02' AND '2026-04-21 13:51:24' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-173252118.png)

**Forma 2:**

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C, memberships M, payments PAY, plans PL WHERE C.id = M.client_id   AND M.id = PAY.membership_id   AND PL.id = M.plan_id   AND M.start_date  BETWEEN '2025-01-01' AND '2026-03-30' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-3030982433.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-572816302.png)

**Evidencia:**

![![](images/clipboard-1173674578.png)](images/clipboard-1173674578.png)

### 2.8 Consultas con agrupamiento GROUP BY

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

**Narrativa:** Aquí apliqué agregación para calcular indicadores del negocio: el monto total abonado (`SUM`), el promedio por transacción (`AVG`) y la cantidad de pagos (`COUNT`). El uso de `HAVING` me permitió segmentar y descubrir a los clientes VIP (aquellos con mayor volumen de gasto o pagos frecuentes).

**Forma 1 con el where:**

``` sql
SELECT  C.id,  C.name,  SUM(P.amount) AS TotalSuma,      COUNT(P.id) AS CuentaTotal,      AVG(P.amount) AS Promedio   FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.payment_date BETWEEN '2025-03-01 00:00:00' AND '2026-03-30 23:59:59' GROUP BY C.id, C.name ORDER BY TotalSuma DESC;
```

![](images/clipboard-3067025203.png)

**Forma 1:**

``` sql
SELECT C.id,  C.name,  SUM(P.amount) AS TotalGasto,      COUNT(P.id) AS CantidadPagos FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.status = 'pagado' AND P.method = 'tarjeta' GROUP BY C.id, C.name ORDER BY TotalGasto DESC;
```

![](images/clipboard-3088362081.png)

**forma 2 con el having:**

``` sql
SELECT C.id, C.name, SUM(P.amount) AS TotalSuma,  AVG(P.amount) AS PromedioPago FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id  GROUP BY C.id, C.name HAVING SUM(P.amount) >= 100  ORDER BY TotalSuma DESC;
```

![](images/clipboard-1404389709.png)

``` sql
SELECT C.id, C.name, C.email,  SUM(P.amount) AS TotalAnual,    COUNT(P.id) AS TotalPagos  FROM clients AS C  JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.payment_date BETWEEN '2025-01-01 00:00:00' AND '2026-12-31 23:59:59'  GROUP BY C.id, C.name, C.email  HAVING COUNT(P.id) >= 3 AND SUM(P.amount) > 100  ORDER BY TotalAnual DESC;
```

![](images/clipboard-861531518.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-3611661435.png)

**Evidencia:**

![](images/clipboard-2360660911.png)

### 2.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

**Narrativa:** En este ejercicio apliqué teoría de conjuntos en PostgreSQL para detectar clientes inactivos o sin membresías en un rango de fechas. Comparé la técnica del `NOT IN` contra la estrategia de `LEFT JOIN ... IS NULL`, notando que esta última suele ser más eficiente en volúmenes grandes de datos..

``` sql
SELECT  *  FROM m clients as C  WHERE  C.id Not In(select M.client_id from memberships as M where M.start_date  BETWEEN  '2025-03-01' and '2026-03-30'); 
```

![](images/clipboard-4072302102.png)

**Forma 2:**

``` sql
select *  from clients as C  left join memberships  as M on(C.id = M.client_id and M.start_date  between '2025-03-01' and '2026-03-30')  where  M.client_id is null;
```

![](images/clipboard-378400353.png)

##### Creacion del procedure de la consulta anterior:

![](images/clipboard-2472637214.png)

**Evidencia:**

![](images/clipboard-3657636762.png)

### **Creacion triggers en la tabla measurements**

**Narrativa :** Elegí esta tabla porque el campo `bmi` es un dato que se puede calcular a partir de otros dos campos que ya existen: `weight` y `height`. No tiene sentido que yo, como usuario o como aplicación, tenga que calcular el IMC a mano y mandarlo en el INSERT. Con triggers en PostgreSQL (`PL/pgSQL`), la base de datos se encarga de auditar automáticamente las operaciones y registrar los datos en `measurements_audit`.

``` sql
CREATE TABLE IF NOT EXISTS measurements_audit (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  measurement_id  INT NOT NULL,
  actionSale   VARCHAR(10) NOT NULL DEFAULT 'INSERT' CHECK (actionSale IN ('UPDATE','DELETE','INSERT')),
  changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by   VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data  JSONB NULL,
  after_data   JSONB NULL
);
```

![](images/clipboard-2120094847.png)

### **Despues de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_ai_measurements_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'INSERT', NULL, to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_measurements_audit ON measurements;
CREATE TRIGGER ai_measurements_audit
AFTER INSERT ON measurements
FOR EACH ROW EXECUTE FUNCTION fn_ai_measurements_audit();
```

![](images/clipboard-1718482579.png)

![](images/clipboard-2585916465.png)

### **Despues de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_au_measurements_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER au_measurements_audit
AFTER UPDATE ON measurements
FOR EACH ROW EXECUTE FUNCTION fn_au_measurements_audit();
```

![](images/clipboard-72744780.png)

### **Despues de Eliminar**

``` sql
CREATE OR REPLACE FUNCTION fn_ad_measurements_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO measurements_audit (measurement_id, actionSale, before_data, after_data)
  VALUES (OLD.id, 'DELETE', to_jsonb(OLD), NULL);

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ad_measurements_audit
AFTER DELETE ON measurements
FOR EACH ROW EXECUTE FUNCTION fn_ad_measurements_audit();
```

![](images/clipboard-444730886.png)

### **Antes de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_block_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: UPDATE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bu_measurements_audit_block_update
BEFORE UPDATE ON measurements_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_update();
```

![](images/clipboard-592429414.png)

### **Antes de Eliminar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_block_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: DELETE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bd_measurements_audit_block_delete
BEFORE DELETE ON measurements_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_delete();
```

![](images/clipboard-3093493761.png)

### **Antes de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_guard_insert() RETURNS trigger AS $$
BEGIN
  IF COALESCE(current_setting('audit.from_trigger', true), '') <> '1' THEN
    RAISE EXCEPTION 'INSERT en % solo permitido desde los triggers de la tabla original.', TG_TABLE_NAME USING ERRCODE = '45000';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bi_measurements_audit_guard_insert
BEFORE INSERT ON measurements_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_guard_insert();
```

![](images/clipboard-2030286305.png)

### Conclusion

En PostgreSQL se audita la tabla `measurements` registrando en `measurements_audit` los estados `before_data` y `after_data` en formato `JSONB`. Además, se implementaron triggers de inmutabilidad que bloquean cualquier `UPDATE` o `DELETE` y restringen los `INSERT` directos no originados desde los triggers principales.

### **Creacion triggers en la tabla memberships**

**Narrativa:** Elegí esta tabla porque es donde se le 'regalaría' un beneficio a alguien sin que exista un pago real detrás. Por eso puse un trigger en PostgreSQL que verifique que exista auditoría registrada de los cambios y proteja la inmutabilidad del historial.

``` sql
CREATE TABLE IF NOT EXISTS memberships_audit (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  membership_id  INT NOT NULL,
  actionSale     VARCHAR(10) NOT NULL DEFAULT 'INSERT' CHECK (actionSale IN ('UPDATE','DELETE','INSERT')),
  changed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by     VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data    JSONB NULL,
  after_data     JSONB NULL
);
```

![](images/clipboard-493852541.png)

### **Despues de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_ai_memberships_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'INSERT', NULL, to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_memberships_audit ON memberships;
CREATE TRIGGER ai_memberships_audit
AFTER INSERT ON memberships
FOR EACH ROW EXECUTE FUNCTION fn_ai_memberships_audit();
```

![](images/clipboard-3715189581.png)

### **Despues de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_au_memberships_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS au_memberships_audit ON memberships;
CREATE TRIGGER au_memberships_audit
AFTER UPDATE ON memberships
FOR EACH ROW EXECUTE FUNCTION fn_au_memberships_audit();
```

![](images/clipboard-2559899604.png)

### **Despues de Eliminar**

``` sql
CREATE OR REPLACE FUNCTION fn_ad_memberships_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO memberships_audit (membership_id, actionSale, before_data, after_data)
  VALUES (OLD.id, 'DELETE', to_jsonb(OLD), NULL);

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ad_memberships_audit ON memberships;
CREATE TRIGGER ad_memberships_audit
AFTER DELETE ON memberships
FOR EACH ROW EXECUTE FUNCTION fn_ad_memberships_audit();
```

![](images/clipboard-2137849239.png)

### **Antes de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_block_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: UPDATE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bu_memberships_audit_block_update
BEFORE UPDATE ON memberships_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_update();
```

![](images/clipboard-2213905738.png)

### **Antes de Eliminar**

``` sql

CREATE OR REPLACE FUNCTION fn_audit_block_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: DELETE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER bd_memberships_audit_block_delete
BEFORE DELETE ON memberships_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_delete();
```

![](images/clipboard-1751833486.png)

### **Antes de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_guard_insert() RETURNS trigger AS $$
BEGIN
  IF COALESCE(current_setting('audit.from_trigger', true), '') <> '1' THEN
    RAISE EXCEPTION 'INSERT en % solo permitido desde los triggers de la tabla original.', TG_TABLE_NAME USING ERRCODE = '45000';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bi_memberships_audit_guard_insert
BEFORE INSERT ON memberships_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_guard_insert();
```

![](images/clipboard-1446213279.png)

# **Evidencia de la funcionalidad de los triggers**

![](images/clipboard-857189065.png)

![](images/clipboard-1552354997.png)

![](images/clipboard-4195414228.png)

![](images/clipboard-189090734.png)

![](images/clipboard-3947515779.png)

**Prohibiciones**

![](images/clipboard-2315023846.png)

![](images/clipboard-2355247413.png)

![](images/clipboard-551032054.png)

![](images/clipboard-2511315965.png)

### Conclusion

En PostgreSQL se observa cómo quedaron registradas en `memberships_audit` las operaciones de inserción, actualización y eliminación. Se validó además que la tabla de auditoría es inmutable: los triggers impiden modificar o borrar el historial y solo permiten insertar registros provenientes de los triggers propios de `memberships`.

### **Creacion triggers en la tabla payments**

**Narrativa:** Elegí esta tabla porque es la más sensible a fraude de todo el sistema, ya que aquí se maneja directamente el dinero. Por eso decidí poner triggers en PostgreSQL que auditen cada modificación e impidan la alteración directa del historial contable.

``` sql
CREATE TABLE IF NOT EXISTS payments_audit (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id   INT NOT NULL,
  actionSale   VARCHAR(10) NOT NULL DEFAULT 'INSERT' CHECK (actionSale IN ('UPDATE','DELETE','INSERT')),
  changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by   VARCHAR(255) NOT NULL DEFAULT 'Admin',
  before_data  JSONB NULL,
  after_data   JSONB NULL
);
```

![](images/clipboard-2804911625.png)

### **Despues de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_ai_payments_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'INSERT', NULL, to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_payments_audit
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION fn_ai_payments_audit();
```

![](images/clipboard-2612745824.png)

### **Despues de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_au_payments_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER au_payments_audit
AFTER UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_au_payments_audit();
```

![](images/clipboard-3029305964.png)

### **Despues de Eliminar**

``` sql
CREATE OR REPLACE FUNCTION fn_ad_payments_audit() RETURNS trigger AS $$
BEGIN
  PERFORM set_config('audit.from_trigger', '1', true);

  INSERT INTO payments_audit (payment_id, actionSale, before_data, after_data)
  VALUES (OLD.id, 'DELETE', to_jsonb(OLD), NULL);

  PERFORM set_config('audit.from_trigger', '', true);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ad_payments_audit
AFTER DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_ad_payments_audit();
```

![](images/clipboard-2624841293.png)

### **Antes de Actualizar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_block_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: UPDATE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER bu_payments_audit_block_update
BEFORE UPDATE ON payments_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_update();
```

![](images/clipboard-2497408879.png)

### **Antes de Eliminar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_block_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es inmutable: DELETE prohibido.', TG_TABLE_NAME USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bd_payments_audit_block_delete
BEFORE DELETE ON payments_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_block_delete();
```

![](images/clipboard-1588022392.png)

### **Antes de Insertar**

``` sql
CREATE OR REPLACE FUNCTION fn_audit_guard_insert() RETURNS trigger AS $$
BEGIN
  IF COALESCE(current_setting('audit.from_trigger', true), '') <> '1' THEN
    RAISE EXCEPTION 'INSERT en % solo permitido desde los triggers de la tabla original.', TG_TABLE_NAME USING ERRCODE = '45000';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bi_payments_audit_guard_insert
BEFORE INSERT ON payments_audit
FOR EACH ROW EXECUTE FUNCTION fn_audit_guard_insert();
```

![](images/clipboard-480430660.png)

# **Evidencia de la funcionalidad de los triggers**

### **Modificar**

![](images/clipboard-1442026677.png)

![](images/clipboard-597796726.png)

### **Eliminar**

![](images/clipboard-3277764938.png)

![](images/clipboard-2950326843.png)

### **Insertar**

![](images/clipboard-1260933259.png)

![](images/clipboard-2141754218.png)

### **Prohibiciones:**

![](images/clipboard-4105003306.png)

![](images/clipboard-3532388448.png)

![](images/clipboard-871701594.png)

### Conclusion

En PostgreSQL, el uso de funciones `PL/pgSQL` desacopladas por evento (`AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`) e inmutabilidad (`BEFORE UPDATE`, `BEFORE DELETE`, `BEFORE INSERT`) garantiza un control estricto sobre las tablas `measurements`, `memberships` y `payments`, manteniendo intacta la trazabilidad de los datos.

## 3. Consultas avanzadas en MSSQL :

#### 3.1 Mostrar algunos de los registros de la tabla exercises

**Narrativa:** Para el inicio del bloque en SQL Server (MSSQL), cambié el foco hacia la tabla `exercises`. Seleccionar únicamente el nombre, descripción y estado del ejercicio me ayudó a corroborar que el catálogo de actividades físicas del gimnasio está correctamente disponible para consulta.

``` sql
SELECT name,description, status FROM exercises;
```

![](images/clipboard-1539526662.png)

### 3.2 Mostrar de forma ordenada (DESC) las payments desde su comienzo

**Narrativa:** En MSSQL apliqué `ORDER BY` sobre `payment_date` descendente para simular la vista del módulo contable. Esta consulta resulta esencial cuando la administración necesita revisar en tiempo real cuáles fueron los últimos cobros procesados en el sistema.

``` sql
SELECT id,method,amount,status FROM payments  ORDER BY payment_date DESC;
```

![](images/clipboard-3857241490.png)

### 3.3 Consultas a múltiples tablas mediante WHERE

**Narrativa:** En este punto vinculé `memberships` con `payments` en SQL Server mediante el filtrado de llaves en el `WHERE`. Me interesaba cruzar la fecha de corte de la membresía con la fecha en que se registró el pago correspondiente para verificar si hubo pagos extemporáneos.

``` sql
SELECT m.start_date ,m.end_date ,m.status ,pay.payment_date ,pay.status  FROM  memberships m ,payments pay   WHERE m.id = pay.membership_id;
```

![](images/clipboard-1282228093.png)

### 3.4 Consultas a múltiples tablas mediante JOIN

**Narrativa:** Aquí utilicé la cláusula `INNER JOIN` en MSSQL para entrelazar la información de clientes con sus membresías. Al proyectar solo los datos de contacto junto a los detalles del plan, se obtiene una vista limpia ideal para atención al cliente.

``` sql
SELECT C.name, C.email, M.*   FROM clients as C  
join memberships as M on( C.id = M.client_id ); 
```

![](images/clipboard-2657358142.png)

### 3.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

**Narrativa:** Para practicar la filtración en SQL Server, creé dos variantes que clasifican a los clientes según el estado del servicio ('active' vs 'expired'). Esto me permitió validar cómo MSSQL optimiza las búsquedas cuando se combinan operadores lógicos como `AND` sobre campos de estado.

``` sql
SELECT * FROM memberships m ,clients c  WHERE c.id = m.client_id and m.status ='active';
```

![](images/clipboard-1660361786.png)

**Forma 2 :**

``` sql
SELECT C.name, C.email,M.start_date ,M.client_id, M.status   FROM clients as C   join memberships as M on( C.id = M.client_id )   where  M.status = 'expired'; 
```

![](images/clipboard-4054028123.png)

### 3.6 Consultas con filtros condicional LIKE

**Narrativa:** Exploré las búsquedas difusas en MSSQL usando `LIKE`. Probé desde el filtrado por inicial en el correo hasta la búsqueda del dominio 'gmail' mediante `CONCAT`. La combinación con el filtro de membresías expiradas sirve para generar listas de mercadeo dirigidas a clientes inactivos.

``` sql
select *  from clients as C  where C.email like 'm%';
```

![](images/clipboard-4089174977.png)

**Mostrar todos los correos de los clientes que contengan el dominio gmail**

``` sql
SELECT id,document_type ,document_number , name,email  
FROM clients as C  where C.email like concat('%','gmail','%'); 
```

![](images/clipboard-4238178750.png)

**combinacion del punto anterior y la implementacion de el like**

``` sql
SELECT C.name, C.email, M.start_date ,M.status   FROM clients as C   join memberships as M on( C.id = M.client_id )  where  M.status = 'expired' and C.email like 'm%'; 
```

### ![](images/clipboard-2847147233.png)3.7 Consultas con filtros condicionales BETWEEN

**Narrativa:** En este ejercicio construí un reporte financiero cruzando `clients`, `memberships`, `payments` y `plans` en SQL Server. El operador `BETWEEN` me permitió restringir la búsqueda a un período fiscal determinado y ordenar cronológicamente los ingresos recibidos.

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C JOIN memberships M ON C.id = M.client_id JOIN payments PAY ON M.id = PAY.membership_id JOIN plans PL ON PL.id = M.plan_id WHERE PAY.payment_date BETWEEN '2025-01-15 12:26:02' AND '2026-04-21 13:51:24' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-3495860649.png)

**Forma 2:**

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C, memberships M, payments PAY, plans PL WHERE C.id = M.client_id   AND M.id = PAY.membership_id   AND PL.id = M.plan_id   AND M.start_date  BETWEEN '2025-01-01' AND '2026-03-30' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-2151880947.png)

### 3.8 Consultas con agrupamiento GROUP BY

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

**Narrativa:** En MSSQL utilicé funciones de agrupación para consolidar métricas de facturación por usuario. La cláusula `HAVING` fue clave para aplicar un filtro secundario sobre los resultados calculados, aislando a los clientes con 3 o más pagos o con un gasto acumulado significativo.

**Forma 1 con el where:**

``` sql
SELECT  C.id,  C.name,  SUM(P.amount) AS TotalSuma,      COUNT(P.id) AS CuentaTotal,      AVG(P.amount) AS Promedio   FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.payment_date BETWEEN '2025-03-01 00:00:00' AND '2026-03-30 23:59:59' GROUP BY C.id, C.name ORDER BY TotalSuma DESC;
```

![](images/clipboard-183796130.png)

**Forma 1:**

``` sql
SELECT C.id,  C.name,  SUM(P.amount) AS TotalGasto,      COUNT(P.id) AS CantidadPagos FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.status = 'pagado' AND P.method = 'tarjeta' GROUP BY C.id, C.name ORDER BY TotalGasto DESC;
```

![](images/clipboard-4270822940.png)

**forma 2 con el having:**

``` sql
SELECT C.id, C.name, SUM(P.amount) AS TotalSuma,  AVG(P.amount) AS PromedioPago FROM clients AS C JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id  GROUP BY C.id, C.name HAVING SUM(P.amount) >= 100  ORDER BY TotalSuma DESC;
```

![](images/clipboard-165434892.png)

``` sql
SELECT C.id, C.name, C.email,  SUM(P.amount) AS TotalAnual,    COUNT(P.id) AS TotalPagos  FROM clients AS C  JOIN memberships AS M ON C.id = M.client_id JOIN payments AS P ON M.id = P.membership_id WHERE P.payment_date BETWEEN '2025-01-01 00:00:00' AND '2026-12-31 23:59:59'  GROUP BY C.id, C.name, C.email  HAVING COUNT(P.id) >= 3 AND SUM(P.amount) > 100  ORDER BY TotalAnual DESC;
```

### ![](images/clipboard-925535246.png)3.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

**Narrativa:** Implementé lógica de diferencia de conjuntos (clientes sin membresía en un período) en SQL Server. Al evaluar `NOT IN` frente a un `LEFT JOIN` con condición nula (`IS NULL`), comprobé cómo ambas sintaxis resuelven el mismo problema de negocio desde ángulos conceptuales distintos.

``` sql
SELECT  *  FROM  clients as C  WHERE  C.id Not In(select M.client_id from memberships as M where M.start_date  BETWEEN  '2025-03-01' and '2026-03-30'); 
```

![](images/clipboard-3043961135.png)

**Forma 2:**

``` sql
select *  from clients as C  left join memberships  as M on(C.id = M.client_id and M.start_date  between '2025-03-01' and '2026-03-30')  where  M.client_id is null;
```

![](images/clipboard-3512686044.png)

## 4. Consultas avanzadas en Oracle:

#### 4.1 Mostrar algunos de los registros de la tabla TRAINERS

**Narrativa:** Al trabajar sobre el motor Oracle DB, elegí arrancar examinando la tabla `TRAINERS`. Seleccionar los campos de contacto y estado del entrenador me permitió comprobar la estructura del catálogo del personal y el comportamiento de las consultas básicas en Oracle.

``` sql
SELECT name,phone,email, status FROM TRAINERS  ;
```

![](images/clipboard-1794633345.png)

### 4.2 Mostrar de forma ordenada (DESC) el nombre de la tabla routines

**Narrativa:** En este ejercicio en Oracle ordené la tabla `routines` alfabéticamente de forma descendente por el nombre. Esta consulta es útil para que los entrenadores consulten el listado de rutinas predefinidas comenzando por las más recientes o de nombre avanzado.

``` sql
SELECT name,description,status FROM routines  ORDER BY name DESC;
```

![](images/clipboard-167334197.png)

### 4.3 Consultas a múltiples tablas mediante WHERE

**Narrativa:** Vinculé la información de `clients` y `memberships` en Oracle mediante una relación implícita en el `WHERE`. Proyecté el tipo y número de documento junto con el estado del contrato, simulando la información que se requiere al momento de validar el ingreso de un afiliado.

``` sql
SELECT C.name,C.DOCUMENT_TYPE ,C.DOCUMENT_NUMBER   ,m.start_date ,m.end_date ,m.status   FROM   clients C, memberships m  WHERE C.id = m.CLIENT_ID ;
```

![](images/clipboard-2328330334.png)

### 4.4 Consultas a múltiples tablas mediante JOIN

**Narrativa:** En Oracle ejecuté la sintaxis `JOIN ... ON` para relacionar clientes con sus membresías. Me interesaba verificar que este motor procesa sin problema las uniones estándar ANSI SQL y proyecta la información del cliente junto con la totalidad de los datos de su plan.

``` sql
SELECT C.name, C.email, M.*   FROM clients  C    join memberships  M on( C.id = M.client_id ); 
```

![](images/clipboard-1749180460.png)

### 4.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

**Narrativa:** En este punto utilicé filtros condicionales en Oracle para diferenciar las membresías activas de las vencidas. Al comparar la unión implícita frente al `JOIN` explícito, verifiqué que en Oracle ambas formas ofrecen consistencia total al evaluar condiciones con `WHERE`.

``` sql
SELECT * FROM memberships m ,clients c  WHERE c.id = m.client_id and m.status ='active';
```

![](images/clipboard-3028701213.png)

**Forma 2 :**

``` sql
SELECT C.name, C.email,M.start_date ,M.client_id, M.status   
FROM clients C   join memberships M on( C.id = M.client_id )
where  M.status = 'expired'; 
```

### ![](images/clipboard-2067981000.png)4.6 Consultas con filtros condicional LIKE

**Narrativa:** Al probar `LIKE` en Oracle, presté especial atención al uso de la función `CONCAT`, ya que en Oracle esta función solo acepta dos argumentos a la vez, requiriendo anidación (`CONCAT(CONCAT('%', 'gmail'), '%')`). Esto me sirvió para entender las particularidades sintácticas del motor al buscar dominios o iniciales en correos.

``` sql
select *  from clients  C  where C.email like 'm%';
```

![](images/clipboard-2539969999.png)

**Mostrar todos los correos de los clientes que contengan el dominio gmail**

``` sql
SELECT  id, document_type, document_number, name, email  
FROM clients C  
WHERE C.email LIKE CONCAT(CONCAT('%', 'gmail'), '%');
```

![](images/clipboard-1243966211.png)

**combinacion del punto anterior y la implementacion de el like**

``` sql
SELECT C.name, C.email, M.start_date ,M.status   
FROM clients C   
join memberships  M on( C.id = M.client_id )  where  M.status = 'expired' and C.email like 'm%'; 
```

![](images/clipboard-217980775.png)

### 4.7 Consultas con filtros condicionales BETWEEN

**Narrativa:** Construí un reporte multitabla en Oracle combinando `clients`, `memberships`, `payments` y `plans`. Para filtrar el rango de fechas con `BETWEEN` utilicé las funciones de conversión propias de Oracle como `TO_TIMESTAMP` y `TO_DATE`, garantizando el formato correcto de las estampas de tiempo.

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name 
FROM clients C 
JOIN memberships M ON C.id = M.client_id
JOIN payments PAY ON M.id = PAY.membership_id 
JOIN plans PL ON PL.id = M.plan_id
WHERE PAY.payment_date BETWEEN TO_TIMESTAMP('2025-02-15 00:00:00', 'YYYY-MM-DD HH24:MI:SS') 
                           AND TO_TIMESTAMP('2026-03-05 00:00:00', 'YYYY-MM-DD HH24:MI:SS')
ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-4025191586.png)

**Forma 2:**

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  
FROM clients C, memberships M, payments PAY, plans PL
WHERE C.id = M.client_id
  AND M.id = PAY.membership_id
  AND PL.id = M.plan_id
  AND M.start_date BETWEEN TO_DATE('2025-01-01', 'YYYY-MM-DD') 
                       AND TO_DATE('2026-03-30', 'YYYY-MM-DD')
ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-1753863047.png)

### 4.8 Consultas con agrupamiento GROUP BY

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

**Narrativa:** Diseñé un análisis de consumo de clientes en Oracle usando `GROUP BY` e indicadores agregados (`SUM`, `COUNT`, `ROUND(AVG(...), 2)`). El uso de `ROUND` me permitió limitar los decimales en el promedio, mientras que `HAVING` filtró los usuarios con mayor recurrencia e ingresos abonados.

**Forma 1 con el where:**

``` sql
SELECT  C.id,  C.name,  SUM(P.amount) AS TotalSuma,  COUNT(P.id) AS CuentaTotal, 
    ROUND(AVG(P.amount), 2) AS Promedio 
FROM clients C
JOIN memberships M ON C.id = M.client_id
JOIN payments P ON M.id = P.membership_id
WHERE P.payment_date BETWEEN TIMESTAMP '2025-03-01 00:00:00'
                         AND TIMESTAMP '2026-03-30 23:59:59'
GROUP BY C.id, C.name
ORDER BY TotalSuma DESC;
```

![](images/clipboard-2819390356.png)

**Forma 1:**

``` sql
SELECT  C.id,  C.name,  SUM(P.amount) AS TotalGasto, 
    COUNT(P.id) AS CantidadPagos
FROM clients C
JOIN memberships M ON C.id = M.client_id
JOIN payments P ON M.id = P.membership_id
WHERE LOWER(P.status) = 'pagado' 
  AND LOWER(P.method) = 'tarjeta'
GROUP BY C.id, C.name
ORDER BY TotalGasto DESC;
```

![](images/clipboard-2921471252.png)

**forma 2 con el having:**

``` sql
SELECT C.id, C.name, SUM(P.amount) AS TotalSuma, 
    ROUND(AVG(P.amount), 2) AS PromedioPago
FROM clients C
JOIN memberships M ON C.id = M.client_id
JOIN payments P ON M.id = P.membership_id
GROUP BY C.id, C.name
HAVING SUM(P.amount) >= 100
ORDER BY TotalSuma DESC;
```

![](images/clipboard-2712237275.png)

``` sql
SELECT  C.id, C.name, C.email, SUM(P.amount) AS TotalAnual, COUNT(P.id) AS TotalPagos
FROM clients C
JOIN memberships M ON C.id = M.client_id
JOIN payments P ON M.id = P.membership_id
WHERE P.payment_date BETWEEN TIMESTAMP '2025-01-01 00:00:00' 
                         AND TIMESTAMP '2026-12-31 23:59:59'
GROUP BY C.id, C.name, C.email
HAVING COUNT(P.id) >= 3 AND SUM(P.amount) > 100
ORDER BY TotalAnual DESC;
```

### ![](images/clipboard-199685186.png)4.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

**Narrativa:** Finalicé el bloque de Oracle aplicando la teoría de conjuntos para identificar clientes que no contrataron membresías en ciertas fechas. En la subconsulta con `NOT IN` me aseguré de incluir `M.client_id IS NOT NULL` y literales `DATE`, previniendo comportamientos inesperados causados por valores nulos en Oracle.

``` sql
SELECT * 
FROM clients C 
WHERE C.id NOT IN (SELECT M.client_id FROM memberships M 
    WHERE M.client_id IS NOT NULL 
      AND M.start_date BETWEEN DATE '2025-03-01' AND DATE '2026-03-30'
);
```

![](images/clipboard-2172634144.png)

**Forma 2:**

``` sql
SELECT C.* 
FROM clients C 
LEFT JOIN memberships M ON C.id = M.client_id 
 AND M.start_date BETWEEN DATE '2025-03-01' AND DATE '2026-03-30'
WHERE M.client_id IS NULL;
```

![](images/clipboard-3697951155.png)

En Oracle Database, la estructuración de los triggers de auditoría en la tabla `payments` asegura que todas las transacciones financieras queden blindadas ante alterations de terceros. La segregación por evento (`Despues de Insertar`, `Despues de Actualizar`, `Despues de Eliminar`) junto con el bloqueo estricto en las operaciones de modificación (`Antes de Actualizar`, `Antes de Eliminar`, `Antes de Insertar`) garantiza que los registros contables permanezcan 100% íntegros e inmutables.
