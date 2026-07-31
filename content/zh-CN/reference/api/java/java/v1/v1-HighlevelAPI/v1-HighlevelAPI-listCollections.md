---
title: "listCollections() | Java | v1"
slug: /java/v1-HighlevelAPI-listCollections
sidebar_label: "listCollections()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法列出所有集合。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#GYyPdMqeZoN3WYxf3OjcbyTsnVb
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listCollections()

MilvusClient 接口。此方法列出所有集合。

```java
R<ListCollectionsResponse> listCollections(ListCollectionsParam requestParam);
```

#### ListCollectionsParam\{#listcollectionsparam}

使用 `ListCollectionsParam.Builder` 构造 `ListCollectionsParam` 对象。

```java
import io.milvus.param.highlevel.collection.ListCollectionsParam;
ListCollectionsParam.Builder builder = ListCollectionsParam.newBuilder();
```

`ListCollectionsParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ListCollectionsParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ListCollectionsParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<ListCollectionsResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `ListCollectionsResponse`。

#### 示例\{#example}

```java
import io.milvus.param.highlevel.collection.*;

ListCollectionsParam param = ListCollectionsParam.newBuilder()
        .build();

R<ListCollectionsResponse> response = client.listCollections(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
for (String collectionName : response.getData().collectionNames) {
    System.out.println(collectionName);
}
```

