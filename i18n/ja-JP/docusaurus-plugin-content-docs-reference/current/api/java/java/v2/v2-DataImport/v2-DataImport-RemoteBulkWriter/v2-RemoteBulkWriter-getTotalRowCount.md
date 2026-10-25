---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、この RemoteBulkWriter インスタンスによって書き込まれた行の総数を返します。 | Java | v2"
type: docx
token: QH3hdlzwDoxHjTxPj39c6qMSnbg
sidebar_position: 7
keywords: 
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

この操作は、この RemoteBulkWriter インスタンスによって書き込まれた行の総数を返します。

```java
public Long getTotalRowCount()
```

**戻り値の型：**

*Long*

**戻り値：**

この RemoteBulkWriter インスタンスによって書き込まれた行の総数です。

**パラメーター：**

- **totalRowCount** (*Long*) -

    これまでに追加された行数です。

**例外：**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
RemoteBulkWriter writer = new RemoteBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```
