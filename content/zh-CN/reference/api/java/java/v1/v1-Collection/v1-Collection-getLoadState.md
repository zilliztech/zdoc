---
title: "getLoadState() | Java | v1"
slug: /java/v1-Collection-getLoadState
sidebar_label: "getLoadState()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法获取集合加载进度的状态。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#ONQ1diBeRoffA1xnWVMc9WiInDb
sidebar_position: 20
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getLoadState()

一个 MilvusClient 接口。此方法获取集合加载进度的状态。

```java
R<GetLoadStateResponse> getLoadState(GetLoadStateParam requestParam);
```

#### GetLoadStateParam\{#getloadstateparam}

使用 `GetLoadStateParam.Builder` 构造 GetLoadStateParam 对象。

```java
import io.milvus.param.GetLoadStateParam;
GetLoadStateParam.Builder builder = GetLoadStateParam.newBuilder();
```

`GetLoadStateParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要获取状态的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，数据库名称可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withPartitionNames(List\<String> partitionNames)</p></td>
        <td><p>设置分区名称列表以指定查询范围（可选）。</p></td>
        <td><p>partitionNames: <br/>用于获取状态的分区名称列表。</p></td>
    </tr>
    <tr>
        <td><p>addPartitionName(String partitionName)</p></td>
        <td><p>按名称添加分区。分区名称不能为空或 null。</p></td>
        <td><p>partitionName: 分区名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 GetLoadStateParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`GetLoadStateParam.Builder.build()` 可能抛出以下异常：

- ParamException：如果参数无效则报错。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<GetLoadStateResponse>` 对象。

- 如果 API 在服务端失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

GetLoadStateParam param = GetLoadStateParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();
R<GetLoadStateResponse> response = client.getLoadState(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
System.out.println(response.getState());
```

