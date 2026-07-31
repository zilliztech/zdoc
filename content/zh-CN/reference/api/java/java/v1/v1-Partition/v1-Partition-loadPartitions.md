---
title: "loadPartitions() | Java | v1"
slug: /java/v1-Partition-loadPartitions
sidebar_label: "loadPartitions()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会在搜索或查询之前，将分区数据加载到 query node 的内存中。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#UBPYdCwZDoNGybxZsXTc8lobnwd
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# loadPartitions()

MilvusClient 接口。此方法会在搜索或查询之前，将分区数据加载到 query node 的内存中。

```java
R<RpcStatus> loadPartitions(LoadPartitionsParam requestParam);
```

#### LoadPartitionsParam\{#loadpartitionsparam}

使用 `LoadPartitionsParam.Builder` 构造 `LoadPartitionsParam` 对象。

```java
import io.milvus.param.LoadPartitionsParam;
LoadPartitionsParam.Builder builder = LoadPartitionsParam.newBuilder();
```

`LoadPartitionsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName：目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表。分区名称列表不能为空或 null。</p></td>
        <td><p>partitionNames：<br/>要加载的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>按名称添加分区。分区名称不能为空或 null。</p></td>
        <td><p>partitionName：目标分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoad(Boolean syncLoad)</p></td>
        <td><p>为加载操作启用同步模式。启用同步模式后，客户端会持续等待，直到该分区的所有 segment 都成功加载完成。如果禁用同步模式，调用 loadPartitions() 后客户端会立即返回。<br/>默认启用同步模式。</p></td>
        <td><p>syncLoad：设为 True 表示同步模式</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoadWaitingInterval(Long milliseconds)</p></td>
        <td><p>设置同步模式的等待间隔。在同步模式下，客户端会按该间隔持续检查分区加载状态。<br/>间隔值必须大于零，且不能大于 <code>Constant.MAX_WAITING_LOADING_INTERVAL</code>。<br/>默认值为 500 毫秒</p></td>
        <td><p>milliseconds：间隔值（单位：毫秒）</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoadWaitingTimeout(Long seconds)</p></td>
        <td><p>设置同步模式的超时时间。<br/>超时时间必须大于零，且不能大于 <code>Constant.MAX_WAITING_LOADING_TIMEOUT</code>。<br/>默认值为 60 秒。</p></td>
        <td><p>seconds：超时值（单位：秒）</p></td>
    </tr>
    <tr>
        <td><p>withReplicaNumber(Integer replicaNumber)</p></td>
        <td><p>指定要加载的副本数。<br/>默认值为 1。</p></td>
        <td><p>replicaNumber：副本数</p></td>
    </tr>
    <tr>
        <td><p>withRefresh(Boolean refresh)</p></td>
        <td><p>是否在加载前刷新该分区的 segment 列表。首次调用 loadPartitions() 时，此标志必须设置为 FALSE。分区加载完成后，再次调用 loadPartitions() 并设置 refresh=TRUE，服务器会查找尚未加载的新 segment，并尝试将其加载。<br/>该方法主要用于 bulkinsert() 接口。</p></td>
        <td><p>refresh：是否刷新 segment 列表的标志。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 LoadPartitionsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`LoadPartitionsParam.Builder.build()` 可能会抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，将返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，将返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，将返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

LoadPartitionsParam param = LoadPartitionsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .addPartitionName(PARTITION_NAME)
        .build();
R<RpcStatus> response = client.loadPartitions(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
