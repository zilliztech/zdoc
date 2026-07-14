---
title: "list | Cloud"
slug: /cli/cli/Cluster-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのクラスターを一覧表示します。 | Cloud"
type: docx
token: F2RtdzmQ0oQlWfxf7SYcT200nNf
sidebar_position: 4
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作はすべてのクラスターを一覧表示します。

## Description\{#description}

このコマンドは、一覧表示された各クラスターについて以下のフィールドを返します。

- `clusterId`

- `clusterName`

- `description`

- `regionId`

- `cuType`

- `plan`

- `cuSize`

- `status`

## Synopsis\{#synopsis}

```bash
zilliz cluster list
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## Options\{#options}

- **--page-size** (*integer*) -

    1ページあたりの項目数を示します。デフォルト値は **10** です。

- **--page** (*integer*) -

    ページ番号を示します。デフォルト値は **1** です。

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

- **--all, -a** (*boolean*) -

    すべてのページを取得するかどうかを示します。

## Example\{#example}

```bash
# List all clusters
zilliz cluster list

# Fetch all pages
zilliz cluster list --all
```
