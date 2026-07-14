---
title: "commit() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は追加されたデータをコミットします。 | Java | v2"
type: docx
token: V39Ady6thoD9cCxBcopcquFKnzc
sidebar_position: 3
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commit()

この操作は追加されたデータをコミットします。

```java
 public void commit(boolean async)
```

## リクエスト構文\{#request-syntax}

```java
volumeBulkWriter.commit(
    boolean async
)
```

**パラメータ:**

- **async** (*boolean*) -

    commit 操作が呼び出された直後に即座に戻るかどうか。

**戻り値の型:**

*void*

## 例\{#examples}

```java
volumeBulkWriter.commit(false);
```

