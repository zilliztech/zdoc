---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会关闭当前 Volume 存储会话并释放其资源。 | Java | v2"
type: docx
token: F1GvdNp0rosDfCxonr7cJpzcn9w
sidebar_position: 3
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - shutdownGracefully()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# shutdownGracefully()

此操作会关闭当前 Volume 存储会话并释放其资源。

```java
public void shutdownGracefully()
```

**异常：**

- **Exception**

    当请求校验、传输或服务器执行失败时抛出。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
manager.shutdownGracefully();
```
