---
title: "getFunctions() | Java | v2"
slug: /java/java/v2-FunctionScore-getFunctions
sidebar_label: "getFunctions()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回此 FunctionScore 对象中定义的函数列表。 | Java | v2"
type: docx
token: RsqKdZaMnoHbaRxYr1fcqRbRnth
sidebar_position: 3
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量数据库教程
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctions()

此 getter 返回此 FunctionScore 对象中定义的函数列表。

```java
public List<CreateCollectionReq.Function> getFunctions()
```

**返回：**

*List&lt;CreateCollectionReq.Function&gt;*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .addFunction(func)
    .build();
List<CreateCollectionReq.Function> functions = score.getFunctions();
```
