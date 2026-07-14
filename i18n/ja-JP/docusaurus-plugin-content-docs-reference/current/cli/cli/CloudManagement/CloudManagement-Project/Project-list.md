---
title: "list | Cloud"
slug: /cli/cli/Project-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのプロジェクトを一覧表示します。 | Cloud"
type: docx
token: KZ5gdkIy0ojiWixSU0dc6C5KnEd
sidebar_position: 3
keywords: 
  - 動画重複排除
  - 動画類似検索
  - Vector retrieval
  - 音声類似検索
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

この操作はすべてのプロジェクトを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz project list
[--output <value>]
[--query <value>]
[--no-header]
```

## オプション\{#options}

- **--output, -o** (*string*) -

    出力形式を指定します。使用可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## 例\{#example}

```bash
zilliz project list
```
