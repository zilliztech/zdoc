---
title: "close() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-close
sidebar_label: "close()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会关闭当前的 LocalBulkWriter 实例。 | Java | v2"
type: docx
token: ByKadzyxVodrkxxhaGuc4HtFnWh
sidebar_position: 2
keywords: 
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量数据库
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - close()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# close()

此操作会关闭当前的 LocalBulkWriter 实例。

```java
public void close()
```

## 请求语法\{#request-syntax}

```java
remoteBulkWriter.close()
```

**参数：**

*无*

**返回类型：**

*void*

## 示例\{#example}

```java
remoteBulkWriter.close();
```
