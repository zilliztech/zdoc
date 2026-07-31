---
title: "upsert() | Java | v1"
slug: /java/v1-Collection-upsert
sidebar_label: "upsert()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将新实体插入指定集合中，如果实体已存在，则进行替换。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#HH6pdFJD3owq5BxjrsycVnw5nUf
sidebar_position: 13
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# upsert()

MilvusClient 接口。此方法将新实体插入指定集合中，如果实体已存在，则进行替换。

```java
R<MutationResult> upsert(UpsertParam requestParam);
```

#### UpsertParam\{#upsertparam}

使用 `UpsertParam.Builder` 构造 `UpsertParam` 对象。

```java
import io.milvus.param.UpsertParam;
UpsertParam.Builder builder = UpsertParam.newBuilder();
```

`UpsertParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要插入数据的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。数据库名称可以为 null，表示默认数据库。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置目标分区名称（可选）。</p></td>
        <td><p>partitionName: 要插入数据的分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withFields(List&lt;InsertParam.Field&gt; fields)</p></td>
        <td><p>设置要插入的列式数据。fields 列表不能为空。<br/>请注意，如果启用了 auto-id，则主键字段无需输入。</p></td>
        <td><p>fields: Field 对象列表，每个对象表示一个字段。</p></td>
    </tr>
    <tr>
        <td><p>withRows(List\<gson.JsonObject> rows)</p></td>
        <td><p>设置要插入的行式数据。rows 列表不能为空。<br/>请注意，如果调用了 withFields()，则通过 withRows() 设置的 rows 将被忽略。</p></td>
        <td><p>rows: gson.JsonObject 对象列表，每个对象表示一行键值格式的数据。<br/>对于每个字段：<br/>- 如果 dataType 为 Bool/Int8/Int16/Int32/Int64/Float/Double/Varchar，使用 JsonObject.addProperty(key, value) 输入；<br/>- 如果 dataType 为 FloatVector，使用 JsonObject.add(key, gson.toJsonTree(List[Float]) 输入；<br/>- 如果 dataType 为 BinaryVector/Float16Vector/BFloat16Vector，使用 JsonObject.add(key, gson.toJsonTree(byte[])) 输入；<br/>- 如果 dataType 为 SparseFloatVector，使用 JsonObject.add(key, gson.toJsonTree(SortedMap[Long, Float])) 输入；<br/>- 如果 dataType 为 Array，使用 JsonObject.add(key, gson.toJsonTree(List of Boolean/Integer/Short/Long/Float/Double/String)) 输入；<br/>- 如果 dataType 为 JSON，使用 JsonObject.add(key, JsonElement) 输入；<br/>注意：<br/>1. 对于标量数值，value 会根据字段类型被截断。<br/>例如：<br/>  一个名为 "XX" 的 Int8 字段，如果你通过 JsonObject.addProperty("XX", 128) 将值设为 128，则值 128 会被截断为 -128。<br/>  一个名为 "XX" 的 Int64 字段，如果你通过 JsonObject.addProperty("XX", 3.9) 将值设为 3.9，则值 3.9 会被截断为 3。<br/>2. 如果字符串值有效，则可以被解析为数值/布尔类型。<br/>例如：<br/>  一个名为 "XX" 的 Bool 字段，如果你通过 JsonObject.addProperty("XX", "TRUE") 将值设为 "TRUE"，则字符串 "TRUE" 会被解析为 true。<br/>  一个名为 "XX" 的 Float 字段，如果你通过 JsonObject.addProperty("XX", "3.5", 则字符串 "3.5" 会被解析为 3.5。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 InsertParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>在 Java SDK v2.4.1 及更早版本中，输入类型为 <code>fastjson.JSONObject</code>。但由于 <code>fastjson</code> 存在不安全的反序列化漏洞，因此当前不推荐使用。因此，如果你使用的是 Java SDK v2.4.2 或更高版本，请将 <code>fastjson</code> 替换为 <code>gson</code>。</p>

</Admonition>

`UpsertParam.Builder.build()` 可能抛出以下异常：

- ParamException：参数无效时抛出错误。

#### 返回值\{#returns}

- 如果 API 在服务端执行失败，则返回服务端的错误码和消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和异常错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `MutationResult`。你可以使用 `MutationResultWrapper` 获取返回的信息。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

List<List<Float>> vectors = generateFloatVectors(1);
List<JsonObject> rows = new ArrayList<>();
JsonObject row = new JsonObject();
row.addProperty("id", (long)i);
row.add("vector", gson.toJsonTree(vectors.get(0)));
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
