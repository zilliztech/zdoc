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

---

import Admonition from '@theme/Admonition';


# grant-privilege

この操作はロールに権限を付与します。

## Description\{#description}

A **privilege** refers to the permission of specific operations on certain Zilliz Cloud resources such as クラスター, データベース, and コレクション. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a コレクション named `collection_01`.

A **privilege group** is a combination of individual privileges. You can create a privilege group of commonly used privileges to simplify the role-granting process. For ease of use, Zilliz Cloud provides 9 built-in privilege groups at the コレクション, データベース, and クラスター levels.

利用可能な権限は [Privileges and Privilege Groups](/docs/cluster-privileges) に記載されています。

<Admonition type="info" title="Notes">

This command is available for Dedicated クラスター only. You can run `zilliz context set` to switch among クラスター.

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

    Indicates the データベース name.

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
