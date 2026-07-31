---
title: "hasPartition() | Java | v1"
slug: /java/v1-Partition-hasPartition
sidebar_label: "hasPartition()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法检查指定集合中是否存在分区。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#ZYUAdCGKhotNhHxxcNTcgbCTnI3
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hasPartition()

MilvusClient 接口。此方法检查指定集合中是否存在分区。

```java
R<Boolean> hasPartition(HasPartitionParam requestParam);
```

#### HasPartitionParam\{#haspartitionparam}

使用 `HasPartitionParam.Builder` 构建 `HasPartitionParam` 对象。

```java
import io.milvus.param.HasPartitionParam;
HasPartitionParam.Builder builder = HasPartitionParam.newBuilder();
```

`HasPartitionParam.Builder` 的方法：

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
        <td><p>build()</p></td>
        <td><p>构建一个 HasPartitionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`HasPartitionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<Boolean>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误代码和消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

HasPartitionParam param = HasPartitionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPartitionName(PARTITION_NAME)
        .build();
R<Boolean> response = client.hasPartition(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

System.out.println("Partition existence: " + response.getData());
```
