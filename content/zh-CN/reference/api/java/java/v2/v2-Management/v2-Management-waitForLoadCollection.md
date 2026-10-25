---
title: "waitForLoadCollection() | Java | v2"
slug: /java/java/v2-Management-waitForLoadCollection
sidebar_label: "waitForLoadCollection()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "此操作会暂停进程，直到 Collection 加载完成。您可以使用此方法每隔 0.5 秒检查一次 Collection 的加载状态，直到加载过程完成。 | Java | v2"
type: docx
token: LMsOdAVFQopadPx1N2UcOn0unCf
sidebar_position: 18
keywords: 
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - waitForLoadCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# waitForLoadCollection()

此操作会暂停进程，直到 Collection 加载完成。您可以使用此方法每隔 0.5 秒检查一次 Collection 的加载状态，直到加载过程完成。

```java
private void WaitForLoadCollection(String collectionName, long timeoutMs)
```

## 请求语法\{#request-syntax}

```java
waitForCollectionRelease(String collectionName, long timeoutMs)
```

**参数：**

- **collectionName** (*String*) -

    目标 Collection 的名称。

- **timeoutMs** (*long*) -

    此操作的超时时间，单位为毫秒。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
// load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);

// Wait for 10 seconds
client.waitForLoadCollection("test", 10000)
```
