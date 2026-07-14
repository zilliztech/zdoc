---
title: "list | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は external-collection の refresh ジョブを一覧表示します（必要に応じて collection でフィルタリング可能）。 | Cloud"
type: docx
token: YRQbd0bSOoMIDixpInlcg05jn4g
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作は external-collection の refresh ジョブを一覧表示します（必要に応じて collection でフィルタリング可能）。

## Description\{#description}

現在の cluster コンテキスト内の external-collection refresh ジョブを一覧表示します。結果セットを絞り込むには `--name` と `--database` を使用します。

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh list
[--name <value>]
[--database <value>]
```

## Options\{#options}

- **--name** (*string*) -

    external collection 名でフィルタリングします。

- **--database** (*string*) -

    database 名を指定します。

## Example\{#example}

```bash
zilliz -o json external-collection refresh list --name my_external_coll

# Example output
# {
#   "jobs": []
# }
```
