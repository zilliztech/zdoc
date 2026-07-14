---
title: "resume | Cloud"
slug: /cli/cli/Cluster-resume
sidebar_label: "resume"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は一時停止中のクラスターを再開します。 | Cloud"
type: docx
token: EfaUd8o9LoguWnx6jndcyTJfnzd
sidebar_position: 9
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - 再開
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# resume

この操作は一時停止中のクラスターを再開します。

## Synopsis\{#synopsis}

```bash
zilliz cluster resume
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    再開するクラスターの ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションが未設定でも自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz cluster resume --cluster-id in01-xxxxxxxxxxxx
```
