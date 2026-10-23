---
title: "switch | Cloud"
slug: /cli/cli/Auth-switch
sidebar_label: "switch"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は別の organization に切り替えます。 | Cloud"
type: docx
token: WVn4dXc9FocqhRxmuwlcFcTynBg
sidebar_position: 4
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - switch
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# switch

この操作は別の organization に切り替えます。

<strong>Note:</strong> `zilliz auth switch` is a deprecated alias kept for backwards compatibility. Use the top-level `zilliz switch` command in new scripts.

## Synopsis\{#synopsis}

```bash
zilliz auth switch <ORG_ID>
```

## Options\{#options}

- **ORG_ID** (*string*) -

    この操作の後に `zilliz status` の結果に表示される organization の ID を示します。これが指定されていない場合は、選択肢が表示されます。

    このオプションを指定しない場合は、対話形式の選択リストが表示され、その中から選択できます。

## Example\{#example}

```bash
zilliz auth switch
```
