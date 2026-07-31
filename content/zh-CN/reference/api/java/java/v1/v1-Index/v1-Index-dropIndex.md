---
title: "dropIndex() | Java | v1"
slug: /java/v1-Index-dropIndex
sidebar_label: "dropIndex()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会删除指定 collection 中某个字段的索引。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#M6F4dplPOoPLzcxfMQhcXyIsnQh
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropIndex()

MilvusClient 接口。此方法会删除指定 collection 中某个字段的索引。

```java
R<RpcStatus> dropIndex(DropIndexParam requestParam);
```

#### DropIndexParam\{#dropindexparam}

使用 `DropIndexParam.Builder` 构造 `DropIndexParam` 对象。

```java
import io.milvus.param.DropIndexParam;
DropIndexParam.Builder builder = DropIndexParam.newBuilder();
```

`DropIndexParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置 collection 名称。Collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>将要删除的索引名称。如果未指定索引名称，则默认索引名称为空字符串，这意味着由服务器决定。</p></td>
        <td><p>indexName: 索引名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateAliasParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DropIndexParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时报错。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

DropIndexParam param = DropIndexParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withIndexName("index1")
        .build();
R<RpcStatus> response = client.dropIndex(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
