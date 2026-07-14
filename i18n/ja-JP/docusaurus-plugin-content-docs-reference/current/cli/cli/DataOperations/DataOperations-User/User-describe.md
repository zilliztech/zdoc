---
title: "describe | Cloud"
slug: /cli/cli/User-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーの詳細を取得します。 | Cloud"
type: docx
token: ES6CdyFsgoXMEtxpLRAcrnZ3n9f
sidebar_position: 2
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

この操作はユーザーの詳細を取得します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated cluster でのみ使用できます。`zilliz context set` を実行して cluster を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user describe
--user <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    ユーザー名を示します。

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
zilliz user describe --user my_user
```
