---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回 Collection Schema 中定义的函数列表。 | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - 嵌入模型
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctionList()

此 getter 返回 Collection Schema 中定义的函数列表。

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**返回：**

*List&lt;CreateCollectionReq.Function&gt;*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
