---
title: "grant-role | Cloud"
slug: /cli/cli/User-grantrole
sidebar_label: "grant-role"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーにロールを付与します。 | Cloud"
type: docx
token: SvpmdXjkYo3LYTxt2ipcKhLFnZg
sidebar_position: 4
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases の比較
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - grant-role
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-role

この操作はユーザーにロールを付与します。

<Admonition type="info" icon="📘" title="注記">

このコマンドは Dedicated cluster でのみ使用できます。`zilliz context set` を実行して cluster を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user grant-role
--user <value>
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    ユーザー名を示します。

- **--role** (*string*) -

    **[REQUIRED]**

    付与するロール名を示します。

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
zilliz user grant-role --user my_user --role admin
```
