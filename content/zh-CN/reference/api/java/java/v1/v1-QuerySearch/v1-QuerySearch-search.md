---
title: "search() | Java | v1"
slug: /java/v1-QuerySearch-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会在向量字段上执行近似最近邻（ANN）搜索，并结合布尔表达式在搜索前对标量字段进行过滤。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#WggndVzAGoDW80xfaq3cY5MMnzd
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# search()

MilvusClient 接口。此方法会在向量字段上执行近似最近邻（ANN）搜索，并结合布尔表达式在搜索前对标量字段进行过滤。

```java
R<SearchResults> search(SearchParam requestParam);
```

#### SearchParam\{#searchparam}

使用 `SearchParam.Builder` 构建 `SearchParam` 对象。

```java
import io.milvus.param.dml.SearchParam;
SearchParam.Builder builder = SearchParam.newBuilder();
```

`SearchParam.Builder` 的方法：

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
        <td><p>搜索中使用的一致性级别。如果未设置该级别，则使用集合的默认一致性级别。</p></td>
        <td><p>consistencyLevel: 搜索中使用的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表以指定搜索范围（可选）。</p></td>
        <td><p>partitionNames: 要搜索的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>添加一个分区以指定搜索范围（可选）。</p></td>
        <td><p>partitionName: 要搜索的分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withOutFields(List\<String> outFields)</p></td>
        <td><p>指定输出的标量字段（可选）。</p></td>
        <td><p><br/>outFields: 要输出的字段名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addOutField(String fieldName)</p></td>
        <td><p>指定一个输出的标量字段（可选）。</p></td>
        <td><p>fieldName: 输出字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置在搜索前过滤标量字段的表达式（可选）。更多信息请参见<a href="https://milvus.io/docs/v2.1.x/boolean.md">此文档</a>。</p></td>
        <td><p>expr: 用于过滤标量字段的表达式。</p></td>
    </tr>
    <tr>
        <td><p>withMetricType(MetricType metricType)</p></td>
        <td><p>设置 ANN 搜索的度量类型。<br/>默认值为 MetricType.None，表示由服务器决定默认度量类型。请参见 Misc 中的 MetricType。</p></td>
        <td><p>metricType: 搜索使用的度量类型。</p></td>
    </tr>
    <tr>
        <td><p>withVectorFieldName(String vectorFieldName)</p></td>
        <td><p>通过名称设置目标向量字段。字段名称不能为空或 null。</p></td>
        <td><p>vectorFieldName: 执行 ANN 搜索的目标向量字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withTopK(Integer topK)</p></td>
        <td><p>设置 ANN 搜索的 topK 值。<br/>可用范围：[1, 16384]</p></td>
        <td><p>topK: topk 值。</p></td>
    </tr>
    <tr>
        <td><p>withVectors(List\<?> vectors)</p></td>
        <td><p>设置目标向量。最多允许 16384 个向量。<br/>注意：此方法适用于 FloatVector/BinaryVector/SparseFloatVector，但不适用于 Float16Vector/BFloat16Vector。<br/>建议使用 withFloatVectors/withBinaryVectors/withFloat16Vectors/withBFloat16Vectors/withSparseFloatVectors 显式输入向量。</p></td>
        <td><p>vectors: <br/>- 如果目标字段类型为 FloatVector，则需要 List\< List\<Float>gt;。<br/>- 如果目标字段类型为 BinaryVector，则需要 List\<ByteBuffer>。<br/>- 如果目标字段类型为 SparseFloatVector，则需要 List\<SortedMap[Long, Float]>。</p></td>
    </tr>
    <tr>
        <td><p>withFloatVectors(List\<List\<Float>gt; vectors)</p></td>
        <td><p>设置用于搜索 FloatVector 字段的目标向量。最多允许 16384 个向量。<br/>注意：此方法会重置 SearchParam 的目标向量。输入向量时仅调用一次。</p></td>
        <td><p>vectors: 目标向量</p></td>
    </tr>
    <tr>
        <td><p>withBinaryVectors(List\<ByteBuffer> vectors)</p></td>
        <td><p>设置用于搜索 BinaryVector 字段的目标向量。最多允许 16384 个向量。<br/>注意：此方法会重置 SearchParam 的目标向量。输入向量时仅调用一次。</p></td>
        <td><p>vectors: 目标向量</p></td>
    </tr>
    <tr>
        <td><p>withFloat16Vectors(List\<ByteBuffer> vectors)</p></td>
        <td><p>设置用于搜索 Float16Vector 字段的目标向量。最多允许 16384 个向量。<br/>注意：此方法会重置 SearchParam 的目标向量。输入向量时仅调用一次。</p></td>
        <td><p>vectors: 目标向量</p></td>
    </tr>
    <tr>
        <td><p>withBFloat16Vectors(List\<List\<Float>gt; vectors)</p></td>
        <td><p>设置用于搜索 BFloat16Vector 字段的目标向量。最多允许 16384 个向量。<br/>注意：此方法会重置 SearchParam 的目标向量。输入向量时仅调用一次。</p></td>
        <td><p>vectors: 目标向量</p></td>
    </tr>
    <tr>
        <td><p>withSparseFloatVectors(List\<SortedMap\<Long, Float>gt; vectors)</p></td>
        <td><p>设置用于搜索 SparseFloatVector 字段的目标向量。最多允许 16384 个向量。<br/>注意：此方法会重置 SearchParam 的目标向量。输入向量时仅调用一次。</p></td>
        <td><p>vectors: 目标向量</p></td>
    </tr>
    <tr>
        <td><p>withRoundDecimal(Integer decimal)</p></td>
        <td><p>指定返回距离的小数位数。<br/>可用范围：[-1, 6]<br/>默认值为 -1，返回所有位数。</p></td>
        <td><p>decimal: 小数点后保留的位数。</p></td>
    </tr>
    <tr>
        <td><p>withParams(String params)</p></td>
        <td><p>以 JSON 格式指定搜索参数。param 的有效键如下：<br/>1. 索引的特殊参数，例如 "nprobe"、"ef"、"search_k"<br/>2. 度量类型，键为 "metric_type"，值为字符串，例如 "L2"、"IP"。<br/>3. 分页偏移量，键为 "offset"，值为整数</p></td>
        <td><p>params: 额外参数的 JSON 格式字符串。</p></td>
    </tr>
    <tr>
        <td><p>withIgnoreGrowing(Boolean ignoreGrowing)</p></td>
        <td><p>忽略增长段以获得最佳搜索性能。适用于不要求数据可见性的用户场景。<br/>默认值为 False。</p></td>
        <td><p>ignoreGrowing: 是否忽略增长段。</p></td>
    </tr>
    <tr>
        <td><p>withGroupByFieldName(String groupByFieldName)</p></td>
        <td><p>设置用于分组的字段名称。</p></td>
        <td><p>groupByFieldName: 用于分组的字段名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 SearchParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SearchParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<SearchResults>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 成功，则返回由 `R` 模板持有的有效 `SearchResults`。你可以使用 `SearchResultsWrapper` 获取结果。

