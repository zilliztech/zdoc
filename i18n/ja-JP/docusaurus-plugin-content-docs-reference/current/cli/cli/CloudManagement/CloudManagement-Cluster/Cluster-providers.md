---
title: "providers | Cloud"
slug: /cli/cli/Cluster-providers
sidebar_label: "providers"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、適用可能なすべてのクラウドプロバイダーを一覧表示します。 | Cloud"
type: docx
token: Rhked7rPvopHixxQZe6czSUwnvf
sidebar_position: 7
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - providers
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# providers

この操作は、適用可能なすべてのクラウドプロバイダーを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz cluster providers
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

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
zilliz cluster providers
```
