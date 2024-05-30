---
slug: /java/v1-Collection-upsert
beta: FALSE
notebook: FALSE
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#HH6pdFJD3owq5BxjrsycVnw5nUf
sidebar_position: 13
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# upsert()

A MilvusClient interface. This method inserts new entities into a specified collection, and replaces them if the entities already exist.

```java
R<MutationResult> upsert(UpsertParam requestParam);
```

#### UpsertParam{#upsertparam}

Use the `UpsertParam.Builder` to construct an `UpsertParam` object.

```java
import io.milvus.param.UpsertParam;
UpsertParam.Builder builder = UpsertParam.newBuilder();
```

Methods of `UpsertParam.Builder`:

<table>
    <tr>
        <th><p>Method</p></th>
        <th><p>Description</p></th>
        <th><p>Parameters</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>Sets the target collection name. Collection name cannot be empty or null.</p></td>
        <td><p>collectionName: The name of the collection to insert data into.</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>Sets the target partition name(optional).</p></td>
        <td><p>partitionName: The name of the partition to insert data into.</p></td>
    </tr>
    <tr>
        <td><p>withFields(List\<InsertParam.Field> fields)</p></td>
        <td><p>Sets the column-based data to be inserted. The fields list cannot be empty. <br/>Note that no input is required for the primary key field if auto-id is enabled.</p></td>
        <td><p>fields: A list of Field objects, each representing a field.</p></td>
    </tr>
    <tr>
        <td><p>withRows(List\<JSONObject> rows)</p></td>
        <td><p>Sets the row-based data to be inserted. The row list cannot be empty.<br/>Note that if the withFields() is called, the rows by withRows() will be ignored.</p></td>
        <td><p>rows: A list of JSONObject objects, each representing a row in key-value format.<br/>- Requires List\<Boolean> if the data type is Bool.<br/>- Requires List\<Long> if the data type is Int64.<br/>- Requires List\<Integer> or List\<Short> if the data type is Int8/Int16/Int32.<br/>- Value is List\<Float> if the data type is Float.<br/>- Value is List\<Double> if the data type is Double.<br/>- Value is List\<String> if the data type is Varchar.<br/>- Value is List\<List\<?>gt; if the data type is Array, the inner List type must be equal to the element type of the Array field.<br/>- Value is List\<List\<Float>gt;, if the data type is FloatVector.<br/>- Value is List\<ByteBuffer>, if the data type is BinaryVector/Float16Vector/BFloat16Vector.<br/>- Value is List\<SortedMap\<Long, Float>gt; if the data type is SparseFloatVector.</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>Constructs an InsertParam object.</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

The `UpsertParam.Builder.build()` can throw the following exceptions:

- ParamException: error if the parameter is invalid.

#### Returns{#returns}

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and the error message of the exception.

- If the API succeeds, it returns a valid `MutationResult` held by the `R` template. You can use `MutationResultWrapper` to get the returned information.

#### Example{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

List<List<Float>> vectors = generateFloatVectors(1);
List<JSONObject> rows = new ArrayList<>();
JSONObject row = new JSONObject();
row.put("id", 1L);
row.put("vec", vectors.get(0);
rows.add(row);

UpsertParam param = UpsertParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rows)
        .build();

R<MutationResult> response = client.upsert(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

MutationResultWrapper wrapper = new MutationResultWrapper(response.getData());
System.out.println(wrapper.getInsertCount() + " rows upserted");
```
