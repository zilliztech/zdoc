---
title: "loadCollection() | Java | v1"
slug: /java/v1-Collection-loadCollection
sidebar_label: "loadCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将指定 collection 及其中的所有数据加载到内存中，以便进行搜索或查询。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#VaWKdMVPjoIqa0xssy5chMh8nte
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# loadCollection()

MilvusClient 接口。此方法将指定 collection 及其中的所有数据加载到内存中，以便进行搜索或查询。

```java
R<RpcStatus> loadCollection(LoadCollectionParam requestParam);
```

#### LoadCollectionParam\{#loadcollectionparam}

使用 `LoadCollectionParam.Builder` 构造 `LoadCollectionParam` 对象。

```java
import io.milvus.param.LoadCollectionParam;
LoadCollectionParam.Builder builder = LoadCollectionParam.newBuilder();
```

`LoadCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置 collection 名称。collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 要加载的 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoad(Boolean syncLoad)</p></td>
        <td><p>在加载 collection 时启用同步模式。启用同步模式后，客户端会持续等待，直到该 collection 的所有 segment 都成功加载完成。如果禁用同步模式，调用 <code>loadCollection()</code> 后客户端会立即返回。<br/>默认启用同步模式。</p></td>
        <td><p>syncLoad: 用于指示是否启用同步模式的布尔值。如果该值设置为 <code>True</code>，表示启用同步模式。</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoadWaitingInterval(Long milliseconds)</p></td>
        <td><p>设置同步模式的等待间隔。在同步模式下，客户端会按间隔检查 collection 的加载状态。该值必须大于零，且不能大于 Constant.MAX_WAITING_LOADING_INTERVAL。默认值为 500 毫秒。</p></td>
        <td><p>milliseconds: 以毫秒为单位的时间间隔，用于检查数据加载状态。</p></td>
    </tr>
    <tr>
        <td><p>withSyncLoadWaitingTimeout(Long seconds)</p></td>
        <td><p>设置同步模式的超时时间。该值必须大于零，且不能大于 Constant.MAX_WAITING_LOADING_TIMEOUT。默认值为 60 秒。</p></td>
        <td><p>seconds: 等待直到超时的时长，单位为秒。</p></td>
    </tr>
    <tr>
        <td><p>withReplicaNumber(Integer replicaNumber)</p></td>
        <td><p>指定要加载的副本数。默认值为 1。</p></td>
        <td><p>replicaNumber: 加载 collection 时要加载的副本数。</p></td>
    </tr>
    <tr>
        <td><p>withRefresh(Boolean refresh)</p></td>
        <td><p>是否在加载前刷新此 collection 的 segment 列表。首次调用 loadCollection() 时，此标志必须设置为 FALSE。collection 加载完成后，再次调用 loadCollection() 并设置 refresh=TRUE，服务器将查找尚未加载的新 segment，并尝试将其加载。<br/>此方法主要用于 bulkinsert() 接口。</p></td>
        <td><p>refresh: 是否刷新 segment 列表的标志。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 LoadCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`LoadCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，将返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，将返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 调用成功，将返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

LoadCollectionParam param = LoadCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withReplicaNumber(2)
        .withSyncLoad(Boolean.TRUE)
        .withSyncLoadWaitingInterval(500L)
        .withSyncLoadWaitingTimeout(30L)
        .build();
R<RpcStatus> response = client.loadCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
