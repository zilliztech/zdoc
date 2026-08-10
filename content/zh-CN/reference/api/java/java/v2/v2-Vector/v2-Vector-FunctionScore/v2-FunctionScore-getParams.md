---
title: "getParams() | Java | v2"
slug: /java/java/v2-FunctionScore-getParams
sidebar_label: "getParams()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回此 FunctionScore 对象的参数映射。 | Java | v2"
type: docx
token: DUJsdflImor0joxV14ecSwpnnDb
sidebar_position: 4
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - 云
  - getParams()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getParams()

此 getter 返回此 FunctionScore 对象的参数映射。

```java
public Map<String, String> getParams()
```

**返回：**

*Map&lt;String, String&gt;*

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .params(Map.of("weight", "0.8"))
    .build();
Map<String, String> params = score.getParams();
```
