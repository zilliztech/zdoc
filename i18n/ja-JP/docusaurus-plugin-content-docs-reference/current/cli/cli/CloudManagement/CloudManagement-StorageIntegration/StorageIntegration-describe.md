---
title: "describe | Cloud"
slug: /cli/cli/StorageIntegration-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ストレージ統合を ID で詳細表示し、現在の設定、ステータス、検証メッセージを確認できるようにします。 | Cloud"
type: docx
token: Ia7VdhmCgoO6R3xcWtIck7Tfndf
sidebar_position: 3
keywords: 
  - 音声検索
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

この操作は、ストレージ統合を ID で詳細表示し、現在の設定、ステータス、検証メッセージを確認できるようにします。

## Synopsis\{#synopsis}

```bash
zilliz storage-integration describe --integration-id <string>
```

**OPTIONS:**

- **--integration-id** (*string*) -

    **[REQUIRED]**

    ストレージ統合 ID を指定します。

## Example\{#example}

```bash
zilliz storage-integration describe --integration-id int-xxxxxxxx
```
