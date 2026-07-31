---
title: "releaseCollection() | Java | v1"
slug: /java/v1-Collection-releaseCollection
sidebar_label: "releaseCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会将指定集合及其中的所有数据从内存中释放。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#QwQ6dmpUcorF5vxyHipcR3uqnoh
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# releaseCollection()

MilvusClient 接口。此方法会将指定集合及其中的所有数据从内存中释放。

```java
R<RpcStatus> releaseCollection(ReleaseCollectionParam requestParam);
```

#### ReleaseCollectionParam\{#releasecollectionparam}

使用 `ReleaseCollectionParam.Builder` 构造 `ReleaseCollectionParam` 对象。

```java
import io.milvus.param.ReleaseCollectionParam;
ReleaseCollectionParam.Builder builder = ReleaseCollectionParam.newBuilder();
```

`ReleaseCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要释放的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ReleaseCollectionParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ReleaseCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

ReleaseCollectionParam param = ReleaseCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();
R<Boolean> response = client.releaseCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
