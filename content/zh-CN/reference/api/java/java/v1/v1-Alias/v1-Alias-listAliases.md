---
title: "listAliases() | Java | v1"
slug: /java/v1-Alias-listAliases
sidebar_label: "listAliases()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法列出集合的别名。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#DRkedF4ZKogAr8xf2fTcbv3rnfe
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listAliases()

MilvusClient 接口。此方法列出集合的别名。

```java
R<ListAliasesResponse> listAliases(ListAliasesParam requestParam);
```

#### ListAliasesParam\{#listaliasesparam}

使用 `ListAliasesParam.Builder` 构建 `ListAliasesParam` 对象。

```java
import io.milvus.param.ListAliasesParam;
ListAliasesParam.Builder builder = ListAliasesParam.newBuilder();
```

`ListAliasesParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p><br/>withCollectionName(String collectionName)</p></td>
        <td><p>设置目标集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName：要列出其别名的目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。使用默认数据库时，数据库名称可以为 null。</p></td>
        <td><p>databaseName：数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 ListAliasesParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ListAliasesParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误代码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回一个包含在 `R` 模板中的有效 `ListAliasesResponse`。你可以使用 `ListAliasesResponse` 获取别名信息。

#### 示例\{#example}

```java
import io.milvus.param.*;

ListAliasesParam param = ListAliasesParam.newBuilder()
        .withCollection(COLLECTION_NAME)
        .build();
R<ListAliasesResponse> response = client.listAliases(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
