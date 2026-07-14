---
title: "revoke-role | Cloud"
slug: /cli/cli/User-revokerole
sidebar_label: "revoke-role"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーからロールを取り消します。 | Cloud"
type: docx
token: W7NedO3aXoF3UdxWp51cPe0kn2b
sidebar_position: 6
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - revoke-role
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# revoke-role

この操作はユーザーからロールを取り消します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated cluster でのみ使用できます。`zilliz context set` を実行して cluster を切り替えることができます。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz user revoke-role
--user <value>
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    ユーザー名を指定します。

- **--role** (*string*) -

    **[REQUIRED]**

    取り消すロール名を指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値は次のとおりです。

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
zilliz user revoke-role --user my_user --role admin
```
