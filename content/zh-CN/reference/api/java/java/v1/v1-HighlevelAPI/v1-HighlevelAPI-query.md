---
title: "query() | Java | v1"
slug: /java/v1-HighlevelAPI-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法根据由布尔表达式过滤的标量字段查询实体。请注意，返回实体的顺序无法保证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#SvbQdF7xRonhkFxpZ18cHlj8noc
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# query()

MilvusClient 接口。此方法根据由布尔表达式过滤的标量字段查询实体。请注意，返回实体的顺序无法保证。

```java
R<QueryResponse> query(QuerySimpleParam requestParam);
```

#### QuerySimpleParam\{#querysimpleparam}

使用 `QuerySimpleParam.Builder` 构造 `QuerySimpleParam` 对象。

```java
import io.milvus.param.highlevel.dml.QuerySimpleParam;
QuerySimpleParam.Builder builder = QuerySimpleParam.newBuilder();
```

`QuerySimpleParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标 collection 的名称。</p></td>
    </tr>
    <tr>
        <td><p>withOutputFields(List\<String> outputFields)</p></td>
        <td><p>指定输出的标量字段（可选）。<br/>如果指定了输出字段，query() 返回的 QueryResults 将包含这些字段的值。</p></td>
        <td><p><br/>outputFields: 要输出的字段名称列表。</p></td>
    </tr>
    <tr>
        <td><p>withFilter(String filter)</p></td>
        <td><p>设置用于查询实体的表达式。更多信息请参见<a href="https://milvus.io/docs/v2.1.x/boolean.md">此文档</a>。</p></td>
        <td><p>filter: 用于查询的表达式。</p></td>
    </tr>
    <tr>
        <td><p>withOffset(Long offset)</p></td>
        <td><p>指定一个位置，此位置之前返回的实体将被忽略。仅在指定了 `limit` 值时生效。默认值为 0，从起始位置开始。</p></td>
        <td><p>offset: 用于定义位置的值。</p></td>
    </tr>
    <tr>
        <td><p>withLimit(Long limit)</p></td>
        <td><p>指定一个值以控制返回实体的数量。必须为正值。默认值为 0，表示不限制返回数量。</p></td>
        <td><p>limit: 用于定义返回实体数量上限的值。</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>查询中使用的一致性级别。如果未指定级别，将使用默认一致性。请参见 Misc 中的 ConsistencyLevelEnum。</p></td>
        <td><p>consistencyLevel: 查询中使用的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 QuerySimpleParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`QuerySimpleParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<QueryResponse>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回由 `R` 模板持有的有效 `QueryResponse`。

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.response.FieldDataWrapper;
import io.milvus.grpc.QueryResults;

QuerySimpleParam querySimpleParam = QuerySimpleParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withOutFields(Lists.newArrayList("*"))
        .withFilter(filter)
        .withLimit(100L)
        .withOffset(0L)
        .build();
R<QueryResponse> response = client.query(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

for (QueryResultsWrapper.RowRecord rowRecord : response.getData().getRowRecords()) {
    System.out.println(rowRecord);
}
```

