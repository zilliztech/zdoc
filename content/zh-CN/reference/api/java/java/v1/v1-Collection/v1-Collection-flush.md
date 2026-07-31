---
title: "flush() | Java | v1"
slug: /java/v1-Collection-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法会触发一次 flush 操作，将指定 collection 中所有 growing segment 标记为 sealed，然后将其刷新到存储。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#FY0mdKe4noioOGxPlCxcuIZKnve
sidebar_position: 10
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# flush()

一个 MilvusClient 接口。此方法会触发一次 flush 操作，将指定 collection 中所有 growing segment 标记为 sealed，然后将其刷新到存储。 

<Admonition type="info" icon="📘" title="说明">

<p>通常，此方法会在所有数据摄取完成后调用。建议不要频繁调用此方法，因为这可能会生成大量微小 segment，并导致不稳定问题。</p>

</Admonition>

```java
R<FlushResponse> flush(FlushParam requestParam);
```

#### FlushParam\{#flushparam}

使用 `FlushParam.Builder` 构造 `FlushParam` 对象。

```java
import io.milvus.param.FlushParam;
FlushParam.Builder builder = FlushParam.newBuilder();
```

`FlushParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionNames(List\<String> collectionNames)</p></td>
        <td><p>设置要执行 flush 的 collection 列表。</p></td>
        <td><p>collectionNames：要执行 flush 的 collection 名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addCollectionName(String collectionName)</p></td>
        <td><p>添加一个要执行 flush 的 collection。</p></td>
        <td><p>collectionName：要执行 flush 的 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withSyncFlush(Boolean syncFlush)</p></td>
        <td><p>将 flush 功能设置为同步模式。启用同步模式后，客户端会持续等待，直到 collection 的所有 segment 都成功完成 flush。如果禁用同步模式，客户端会在调用 flush() 后立即返回结果。</p></td>
        <td><p>syncFlush：用于指示是否启用同步模式的 Boolean 值。如果该值设置为 True，则启用同步模式。</p></td>
    </tr>
    <tr>
        <td><p>withSyncFlushWaitingInterval(Long milliseconds)</p></td>
        <td><p>设置同步模式下的等待间隔。启用同步模式后，客户端会按间隔检查 segment 状态。该值必须大于零，且不能大于 Constant.MAX_WAITING_FLUSHING_INTERVAL。默认值为 500 毫秒。</p></td>
        <td><p>milliseconds：检查 flush 状态的时间间隔（毫秒）。</p></td>
    </tr>
    <tr>
        <td><p><br/>withSyncFlushWaitingTimeout(Long seconds)</p></td>
        <td><p>设置同步模式的超时时间。该值必须大于零，且不能大于 Constant.MAX_WAITING_FLUSHING_TIMEOUT。默认值为 60 秒。</p></td>
        <td><p>seconds：等待直到超时的时长，单位为秒。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 FlushParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`FlushParam.Builder.build()` 可能会抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<FlushResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `FlushResponse`。`FlushResponse` 包含一个 collection 名称到对应已 flush 的 segment 列表的映射。该映射在内部供其他 SDK 方法使用，例如 `createIndex()`。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.FlushResponse;

FlushParam param = FlushParam.newBuilder()
        .addCollectionName(COLLECTION_NAME)
        .build();
R<FlushResponse> response = client.flush(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
