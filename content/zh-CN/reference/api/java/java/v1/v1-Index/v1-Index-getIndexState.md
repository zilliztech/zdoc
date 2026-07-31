---
title: "getIndexState() | Java | v1"
slug: /java/v1-Index-getIndexState
sidebar_label: "getIndexState()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示索引构建状态以及失败原因（如果有）。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#RtDpdfeTiog4anxHq5Xcdbzengg
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getIndexState()

MilvusClient 接口。此方法显示索引构建状态以及失败原因（如果有）。

```java
R<GetIndexStateResponse> getIndexState(GetIndexStateParam requestParam);
```

#### GetIndexStateParam\{#getindexstateparam}

使用 `GetIndexStateParam.Builder` 构造 `GetIndexStateParam` 对象。

```java
import io.milvus.param.GetIndexStateParam;
GetIndexStateParam.Builder builder = GetIndexStateParam.newBuilder();
```

`GetIndexStateParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置 collection 名称。collection 名称不能为空或 null。</p></td>
        <td><p>collectionName: 目标 collection 名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>设置目标索引名称。如果未指定索引名称，则默认索引名称为空字符串，这表示由服务器来决定。</p></td>
        <td><p>indexName: 索引名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetIndexStateParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetIndexStateParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<GetIndexStateResponse>` 对象。

- 如果 API 在服务器端执行失败，则返回服务器返回的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和异常的错误消息。

- 如果 API 执行成功，则返回一个由 R 模板持有的有效 `GetIndexStateResponse`。

#### Example\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.GetIndexStateResponse;

GetIndexStateParam param = GetIndexStateParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withIndexName("index1")
        .build();
R<GetIndexStateResponse> response = client.getIndexState(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

if (response.getData().getState() == IndexState.Failed) {
    System.out.println(response.getData().getFailReason());
}
```
