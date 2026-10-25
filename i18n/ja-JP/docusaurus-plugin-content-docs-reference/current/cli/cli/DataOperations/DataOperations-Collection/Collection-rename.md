---
title: "rename | Cloud"
slug: /cli/cli/Collection-rename
sidebar_label: "rename"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation renames a コレクション. | Cloud"
type: docx
token: N1uadJS98ojQhixbOQacLOwknke
sidebar_position: 13
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - rename
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# rename

This operation renames a コレクション.

## Synopsis\{#synopsis}

```bash
zilliz collection rename
--name <value>
--new-name <value>
[--database <value>]
[--new-database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the current コレクション name.

- **--new-name** (*string*) -

    **[REQUIRED]**

    Indicates the new コレクション name.

    値は、先頭がアンダースコア (_) または英字で始まる、最大 255 文字の英数字文字列である必要があります。

- **--database** (*string*) -

    Indicates the current データベース name.

- **--new-database** (*string*) -

    Indicates the target データベース name (for cross-db rename).

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`, `table`, `text`, `yaml`, `csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz collection rename --name old_collection --new-name new_collection
```
