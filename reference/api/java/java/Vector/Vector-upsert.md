---
displayed_sidbar: javaSidebar
slug: /java/Vector-upsert
beta: false
notebook: false
type: docx
token: DGdZdLvmPoKuutxEJfnc2ww2nMh
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# upsert()

This operation inserts or updates data in a specific collection.

```java
public UpsertResp upsert(UpsertReq request)
```

## Request Syntax{#request-syntax}

```java
upsert(UpsertReq.builder()
    .data(List<JSONObject> data)
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `data(List<JSONObject> data)`

    The data to insert or update into the current collection.

    The data to insert or update should be a dictionary that matches the schema of the current collection or a list of such dictionaries. 

    The following code assumes that the schema of the current collection has two fields named __id__ and __vector__. The former is the primary field and the latter is a field to hold 5-dimensional vector embeddings.

    ```java
    // A dictionary, or
    JSONObject jsonObject = new JSONObject();
    JSONArray vectorArray = new JSONArray();
    vectorArray.put(0.6186516144460161);
    vectorArray.put(0.5927442462488592);
    vectorArray.put(0.848608119657156);
    vectorArray.put(0.9287046808231654);
    vectorArray.put(-0.42215796530168403);
    
    jsonObject.put("id", 0);
    jsonObject.put("vector", vectorArray);
    
    // A list of dictionaries
    JSONArray dataArray = new JSONArray();
    
    JSONObject dict1 = new JSONObject();
    JSONArray vectorArray1 = new JSONArray();
    vectorArray1.put(0.37417449965222693);
    vectorArray1.put(-0.9401784221711342);
    vectorArray1.put(0.9197526367693833);
    vectorArray1.put(0.49519396415367245);
    vectorArray1.put(-0.558567588166478);
    
    dict1.put("id", 1);
    dict1.put("vector", vectorArray1);
    
    JSONObject dict2 = new JSONObject();
    JSONArray vectorArray2 = new JSONArray();
    vectorArray2.put(0.46949086179692356);
    vectorArray2.put(-0.533609076732849);
    vectorArray2.put(-0.8344432775467099);
    vectorArray2.put(0.9797361846081416);
    vectorArray2.put(0.6294256393761057);
    
    dict2.put("id", 2);
    dict2.put("vector", vectorArray2);
    
    dataArray.put(dict1);
    dataArray.put(dict2);
    ```

- `collectionName(String collectionName)`

    The name of an existing collection.

__RETURN TYPE:__

_UpsertResp_

__RETURNS:__

An __UpsertResp__ object that contains information about the number of inserted or updated entities.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
JSONObject jsonObject = new JSONObject();
List<Float> vectorList = new ArrayList<>();
vectorList.add(2.0f);
vectorList.add(3.0f);
jsonObject.put("vector", vectorList);
jsonObject.put("id", 0L);
UpsertReq upsertReq = UpsertReq._builder_()
        .collectionName("test")
        .data(Collections._singletonList_(jsonObject))
        .build();

client_v2.upsert(upsertReq);
```

