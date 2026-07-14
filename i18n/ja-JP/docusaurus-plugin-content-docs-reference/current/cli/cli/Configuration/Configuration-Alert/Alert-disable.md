---
title: "disable | Cloud"
slug: /cli/cli/Alert-disable
sidebar_label: "disable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はアラートルールを無効化します。 | Cloud"
type: docx
token: AVX3dxX68oYAc1x06uVc7bgcnx1
sidebar_position: 3
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソース vector db
  - ベクトルデータベースの例
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - 無効化
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# disable

この操作はアラートルールを無効化します。

## Description\{#description}

このコマンドを実行すると、一時的に不要な場合に指定したアラートルールを無効化できます。無効化されたアラートルールは引き続き存在し、必要に応じてそのいずれかを有効化できます。

## Synopsis\{#synopsis}

```bash
zilliz alert disable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    無効化するアラートルールの ID を示します。たとえば `alert-xxxx` です。既存のアラートルールの完全な一覧を取得するには、`zilliz alert list` を実行します。

- **--project-id** (*string*) -

    リストからアラートルールを選択する際のプロジェクト ID を示します。

    `zilliz context set` を使用してプロジェクトが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値: 

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert disable --id xxx
```
