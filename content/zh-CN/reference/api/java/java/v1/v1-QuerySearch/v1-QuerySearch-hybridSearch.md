---
title: "hybridSearch() | Java | v1"
slug: /java/v1-QuerySearch-hybridSearch
sidebar_label: "hybridSearch()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会在多个向量字段上执行近似最近邻（ANN）搜索，并在重排序后返回搜索结果。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#QC0Yd0dhsodbfPxse7wcpyQSnke
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hybridSearch()

MilvusClient 接口。此方法会在多个向量字段上执行近似最近邻（ANN）搜索，并在重排序后返回搜索结果。

```java
R<SearchResults> hybridSearch(HybridSearchParam requestParam);
```

#### HybridSearchParam\{#hybridsearchparam}

使用 `HybridSearchParam.Builder` 构建 `HybridSearchParam` 对象。

```java
import io.milvus.param.dml.HybridSearchParam;
HybridSearchParam.Builder builder = HybridSearchParam.newBuilder();
```

`HybridSearchParam.Builder` 的方法：

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
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
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
        <td><p>指定一个输出的标量字段（可选）。</p></td>
        <td><p>fieldName: 输出字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withTopK(Integer topK)</p></td>
        <td><p>设置 ANN 搜索的 topK 值。<br/>可用范围：[1, 16384]</p></td>
        <td><p>topK: topk 值。</p></td>
    </tr>
    <tr>
        <td><p>withRoundDecimal(Integer decimal)</p></td>
        <td><p>指定返回距离的小数位数。<br/>可用范围：[-1, 6]<br/>默认值为 -1，返回所有位数。</p></td>
        <td><p>decimal: 小数点后保留的位数。</p></td>
    </tr>
    <tr>
        <td><p>addSearchRequest(AnnSearchParam searchParam)</p></td>
        <td><p>为某个向量字段添加一个向量搜索请求。您可以添加</p></td>
        <td><p>searchParam: 一个 AnnSearchParam 对象。</p></td>
    </tr>
    <tr>
        <td><p>withRanker(BaseRanker ranker)</p></td>
        <td><p>设置一个 ranker，对 limit 返回的结果数量进行重新排序。<br/>可用值：<br/>- RRFRanker<br/>- WeightedRanker</p></td>
        <td><p>ranker: 具体的 ranker 对象。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 SearchParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`HybridSearchParam.Builder.build()` 可能会抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### AnnSearchParam\{#annsearchparam}

`hybridSearch()` 的子请求。

使用 `AnnSearchParam.Builder` 构建 `AnnSearchParam` 对象。

```java
import io.milvus.param.dml.AnnSearchParam;
AnnSearchParam.Builder builder = AnnSearchParam.newBuilder();
```

`AnnSearchParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置在搜索前过滤标量字段的表达式（可选）。更多信息请参见<a href="https://milvus.io/docs/v2.3.x/boolean.md">此文档</a>。</p></td>
        <td><p>expr: 用于过滤标量字段的表达式。</p></td>
    </tr>
    <tr>
        <td><p>withMetricType(MetricType metricType)</p></td>
        <td><p>设置 ANN 搜索的度量类型。<br/>默认值为 MetricType.None，表示由服务器确定默认度量类型。请参见 Misc 中的 MetricType。</p></td>
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
        <td><p>withParams(String params)</p></td>
        <td><p>以 JSON 格式指定搜索参数。以下是 param 的有效键：<br/>1. 索引的特殊参数，例如 "nprobe"、"ef"、"search_k"<br/>2. 度量类型，键为 "metric_type"，值为字符串，例如 "L2"、"IP"<br/>3. 分页 offset，键为 "offset"，值为整数</p></td>
        <td><p>params: 额外参数的 JSON 格式字符串。</p></td>
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
        <td><p>build()</p></td>
        <td><p>构建一个 SearchParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### RRFRanker\{#rrfranker}

RRF 重排序策略会合并多个搜索的结果，并优先保留那些持续出现的条目。

使用 `RRFRanker.Builder` 构建 `RRFRanker` 对象。

```java
import io.milvus.param.dml.ranker.RRFRanker;
RRFRanker.Builder builder = RRFRanker.newBuilder();
```

`RRFRanker.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withK(Integer k)</p></td>
        <td><p>设置 RRF 的 k 因子。该值不能为负。默认值为 60。<br/>score = 1 / (k + float32(rank_i+1))<br/>rank_i 是每个字段中的排名</p></td>
        <td><p>k: k 因子值。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 RRFRanker 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### WeightedRanker\{#weightedranker}

加权平均评分重排序策略会根据相关性对向量进行优先级排序，并对其重要性求平均。

使用 `WeightedRankerWeightedRanker.Builder` 构建 `WeightedRanker` 对象。

```java
import io.milvus.param.dml.ranker.WeightedRanker;
WeightedRanker.Builder builder = WeightedRanker.newBuilder();
```

`WeightedRanker.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withWeights(List\<Float> weights)</p></td>
        <td><p>为每个 AnnSearchParam 分配权重。weights 的长度必须等于 AnnSearchParam 的数量。<br/>您可以为权重指定任意 float 值，权重总和可以超过 1。<br/>每个字段的距离/相似度值都会被映射到 [0,1] 范围内，<br/>并且 score = sum(weights[i] * distance_i_in_[0,1])。</p></td>
        <td><p>weights: 权重值。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 WeightedRanker 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<SearchResults>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误代码和消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和异常错误消息。

- 如果 API 成功，则返回由 `R` 模板持有的有效 `SearchResults`。您可以使用 `SearchResultsWrapper` 获取结果。

#### Example\{#example}

```java
import io.milvus.param.dml.*;
import io.milvus.param.dml.ranker.*;
import io.milvus.grpc.SearchResults;

AnnSearchParam req1 = AnnSearchParam.newBuilder()
        .withVectorFieldName(FLOAT_VECTOR_FIELD)
        .withFloatVectors(floatVectors)
        .withMetricType(MetricType.IP)
        .withParams("{\"nprobe\": 32}")
        .withTopK(10)
        .build();

AnnSearchParam req2 = AnnSearchParam.newBuilder()
        .withVectorFieldName(BINARY_VECTOR_FIELD)
        .withBinaryVectors(binaryVectors)
        .withMetricType(MetricType.HAMMING)
        .withTopK(15)
        .build();

HybridSearchParam searchParam = HybridSearchParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .addOutField(FLOAT_VECTOR_FIELD)
        .addSearchRequest(req1)
        .addSearchRequest(req2)
        .withTopK(5)
        .withConsistencyLevel(ConsistencyLevelEnum.STRONG)
        .withRanker(RRFRanker.newBuilder()
                .withK(2)
                .build())
        .build();

R<SearchResults> response = milvusClient.hybridSearch(searchParam);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
