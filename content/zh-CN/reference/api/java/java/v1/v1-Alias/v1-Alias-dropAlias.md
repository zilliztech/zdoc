---
title: "dropAlias() | Java | v1"
slug: /java/v1-Alias-dropAlias
sidebar_label: "dropAlias()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会删除指定 collection 的别名。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#JDjWdxsRvolNjfxfpAacty3Hn4O
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropAlias()

MilvusClient 接口。此方法会删除指定 collection 的别名。

```java
R<RpcStatus> dropAlias(DropAliasParam requestParam);
```

#### DropAliasParam\{#dropaliasparam}

使用 `DropAliasParam.Builder` 构造 `DropAliasParam` 对象。

```java
import io.milvus.param.DropAliasParam;
DropAliasParam.Builder builder = DropAliasParam.newBuilder();
```

`DropAliasParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withAlias(String alias)</p></td>
        <td><p>设置 collection 别名。<br/>别名不能为空或 null。</p></td>
        <td><p>alias：要删除的别名。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateAliasParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DropAliasParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

DropAliasParam param = DropAliasParam.newBuilder()
        .withAlias("alias1")
        .build();
R<RpcStatus> response = client.dropAlias(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
