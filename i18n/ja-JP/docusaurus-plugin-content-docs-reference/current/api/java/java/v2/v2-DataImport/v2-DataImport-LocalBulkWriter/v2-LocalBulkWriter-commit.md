---
title: "commit() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は追加されたデータをコミットします。 | Java | v2"
type: docx
token: OUhTdWnXBoHqKdxTA0HcdMY5n4b
sidebar_position: 3
keywords: 
  - ベクトル類似性検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
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
localBulkWriter.commit(
    boolean async
)
```

**パラメーター:**

- **async** (*boolean*) -

    commit 操作が呼び出された直後に戻るかどうか。

**戻り値の型:**

*void*

## 例\{#examples}

```java
localBulkWriter.commit(false);
```
