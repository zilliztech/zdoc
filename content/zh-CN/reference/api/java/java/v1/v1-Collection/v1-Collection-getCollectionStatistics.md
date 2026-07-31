---
title: "getCollectionStatistics() | Java | v1"
slug: /java/v1-Collection-getCollectionStatistics
sidebar_label: "getCollectionStatistics()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法显示指定 collection 的统计信息。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#OJl3dURMVoXJ20xPVa7c3HAunhf
sidebar_position: 8
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getCollectionStatistics()

一个 MilvusClient 接口。此方法显示指定 collection 的统计信息。

<Admonition type="info" icon="📘" title="当前版本仅返回 collection 的行数。此方法未来可能会被弃用。">

</Admonition>

```java
R<GetCollectionStatisticsResponse> getCollectionStatistics(GetCollectionStatisticsParam requestParam);
```

#### GetCollectionStatisticsParam\{#getcollectionstatisticsparam}

使用 `GetCollectionStatisticsParam.Builder` 构造 `GetCollectionStatisticsParam` 对象。

```java
import io.milvus.param.GetCollectionStatisticsParam;
GetCollectionStatisticsParam.Builder builder = GetCollectionStatisticsParam.newBuilder();
```

`GetCollectionStatisticsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置 collection 名称。collection 名称不能为空或 null。</p></td>
        <td><p>collectionName：需要查看其统计信息的 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withFlush(Boolean flush)</p></td>
        <td><p>在获取 collection 统计信息之前请求执行 flush 操作。默认值为 False。</p></td>
        <td><p>flush：将该值设置为 true 以执行 flush 操作。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetCollectionStatisticsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetCollectionStatisticsParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<GetCollectionStatisticsResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 调用成功，则返回由 `R` 模板持有的有效 `GetCollectionStatisticsResponse`。您可以使用 `GetCollStatResponseWrapper` 获取相关信息。

#### GetCollStatResponseWrapper\{#getcollstatresponsewrapper}

一个用于封装 `GetCollectionStatisticsResponse` 的工具类。

```java
import io.milvus.response.GetCollStatResponseWrapper;
GetCollStatResponseWrapper wrapper = new GetCollStatResponseWrapper(getStatResponse);
```

`GetCollStatResponseWrapper` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>getRowCount()</p></td>
     <td><p>获取 collection 的行数。请注意，出于技术原因，已删除的实体不会计入行数。</p></td>
     <td><p>N/A</p></td>
     <td><p>long</p></td>
   </tr>
</table>

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.response.GetCollStatResponseWrapper;
import io.milvus.grpc.GetCollectionStatisticsResponse;

GetCollectionStatisticsParam param = GetCollectionStatisticsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();
R<GetCollectionStatisticsResponse> response = client.getCollectionStatistics(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

GetCollStatResponseWrapper wrapper = new GetCollStatResponseWrapper(response.getData());
System.out.println("Row count: " + wrapper.getRowCount());
```
