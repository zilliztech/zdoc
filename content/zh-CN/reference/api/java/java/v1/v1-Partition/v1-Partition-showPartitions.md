---
title: "showPartitions() | Java | v1"
slug: /java/v1-Partition-showPartitions
sidebar_label: "showPartitions()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示指定 collection 中的所有 partition。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#IdiRd3KOxoQR7Jxs9P4clGjdnOh
sidebar_position: 7
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# showPartitions()

MilvusClient 接口。此方法显示指定 collection 中的所有 partition。

```java
R<ShowPartitionsResponse> showPartitions(ShowPartitionsParam requestParam);
```

#### ShowPartitionsParam\{#showpartitionsparam}

使用 `ShowPartitionsParam.Builder` 构建 `ShowPartitionsParam` 对象。

```java
import io.milvus.param.ShowPartitionsParam;
ShowPartitionsParam.Builder builder = ShowPartitionsParam.newBuilder();
```

`ShowPartitionsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。database name 可以为 null，表示默认数据库。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置 partition 名称列表。Partition 名称列表不能为 null 或为空。</p></td>
        <td><p>partitionNames: 要显示的 partition 名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>按名称添加一个 partition。Partition 名称不能为空或 null。</p></td>
        <td><p>partitionName: 目标 partition 名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 ShowPartitionsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ShowPartitionsParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<ShowPartitionsResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及对应异常的错误消息。

- 如果 API 调用成功，则返回由 `R` 模板持有的有效 `ShowPartitionsResponse`。你可以使用 ShowPartResponseWrapper 更方便地获取相关信息。

#### ShowPartResponseWrapper\{#showpartresponsewrapper}

用于封装 `ShowPartitionsResponse` 的工具类。

```java
import io.milvus.response.ShowPartResponseWrapper;
ShowPartResponseWrapper wrapper = new ShowPartResponseWrapper(showPartitionsResponse);
```

`ShowPartitionsResponse` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getPartitionsInfo()</p></td>
     <td><p>返回 PartitionInfo 列表。</p></td>
     <td><p>N/A</p></td>
     <td><p>List\<PartitionInfo></p></td>
   </tr>
   <tr>
     <td><p>getPartitionInfoByName(String partitionName)</p></td>
     <td><p>根据 partition 名称返回一个 PartitionInfo 对象。</p></td>
     <td><p>partitionName: 目标 partition 名称。</p></td>
     <td><p>PartitionInfo</p></td>
   </tr>
</table>

#### PartitionInfo\{#partitioninfo}

用于保存 partition 信息的工具类。

`ShowPartitionsResponse.PartitionInfo` 的方法

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getIndexType()</p></td>
     <td><p>获取索引类型。</p></td>
     <td><p>IndexType</p></td>
   </tr>
   <tr>
     <td><p>getMetricType()</p></td>
     <td><p>获取度量类型。</p></td>
     <td><p>MetricType</p></td>
   </tr>
   <tr>
     <td><p>getExtraParam()</p></td>
     <td><p>获取 JSON 格式的索引参数。</p></td>
     <td><p>String</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.ShowPartitionsResponse;
import io.milvus.response.ShowPartResponseWrapper;

ShowPartitionsParam param = ShowPartitionsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .addPartitionName(PARTITION_NAME)
        .build();
R<ShowPartitionsResponse> response = client.showPartitions(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

ShowPartResponseWrapper wrapper = new ShowPartResponseWrapper(response.getData());
ShowPartResponseWrapper.PartitionInfo info = wrapper.getPartitionInfoByName("_default");
System.out.println("Partition name: " + info.getName() + ", ID: " + info.getId() + ", in-memory: " + info.getInMemoryPercentage() + "%");
```
