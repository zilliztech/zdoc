---
title: "dropPartition() | Java | v1"
slug: /java/v1-Partition-dropPartition
sidebar_label: "dropPartition()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法用于删除分区。请注意，此方法会删除该分区中的所有数据，且默认分区不能被删除。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#JAvtdqfVFonHDqxKvTrcYUqtnQc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPartition()

MilvusClient 接口。此方法用于删除分区。请注意，此方法会删除该分区中的所有数据，且默认分区不能被删除。

```java
R<RpcStatus> dropPartition(DropPartitionParam requestParam);
```

#### DropPartitionParam\{#droppartitionparam}

使用 `DropPartitionParam.Builder` 构建 `DropPartitionParam` 对象。

```java
import io.milvus.param.DropPartitionParam;
DropPartitionParam.Builder builder = DropPartitionParam.newBuilder();
```

`DropPartitionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName：目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置 database 名称。对于默认 database，database 名称可以为 null。</p></td>
        <td><p>databaseName：database 名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置分区名称。分区名称不能为空或 null。</p></td>
        <td><p>partitionName：目标分区名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 DropPartitionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DropPartitionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

DropPartitionParam param = DropPartitionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPartitionName(PARTITION_NAME)
        .build();
R<RpcStatus> response = client.dropPartition(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
