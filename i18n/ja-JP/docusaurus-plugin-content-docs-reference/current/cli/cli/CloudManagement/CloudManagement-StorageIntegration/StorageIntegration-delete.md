---
title: "delete | Cloud"
slug: /cli/cli/StorageIntegration-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ID によってストレージ統合を削除します。外部バケットの認証情報を Zilliz Cloud で利用できないようにする必要がある場合に使用します。 | Cloud"
type: docx
token: Is4sdUuC2odTHKxq9NKcl8dynfh
sidebar_position: 2
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

この操作は、ID によってストレージ統合を削除します。外部バケットの認証情報を Zilliz Cloud で利用できないようにする必要がある場合に使用します。

## Synopsis\{#synopsis}

```bash
zilliz storage-integration delete --integration-id <string>
```

**OPTIONS:**

- **--integration-id** (*string*) -

    **[REQUIRED]**

    ストレージ統合 ID を指定します。

## Example\{#example}

```bash
zilliz storage-integration delete --integration-id int-xxxxxxxx
```
