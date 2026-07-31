---
title: "queryIterator() | Java | v1"
slug: /java/v1-QuerySearch-queryIterator
sidebar_label: "queryIterator()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会返回一个迭代器，供您遍历查询结果。尤其当查询结果包含大量数据时，此方法非常有用。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#MT4PdeBFhox6OfxqEixcBX3un2g
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# queryIterator()

MilvusClient 接口。此方法会返回一个迭代器，供您遍历查询结果。尤其当查询结果包含大量数据时，此方法非常有用。

```java
R<QueryIterator> queryIterator(QueryIteratorParam requestParam);
```

#### QueryIteratorParam\{#queryiteratorparam}

使用 `QueryIteratorParam.Builder` 构建 `QueryIteratorParam` 对象。

```java
import io.milvus.param.dml.QueryIteratorParam;
QueryIteratorParam.Builder builder = QueryIteratorParam.newBuilder();
```

`QueryIteratorParam.Builder` 的方法：

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
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>设置搜索一致性级别（可选）。<br/>如果未设置该级别，将使用 collection 的默认一致性级别。</p></td>
        <td><p>consistencyLevel: 查询中使用的一致性级别。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置 partition 名称列表以指定查询范围（可选）。</p></td>
        <td><p>partitionNames: 要查询的 partition 名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>添加一个 partition 以指定查询范围（可选）。</p></td>
        <td><p>partitionName: 要查询的 partition 名称。</p></td>
    </tr>
    <tr>
        <td><p>withOutFields(List\<String> outFields)</p></td>
        <td><p>指定输出的标量字段（可选）。<br/>如果指定了输出字段，query() 返回的 QueryResults 将包含这些字段的值。</p></td>
        <td><p><br/>outFields: 要输出的字段名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addOutField(String fieldName)</p></td>
        <td><p>指定一个输出的标量字段（可选）。</p></td>
        <td><p>fieldName: 输出字段名称。</p></td>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置用于查询实体的表达式。更多信息请参见<a href="https://milvus.io/docs/v2.3.x/boolean.md">此文档</a>。</p></td>
        <td><p>expr: 查询表达式</p></td>
    </tr>
    <tr>
        <td><p>withOffset(Long offset)</p></td>
        <td><p>指定一个位置，返回结果中此位置之前的实体将被忽略。仅在指定了 'limit' 值时生效。默认值为 0，表示从开头开始。</p></td>
        <td><p>offset: 用于定义位置的值。</p></td>
    </tr>
    <tr>
        <td><p>withLimit(Long limit)</p></td>
        <td><p>指定一个值以控制返回的实体数量。必须为正值。默认值为 -1，表示返回结果不受限制。</p></td>
        <td><p>limit: 用于定义返回实体数量上限的值。</p></td>
    </tr>
    <tr>
        <td><p>withIgnoreGrowing(Boolean ignoreGrowing)</p></td>
        <td><p>忽略 growing segments 以获得最佳查询性能。适用于不要求数据可见性的使用场景。默认值为 False。</p></td>
        <td><p>ignoreGrowing: 是否忽略 growing segments。</p></td>
    </tr>
    <tr>
        <td><p>withBatchSize(Long batchSize)</p></td>
        <td><p>指定一个值以控制每批返回的实体数量。必须为正值。<br/>默认值为 1000，返回时不受 batchSize 限制。</p></td>
        <td><p>batchSize: 用于定义每批返回实体数量的值</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 QueryIteratorParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`QueryIteratorParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<QueryIterator>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `QueryIterator`。

#### QueryIterator\{#queryiterator}

`QueryIterator` 的方法：

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

R<QueryIterator> response = milvusClient.queryIterator(QueryIteratorParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withExpr(expr)
        .withBatchSize(100L)
        .build());
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

QueryIterator queryIterator = response.getData();
while (true) {
    List<QueryResultsWrapper.RowRecord> batchResults = queryIterator.next();
    if (res.isEmpty()) {
        System.out.println("query iteration finished, close");
        queryIterator.close();
        break;
    }
    for (QueryResultsWrapper.RowRecord res : batchResults) {
        System.out.println(res);
    }
}
```
