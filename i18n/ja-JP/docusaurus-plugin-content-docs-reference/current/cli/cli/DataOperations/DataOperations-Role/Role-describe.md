---
title: "describe | Cloud"
slug: /cli/cli/Role-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロールの詳細と権限を取得します。 | Cloud"
type: docx
token: Fj9Yd4SOPoppxTx7K8WcyMd7ncd
sidebar_position: 2
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
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

この操作は、ロールの詳細と権限を取得します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスター間を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role describe
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

**OPTIONS:**

- **--role** (*string*) -

    **[REQUIRED]**

    ロール名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。使用可能な値:

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
zilliz role describe --role my_role
```
