# CONSULTAS AVANZANDAS SQL

## Imagenes de los registros de cada tabla creada :

![](images/clipboard-2644681828.png)

![](images/clipboard-425640755.png)

![](images/clipboard-2066403936.png)

![](images/clipboard-1729154519.png)

![](images/clipboard-738095145.png)

![](images/clipboard-3066198009.png)

![](images/clipboard-2000535540.png)

![](images/clipboard-1819806480.png)

![](images/clipboard-1109866264.png)

![](images/clipboard-393698099.png)

## 1. Consultas avanzadas en MySQL :

#### 1.1 Mostrar algunos de los registros de la tabla clients

``` sql
SELECT name,document_type, document_number, status FROM clients;
```

## ![](images/clipboard-4091028779.png)

### 1.2 Mostrar de forma ordenada (DESC) las membresias desde su comienzo

``` sql
SELECT id, start_date, end_date, status FROM memberships   ORDER BY start_date DESC;
```

![](images/clipboard-2227404320.png)

### 1.3 Consultas a múltiples tablas mediante WHERE

``` sql
SELECT *
FROM memberships m ,clients c 
WHERE c.id = m.client_id;
```

![](images/clipboard-1375332071.png)

### 1.4 Consultas a múltiples tablas mediante JOIN

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ); 
```

![](images/clipboard-352116783.png)

### 1.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

``` sql
SELECT *
FROM memberships m ,clients c 
WHERE c.id = m.client_id and m.status ="active";
```

![](images/clipboard-3146841746.png)

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ) 
where  M.status = "expired"; 
```

![](images/clipboard-3314925970.png)

### 1.6 Consultas con filtros condicional LIKE

``` sql
select * 
from clients as C 
where C.email like 'm%';
```

![](images/clipboard-4259360956.png)

**Mostrar todos los correos de los clientes que contengan el dominio gmail**

``` sql
SELECT * 
FROM clients as C 
where C.email like concat('%','gmail','%'); 
```

![](images/clipboard-1783617283.png)

**combinacion del punto 1.5 y la implementacion de el like**

``` sql
SELECT C.name, C.email, M.* 
FROM clients as C 
join memberships as M on( C.id = M.client_id ) 
where  M.status = "expired" and C.email like 'm%'; 
```

![](images/clipboard-1861361036.png)

### 1.7 Consultas con filtros condicionales BETWEEN

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

### 1.8 Consultas con agrupamiento GROUP BY 

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

**Forma 1 con el where:**

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

### 1.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

``` sql
SELECT  * 
FROM m clients as C 
WHERE  C.id Not In(select M.client_id from memberships as M where M.start_date 
BETWEEN  "2025-03-01" and "2026-03-30"); 
```

![](images/clipboard-4214935019.png)

**Forma 2:**

``` sql
select * 
from clients as C 
left join memberships  as M on(C.id = M.client_id and M.start_date 
between "2025-03-01" and "2026-03-30") 
where  M.client_id is null;
```

![](images/clipboard-1111366890.png)

## 2. Consultas avanzadas en PostgreSQL :

#### 2.1 Mostrar algunos de los registros de la tabla clients

``` sql
SELECT name,document_type, document_number, status FROM clients;
```

![](images/clipboard-903827105.png)

### 2.2 Mostrar de forma ordenada (DESC) las payments desde su comienzo

``` sql
SELECT id,method,amount,status FROM payments  ORDER BY payment_date DESC;
```

![](images/clipboard-1433641025.png)

### 

### 2.3 Consultas a múltiples tablas mediante WHERE

``` sql
SELECT m.start_date ,m.end_date ,m.status ,pay.payment_date ,pay.status 
FROM  memberships m ,payments pay  
WHERE m.id = pay.membership_id;
```

![](images/clipboard-2986178139.png)

### 2.4 Consultas a múltiples tablas mediante JOIN

``` sql
SELECT C.name, C.email, M.*  
FROM clients as C  
join memberships as M on( C.id = M.client_id ); 
```

![](images/clipboard-1930710102.png)

### 2.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

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

### 2.6 Consultas con filtros condicional LIKE

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

