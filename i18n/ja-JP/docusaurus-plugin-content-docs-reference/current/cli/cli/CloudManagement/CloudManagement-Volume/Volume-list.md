---
title: "list | Cloud"
slug: /cli/cli/Volume-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクト内のすべての volume を一覧表示します。 | Cloud"
type: docx
token: OShTd6lMhoaxK2xDlExcmzXTnLd
sidebar_position: 3
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - 一覧
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作は、プロジェクト内のすべての volume を一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz volume list
--project-id <value>
[--page-size <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[必須]**

    プロジェクト ID を示します。

    `zilliz context set` を使用してプロジェクトが設定されている場合、このオプションが未設定でも自動的に適用されます。

- **--page-size** (*integer*) -

    1 ページあたりの項目数を示します。デフォルト値は **10** です。

- **--page** (*integer*) -

    現在のページ番号を示します。デフォルト値は **1** です。

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
zilliz volume list --project-id proj-xxxxxxxxxxxx
```
