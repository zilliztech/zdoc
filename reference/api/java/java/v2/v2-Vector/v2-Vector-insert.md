---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation inserts data into a specific collection. | Java | v2"
type: docx
token: P0XRd2Mgfo1uG6xk47icWRd4n6b
sidebar_position: 4
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV226
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

This operation inserts data into a specific collection.

```java
public InsertResp insert(InsertReq request)
```

## Request Syntax\{#request-syntax}

```java
insert(InsertReq.builder()
    .collectionName(String collectionName)
    .data(List<JsonObject> data)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `data(List<JsonObject> data)`

    The data to insert into the current collection.

    The data to insert should be a `gson.JsonObject` that matches the schema of the current collection or a list of such dictionaries. 

    The following code assumes that the schema of the current collection has two fields named **id** and **vector**. The former is the primary field and the latter is a field to hold 5-dimensional vector embeddings.

    <Admonition type="info" icon="📘" title="Notes">

    <p>In Java SDK versions v2.4.1 or earlier versions, the input is a <code>fastjson.JSONObject</code>. But <code>fastjson</code> is not recommended to use now because of its unsafe deserialization vulnerability. Therefore, replace <code>fastjson</code> with <code>gson</code> if you use the Java SDK of v2.4.2 or later releases.</p>

    </Admonition>

    ```java
    import com.google.gson.JsonObject;
    
    List<JsonObject> data = new ArrayList<>();
    
    JsonObject dict1 = new JsonObject();
    List<Float> vectorArray1 = new ArrayList<>();
    vectorArray1.add(0.37417449965222693);
    vectorArray1.add(-0.9401784221711342);
    vectorArray1.add(0.9197526367693833);
    vectorArray1.add(0.49519396415367245);
    vectorArray1.add(-0.558567588166478);
    
    dict1.addProperty("id", 1L);
    dict1.add("vector", gson.toJsonTree(vectorArray1));
    
    JsonObject dict2 = new JsonObject();
    List<Float> vectorArray2 = new ArrayList<>();
    vectorArray2.add(0.46949086179692356);
    vectorArray2.add(-0.533609076732849);
    vectorArray2.add(-0.8344432775467099);
    vectorArray2.add(0.9797361846081416);
    vectorArray2.add(0.6294256393761057);
    
    dict2.addProperty("id", 2L);
    dict2.add("vector", gson.toJsonTree(vectorArray2));
    
    data.add(dict1);
    data.add(dict2);
    ```

- `partitionName(String partitionName)`

    The name of a partition.

**RETURN TYPE:**

*InsertResp*

**RETURNS:**

An **InsertResp** object containing information about the number of inserted entities.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.InsertReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Add one row to the collection, the collection has an "id" field
// and a "vector" field with dimension 2
JsonObject row = new JsonObject();
List<Float> vectorList = new ArrayList<>();
vectorList.add(1.0f);
vectorList.add(2.0f);
row.add("vector", gson.toJsonTree(vectorList));
row.addProperty("id", 0L);

InsertReq insertReq = InsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(row))
        .build();
client.insert(insertReq);
```

