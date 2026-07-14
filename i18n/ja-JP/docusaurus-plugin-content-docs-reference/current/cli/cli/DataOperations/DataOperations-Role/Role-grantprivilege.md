---
title: "grant-privilege | Cloud"
slug: /cli/cli/Role-grantprivilege
sidebar_label: "grant-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はロールに権限を付与します。 | Cloud"
type: docx
token: U83ddOym4o7WgAx1ekac4nFHnzf
sidebar_position: 4
keywords: 
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - grant-privilege
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-privilege

この操作はロールに権限を付与します。

## Description\{#description}

**privilege** とは、clusters、databases、collections などの特定の Zilliz Cloud リソースに対する特定の操作の許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソースに対して実行できる操作が定義されます。権限の例としては、`collection_01` という名前の collection にデータを挿入する許可が挙げられます。

**privilege group** は、個々の権限を組み合わせたものです。よく使用される権限の privilege group を作成することで、ロール付与のプロセスを簡素化できます。使いやすさのために、Zilliz Cloud は collection、database、cluster レベルで 9 個の組み込み privilege group を提供しています。

利用可能な権限は [Privileges and Privilege Groups](/docs/cluster-privileges) に記載されています。

<Admonition type="info" icon="📘" title="Notes">

このコマンドは Dedicated clusters でのみ使用できます。`zilliz context set` を実行して clusters 間を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role grant-privilege
--role <value>
--object-type <Global | Collection | Database>
--object-name <value>
--privilege <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--role** (*string*) -

    **[REQUIRED]**

    ロール名を指定します。

- **--object-type** (*string*) -

    **[REQUIRED]**

    オブジェクトタイプを指定します。指定可能な値:

    - `Global`,

    - `Collection`,

    - `Database`.

- **--object-name** (*string*) -

    **[REQUIRED]**

    オブジェクト名を指定します。`'*'` を使用して、指定したタイプのすべてのオブジェクトを含めることができます。

- **--privilege** (*string*) -

    **[REQUIRED]**

    権限名を指定します。`'*'` を使用してすべての権限を含めることができます。利用可能な権限は [Privileges and Privilege Groups](/docs/cluster-privileges) に記載されています。

- **--database** (*string*) -

    database 名を指定します。

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

    出力をフィルタリングする JMESPath 式を指定します。

## Example\{#example}

```bash
# Grant search on a specific collection
zilliz role grant-privilege --role my_role --object-type Collection --object-name my_col --privilege Search

# Grant all privileges on all collections
zilliz role grant-privilege --role my_role --object-type Collection --object-name '*' --privilege '*'
```