#### SearchResultsWrapper\{#searchresultswrapper}

用于封装 `SearchResults` 的工具类。

```java
import io.milvus.response.SearchResultsWrapper;
SearchResultsWrapper wrapper = new SearchResultsWrapper(searchResults);
```

`SearchResultsWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getFieldData(String fieldName, int indexOfTarget)</p></td>
     <td><p>获取由 SearchParam 指定的输出字段的数据。</p><p>如果字段不存在或 indexOfTarget 非法，则抛出 ParamException。</p></td>
     <td><p>fieldName: 由 SearchParam 的 withOutFields() 指定的字段名称。</p><p>indexOfTarget: 目标向量的序号。</p></td>
     <td><ul><li><p>对于 FloatVector 字段，返回 List\<List\<Float>gt;。</p></li><li><p>对于 BinaryVector/Float16Vector/BFloat16Vector 字段，返回 List\<ByteBuffer>。</p></li><li><p>对于 SparseFloatVector 字段，返回 List\<SortedMap[Long, Float]>。</p></li><li><p>对于 Int64 字段，返回 List\<Long>。</p></li><li><p>对于 Int32/Int16/Int8 字段，返回 List\<Integer>。</p></li><li><p>对于 Bool 字段，返回 List\<Boolean>。</p></li><li><p>对于 Float 字段，返回 List\<Float>。</p></li><li><p>对于 Double 字段，返回 List\<Double>。</p></li><li><p>对于 Varchar 字段，返回 List\<String>。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>getIDScore(int indexOfTarget)</p></td>
     <td><p>获取 search() 返回的 ID-score 对。</p><p>如果 indexOfTarget 非法，则抛出 ParamException。</p><p>如果返回结果非法，则抛出 IllegalResponseException。</p></td>
     <td><p>indexOfTarget: 目标向量的序号。</p></td>
     <td><p>List\<IDScore></p></td>
   </tr>
   <tr>
     <td><p>getRowRecords(int indexOfTarget)</p></td>
     <td><p>从搜索结果中获取行记录。</p><p>ID 会以键 "id" 放入 QueryResultsWrapper.RowRecord 中。</p><p>距离会以键 "distance" 放入 QueryResultsWrapper.RowRecord 中。</p></td>
     <td><p>indexOfTarget: 目标向量的序号。</p></td>
     <td><p>List&lt;QueryResultsWrapper.RowRecord&gt;</p></td>
   </tr>
</table>

#### IDScore\{#idscore}

一个工具类，用于保存 ID 与距离的配对，以及输出字段的值。

`SearchResultsWrapper.IDScore` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getLongID()</p></td>
     <td><p>如果主键类型为 Int64，则获取整数 ID。</p></td>
     <td><p>long</p></td>
   </tr>
   <tr>
     <td><p>getStrID()</p></td>
     <td><p>如果主键类型为 VarChar，则获取字符串 ID。</p></td>
     <td><p>String</p></td>
   </tr>
   <tr>
     <td><p>getScore()</p></td>
     <td><p>获取距离值。</p></td>
     <td><p>float</p></td>
   </tr>
   <tr>
     <td><p>get(String keyName)</p></td>
     <td><p>通过键名获取值。如果键名是字段名，则返回该字段的值。</p><p>如果键名位于动态字段中，则返回动态字段中的值。</p><p>如果键名不存在，则抛出 ParamException。</p></td>
     <td><p>Object</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.response.SearchResultsWrapper;
import io.milvus.grpc.SearchResults;

SearchParam param = SearchParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withMetricType(MetricType.IP)
        .withTopK(10)
        .withFloatVectors(targetVectors)
        .withVectorFieldName("field1")
        .withConsistencyLevel(ConsistencyLevelEnum.EVENTUALLY)
        .withParams("{\"nprobe\":10,\"offset\":2, \"limit\":3}")
        .build();
R<SearchResults> response = client.search(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());
System.out.println("Search results:");
for (int i = 0; i < targetVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = results.getIDScore(i);
    for (SearchResultsWrapper.IDScore score:scores) {
        System.out.println(score);
    }
}
```

