---
title: "search | Cloud"
slug: /cli/cli/History-search
sidebar_label: "search"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コマンドラインに指定されたキーワードを含むエントリにコマンド履歴を絞り込みます（大文字・小文字を区別しない部分文字列一致）。新しい順に並べられます。 | Cloud"
type: docx
token: FVmwd1ishoRaqUxQQNNch019nOf
sidebar_position: 3
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - search
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# search

この操作は、コマンドラインに指定されたキーワードを含むエントリにコマンド履歴を絞り込みます（大文字・小文字を区別しない部分文字列一致）。新しい順に並べられます。

## Synopsis\{#synopsis}

```bash
zilliz history search
--keyword <string>
```

## Options\{#options}

- **--keyword** (*string*) -

    **[REQUIRED]**

    検索語を指定します。記録されたコマンドラインに対して、大文字・小文字を区別しない部分文字列一致で検索します。

## Example\{#example}

```bash
# 記録された `cluster create` の呼び出しをすべて検索
zilliz history search --keyword "cluster create"

# 特定の cluster ID に言及したコマンドを検索
zilliz history search --keyword inxx-1234567890ab
```
