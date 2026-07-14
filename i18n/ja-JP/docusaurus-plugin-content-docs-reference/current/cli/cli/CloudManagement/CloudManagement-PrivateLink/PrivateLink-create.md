---
title: "create | Cloud"
slug: /cli/cli/PrivateLink-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は PrivateLink エンドポイントを作成します。 | Cloud"
type: docx
token: GBdVd6bJ1o6VhRxgHxLcsFsVn2b
sidebar_position: 2
keywords: 
  - 音声検索
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は PrivateLink エンドポイントを作成します。

## Usage\{#usage}

```bash
zilliz privatelink create [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    プロジェクト ID。

- **--region-id** (*string*) -

    **[REQUIRED]**

    クラウドリージョン。

- **--endpoint-id** (*string*) -

    **[REQUIRED]**

    VPC エンドポイント ID（例: vpce-xxxx）。

- **--gcp-project-id** (*string*) -

    GCP プロジェクト ID（GCP のみ）。

## Example\{#example}

```bash
zilliz privatelink create --project-id proj-xxxx --region-id aws-us-east-1 --endpoint-id vpce-xxxx
```
