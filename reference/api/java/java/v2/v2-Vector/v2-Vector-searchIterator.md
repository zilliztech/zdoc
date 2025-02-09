---
displayed_sidbar: javaSidebar
title: "searchIterator() | Java | v2"
slug: /java/java/v2-Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
notebook: false
description: "This method returns a search iterator to iterate search results. | Java | v2"
type: docx
token: M4IqdsRCNotiM4xdOA0cWSnUngb
sidebar_position: 8
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - searchIterator()
  - javaV2
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# searchIterator()

This method returns a search iterator to iterate search results.

```java
public SearchIterator searchIterator(SearchIteratorReq request)
```

## Request Syntax{#request-syntax}

```java
searchIterator(SearchIteratorReq.builder()
        .collectionName(String collectionName)
        .databaseName(String databaseName)
        .outputFields(List<String> outputFields)
        .expr(String expr)
        .batchSize(long size)
        .vectorFieldName(String vectorFieldName)
        .vectors(List<BaseVector> vectors)
        .params(String params)
        .topK(int topk)
        .metricType(IndexParam.MetricType metricType)
        .consistencyLevel(ConsistencyLevel consistencyLevel)
        .roundDecimal(int decimal)
        .ignoreGrowing(boolean ignoreGrwing)
        .groupByFieldName(String fieldName)
        .build());
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `databaseName(String databaseName)`

The database to which the collection belongs. You can ignore it if the database is the default.

- `outputFields(List<String> outputFields)`

    A list of field names to include in each entity in return.

    The value defaults to **None**. If left unspecified, all fields in the collection are selected as the output fields.

- `expr(String expr)`

    A scalar filtering condition to filter matching entities. 

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- `batchSize(long size)`

A value to define the number of entities returned per batch.

- `vectorFieldName(String vectorFieldName)`

The target vector field name to do ANN search.

- `vectors(List<BaseVector> vectors)`

Set the target vectors to do ANN search.

BaseVector is a base class for abstract vector classes. The following classes are derived from BaseVector. Choose the correct class as input according to DataType of the vector field.

<table>
   <tr>
     <th><p><strong>Class Name</strong></p></th>
     <th><p><strong>Constructors</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>FloatVec</p></td>
     <td><p>FloatVec(List\<Float> data)FloatVec(float[] data)</p></td>
     <td><p>For DataType.FloatVector type field.</p></td>
   </tr>
   <tr>
     <td><p>BinaryVec</p></td>
     <td><p>BinaryVec(ByteBuffer data)BinaryVec(byte[] data)</p></td>
     <td><p>For DataType.BinaryVector type field.</p></td>
   </tr>
   <tr>
     <td><p>Float16Vec</p></td>
     <td><p>Float16Vec(ByteBuffer data)Float16Vec(byte[] data)Float16Vec(List\<Float> data)</p></td>
     <td><p>For DataType.Float16Vector type field.</p></td>
   </tr>
   <tr>
     <td><p>BFloat16Vec</p></td>
     <td><p>BFloat16Vec(ByteBuffer data)BFloat16Vec(byte[] data)BFloat16Vec(List\<Float> data)</p></td>
     <td><p>For DataType.BFloat16Vector type field.</p></td>
   </tr>
   <tr>
     <td><p>SparseFloatVec</p></td>
     <td><p>SparseFloatVec(SortedMap\<Long, Float> data)</p></td>
     <td><p>For DataType.SparseFloatVector type field.</p></td>
   </tr>
</table>

- `params(String params)`

A JSON format string for extra parameters.

- `topK(int topk)`

The topk value.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level of the target collection.

    The value defaults to the one specified when you create the current collection, with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

    <Admonition type="info" icon="📘" title="What is the consistency level?">

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </Admonition>

- `roundDecimal(int decimal)`

How many digits are reserved after the decimal point.

- `ignoreGrowing(boolean ignoreGrwing)`

Ignore growing segments or not.

- `groupByFieldName(String fieldName)`

Sets the field name to do grouping for results.

**RETURN TYPE:**

*SearchIterator*

**RETURNS:**

A *SearchIterator* object to iterate search results.

**METHODS:**

- List\<QueryResultsWrapper.RowRecord> next()

Return a batch of results.

- close()

Release the cache results.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<Float> vector = generateFloatVector();
SearchIterator searchIterator = client.searchIterator(SearchIteratorReq.builder()
        .collectionName(COLLECTION_NAME)
        .outputFields(Lists.newArrayList("vector"))
        .batchSize(50L)
        .vectorFieldName("vector")
        .vectors(Collections.singletonList(new FloatVec(vector)))
        .expr("id > 100")
        .params("{\"range_filter\": 15.0, \"radius\": 20.0}")
        .topK(300)
        .metricType(IndexParam.MetricType.L2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

while (true) {
    List<QueryResultsWrapper.RowRecord> res = searchIterator.next();
    if (res.isEmpty()) {
        System.out.println("Search iteration finished, close");
        searchIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}
```

