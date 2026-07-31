---
title: "getIndexBuildingProgress() | Java | v1"
slug: /java/v1-Index-getIndexBuildingProgress
sidebar_label: "getIndexBuildingProgress()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法显示索引构建进度，例如已建立索引的行数。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Nyr0dduGzo2U93xqMqRcBux9nJf
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getIndexBuildProgress()

MilvusClient 接口。此方法显示索引构建进度，例如已建立索引的行数。

```java
R<GetIndexBuildProgressResponse> getIndexBuildProgress(GetIndexBuildProgressParam requestParam);
```

#### GetIndexBuildProgressParam\{#getindexbuildprogressparam}

使用 `GetIndexBuildProgressParam.Builder` 构造 `GetIndexBuildProgressParam` 对象。

```java
import io.milvus.param.GetIndexBuildProgressParam;
GetIndexBuildProgressParam.Builder builder = GetIndexBuildProgressParam.newBuilder();
```

`GetIndexBuildProgressParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或为 null。</p></td>
        <td><p>collectionName: 目标集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withIndexName(String indexName)</p></td>
        <td><p>设置目标索引名称。如果未指定索引名称，则默认索引名称为空字符串，这表示由服务器决定。</p></td>
        <td><p>indexName: 索引名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetIndexBuildProgressParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetIndexBuildProgressParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时出错。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<GetIndexBuildProgressResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回一个由 `R` 模板持有的有效 `GetIndexBuildProgressResponse`。

#### 示例\{#example}

```java
import io.milvus.param.*;
import io.milvus.grpc.GetIndexBuildProgressResponse;

GetIndexBuildProgressParam param = GetIndexBuildProgressParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withIndexName("index1")
        .build();
R<GetIndexBuildProgressResponse> response = client.getIndexBuildProgress(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}

long indexedRows = response.getData().getIndexedRows();
long totalRows = response.getData().getTotalRows();
System.out.println("indexed rows: "  + indexedRows + ", total rows: " + totalRows);
```
