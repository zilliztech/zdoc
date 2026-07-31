---
title: "getLoadingProgress() | Java | v1"
slug: /java/v1-Collection-getLoadingProgress
sidebar_label: "getLoadingProgress()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法用于获取集合的加载进度。| Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#FEPPdW1rEohYZLxEEo0cm3WOnoh
sidebar_position: 19
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getLoadingProgress()

MilvusClient 接口。此方法用于获取集合的加载进度。

```java
R<GetLoadingProgressResponse> getLoadingProgress(GetLoadingProgressParam requestParam);
```

#### GetLoadingProgressParam\{#getloadingprogressparam}

使用 `GetLoadingProgressParam.Builder` 构造 `GetLoadingProgressParam` 对象。

```java
import io.milvus.param.GetLoadingProgressParam;
GetLoadingProgressParam.Builder builder = GetLoadingProgressParam.newBuilder();
```

`GetLoadingProgressParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要加载的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表以指定查询范围（可选）。</p></td>
        <td><p>partitionNames: <br/>要加载的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>添加一个分区名称以指定查询范围（可选）。</p></td>
        <td><p>partitionName: 分区名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetLoadingProgressParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetLoadingProgressParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<GetLoadingProgressResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误信息。

- 如果 API 调用成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

GetLoadingProgressParam param = GetLoadingProgressParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();
R<GetLoadingProgressResponse> response = client.getLoadingProgress(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
System.out.println(response.getProgress());
```

