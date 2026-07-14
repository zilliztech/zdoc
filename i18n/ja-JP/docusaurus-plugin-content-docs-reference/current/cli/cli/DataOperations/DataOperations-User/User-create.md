---
title: "create | Cloud"
slug: /cli/cli/User-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいデータベースユーザーを作成します。 | Cloud"
type: docx
token: UJuOdGGu3okE0Sx1jARc45lMnGb
sidebar_position: 1
keywords: 
  - 類似性検索
  - マルチモーダルRAG
  - llm hallucinations
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は新しいデータベースユーザーを作成します。

## Description\{#description}

Zilliz Cloud では、クラスター ユーザーを作成し、それらにクラスター ロールを割り当てて権限を定義することで、データセキュリティを実現できます。

クラスターの作成時には、`db_admin` という名前のデフォルトユーザーが自動的に作成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、よりきめ細かなアクセス制御のために、さらにクラスター ユーザーを作成できます。

クラスター ユーザーを管理するには、**Organization Owner** または **Project Admin** であるか、**Cluster_Admin** 権限を持つロールが必要です。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスター間を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user create
--user <value>
--password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    ユーザー名を指定します。

    値は **32** 文字以内の文字列で、**アンダースコア (_) または英字で始まる**必要があります。

- **--password** (*string*) -

    **[REQUIRED]**

    パスワードを指定します。 

    パスワードは少なくとも **8** 文字の文字列で、次の種類のうち **2** 種類を含む必要があります。

    - 大文字 (A-Z)

    - 小文字 (a-z)

    - 数字 (0-9)

    - 特殊文字 (`!`, `@`, `#` など)

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
zilliz user create --user my_user --password my_password
```
