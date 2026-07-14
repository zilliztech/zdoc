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
  - マネージド vector データベース
  - Pinecone vector データベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - cloud
  - status
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
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

    指定した import job に関係する cluster の ID を指定します。これは `inxx-xxxxx` に似た形式です。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションを設定しなくても自動的に適用されます。

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
