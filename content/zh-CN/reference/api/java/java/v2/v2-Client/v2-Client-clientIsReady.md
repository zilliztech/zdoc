---
title: "clientIsReady() | Java | v2"
slug: /java/java/v2-Client-clientIsReady
sidebar_label: "clientIsReady()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作检查客户端与服务器的连接是否已就绪。 | Java | v2"
type: docx
token: I1sMd0t6qoNuIWx3mjecEfjwnyc
sidebar_position: 3
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - clientIsReady()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# clientIsReady()

此操作检查客户端与服务器的连接是否已就绪。

```java
public boolean clientIsReady()
```

**返回值：**

*boolean*

如果客户端已连接并就绪，则返回 **true**；否则返回 **false**。

## 示例\{#example}

```java
boolean ready = client.clientIsReady();
System.out.println("Client ready: " + ready);
```
