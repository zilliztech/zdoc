---
title: "search() | Java | v1"
slug: /java/v1-HighlevelAPI-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法在向量字段上执行近似最近邻（ANN）搜索，并结合布尔表达式在搜索前对标量字段执行过滤。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#J7mOdolPjo1iByxIFZ3cjqYwntg
sidebar_position: 7
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# search()

MilvusClient 接口。此方法在向量字段上执行近似最近邻（ANN）搜索，并结合布尔表达式在搜索前对标量字段执行过滤。

```java
R<SearchResponse> search(SearchSimpleParam requestParam);
```

#### SearchSimpleParam\{#searchsimpleparam}

使用 `SearchSimpleParam.Builder` 构建 `SearchSimpleParam` 对象。

```java
import io.milvus.param.highlevel.dml.SearchSimpleParam;
SearchSimpleParam.Builder builder = SearchSimpleParam.newBuilder();
```

`SearchSimpleParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标集合名称</p></td>
    </tr>
    <tr>
        <td><p>withOutFields(List\<String> outFields)</p></td>
        <td><p>指定输出的标量字段（可选）。</p></td>
        <td><p><br/>outFields: 要输出的字段名称列表</p></td>
    </tr>
    <tr>
        <td><p>withFilter(String filter)</p></td>
        <td><p>设置在搜索前过滤标量字段的表达式（可选）。更多信息请参见<a href="https://milvus.io/docs/v2.1.x/boolean.md">此文档</a>。</p></td>
        <td><p>filter: 用于过滤标量字段的表达式</p></td>
    </tr>
    <tr>
        <td><p>withVectors(List\<?> vectors)</p></td>
        <td><p>设置目标向量。最多允许 16384 个向量。</p></td>
        <td><p>vectors: <br/>- 如果目标字段类型为 float vector，则需要 List\< List\<Float>gt;；<br/>- 如果目标字段类型为 binary vector，则需要 List\<ByteBuffer>；</p></td>
    </tr>
    <tr>
        <td><p>withOffset(Long offset)</p></td>
        <td><p>指定一个位置，返回结果中此位置之前的实体将被忽略。仅在指定了 'limit' 值时生效。默认值为 0，表示从开始位置起。</p></td>
        <td><p>offset: 用于定义位置的值</p></td>
    </tr>
    <tr>
        <td><p>withLimit(Long limit)</p></td>
        <td><p>指定一个值以控制返回的实体数量。必须为正值。默认值为 10，将在没有限制的情况下返回。</p></td>
        <td><p>limit: 用于定义返回实体数量限制的值</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>搜索中使用的一致性级别。如果未指定级别，则使用默认一致性。请参见 Misc 中的 ConsistencyLevelEnum。</p></td>
        <td><p>consistencyLevel: 搜索中使用的一致性级别</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 SearchSimpleParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SearchSimpleParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<SearchResponse>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回由 `R` 模板持有的有效 `SearchResponse`。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.SearchResultsWrapper;
import io.milvus.grpc.SearchResults;

SearchSimpleParam param = SearchSimpleParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withVectors(generateFloatVector())
        .withOutputFields(Lists.newArrayList("*"))
        .withFilter(filter)
        .withLimit(100L)
        .withOffset(0L)
        .build();
R<SearchResponse> response = client.search(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (QueryResultsWrapper.RowRecord rowRecord : response.getData().getRowRecords()) {
    System.out.println(rowRecord);
}
```
