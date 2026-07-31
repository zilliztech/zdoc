---
title: "searchIterator() | Java | v1"
slug: /java/v1-QuerySearch-searchIterator
sidebar_label: "searchIterator()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会返回一个 Python 迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，它尤其有用。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#CaeGd0ApXo1nEOxr3rDcCGLengf
sidebar_position: 7
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# searchIterator()

MilvusClient 接口。此方法会返回一个 Python 迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，它尤其有用。

```java
R<SearchIterator> searchIterator(SearchIteratorParam requestParam);
```

#### SearchIteratorParam\{#searchiteratorparam}

使用 `SearchIteratorParam.Builder` 构造 `SearchIteratorParam` 对象。

```java
import io.milvus.param.dml.SearchIteratorParam;
SearchIteratorParam.Builder builder = SearchIteratorParam.newBuilder();
```

`SearchIteratorParam.Builder` 的方法：

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
        <td><p>设置搜索一致性级别（可选）。<br/>如果未设置该级别，则使用集合的默认一致性级别。</p></td>
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
        <td><p>指定一个输出标量字段（可选）。</p></td>
        <td><p>fieldName: 输出字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置在搜索前过滤标量字段的表达式（可选）。更多信息请参见<a href="https://milvus.io/docs/v2.3.x/boolean.md">此文档</a>。</p></td>
        <td><p>expr: 用于过滤标量字段的表达式。</p></td>
    </tr>
    <tr>
        <td><p>withMetricType(MetricType metricType)</p></td>
        <td><p>设置 ANN 搜索的度量类型。<br/>默认值为 MetricType.None，表示由服务器决定默认度量类型。请参见 Misc 中的 MetricType。</p></td>
        <td><p>metricType: 搜索使用的度量类型。</p></td>
    </tr>
    <tr>
        <td><p>withVectorFieldName(String vectorFieldName)</p></td>
        <td><p>按名称设置目标向量字段。字段名称不能为空或 null。</p></td>
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
        <td><p>指定返回距离值的小数位数。<br/>可用范围：[-1, 6]<br/>默认值为 -1，返回所有数字。</p></td>
        <td><p>decimal: 小数点后保留的位数。</p></td>
    </tr>
    <tr>
        <td><p>withParams(String params)</p></td>
        <td><p>以 JSON 格式指定搜索参数。以下是 param 的有效键：<br/>1. 索引的特殊参数，例如 "nprobe"、"ef"、"search_k"<br/>2. 度量类型，键为 "metric_type"，值为字符串，例如 "L2"、"IP"。<br/>3. 用于分页的 offset，键为 "offset"，值为整数</p></td>
        <td><p>params: 额外参数的 JSON 格式字符串。</p></td>
    </tr>
    <tr>
        <td><p>withIgnoreGrowing(Boolean ignoreGrowing)</p></td>
        <td><p>忽略 growing segments 以获得最佳搜索性能。适用于不要求数据可见性的用户场景。<br/>默认值为 False。</p></td>
        <td><p>ignoreGrowing: 是否忽略 growing segments。</p></td>
    </tr>
    <tr>
        <td><p>withGroupByFieldName(String groupByFieldName)</p></td>
        <td><p>设置用于分组的字段名称。</p></td>
        <td><p>groupByFieldName: 用于分组的字段名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 SearchIteratorParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SearchIteratorParam.Builder.build()` 可能抛出以下异常：

- ParamException: 参数无效时抛出的错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<SearchIterator>` 对象。

- 如果 API 在服务器端执行失败，则返回服务器端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `SearchIterator`。

#### SearchIterator\{#searchiterator}

`SearchIterator` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>next()</p></td>
     <td><p>返回一批结果。</p></td>
     <td><p>N/A</p></td>
     <td><p>List&lt;QueryResultsWrapper.RowRecord&gt;</p></td>
   </tr>
   <tr>
     <td><p>close()</p></td>
     <td><p>释放缓存结果。</p></td>
     <td><p>N/A</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.orm.iterator.*;
import io.milvus.response.QueryResultsWrapper;

R<SearchIterator> response = milvusClient.searchIterator(SearchIteratorParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withBatchSize(50L)
        .withVectorFieldName(VECTOR_FIELD)
        .withFloatVectors(vectors)
        .withParams(params)
        .withMetricType(MetricType.L2)
        .build());
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

SearchIterator searchIterator = response.getData();
while (true) {
    List<QueryResultsWrapper.RowRecord> batchResults = searchIterator.next();
    if (res.isEmpty()) {
        System.out.println("search iteration finished, close");
        queryIterator.close();
        break;
    }
    for (QueryResultsWrapper.RowRecord res : batchResults) {
        System.out.println(res);
    }
}
```
