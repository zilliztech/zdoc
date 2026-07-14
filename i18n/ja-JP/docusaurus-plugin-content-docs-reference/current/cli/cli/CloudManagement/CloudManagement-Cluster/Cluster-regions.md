---
title: "regions | Cloud"
slug: /cli/cli/Cluster-regions
sidebar_label: "regions"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クラウドプロバイダーで利用可能なすべてのリージョンを一覧表示します。 | Cloud"
type: docx
token: YHtudYo81oBKruxujL5cw0yZnxd
sidebar_position: 8
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - regions
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# regions

この操作は、クラウドプロバイダーで利用可能なすべてのリージョンを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz cluster regions
--cloud-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--cloud-id** (*string*) -

    クラウドプロバイダーを指定します。指定可能な値は次のとおりです: `aws`、`gcp`、`azure`。

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
# すべてのリージョンを一覧表示
zilliz cluster regions

# AWS リージョンのみを一覧表示
zilliz cluster regions --cloud-id aws
```
