---
title: "status | Cloud"
slug: /cli/cli/Import-status
sidebar_label: "status"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は import job のステータスを取得します。 | Cloud"
type: docx
token: Lu5EdzR9So5gUCxL71YcX30Enkh
sidebar_position: 3
keywords: 
  - Managed ベクトル データベース
  - Pinecone ベクトル データベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - cloud
  - status
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# status

この操作は import job のステータスを取得します。

## Synopsis\{#synopsis}

```bash
zilliz import status
--job-id <value>
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--job-id** (*string*) -

    **[REQUIRED]**

    `job-xxxxx` に似た import job ID を指定します。

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the involved クラスター in the specified import job, which is similar to `inxx-xxxxx`.

    If a クラスター is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz import status --job-id job-xxxx --cluster-id in01-xxxxxxxxxxxx
```
