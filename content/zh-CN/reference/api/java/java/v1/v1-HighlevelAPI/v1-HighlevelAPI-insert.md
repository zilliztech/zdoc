---
title: "insert() | Java | v1"
slug: /java/v1-HighlevelAPI-insert
sidebar_label: "insert()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将实体插入到指定集合中。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#OHD5dtKR1ovOACxIUHFcMH6cnFf
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# insert()

MilvusClient 接口。此方法将实体插入到指定集合中。

```java
R<InsertResponse> insert(InsertRowsParam requestParam);
```

#### InsertRowsParam\{#insertrowsparam}

使用 `InsertRowsParam.Builder` 构造 InsertRowsParam 对象。

```java
import io.milvus.param.highlevel.dml.InsertRowsParam;
InsertRowsParam.Builder builder = InsertRowsParam.newBuilder();
```

`InsertRowsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName：要插入数据的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withRows(List\<gson.JsonObject> rows)</p></td>
        <td><p>设置要插入的行数据。rows 列表不能为空。<br/>请注意，如果启用了 auto-ID，则主键字段无需输入。</p></td>
        <td><p>rows：由 gson.JsonObject 对象组成的列表，每个对象代表一行数据。<br/>对于每个字段：<br/>- 如果 dataType 是 Bool/Int8/Int16/Int32/Int64/Float/Double/Varchar，使用 JsonObject.addProperty(key, value) 输入；<br/>- 如果 dataType 是 FloatVector，使用 JsonObject.add(key, gson.toJsonTree(List[Float]) 输入；<br/>- 如果 dataType 是 BinaryVector/Float16Vector/BFloat16Vector，使用 JsonObject.add(key, gson.toJsonTree(byte[])) 输入；<br/>- 如果 dataType 是 SparseFloatVector，使用 JsonObject.add(key, gson.toJsonTree(SortedMap[Long, Float])) 输入；<br/>- 如果 dataType 是 Array，使用 JsonObject.add(key, gson.toJsonTree(List of Boolean/Integer/Short/Long/Float/Double/String)) 输入；<br/>- 如果 dataType 是 JSON，使用 JsonObject.add(key, JsonElement) 输入；<br/>注意：<br/>1. 对于标量数值，value 会根据字段类型被截断。<br/>例如：<br/>  名为 "XX" 的 Int8 字段，如果你通过 JsonObject.addProperty("XX", 128) 将值设置为 128，则值 128 会被截断为 -128。<br/>  名为 "XX" 的 Int64 字段，如果你通过 JsonObject.addProperty("XX", 3.9) 将值设置为 3.9，则值 3.9 会被截断为 3。<br/>2. 如果字符串值有效，则可以被解析为数值/布尔类型。<br/>例如：<br/>  名为 "XX" 的 Bool 字段，如果你通过 JsonObject.addProperty("XX", "TRUE") 将值设置为 "TRUE"，则字符串 "TRUE" 会被解析为 true。<br/>  名为 "XX" 的 Float 字段，如果你通过 JsonObject.addProperty("XX", "3.5", 将值设置为 "3.5"，则字符串 "3.5" 会被解析为 3.5。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 InsertRowsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>在 Java SDK v2.4.1 及更早版本中，输入类型为 <code>fastjson.JSONObject</code>。但由于 <code>fastjson</code> 存在不安全的反序列化漏洞，目前不建议使用。因此，如果你使用的是 Java SDK v2.4.2 或更高版本，请将 <code>fastjson</code> 替换为 <code>gson</code>。</p>

</Admonition>

`InsertRowsParam.Builder.build()` 可能抛出以下异常：

- ParamException：参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<InsertResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回由 `R` 模板封装的有效 `InsertResponse`。

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

List<JsonObject> rows = new ArrayList<>();
Random ran = new Random();
for (long i = 0L; i < rowCount; ++i) {
    JsonObject row = new JsonObject();
    row.addProperty(AGE_FIELD, ran.nextInt(99));
    List<Float> vector = generateFloatVector();
    row.add(VECTOR_FIELD, gson.toJsonTree(vector));

    // $meta if collection EnableDynamicField, you can input this field not exist in schema, else deny
    row.addProperty(INT32_FIELD_NAME, ran.nextInt());
    row.addProperty(INT64_FIELD_NAME, ran.nextLong());
    row.addProperty(VARCHAR_FIELD_NAME, "varchar");
    row.addProperty(FLOAT_FIELD_NAME, ran.nextFloat());
    row.addProperty(DOUBLE_FIELD_NAME, ran.nextDouble());
    row.addProperty(BOOL_FIELD_NAME, ran.nextBoolean());

    // $json
    JsonObject jsonObject = new JsonObject();
    jsonObject.addProperty(INT32_FIELD_NAME, ran.nextInt());
    jsonObject.addProperty(INT64_FIELD_NAME, ran.nextLong());
    jsonObject.addProperty(VARCHAR_FIELD_NAME, "varchar");
    jsonObject.addProperty(FLOAT_FIELD_NAME, ran.nextFloat());
    jsonObject.addProperty(DOUBLE_FIELD_NAME, ran.nextDouble());
    jsonObject.addProperty(BOOL_FIELD_NAME, ran.nextBoolean());
    row.add(USER_JSON_FIELD, jsonObject);

    rows.add(row);
}

InsertRowsParam param = InsertRowsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rows)
        .build();
R<InsertResponse> response = client.insert(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

System.out.println("insertCount: " + response.getData().getInsertCount());
System.out.println("insertIds: " + response.getData().getInsertIds());
```

