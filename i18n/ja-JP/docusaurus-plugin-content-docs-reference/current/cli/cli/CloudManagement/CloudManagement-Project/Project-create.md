---
title: "create | Cloud"
slug: /cli/cli/Project-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作は新しいプロジェクトを作成します。 | Cloud"
type: docx
token: GXhEdTZt9or6nix81GtcENu9n0f
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - Milvus vector database
  - Milvus db
  - zilliz
  - Zilliz Cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は新しいプロジェクトを作成します。

## Description\{#description}

新しい Zilliz Cloud プロジェクトを作成します。プロジェクト作成時にリージョンをバインドしたい場合は、`--region` を1回以上使用します。

## Synopsis\{#synopsis}

```bash
zilliz project create
--name <value>
--plan <value>
[--region <value>]
[--api-key <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    プロジェクト名を指定します。

- **--plan** (*string*) -

    **[REQUIRED]**

    サブスクリプションプランを指定します。選択肢: `Standard`、`Enterprise`、`BusinessCritical`。

- **--region** (*array*) -

    バインドするリージョン ID を指定します（繰り返し指定可能。例: `--region aws-us-east-1 --region gcp-us-west1`）。

- **--api-key** (string) -

    このコマンドの API key を指定します。この値は、環境変数または設定済みの API key を上書きします。

## Example\{#example}

```bash
# Create a project without regions
zilliz project create --name my-project --plan Standard

# Create a project with multiple regions
zilliz project create --name my-project --plan Standard --region aws-us-east-1 --region gcp-us-west1
```
