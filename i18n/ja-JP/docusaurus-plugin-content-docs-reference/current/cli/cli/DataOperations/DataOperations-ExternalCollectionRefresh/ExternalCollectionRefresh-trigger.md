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
  - openai ベクトル db
  - 自然言語処理データベース
  - cheap ベクトル データベース
  - Managed ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - trigger
  - cliv14
displayed_sidebar: cliSidebar

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

    この更新で使用する外部ソース URI を指定します。

    `--external-spec` と併せて指定するか、両方を省略してください。両方を省略した場合、更新では永続化されたソースと仕様が再利用されます。

    <NextChannel action="include">このオプションでは、`volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを使用できます。`volume://` URI には上記のルールが適用されます。`milvus://` ソースの場合は必須です。省略した場合、更新は有効にならず、コレクションは以前に同期されたデータを引き続き提供します。</NextChannel>

- **--external-spec** (*string*) -

    この更新で使用する外部ソース仕様を JSON 文字列として指定します。`--external-source` と併せて指定するか、両方を省略してください。

    <NextChannel action="include">`milvus://` ソースの場合は省略できます。`format` のデフォルトは `milvus-table` です。</NextChannel>

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
# next-channel-start

# Trigger refresh for an external collection that uses a milvus:// source
zilliz external-collection refresh trigger --name my_external_coll --external-source milvus://in01-xxxx/default/orders
# next-channel-end
```
