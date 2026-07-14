---
title: "release | Cloud"
slug: /cli/cli/Partition-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はパーティションをメモリから解放します。 | Cloud"
type: docx
token: XpaudNsR2o3MRoxTbAMcj4tEn1w
sidebar_position: 7
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# release

この操作はパーティションをメモリから解放します。

## Synopsis\{#synopsis}

```bash
zilliz partition release [OPTIONS]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--names** (*array*) -

    **[REQUIRED]**

    パーティション名を JSON 配列として示します。

- **--database** (*string*) -

    データベース名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`, `table`, `text`, `yaml`, `csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz partition release --collection my_collection --names '["p1", "p2"]'
```
