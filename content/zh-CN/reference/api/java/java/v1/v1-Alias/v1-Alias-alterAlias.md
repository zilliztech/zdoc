---
title: "alterAlias() | Java | v1"
slug: /java/v1-Alias-alterAlias
sidebar_label: "alterAlias()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将别名从一个 collection 更改到另一个 collection。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#CISLdYUTuon6MUx2OZmcwExGn5g
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterAlias()

MilvusClient 接口。此方法将别名从一个 collection 更改到另一个 collection。

```java
R<RpcStatus> alterAlias(AlterAliasParam requestParam);
```

#### AlterAliasParam\{#alteraliasparam}

使用 `AlterAliasParam.Builder` 构造 `AlterAliasParam` 对象。

```java
import io.milvus.param.AlterAliasParam;
AlterAliasParam.Builder builder = AlterAliasParam.newBuilder();
```

`AlterAliasParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p><br/>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标 collection 名称。Collection 名称不能为空或为 null。</p></td>
        <td><p>collectionName: 要将别名更改到的目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withAlias(String alias)</p></td>
        <td><p>设置要更改的 collection 别名。Collection 别名不能为空或为 null。</p></td>
        <td><p>alias: 要更改的别名。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateAliasParam 对象。</p></td>
        <td></td>
    </tr>
</table>

`AlterAliasParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

AlterAliasParam param = AlterAliasParam.newBuilder()
        .withCollection(COLLECTION_NAME)
        .withAlias("alias1")
        .build();
R<RpcStatus> response = client.alterAlias(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
