---
title: "getPartitionStatistics() | Java | v1"
slug: /java/v1-Partition-getPartitionStatistics
sidebar_label: "getPartitionStatistics()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示分区的统计信息。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#AfAjdyxETo9c4QxPIcJcOnbpnyf
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getPartitionStatistics()

MilvusClient 接口。此方法显示分区的统计信息。

```java
R<GetPartitionStatisticsResponse> getPartitionStatistics(GetPartitionStatisticsParam requestParam);
```

#### GetPartitionStatisticsParam\{#getpartitionstatisticsparam}

使用 `GetPartitionStatisticsParam.Builder` 构造 `GetPartitionStatisticsParam` 对象。

```java
import io.milvus.param.GetPartitionStatisticsParam;
GetPartitionStatisticsParam.Builder builder = GetPartitionStatisticsParam.newBuilder();
```

`GetPartitionStatisticsParam.Builder` 的方法：

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
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置分区名称。分区名称不能为空或 null。</p></td>
        <td><p>partitionName：目标分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withFlush(Boolean flush)</p></td>
        <td><p>在获取分区统计信息之前要求执行 flush 操作。默认值为 True。</p></td>
        <td><p>flush：设置为 True 以请求执行 flush 操作。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetPartitionStatisticsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetPartitionStatisticsParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<GetPartitionStatisticsResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `GetPartitionStatisticsResponse`。你可以使用 `GetPartStatResponseWrapper` 更方便地获取统计信息。

#### GetPartStatResponseWrapper\{#getpartstatresponsewrapper}

一个用于封装 `GetPartitionStatisticsResponse` 的工具类。 

```java
import io.milvus.response.GetPartStatResponseWrapper;
GetPartStatResponseWrapper wrapper = new GetPartStatResponseWrapper(partStatResponse);
```

`GetPartStatResponseWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getRowCount()</p></td>
     <td><p>获取分区的行数。</p><p>如果行数字符串不合法，则抛出 NumberFormatException。</p></td>
     <td><p>long</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.GetPartitionStatisticsResponse;
import io.milvus.response.GetPartStatResponseWrapper;

GetPartitionStatisticsParam param = GetPartitionStatisticsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPartitionName(PARTITION_NAME)
        .build();
R<GetPartitionStatisticsResponse> response = client.getPartitionStatistics(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

GetPartStatResponseWrapper wrapper = new GetPartStatResponseWrapper(response.getData());
System.out.println("Partition row count: " + wrapper.getRowCount());
```
