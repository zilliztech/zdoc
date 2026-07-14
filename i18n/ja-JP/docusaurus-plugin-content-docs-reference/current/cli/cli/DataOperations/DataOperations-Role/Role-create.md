---
title: "create | Cloud"
slug: /cli/cli/Role-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいロールを作成します。 | Cloud"
type: docx
token: V9xIdjMEMowIh2xVJUUcvir6nUf
sidebar_position: 1
keywords: 
  - ベクターデータベースの比較
  - Faiss
  - 動画検索
  - AI Hallucination
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

この操作は新しいロールを作成します。

## Description\{#description}

Zilliz Cloud は、クラスター レベルでアクセス制御を実装するためのクラスター ロールを提供します。詳細については、[アクセス制御の説明](/docs/access-control-overview) を参照してください。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスターを切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role create
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

## Options\{#options}

- **--role** (*string*) -

    **[必須]**

    ロール名を示します。

    値は **255** 文字以内の文字列で、**アンダースコア (_) または英字で始まる**必要があります。

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

- **--database** (*string*) -

    データベース名を示します。デフォルト値は `default` です。

## Example\{#example}

```bash
zilliz role create --role my_role
```
