---
title: "delete | Cloud"
slug: /cli/cli/Alert-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はアラートルールを削除します。 | Cloud"
type: docx
token: L6dIdJaeGoNfmcxAXC2cW82znke
sidebar_position: 2
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

この操作はアラートルールを削除します。

## Description\{#description}

このコマンドを実行すると、不要になった指定のアラートルールを削除できます。この操作は元に戻せないため、注意して実行してください。既存のアラートルールの完全な一覧を取得するには、`zilliz alert list` を実行します。

オプションを指定せずにこのコマンドを実行すると、設定を支援する一連の対話型プロンプトが表示されます。

## Synopsis\{#synopsis}

```bash
zilliz alert delete
--id <value>
[--project-id <value>]
[--output <json | table | text>]
[--yes]
```

## Options\{#options}

- **--id** (*string*) -

    **[必須]**

    削除するアラートルールの ID を指定します。たとえば `alert-xxxx` です。既存のアラートルールの完全な一覧を取得するには、`zilliz alert list` を実行します。

- **--project-id** (*string*) -

    リストからアラートルールを選択したい場合に、プロジェクトの ID を指定します。たとえば `proj-xxxx` です。

    `zilliz context set` を使用してプロジェクトが設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`.

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを指定します。

## Example\{#example}

```bash
zilliz alert delete
```
