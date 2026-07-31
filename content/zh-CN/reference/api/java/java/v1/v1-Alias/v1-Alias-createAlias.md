---
title: "createAlias() | Java | v1"
slug: /java/v1-Alias-createAlias
sidebar_label: "createAlias()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法为集合创建别名。别名不能重复。同一个别名不能分配给不同的集合。不过，你可以为每个集合指定多个别名。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#MdbJddBe1osFqRxlhL0cLvtxnVh
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createAlias()

一个 MilvusClient 接口。此方法为集合创建别名。别名不能重复。同一个别名不能分配给不同的集合。不过，你可以为每个集合指定多个别名。

```java
R<RpcStatus> createAlias(CreateAliasParam requestParam);
```

#### CreateAliasParam\{#createaliasparam}

使用 `CreateAliasParam.Builder` 构造 `CreateAliasParam` 对象。

```java
import io.milvus.param.CreateAliasParam;
CreateAliasParam.Builder builder = CreateAliasParam.newBuilder();
```

`CreateAliasParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(<br/>String collectionName)</p></td>
        <td><p>设置目标集合名称。<br/>集合名称不能为空或 null。</p></td>
        <td><p>collectionName：要为其创建别名的目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withAlias(String alias)</p></td>
        <td><p>设置集合别名。<br/>集合别名不能为空或 null。</p></td>
        <td><p>alias：目标集合的别名。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateAliasParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreateAliasParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务器端执行失败，则返回服务器的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

CreateAliasParam param = CreateAliasParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withAlias("alias1")
        .build();
R<RpcStatus> response = client.createAlias(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
