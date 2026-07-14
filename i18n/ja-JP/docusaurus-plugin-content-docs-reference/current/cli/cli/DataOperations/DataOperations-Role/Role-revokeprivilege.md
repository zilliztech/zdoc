---
title: "revoke-privilege | Cloud"
slug: /cli/cli/Role-revokeprivilege
sidebar_label: "revoke-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロールから権限を取り消します。 | Cloud"
type: docx
token: YXtHdG865oGg7IxwoZRcIJkQn8e
sidebar_position: 6
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - revoke-privilege
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# revoke-privilege

この操作は、ロールから権限を取り消します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role revoke-privilege
--role <value>
--object-type <Global | Collection | Database>
--object-name <value>
--privilege <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--role** (*string*) -

    **[REQUIRED]**

    ロール名を示します。

- **--object-type** (*string*) -

    **[REQUIRED]**

    オブジェクトタイプを示します。指定可能な値:

    - `Global`,

    - `Collection`,

    - `Database`.

- **--object-name** (*string*) -

    **[REQUIRED]**

    オブジェクト名（またはすべてを表す *）を示します。

- **--privilege** (*string*) -

    **[REQUIRED]**

    権限名を示します。

- **--database** (*string*) -

    データベース名を示します。

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
zilliz role revoke-privilege --role my_role --object-type Collection --object-name my_col --privilege Search
```
