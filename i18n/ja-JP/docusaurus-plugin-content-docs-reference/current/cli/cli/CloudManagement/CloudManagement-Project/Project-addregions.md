---
title: "add-regions | Cloud"
slug: /cli/cli/Project-addregions
sidebar_label: "add-regions"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のプロジェクトに追加のリージョンを関連付けます。 | Cloud"
type: docx
token: JP80dUdphoM5N9xsTFTccZeRnhp
sidebar_position: 5
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - add-regions
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# add-regions

この操作は、既存のプロジェクトに追加のリージョンを関連付けます。

## Description\{#description}

既存の Zilliz Cloud プロジェクトに追加のリージョンを関連付けます。`--region` を繰り返すことで、1 つのコマンドで複数のリージョンを追加できます。

## Synopsis\{#synopsis}

```bash
zilliz project add-regions
--project-id <value>
--region <value>
[--api-key <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    追加のリージョンを関連付けるプロジェクト ID を指定します。

- **--region** (*array*) -

    **[REQUIRED]**

    追加するリージョン ID（繰り返し指定可能。例: **--region aws-us-east-1 --region gcp-us-west1**）。

- **--api-key** (*string*) -

    このコマンド用の API キーを指定します。この値は、環境変数または設定済みの API キーを上書きします。

## Example\{#example}

```bash
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1 --region gcp-us-west1
```
