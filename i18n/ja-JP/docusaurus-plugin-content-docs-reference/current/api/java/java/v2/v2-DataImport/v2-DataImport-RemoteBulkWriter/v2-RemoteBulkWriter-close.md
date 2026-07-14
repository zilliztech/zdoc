---
title: "close() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-close
sidebar_label: "close()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の LocalBulkWriter インスタンスを閉じます。 | Java | v2"
type: docx
token: ByKadzyxVodrkxxhaGuc4HtFnWh
sidebar_position: 2
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# close()

この操作は現在の LocalBulkWriter インスタンスを閉じます。

```java
public void close()
```

## リクエスト構文\{#request-syntax}

```java
remoteBulkWriter.close()
```

**パラメータ:**

*なし*

**戻り値の型:**

*void*

## 例\{#example}

```java
remoteBulkWriter.close();
```
