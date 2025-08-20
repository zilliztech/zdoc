---
displayed_sidbar: javaSidebar
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
notebook: false
description: "This operation conducts a scalar filtering with a specified boolean expression. | Java | v2"
type: docx
token: OnIpdTTSOoV06KxhhAkcFQCKnWd
sidebar_position: 5
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - javaV225
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# query()

This operation conducts a scalar filtering with a specified boolean expression.

```java
public QueryResp query(QueryReq request)
```

## Request Syntax{#request-syntax}

```java
query(QueryReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .ids(List<Object> ids)
    .filter(String filter)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of an existing database.

- `collectionName(String collectionName)`

    The name of an existing collection in the above-specified database.

- `partitionNames(List<String> partitionNames)`

    A list of partition names in the above-specified collection.

- `outputFields(List<String> outputFields)`

    A list of field names to include in each entity in return.

    The value defaults to **None**. If left unspecified, all fields in the collection are selected as the output fields.

- `ids(List<Object> ids)`

    The IDs of entities to query.

- `filter(String filter)`

    A scalar filtering condition to filter matching entities. 

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level of the target collection.

    The value defaults to the one specified when you create the current collection, with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

    <Admonition type="info" icon="📘" title="What is the consistency level?">

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </Admonition>

- `offset(long offset)`

    The number of records to skip in the query result. 

    You can use this parameter in combination with `limit` to enable pagination.

    The sum of this value and `limit` should be less than 16,384. 

- `limit(long limit)`

    The number of records to return in the query result.

    You can use this parameter in combination with `offset` to enable pagination.

    The sum of this value and `offset` should be less than 16,384. 

**RETURN TYPE:**

*QueryResp*

**RETURNS:**

A **QueryResp object representing specific query results with the specified output fields

**PARAMETERS:**

- queryResults(List\&lt;QueryResp.QueryResult\&gt;)

A list of QueryResult objects with each QueryResult representing a queried entity.

<Admonition type="info" icon="📘" title="Notes">

<p>If the number of returned entities is less than expected, duplicate entities may exist in your collection.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Query by filter "id < 10"
QueryReq queryReq = QueryReq.builder()
        .collectionName("test")
        .filter("id < 10")
        .build();
QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getGetResults()) {
    System.out.println(result.getEntity());
}
```
