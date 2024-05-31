---
slug: /java/v1-HighlevelAPI-insert
beta: FALSE
notebook: FALSE
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#OHD5dtKR1ovOACxIUHFcMH6cnFf
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# insert()

A MilvusClient interface. This method inserts entities into a specified collection.

```java
R<InsertResponse> insert(InsertRowsParam requestParam);
```

#### InsertRowsParam{#insertrowsparam}

Use the `InsertRowsParam.Builder` to construct an InsertRowsParam object.

```java
import io.milvus.param.highlevel.dml.InsertRowsParam;
InsertRowsParam.Builder builder = InsertRowsParam.newBuilder();
```

Methods of `InsertRowsParam.Builder`:

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
        <td><p>withRows(List\<JSONObject> rows)</p></td>
        <td><p>Sets the row data to insert. The rows list cannot be empty.<br/>Note that no input is required for the primary key field if auto-ID is enabled.</p></td>
        <td><p>rows: A list of JSONObject objects, each representing a row data.</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>Constructs an InsertRowsParam object.</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

The `InsertRowsParam.Builder.build()` can throw the following exceptions:

- ParamException: error if the parameter is invalid.

#### Returns{#returns}

This method catches all the exceptions and returns an `R<InsertResponse>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and the error message of the exception.

- If the API succeeds, it returns a valid `InsertResponse` held by the `R` template.

#### Example{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

List<JSONObject> rowsData = new ArrayList<>();
Random ran = new Random();
for (long i = 0L; i < rowCount; ++i) {
    JSONObject row = new JSONObject();
    row.put(AGE_FIELD, ran.nextInt(99));
    row.put(VECTOR_FIELD, generateFloatVector());

    // $meta if collection EnableDynamicField, you can input this field not exist in schema, else deny
    row.put(INT32_FIELD_NAME, ran.nextInt());
    row.put(INT64_FIELD_NAME, ran.nextLong());
    row.put(VARCHAR_FIELD_NAME, "varchar");
    row.put(FLOAT_FIELD_NAME, ran.nextFloat());
    row.put(DOUBLE_FIELD_NAME, ran.nextDouble());
    row.put(BOOL_FIELD_NAME, ran.nextBoolean());

    // $json
    JSONObject jsonObject = new JSONObject();
    jsonObject.put(INT32_FIELD_NAME, ran.nextInt());
    jsonObject.put(INT64_FIELD_NAME, ran.nextLong());
    jsonObject.put(VARCHAR_FIELD_NAME, "varchar");
    jsonObject.put(FLOAT_FIELD_NAME, ran.nextFloat());
    jsonObject.put(DOUBLE_FIELD_NAME, ran.nextDouble());
    jsonObject.put(BOOL_FIELD_NAME, ran.nextBoolean());
    row.put(USER_JSON_FIELD, jsonObject);

    rowsData.add(row);
}

InsertRowsParam param = InsertRowsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rowsData)
        .build();
R<InsertResponse> response = client.insert(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

System.out.println("insertCount: " + response.getData().getInsertCount());
System.out.println("insertIds: " + response.getData().getInsertIds());
```

