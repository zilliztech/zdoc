---
title: "getServerVersion() | Java | v2"
slug: /java/java/v2-Management-getServerVersion
sidebar_label: "getServerVersion()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回已连接服务器的版本字符串。| Java | v2"
type: docx
token: FuDHdadxHoX9qSxe4aac4wzNnRh
sidebar_position: 26
keywords: 
  - hnsw 算法
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - zilliz
  - Zilliz Cloud
  - 云
  - getServerVersion()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getServerVersion()

此操作返回已连接服务器的版本字符串。

```java
public String getServerVersion()
```

**返回：**

*String*

服务器的版本字符串（例如 `"2.6.13"`）。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
String version = client.getServerVersion();
System.out.println(version); // "2.6.13"
```
