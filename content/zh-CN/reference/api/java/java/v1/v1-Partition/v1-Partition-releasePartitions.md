---
title: "releasePartitions() | Java | v1"
slug: /java/v1-Partition-releasePartitions
sidebar_label: "releasePartitions()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法从内存中释放分区数据。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#N6Ygd6hCcoyyStxLn9tcymfZnVe
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# releasePartitions()

MilvusClient 接口。此方法从内存中释放分区数据。

```java
R<RpcStatus> releasePartitions(ReleasePartitionsParam requestParam);
```

#### ReleasePartitionsParam\{#releasepartitionsparam}

使用 `ReleasePartitionsParam.Builder` 构建 `ReleasePartitionsParam` 对象。

```java
import io.milvus.param.ReleasePartitionsParam;
ReleasePartitionsParam.Builder builder = ReleasePartitionsParam.newBuilder();
```

`ReleasePartitionsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表。分区名称列表不能为 null 或为空。</p></td>
        <td><p>partitionNames: 要释放的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>按名称添加分区。分区名称不能为空或 null。</p></td>
        <td><p>partitionName: 目标分区名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 ReleasePartitionsParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ReleasePartitionsParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

ReleasePartitionsParam param = ReleasePartitionsParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .addPartitionName(PARTITION_NAME)
        .build();
R<Boolean> response = client.releasePartitions(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
