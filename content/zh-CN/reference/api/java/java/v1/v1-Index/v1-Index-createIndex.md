---
title: "createIndex() | Java | v1"
slug: /java/v1-Index-createIndex
sidebar_label: "createIndex()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法用于在指定 collection 的某个字段上创建索引。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#DITJd9ZMboinkqxpf9lcE6itnlh
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createIndex()

MilvusClient 接口。此方法用于在指定 collection 的某个字段上创建索引。

```java
R<RpcStatus> createIndex(CreateIndexParam requestParam);
```

#### CreateIndexParam\{#createindexparam}

使用 `CreateIndexParam.Builder` 构造 `CreateIndexParam` 对象。

```java
import io.milvus.param.CreateIndexParam;
CreateIndexParam.Builder builder = CreateIndexParam.newBuilder()
```

`CreateIndexParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(<br/>String collectionName)</p></td>
        <td><p>设置目标 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 要为其创建索引的目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withFieldName(String fieldName)</p></td>
        <td><p>设置目标字段名称。字段名称不能为空或 null。</p></td>
        <td><p>fieldName: 目标字段名称</p></td>
    </tr>
    <tr>
        <td><p>withIndexType(IndexType indexType)</p></td>
        <td><p>设置索引类型。请参考 Misc 中的 IndexType。</p></td>
        <td><p>indexType: 索引类型</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>设置将要创建的索引名称。随后你可以使用该索引名称检查索引状态。如果未指定索引名称，默认索引名称为空字符串，这表示由服务器决定。索引名称的最大长度为 255 个字符。</p></td>
        <td><p>indexName: 索引名称</p></td>
    </tr>
    <tr>
        <td><p>withMetricType(MetricType metricType)</p></td>
        <td><p>设置度量类型。请参考 Misc 中的 MetricType。</p></td>
        <td><p>metricType: 度量类型</p></td>
    </tr>
    <tr>
        <td><p><br/>withExtraParam(String extraParam)</p></td>
        <td><p><br/>根据索引类型设置特定的索引参数。例如对于 IVF 索引，额外参数可以是 "\{\"nlist\":1024\}"。</p></td>
        <td><p>extraParam: <br/>JSON 格式的额外参数</p></td>
    </tr>
    <tr>
        <td><p>withSyncMode(Boolean syncMode)</p></td>
        <td><p>启用同步模式。对于同步模式，客户端会持续等待，直到 collection 的所有 segment 都成功建立索引。如果禁用同步模式，createIndex() 会立即返回。默认情况下启用同步模式。</p></td>
        <td><p>syncMode: true 表示同步模式</p></td>
    </tr>
    <tr>
        <td><p>withSyncWaitingInterval(Long milliseconds)</p></td>
        <td><p>设置同步模式下的等待间隔。启用同步模式后，客户端会按照该间隔持续检查索引状态。间隔值必须大于 0，且不能大于 Constant.MAX_WAITING_INDEX_INTERVAL。默认情况下，间隔值为 500 毫秒。</p></td>
        <td><p><br/>milliseconds: 同步模式的间隔值（单位：毫秒）</p></td>
    </tr>
    <tr>
        <td><p><br/>withSyncWaitingTimeout( Long seconds)</p></td>
        <td><p>设置同步模式的超时时间。超时值必须大于 0，且没有上限。默认值为 600 秒。</p></td>
        <td><p>seconds: 同步模式的超时值（单位：秒）</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateAliasParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreateIndexParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务器端执行失败，它将返回服务器返回的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，它将返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，它将返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

CreateIndexParam param = CreateIndexParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withFieldName("field1")
        .withIndexType(IndexType.IVF_FLAT)
        .withMetricType(MetricType.L2)
        .withExtraParam("{\"nlist\":64}")
        .build();
R<RpcStatus> response = client.createIndex(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
