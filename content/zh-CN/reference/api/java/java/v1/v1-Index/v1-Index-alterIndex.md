---
title: "alterIndex() | Java | v1"
slug: /java/v1-Index-alterIndex
sidebar_label: "alterIndex()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法使用键值属性修改索引。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#WHZldozs3oOL22x4UtWczEAPnbh
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterIndex()

MilvusClient 接口。此方法使用键值属性修改索引。

```java
R<RpcStatus> alterIndex(AlterIndexParam requestParam);
```

#### AlterIndexParam\{#alterindexparam}

使用 `AlterIndexParam.Builder` 构造 `AlterIndexParam` 对象。

```java
import io.milvus.param.AlterIndexParam;
AlterIndexParam.Builder builder = AlterIndexParam.newBuilder();
```

`AlterIndexParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>设置目标索引名称。如果未指定索引名称，默认索引名称为空字符串，这表示由服务器决定索引名称。</p></td>
        <td><p>indexName: 索引名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 AlterIndexParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`AlterIndexParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 调用成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

AlterIndexParam param = AlterIndexParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withIndexName("index1")
        .withMMapEnabled(true)
        .build();
R<RpcStatus> response = client.alterIndex(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
