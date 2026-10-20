---
title: "commit() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、追加されたデータをコミットします。 | Java | v2"
type: docx
token: SJ3ndk2d7oQbAOxP5iHcGtr1nrb
sidebar_position: 3
keywords: 
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - milvus db
  - zilliz
  - zilliz cloud
  - クラウド
  - commit()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commit()

この操作は、追加されたデータをコミットします。

```java
 public void commit(boolean async)
```

## リクエスト構文\{#request-syntax}

```java
remoteBulkWriter.commit(
    boolean async
)
```

**パラメーター:**

- **async** (*boolean*) -

    commit 操作が呼び出された直後に戻るかどうか。

## 例\{#examples}

```java
remoteBulkWriter.commit(false);
```
