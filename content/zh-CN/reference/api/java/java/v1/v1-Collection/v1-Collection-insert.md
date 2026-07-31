---
title: "insert() | Java | v1"
slug: /java/v1-Collection-insert
sidebar_label: "insert()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法将实体插入到指定集合中。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#LSztdn2VAohrv3xksJocdjdynXd
sidebar_position: 11
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# insert()

一个 MilvusClient 接口。此方法将实体插入到指定集合中。

```java
R<MutationResult> insert(InsertParam requestParam);
```

#### InsertParam\{#insertparam}

使用 `InsertParam.Builder` 构造 `InsertParam` 对象。

```java
import io.milvus.param.InsertParam;
InsertParam.Builder builder = InsertParam.newBuilder();
```

`InsertParam.Builder` 的方法：

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
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置目标分区名称（可选）。</p></td>
        <td><p>partitionName：要插入数据的分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withFields(List&lt;InsertParam.Field&gt; fields)</p></td>
        <td><p>设置要插入的数据。字段列表不能为空。<br/>请注意，如果启用了 auto_id，则主键字段无需输入。</p></td>
        <td><p>fields：Field 对象列表，每个对象表示一个字段。</p></td>
    </tr>
    <tr>
        <td><p>withRows(List\<gson.JsonObject> rows)</p></td>
        <td><p>设置按行插入的数据。行列表不能为空。<br/>请注意，如果调用了 withFields()，则会忽略通过 withRows() 传入的 rows。</p></td>
        <td><p>rows：gson.JsonObject 对象列表，每个对象表示一行键值格式的数据。<br/>对于每个字段：<br/>- 如果 dataType 是 Bool/Int8/Int16/Int32/Int64/Float/Double/Varchar，使用 JsonObject.addProperty(key, value) 输入；<br/>- 如果 dataType 是 FloatVector，使用 JsonObject.add(key, gson.toJsonTree(List[Float]) 输入；<br/>- 如果 dataType 是 BinaryVector/Float16Vector/BFloat16Vector，使用 JsonObject.add(key, gson.toJsonTree(byte[])) 输入；<br/>- 如果 dataType 是 SparseFloatVector，使用 JsonObject.add(key, gson.toJsonTree(SortedMap[Long, Float])) 输入；<br/>- 如果 dataType 是 Array，使用 JsonObject.add(key, gson.toJsonTree(List of Boolean/Integer/Short/Long/Float/Double/String)) 输入；<br/>- 如果 dataType 是 JSON，使用 JsonObject.add(key, JsonElement) 输入；<br/>注意：<br/>1. 对于标量数值，value 将根据字段类型被截断。<br/>例如：<br/>  名为 "XX" 的 Int8 字段，如果你通过 JsonObject.addProperty("XX", 128) 将值设为 128，则值 128 会被截断为 -128。<br/>  名为 "XX" 的 Int64 字段，如果你通过 JsonObject.addProperty("XX", 3.9) 将值设为 3.9，则值 3.9 会被截断为 3。<br/>2. 如果字符串值有效，则可以被解析为数值/布尔类型。<br/>例如：<br/>  名为 "XX" 的 Bool 字段，如果你通过 JsonObject.addProperty("XX", "TRUE") 将值设为 "TRUE"，则字符串 "TRUE" 会被解析为 true。<br/>  名为 "XX" 的 Float 字段，如果你通过 JsonObject.addProperty("XX", "3.5", 将值设为 "3.5"，则字符串 "3.5" 会被解析为 3.5。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 InsertParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>在 Java SDK v2.4.1 及更早版本中，输入类型为 <code>fastjson.JSONObject</code>。但由于 <code>fastjson</code> 存在不安全反序列化漏洞，目前不建议使用。因此，如果你使用的是 v2.4.2 或更高版本的 Java SDK，请将 <code>fastjson</code> 替换为 <code>gson</code>。</p>

</Admonition>

`InsertParam.Builder.build()` 可能抛出以下异常：

- ParamException：参数无效时抛出错误。

#### Field\{#field}

用于保存数据字段的工具类。

`InsertParam.Field` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
   </tr>
   <tr>
     <td><p>Field(String name, List\<?> values)</p></td>
     <td><p>此类仅提供构造函数来创建 Field 对象。</p></td>
     <td><p>name：数据字段名称。values：</p><ul><li><p>如果数据类型为 Bool，则需要 List\<Boolean>。</p></li><li><p>如果数据类型为 Int64，则需要 List\<Long>。</p></li><li><p>如果数据类型为 Int8/Int16/Int32，则需要 List\<Integer> 或 List\<Short>。</p></li><li><p>如果数据类型为 Float，则需要 List\<Float>。</p></li><li><p>如果数据类型为 Double，则需要 List\<Double>。</p></li><li><p>如果数据类型为 Varchar，则需要 List\<String>。</p></li><li><p>如果数据类型为 Array，则需要 List\<List\<?>gt;，内部 List 的类型必须与 Array 字段的元素类型一致。</p></li><li><p>如果数据类型为 FloatVector，则需要 List\<List\<Float>gt;。</p></li><li><p>如果数据类型为 BinaryVector/Float16Vector/BFloat16Vector，则需要 List\<ByteBuffer>。</p></li><li><p>如果数据类型为 SparseFloatVector，则需要 List\<SortedMap\<Long, Float>gt;。</p></li></ul></td>
   </tr>
</table>

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<MutationResult>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 成功，则返回由 `R` 模板持有的有效 `MutationResult`。你可以使用 `MutationResultWrapper` 获取返回的信息。

#### MutationResultWrapper\{#mutationresultwrapper}

用于封装 MutationResult 的工具类。

```java
import io.milvus.response.MutationResultWrapper;
MutationResultWrapper wrapper = new MutationResultWrapper(mutationResult);
```

`MutationResultWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getInsertCount()</p></td>
     <td><p>获取已插入实体的行数。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getLongIDs()</p></td>
     <td><p>如果主键字段类型为 int64，则获取 insert() 接口返回的 long ID 数组。如果主键类型不是 int64，则抛出 ParamException。</p></td>
     <td><p>List\<Long></p></td>
   </tr>
   <tr>
     <td><p>getStringIDs()</p></td>
     <td><p>如果主键字段类型为 varchar，则获取 insert() 接口返回的 string ID 数组。如果主键类型不是 varchar，则抛出 ParamException。</p></td>
     <td><p>List\<String></p></td>
   </tr>
   <tr>
     <td><p>getDeleteCount()</p></td>
     <td><p>获取已删除实体的行数。当前，该值始终等于输入的行数。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getOperationTs()</p></td>
     <td><p>获取由服务器标记的操作时间戳。</p></td>
     <td><p>long</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

int rowCount = 10000;
List<List<Float>> vectors = generateFloatVectors(rowCount);

// insert data by columns
List<Long> ids = new ArrayList<>();
for (long i = 0L; i < rowCount; ++i) {
    ids.add(i);
}

List<InsertParam.Field> fields = new ArrayList<>();
fields.add(new InsertParam.Field("id", ids));
fields.add(new InsertParam.Field("vector", vectors));

R<MutationResult> response = client.insert(InsertParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withFields(fields)
        .build());
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

MutationResultWrapper wrapper = new MutationResultWrapper(response.getData());
System.out.println(wrapper.getInsertCount() + " rows inserted");

// insert data by rows
Gson gson = new Gson();
List<JsonObject> rows = new ArrayList<>();
for (int i = 1; i <= rowCount; ++i) {
    JsonObject row = new JsonObject();
    row.addProperty("id", (long)i);
    row.add("vector", gson.toJsonTree(vectors.get(i)));
    rows.add(row);
}

response = client.insert(InsertParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withRows(rows)
        .build());
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
