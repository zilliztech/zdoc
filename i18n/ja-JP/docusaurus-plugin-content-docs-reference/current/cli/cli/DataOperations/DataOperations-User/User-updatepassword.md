---
title: "update-password | Cloud"
slug: /cli/cli/User-updatepassword
sidebar_label: "update-password"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーパスワードを更新します。 | Cloud"
type: docx
token: AB6Hd6NHUoNLXIxgXywc3hmtnjc
sidebar_position: 7
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - update-password
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update-password

この操作はユーザーパスワードを更新します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスターを切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user update-password
--user <value>
--password <value>
--new-password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    ユーザー名を示します。

- **--password** (*string*) -

    **[REQUIRED]**

    現在のパスワードを示します。

- **--new-password** (*string*) -

    **[REQUIRED]**

    新しいパスワードを示します。

    パスワードは少なくとも **8** 文字の文字列で、次のオプションのうち **2** 種類を含んでいる必要があります。

    - 大文字 (A-Z)

    - 小文字 (a-z)

    - 数字 (0-9)

    - 特殊文字 (`!`, `@`, `#` など)

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

## 例\{#example}

```bash
zilliz user update-password --user my_user --password old_pass --new-password new_pass
```
