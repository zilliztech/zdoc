---
title: "session() | Java | v2"
slug: /java/java/v2-Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.2
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为全局集群部署创建一个绑定到特定集群 ID 的会话。当您需要将 DML 或 DQL 操作路由到选定集群而不是当前主集群时，请使用此会话。 | Java | v2"
type: docx
token: Ay5BdddEboorRGxq3XacHXYHnwf
sidebar_position: 8
keywords: 
  - LLM 作为评判者
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - zilliz
  - zilliz cloud
  - 云
  - session()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# session()

此操作会为全局集群部署创建一个绑定到特定集群 ID 的会话。当您需要将 DML 或 DQL 操作路由到选定集群而不是当前主集群时，请使用此会话。

```java
public MilvusClientV2Session session(String clusterId)
```

## 请求语法\{#request-syntax}

```java
MilvusClientV2Session session = client.session(String clusterId);
```

**参数：**

- `clusterId` （*String*） -

    **[必需]**

要将会话绑定到的集群 ID。该值不能为 null 或为空。通过返回的会话调用的操作会路由到此集群。

**返回类型：**

*MilvusClientV2Session*

**返回：**

返回的会话提供集群作用域的向量操作变体，例如 `search()`、`hybridSearch()`、`query()`、`get()`、`queryIterator()`、`searchIterator()` 及其支持的异步形式。当不再需要使用该会话时，请调用 `close()`。

**MilvusClientV2Session** 对象包含以下字段：

**参数：**

- **clusterId** （*String*） -

    会话所绑定集群的 ID。使用 `getClusterId()` 读取该值。通过该会话调用的操作会路由到此集群。

**异常：**

- **MilvusClientException**<br/>
  如果 `clusterId` 为 null 或为空，将引发此异常。

- **MilvusClientException**<br/>
  当任何会话操作失败时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.MilvusClientV2Session;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2Session session = client.session("cluster-a");
try {
    QueryResp resp = session.query(QueryReq.builder()
        .collectionName("book_catalog")
        .filter("category == \"database\"")
        .outputFields(Arrays.asList("id", "title"))
        .limit(10)
        .build());
    System.out.println(resp.getQueryResults().size());
} finally {
    session.close();
}
```
