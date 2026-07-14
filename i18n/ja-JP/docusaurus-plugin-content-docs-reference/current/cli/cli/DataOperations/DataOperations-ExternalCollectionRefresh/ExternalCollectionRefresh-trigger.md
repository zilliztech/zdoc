---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は外部コレクションの更新ジョブをトリガーします。ジョブ ID を返します。 | Cloud"
type: docx
token: ApSLdblNKo7ru0xGTqbconxBnSh
sidebar_position: 3
keywords: 
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - trigger
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# trigger

この操作は外部コレクションの更新ジョブをトリガーします。ジョブ ID を返します。

## Description\{#description}

現在のクラスターコンテキスト内の外部コレクションに対する更新ジョブを開始します。返された `jobId` を使用して、`zilliz external-collection refresh describe` でジョブを確認します。

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh trigger
--name <value>
[--database <value>]
[--external-source <value>]
[--external-spec <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    外部コレクション名を指定します。

- **--database** (*string*) -

    データベース名を指定します。

- **--external-source** (*string*) -

    外部ソースを上書きします（任意）。

- **--external-spec** (*string*) -

    外部仕様を上書きします（任意）。

## Example\{#example}

```bash
# Trigger refresh for an external collection
zilliz external-collection refresh trigger --name my_external_coll

# Example output
# {
#   "jobId": 123456
# }

# Trigger refresh in a non-default database
zilliz external-collection refresh trigger --name my_external_coll --database my_db
```
