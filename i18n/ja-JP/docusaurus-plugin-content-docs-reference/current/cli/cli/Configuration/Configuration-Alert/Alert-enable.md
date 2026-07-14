---
title: "enable | Cloud"
slug: /cli/cli/Alert-enable
sidebar_label: "enable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はアラートルールを有効にします。 | Cloud"
type: docx
token: MLrJdT9TdojvcJxhauic8s9anBf
sidebar_position: 4
keywords: 
  - オープンソースベクトルデータベース
  - Vector index
  - ベクトルデータベース オープンソース
  - オープンソース vector db
  - zilliz
  - zilliz cloud
  - cloud
  - 有効化
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# enable

この操作はアラートルールを有効にします。

## Description\{#description}

有効化されたアラートルールのみが適用されます。必要に応じて、このコマンドを実行して指定したアラートルールを有効にできます。

## Synopsis\{#synopsis}

```bash
zilliz alert enable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    有効にするアラートルールの ID（`alert-xxxxx` など）を指定します。既存のアラートルールの一覧を完全に取得するには、`zilliz alert list` を実行します。

- **--project-id** (*string*) -

    一覧からアラートルールを選択する場合は、project ID を指定します。

    `zilliz context set` を使用して project が設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert enable --id xxxx
```
