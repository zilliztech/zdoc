---
displayed_sidbar: javaSidebar
slug: /java/Vector-query
beta: false
notebook: false
type: docx
token: WxDjdYxSaoin88xQ7z7cL2rrnDg
sidebar_position: 4
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
    .collectionName(String collectionName)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .filter(String filter)
    .ids(List<Object> ids)
    .limit(long limit)
    .offset(long offset)
    .outputFields(List<String> outputFields)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level of the target collection.

    The value defaults to the one specified when you create the current collection, with options of __Strong __(__0__), __Bounded __(__1__), __Session __(__2__), and __Eventually __(__3__).

    <Admonition type="info" icon="📘" title="What is the consistency level?">

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p></p>
    <p></p>
    <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
    <p></p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </Admonition>

- `filter(String filter)`

    A scalar filtering condition to filter matching entities. 

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- `ids(List<Object> ids)`

    The IDs of entities to query.

- `limit(long limit)`

    The number of records to return in the query result.

    You can use this parameter in combination with `offset` to enable pagination.

    The sum of this value and `offset` should be less than 16,384. 

- `offset(long offset)`

    The number of records to skip in the query result. 

    You can use this parameter in combination with `limit` to enable pagination.

    The sum of this value and `limit` should be less than 16,384. 

- `outputFields(List<String> outputFields)`

    A list of field names to include in each entity in return.

    The value defaults to __None__. If left unspecified, all fields are selected as the output fields.

- `partitionNames(List<String> partitionNames)`

    A list of partition names.

__RETURN TYPE:__

_QueryResp_

__RETURNS:__

A __QueryResp__ object representing one or more queried entities.

__PARAMETERS:__

- __fields__ (_Map\<String,Object\>_)

    A map that contains key-value pairs of field names and their values.

<Admonition type="info" icon="📘" title="Notes">

<p>If the number of returned entities is less than expected, duplicate entities may exist in your collection.</p>

</Admonition>

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
//query by filter "id < 10"
QueryReq queryReq = QueryReq._builder_()
        .collectionName("book")
        .filter("id < 10")
        .build();
QueryResp queryResp = client_v2.query(queryReq);
```
