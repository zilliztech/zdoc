---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation inserts or updates data in a specific collection. | Java | v2"
type: docx
token: Ei2hd8dE4oGCvJxKbEvcamxTnke
sidebar_position: 9
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - javaV226
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

This operation inserts or updates data in a specific collection.

```java
public UpsertResp upsert(UpsertReq request)
```

## Request Syntax\{#request-syntax}

```java
upsert(UpsertReq.builder()
    .data(List<JsonObject> data)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .partialUpdate(Boolean partialUpdate)
    .build()
)
```

**BUILDER METHODS:**

- `data(List<JsonObject> data)`

    The data to insert or update into the current collection.

    The data to insert or update should be a `gson.JsonObject` that matches the schema of the current collection or a list of such dictionaries. 

    To perform an update, you are advised first to retrieve the target entity from the collection, modify the values of any relevant fields, and then save it back to the collection. 

    The following code assumes that the schema of the current collection has three fields named **id**, **vector** ,and **color**. The `id` field is the primary field, the `vector` field is a field to hold 5-dimensional vector embeddings, and the `color` field is a scalar field holding strings.

    <Admonition type="info" icon="📘" title="Notes">

    <p>In Java SDK versions v2.4.1 or earlier versions, the input is a <code>fastjson.JSONObject</code>. But <code>fastjson</code> is not recommended to use now because of its unsafe deserialization vulnerability. Therefore, replace <code>fastjson</code> with <code>gson</code> if you use the Java SDK of v2.4.2 or later releases.</p>

    </Admonition>

    ```java
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
    dict1.add("color", "green")
    
    JsonObject dict2 = new JsonObject();
    JSONArray vectorArray2 = new ArrayList<>();
    vectorArray2.add(0.46949086179692356);
    vectorArray2.add(-0.533609076732849);
    vectorArray2.add(-0.8344432775467099);
    vectorArray2.add(0.9797361846081416);
    vectorArray2.add(0.6294256393761057);
    
    dict2.addProperty("id", 2L);
    dict2.add("vector", gson.toJsonTree(vectorArray2));
    dict2.add("color", "brown")
    
    data.add(dict1);
    data.add(dict2);
    ```

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of an existing partition.

**RETURN TYPE:**

*UpsertResp*

**RETURNS:**

An **UpsertResp** object that contains information about the number of inserted or updated entities.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Upsert operation
JsonObject row = new JsonObject();
List<Float> vectorList = new ArrayList<>();
vectorList.add(2.0f);
vectorList.add(3.0f);
row.add("vector", gson.toJsonTree(vectorList));
row.addProperty("id", 0L);
row.addProperty("color", "purple")

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(row))
        .build();
client.upsert(upsertReq);

```

