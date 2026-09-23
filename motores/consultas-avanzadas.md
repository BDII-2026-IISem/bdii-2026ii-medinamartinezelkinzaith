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

#### 1.1 Mostrar algunos  de los registros de la tabla clients

``` sql
SELECT name,document_type, document_number, status FROM clients;
```

## ![](images/clipboard-4091028779.png)

### 1.2 Mostrar de  forma ordenada (DESC) las membresias desde su comienzo

``` sql
SELECT id, start_date, end_date, status FROM memberships   ORDER BY start_date DESC;
```

![](images/clipboard-2227404320.png)

### 1.3 Consultas a múltiples tablas mediante  WHERE 

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

Quiero realizar la misma consulta anterior de cualquiera de las dos formas, teniendo en cuenta la condición que presente las ventas de una fecha especifica.

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

### 1.7 Consultas con filtros condicionales  BETWEEN

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

``` SQL
SELECT C.name, C.email, M.start_date ,M.status , PAY.payment_date , PL.name 
FROM clients C, memberships M, payments PAY, plans PL
WHERE C.id = M.client_id
  AND M.id = PAY.membership_id
  AND PL.id = M.plan_id
  AND M.start_date  BETWEEN '2025-01-01' AND '2026-03-30'
ORDER BY PAY.payment_date ASC;
```

![](images/clipboard-2191993456.png)
