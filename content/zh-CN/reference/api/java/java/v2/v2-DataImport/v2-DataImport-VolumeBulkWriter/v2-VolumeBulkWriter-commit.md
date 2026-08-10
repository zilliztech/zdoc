---
title: "commit() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会提交已追加的数据。 | Java | v2"
type: docx
token: V39Ady6thoD9cCxBcopcquFKnzc
sidebar_position: 3
keywords: 
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - 近邻搜索
  - zilliz
  - zilliz cloud
  - 云
  - commit()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commit()

此操作会提交已追加的数据。

```java
 public void commit(boolean async)
```

## 请求语法\{#request-syntax}

```java
volumeBulkWriter.commit(
    boolean async
)
```

**参数：**

- **async** (*boolean*) -

    commit 操作在被调用后是否立即返回。

**返回类型：**

*void*

## 示例\{#examples}

```java
volumeBulkWriter.commit(false);
```

