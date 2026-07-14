---
title: "drop | Cloud"
slug: /cli/cli/Alias-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は alias を削除します。 | Cloud"
type: docx
token: CucPdYRmsofWt8xkVj3cK7Vynjg
sidebar_position: 4
keywords: 
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - nlp 検索
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

この操作は alias を削除します。

## Synopsis\{#synopsis}

```bash
zilliz alias drop
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--alias** (*string*) -

    **[REQUIRED]**

    削除する alias 名を指定します。

- **--database** (*string*) -

    database 名を指定します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションを設定しなくても、それが属する database が自動的に適用されます。

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

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを指定します。

## Example\{#example}

```bash
zilliz alias drop --alias my_alias
```
