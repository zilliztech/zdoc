---
title: "renameCollection() | Java | v1"
slug: /java/v1-Collection-renameCollection
sidebar_label: "renameCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法用于重命名指定的集合。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#C617dmut8o2d4dxQj4dct7gkn5g
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# renameCollection()

一个 MilvusClient 接口。此方法用于重命名指定的集合。

```java
R<RpcStatus> renameCollection(RenameCollectionParam requestParam)
```

#### RenameCollectionParam\{#renamecollectionparam}

使用 `RenameCollectionParam.Builder` 构造 `RenameCollectionParam` 对象。

```java
import io.milvus.param.RenameCollectionParam;
RenameCollectionParam.Builder builder = RenameCollectionParam.newBuilder();
```

`RenameCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withOldCollectionName(String oldCollectionName)</p></td>
        <td><p>设置旧集合名称。旧集合名称不能为空或 null。</p></td>
        <td><p>oldCollectionName: 要重命名的集合的旧名称。</p></td>
    </tr>
    <tr>
        <td><p>withNewCollectionName(String newCollectionName)</p></td>
        <td><p>设置新集合名称。新集合名称不能为空或 null。</p></td>
        <td><p>newCollectionName: 要重命名的集合的新名称。</p></td>
    </tr>
    <tr>
        <td><p>withOldDatabaseName(String databaseName)</p></td>
        <td><p>设置旧集合所在的数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withNewDatabaseName(String databaseName)</p></td>
        <td><p>设置新集合所在的数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 RenameCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`RenameCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

RenameCollectionParam param = RenameCollectionParam.newBuilder()
        .withOldCollectionName(OLD_COLLECTION_NAME)
        .withNewCollectionName(NEW_COLLECTION_NAME)
        .build();
R<Boolean> response = client.renameCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
