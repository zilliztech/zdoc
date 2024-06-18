---
slug: /java/v1-Collection-insert
beta: FALSE
notebook: FALSE
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#LSztdn2VAohrv3xksJocdjdynXd
sidebar_position: 11
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# insert()

A MilvusClient interface. This method inserts entities into a specified collection.

```java
R<MutationResult> insert(InsertParam requestParam);
```

#### InsertParam{#insertparam}

Use the `InsertParam.Builder` to construct an `InsertParam` object.

```java
import io.milvus.param.InsertParam;
InsertParam.Builder builder = InsertParam.newBuilder();
```

Methods of `InsertParam.Builder`:

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
        <td><p>Sets the data to be inserted. The field list cannot be empty. <br/>Note that no input is required for the primary key field if auto_id is enabled.</p></td>
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

The `InsertParam.Builder.build()` can throw the following exceptions:

- ParamException: error if the parameter is invalid.

#### Field{#field}

A tool class to hold a data field.

Methods of `InsertParam.Field`:

<table>
   <tr>
     <th><p><strong>Method</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Parameters</strong></p></th>
   </tr>
   <tr>
     <td><p>Field(String name, List\<?> values)</p></td>
     <td><p>This class only provides a constructor to create a Field object.<br/></p></td>
     <td><p>name: The name of the data field. values:<br/>- Requires List\<Boolean> if the data type is Bool.<br/>- Requires List\<Long> if the data type is Int64.<br/>- Requires List\<Integer> or List\<Short> if the data type is Int8/Int16/Int32.<br/>- Requires List\<Float> if the data type is Float.<br/>- Requires List\<Double> if the data type is Double.<br/>- Requires List\<String> if the data type is Varchar.<br/>- Requires List\<List\<?>gt; if the data type is Array, the inner List type must be equal to the element type of the Array field.<br/>- Requires List\<List\<Float>gt;, if the data type is FloatVector.<br/>- Requires List\<ByteBuffer>, if the data type is BinaryVector/Float16Vector/BFloat16Vector.<br/>- Requires List\<SortedMap\<Long, Float>gt; if the data type is SparseFloatVector.</p></td>
   </tr>
</table>

#### Returns{#returns}

This method catches all the exceptions and returns an `R<MutationResult>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and the error message of the exception.

- If the API succeeds, it returns a valid `MutationResult` held by the `R` template. You can use `MutationResultWrapper` to get the returned information.

#### MutationResultWrapper{#mutationresultwrapper}

A tool class to encapsulate the MutationResult. 

```java
import io.milvus.response.MutationResultWrapper;
MutationResultWrapper wrapper = new MutationResultWrapper(mutationResult);
```

Methods of `MutationResultWrapper`:

<table>
   <tr>
     <th><p><strong>Method</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Returns</strong></p></th>
   </tr>
   <tr>
     <td><p>getInsertCount()</p></td>
     <td><p>Gets the row count of the inserted entities.<br/></p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getLongIDs()<br/></p></td>
     <td><p>Gets the long ID array returned by the insert() interface if the primary key field is int64 type. Throw ParamException if the primary key type is not int64.<br/></p></td>
     <td><p>List\<Long></p></td>
   </tr>
   <tr>
     <td><p>getStringIDs()</p></td>
     <td><p>Gets the string ID array returned by the insert() interface if the primary key field is varchar type. Throw ParamException if the primary key type is not varchar type.</p></td>
     <td><p>List\<String><br/></p></td>
   </tr>
   <tr>
     <td><p>getDeleteCount()</p></td>
     <td><p>Gets the row count of the deleted entities. Currently, this value is always equal to the input row count.</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getOperationTs()<br/></p></td>
     <td><p>Gets the timestamp of the operation marked by the server.</p></td>
     <td><p>long</p></td>
   </tr>
</table>

#### Example{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

int rowCount = 10000;
List<Long> ids = new ArrayList<>();
for (long i = 0L; i < rowCount; ++i) {
    ids.add(i);
}
List<List<Float>> vectors = generateFloatVectors(rowCount);

List<InsertParam.Field> fields = new ArrayList<>();
fields.add(new InsertParam.Field("id", ids));
fields.add(new InsertParam.Field("vec", vectors));

InsertParam param = InsertParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withFields(fields)
        .build();
R<MutationResult> response = client.insert(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

MutationResultWrapper wrapper = new MutationResultWrapper(response.getData());
System.out.println(wrapper.getInsertCount() + " rows inserted");
```
