---
title: "query() | Java | v1"
slug: /java/v1-QuerySearch-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法基于由布尔表达式过滤的标量字段查询实体。请注意，返回实体的顺序无法保证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Rtw3dmldWoiOfIxtGRBcpwPynDc
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# query()

MilvusClient 接口。此方法基于由布尔表达式过滤的标量字段查询实体。请注意，返回实体的顺序无法保证。

```java
R<QueryResults> query(QueryParam requestParam);
```

#### QueryParam\{#queryparam}

使用 `QueryParam.Builder` 构造 `QueryParam` 对象。

```java
import io.milvus.param.dml.QueryParam;
QueryParam.Builder builder = QueryParam.newBuilder();
```

`QueryParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>设置搜索一致性级别（可选）。<br/>如果未设置该级别，将使用集合的默认一致性级别。</p></td>
        <td><p>consistencyLevel: 查询中使用的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表以指定查询范围（可选）。</p></td>
        <td><p>partitionNames: 要查询的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>添加一个分区以指定查询范围（可选）。</p></td>
        <td><p>partitionName: 要查询的分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withOutFields(List\<String> outFields)</p></td>
        <td><p>指定输出的标量字段（可选）。<br/>如果指定了输出字段，query() 返回的 QueryResults 将包含这些字段的值。</p></td>
        <td><p><br/>outFields: 要输出的字段名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addOutField(String fieldName)</p></td>
        <td><p>指定一个输出标量字段（可选）。</p></td>
        <td><p>fieldName: 输出字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置用于查询实体的表达式。更多信息请参见<a href="https://milvus.io/docs/boolean.md">此文档</a>。</p></td>
        <td><p>expr: 用于查询的表达式</p></td>
    </tr>
    <tr>
        <td><p>withOffset(Long offset)</p></td>
        <td><p>指定一个位置，将忽略该位置之前返回的实体。仅当指定了 'limit' 值时生效。默认值为 0，从起始位置开始。</p></td>
        <td><p>offset: 用于定义位置的值。</p></td>
    </tr>
    <tr>
        <td><p>withLimit(Long limit)</p></td>
        <td><p>指定一个值以控制返回实体的数量。必须为正值。默认值为 -1，表示返回结果不受限制。</p></td>
        <td><p>limit: 用于定义返回实体上限的值。</p></td>
    </tr>
    <tr>
        <td><p>withIgnoreGrowing(Boolean ignoreGrowing)</p></td>
        <td><p>忽略 growing segments 以获得最佳查询性能。适用于不要求数据可见性的用户场景。默认值为 False。</p></td>
        <td><p>ignoreGrowing: 是否忽略 growing segments。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 QueryParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`QueryParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<QueryResults>` 对象。

- 如果 API 在服务端执行失败，将返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，将返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 调用成功，将返回由 `R` 模板持有的有效 `QueryResults`。你可以使用 `QueryResultsWrapper` 获取查询结果。

#### QueryResultsWrapper\{#queryresultswrapper}

用于封装 `QueryResults` 的工具类。

```java
import io.milvus.response.QueryResultsWrapper;
QueryResultsWrapper wrapper = new QueryResultsWrapper(queryResults);
```

`QueryResultsWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getFieldWrapper(String fieldName)</p></td>
     <td><p>根据字段名返回一个 FieldDataWrapper 对象。如果字段不存在，则抛出 <code>ParamException</code>。</p></td>
     <td><p>fieldName: 由 QueryParam 的 withOutFields() 指定的字段名称。</p></td>
     <td><p>FieldDataWrapper</p></td>
   </tr>
   <tr>
     <td><p>getRowCount()</p></td>
     <td><p>获取查询结果的行数。</p></td>
     <td><p>N/A</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getRowRecords()</p></td>
     <td><p>从查询结果中获取行记录列表。</p></td>
     <td><p>N/A</p></td>
     <td><p>List&lt;QueryResultsWrapper.RowRecord&gt;</p></td>
   </tr>
</table>

#### FieldDataWrapper\{#fielddatawrapper}

用于封装 `query()` API 返回列数据的工具类。

`FieldDataWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>isVectorField()</p></td>
     <td><p>告知用户该字段是向量字段还是标量字段。</p></td>
     <td><p>boolean</p></td>
   </tr>
   <tr>
     <td><p>isJsonField()</p></td>
     <td><p>告知用户该字段是否为 JSON 字段。</p></td>
     <td><p>boolean</p></td>
   </tr>
   <tr>
     <td><p>isDynamicField()</p></td>
     <td><p>告知用户该字段是否为动态字段。</p></td>
     <td><p>boolean</p></td>
   </tr>
   <tr>
     <td><p>getDim()</p></td>
     <td><p>如果该字段是向量字段，则获取其维度值。如果该字段不是向量字段，则抛出 IllegalResponseException。</p></td>
     <td><p>int</p></td>
   </tr>
   <tr>
     <td><p>getRowCount()</p></td>
     <td><p>获取字段的行数。如果字段数据非法，则抛出 IllegalResponseException。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getFieldData()</p></td>
     <td><p>根据字段类型返回字段数据。</p></td>
     <td><ul><li><p>对于 FloatVector 字段，返回 List\<List\<Float>gt;。</p></li><li><p>对于 BinaryVector/Float16Vector/BFloatVector 字段，返回 List\<ByteBuffer>。</p></li><li><p>对于 SparseFloatVector 字段，返回 List\<SortedMap\<Long, Float>gt;。</p></li><li><p>对于 Int64 字段，返回 List\<Long>。</p></li><li><p>对于 Int32/Int16/Int8 字段，返回 List\<Integer>。</p></li><li><p>对于 Bool 字段，返回 List\<Boolean>。</p></li><li><p>对于 Float 字段，返回 List\<Float>。</p></li><li><p>对于 Double 字段，返回 List\<Double>。</p></li><li><p>对于 Varchar 字段，返回 List\<String>。</p></li><li><p>对于 JSON 字段，返回 List\<ByteString>。</p></li></ul></td>
   </tr>
</table>

#### QueryResultsWrapper.RowRecord\{#queryresultswrapperrowrecord}

以键值格式保存单行数据的工具类。

`RowRecord` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>put(String keyName, Object obj)</p></td>
     <td><p>内部使用。为该行设置一个键值对。</p></td>
     <td><p>boolean</p></td>
   </tr>
   <tr>
     <td><p>get(String keyName)</p></td>
     <td><p>根据键名获取值。如果键名是字段名，则返回该字段的值。</p><p>如果键名位于动态字段中，则返回动态字段中的值。</p><p>如果键名不存在，则抛出 ParamException。</p></td>
     <td><p>Object</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.response.FieldDataWrapper;
import io.milvus.grpc.QueryResults;

QueryParam param = QueryParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withExpr("id in [100, 101]")
        .addOutFields("field1")
        .withConsistencyLevel(ConsistencyLevelEnum.EVENTUALLY)
        .build();
R<QueryResults> response = client.query(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

QueryResultsWrapper wrapper = new QueryResultsWrapper(response.getData());
List<QueryResultsWrapper.RowRecord> records = wrapper.getRowRecords();
for (QueryResultsWrapper.RowRecord record:records) {
    System.out.println(record);
}
```
