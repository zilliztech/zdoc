---
title: "delete() | Java | v1"
slug: /java/v1-Collection-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法根据由布尔表达式过滤的主键删除实体。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#FYKgd3lYvoJIdIxvgTccW30Kngf
sidebar_position: 15
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# delete()

MilvusClient 接口。此方法根据由布尔表达式过滤的主键删除实体。

```java
R<MutationResult> delete(DeleteParam requestParam);
```

#### DeleteParam\{#deleteparam}

使用 `DeleteParam.Builder` 构建 `DeleteParam` 对象。

```java
import io.milvus.param.DeleteParam;
DeleteParam.Builder builder = DeleteParam.newBuilder();
```

`DeleteParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName：要从中删除一个或多个实体的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionName(String partitionName)</p></td>
        <td><p>设置目标分区名称（可选）。</p></td>
        <td><p>partitionName：要从中删除一个或多个实体的分区名称。</p></td>
    </tr>
    <tr>
        <td><p>withExpr(String expr)</p></td>
        <td><p>设置用于筛选待删除实体的表达式。</p></td>
        <td><p>expr：用于筛选的表达式。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 DeleteParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DeleteParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<MutationResult>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `MutationResult`。你可以使用 `MutationResultWrapper` 获取返回的信息。有关 MutationResultWrapper 的更多信息，请参见 `insert()` 中对应的章节。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.MutationResult;

DeleteParam param = DeleteParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withPartitionName(PARTITION_NAME)
        .withExpr("id in [100, 200, 300]")
        .build();
R<MutationResult> response = milvusClient.delete(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
