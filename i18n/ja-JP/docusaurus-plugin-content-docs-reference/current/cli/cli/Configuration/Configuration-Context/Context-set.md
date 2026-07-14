---
title: "set | Cloud"
slug: /cli/cli/Context-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作では、後続のデータプレーンコマンドが使用するデフォルトの cluster endpoint と database を選択します。collection、vector、index、partition、user、role、または alias コマンドを実行する前に context を設定してください。 | Cloud"
type: docx
token: WF1JdhGAgodzpExXO1hcPjADn8b
sidebar_position: 3
keywords: 
  - 音声検索
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# set

この操作では、後続のデータプレーンコマンドが使用するデフォルトの cluster endpoint と database を選択します。collection、vector、index、partition、user、role、または alias コマンドを実行する前に context を設定してください。

## Description\{#description}

後続のデータプレーンコマンドが使用するデフォルトの cluster endpoint と database を設定します。collection、vector、index、partition、user、role、または alias コマンドを実行する前に context を設定してください。

## Synopsis\{#synopsis}

```bash
zilliz context set
[--cluster-id <value>]
[--endpoint <value>]
[--database <value>]
[--on-demand]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    後続のデータプレーンコマンドで使用する cluster を指定します。--endpoint を省略すると、CLI はこの cluster ID から cluster endpoint を解決します。

- **--endpoint** (*string*) -

    cluster endpoint を直接指定します。endpoint をすでに把握している場合や、CLI に cluster ID から解決させたくない場合に使用します。

- **--database** (*string*) -

    現在の context において、後続のデータプレーンコマンドで使用するデフォルトの database を指定します。これは database を作成するものではありません。

- **--on-demand** (*boolean*) -

    on-demand cluster の cluster 詳細を解決します。cluster ID が on-demand cluster に属している場合に使用します。

## Example\{#example}

```bash
# Set context to a standard cluster
zilliz context set --cluster-id in01-xxxxxxxxxxxx

# Set context to an on-demand cluster
zilliz context set --cluster-id in-xxxxxxxxxxxx --on-demand

# Update the database for the current context
zilliz context set --database my_db
```
