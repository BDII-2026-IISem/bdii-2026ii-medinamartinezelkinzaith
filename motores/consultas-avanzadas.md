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
