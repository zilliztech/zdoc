---
title: "createPartition() | Java | v1"
slug: /java/v1-Partition-createPartition
sidebar_label: "createPartition()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法在指定的 collection 中创建一个 partition。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Y5IOdcsfcoF5fnxaK8ZcnHlznpg
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPartition()

MilvusClient 接口。此方法在指定的 collection 中创建一个 partition。

```java
R<RpcStatus> createPartition(CreatePartitionParam requestParam);
```

#### CreatePartitionParam\{#createpartitionparam}

使用 `CreatePartitionParam.Builder` 构建 `CreatePartitionParam` 对象。

```java
import io.milvus.param.CreatePartitionParam;
CreatePartitionParam.Builder builder = CreatePartitionParam.newBuilder();
```

`CreatePartitionParam.Builder` 的方法：

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
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置 partition 名称。Partition 名称不能为空或 null。</p></td>
        <td><p>partitionName: partition 名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 CreatePartitionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreatePartitionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时报错。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和对应异常的错误信息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

CreatePartitionParam param = CreatePartitionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPartitionName(PARTITION_NAME)
        .build();
R<RpcStatus> response = client.createPartition(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
