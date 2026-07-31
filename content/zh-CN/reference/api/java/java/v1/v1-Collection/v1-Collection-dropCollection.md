---
title: "dropCollection() | Java | v1"
slug: /java/v1-Collection-dropCollection
sidebar_label: "dropCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法删除指定的 collection。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#E8vMdekAdobZ1Ex75CAcnhh9nwh
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollection()

MilvusClient 接口。此方法删除指定的 collection。 

<Admonition type="info" icon="📘" title="此方法会删除 collection 中的所有数据。">

</Admonition>

```java
R<RpcStatus> dropCollection(DropCollectionParam requestParam);
```

#### DropCollectionParam\{#dropcollectionparam}

使用 `DropCollectionParam.Builder` 构造 `DropCollectionParam` 对象。

```java
import io.milvus.param.DropCollectionParam;
DropCollectionParam.Builder builder = DropCollectionParam.newBuilder();
```

`DropCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置 collection 名称。collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 要删除的 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 DropCollectionParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DropCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

DropCollectionParam dropParam = DropCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();

R<RpcStatus> response = client.dropCollection(dropParam);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
