---
title: "set | Cloud"
slug: /cli/cli/Context-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation selects the default クラスター endpoint and データベース that later data-plane commands use. Set a context before running コレクション, ベクトル, インデックス, partition, user, role, or alias commands. | Cloud"
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

---

import Admonition from '@theme/Admonition';


# set

This operation selects the default クラスター endpoint and データベース that later data-plane commands use. Set a context before running コレクション, ベクトル, インデックス, partition, user, role, or alias commands.

## Description\{#description}

Sets the default クラスター endpoint and データベース that later data-plane commands use. Set a context before running コレクション, ベクトル, インデックス, partition, user, role, or alias commands.

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

    Specifies the クラスター to use for subsequent data-plane commands. If you omit --endpoint, the CLI resolves the クラスター endpoint from this クラスター ID.

- **--endpoint** (*string*) -

    Specifies the クラスター endpoint directly. Use this when you already know the endpoint or do not want the CLI to resolve it from a クラスター ID.

- **--database** (*string*) -

    Specifies the default データベース for subsequent data-plane commands in the current context. This does not create a データベース.

- **--on-demand** (*boolean*) -

    Resolves クラスター details for an on-demand クラスター. Use this when the クラスター ID belongs to an on-demand クラスター.

## Example\{#example}

```bash
# Set context to a standard cluster
zilliz context set --cluster-id in01-xxxxxxxxxxxx

# Set context to an on-demand cluster
zilliz context set --cluster-id in-xxxxxxxxxxxx --on-demand

# Update the database for the current context
zilliz context set --database my_db
```