### 2.7 Consultas con filtros condicionales BETWEEN

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C JOIN memberships M ON C.id = M.client_id JOIN payments PAY ON M.id = PAY.membership_id JOIN plans PL ON PL.id = M.plan_id WHERE PAY.payment_date BETWEEN '2025-01-15 12:26:02' AND '2026-04-21 13:51:24' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-173252118.png)

**Forma 2:**

``` sql
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name  FROM clients C, memberships M, payments PAY, plans PL WHERE C.id = M.client_id   AND M.id = PAY.membership_id   AND PL.id = M.plan_id   AND M.start_date  BETWEEN '2025-01-01' AND '2026-03-30' ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-3030982433.png)

### 2.8 Consultas con agrupamiento GROUP BY 

Se consideran este tipo de consultas cuando tenemos valores que se repiten en los registros.

Si observamos la siguiente consulta:

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

### 2.9 Subconsultas y teoría de conjuntos

En las Sub Consultas podemos realizar la teoría de conjuntos aplicadas a las bases de datos:

la mas conocida es el siguiente caso:

Teniendo en cuenta las tablas entre clientes y membresias, muestre los clientes que no le han realizado membresias en una fecha de inicion.

``` sql
SELECT  *  FROM m clients as C  WHERE  C.id Not In(select M.client_id from memberships as M where M.start_date  BETWEEN  '2025-03-01' and '2026-03-30'); 
```

![](images/clipboard-4072302102.png)

**Forma 2:**

``` sql
select *  from clients as C  left join memberships  as M on(C.id = M.client_id and M.start_date  between '2025-03-01' and '2026-03-30')  where  M.client_id is null;
```

![](images/clipboard-378400353.png)

## 3. Consultas avanzadas en MSSQL :

#### 3.1 Mostrar algunos de los registros de la tabla exercises

``` sql
SELECT name,description, status FROM exercises;
```

![](images/clipboard-1539526662.png)

### 3.2 Mostrar de forma ordenada (DESC) las payments desde su comienzo

``` sql
SELECT id,method,amount,status FROM payments  ORDER BY payment_date DESC;
```

![](images/clipboard-3857241490.png)

### 3.3 Consultas a múltiples tablas mediante WHERE

``` sql
SELECT m.start_date ,m.end_date ,m.status ,pay.payment_date ,pay.status  FROM  memberships m ,payments pay   WHERE m.id = pay.membership_id;
```

![](images/clipboard-1282228093.png)

### 3.4 Consultas a múltiples tablas mediante JOIN

``` sql
SELECT C.name, C.email, M.*   FROM clients as C   join memberships as M on( C.id = M.client_id ); 
```

![](images/clipboard-2657358142.png)

### 3.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

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

``` sql
SELECT name,phone,email, status FROM TRAINERS  ;
```

![](images/clipboard-1794633345.png)

### 4.2 Mostrar de forma ordenada (DESC) el nombre de la tabla routines

``` sql
SELECT name,description,status FROM routines  ORDER BY name DESC;
```

![](images/clipboard-167334197.png)

### 4.3 Consultas a múltiples tablas mediante WHERE

``` sql
SELECT C.name,C.DOCUMENT_TYPE ,C.DOCUMENT_NUMBER   ,m.start_date ,m.end_date ,m.status   FROM   clients C, memberships m  WHERE C.id = m.CLIENT_ID ;
```

![](images/clipboard-2328330334.png)

### 4.4 Consultas a múltiples tablas mediante JOIN

``` sql
SELECT C.name, C.email, M.*   FROM clients  C    join memberships  M on( C.id = M.client_id ); 
```

![](images/clipboard-1749180460.png)

### 4.5 Condiciones en las Consultas o filtros en las Consultas

Para las condiciones se utiliza la clausula Where de la siguiente manera:

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una status especifica.

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

### CONCLUSION

La verdad, la practica de las consultas me sirvió mucho más allá de escribir código, la idea principal fue aprender a **pensar en tablas y relaciones**, dándome cuenta de que un mismo problema —como sacar métricas de clientes o ver quiénes están inactivos— lo puedo resolver de varias formas con joins, agrupaciones o subconsultas.
