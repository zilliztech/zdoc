---
title: "apply | Cloud"
slug: /cli/cli/Volume-apply
sidebar_label: "apply"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はボリュームをプロジェクトに適用（アタッチ）します。 | Cloud"
type: docx
token: VJ8cdV2uuoYAuMxrJAjcMmRknke
sidebar_position: 4
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - apply
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# apply

この操作はボリュームをプロジェクトに適用（アタッチ）します。

## Usage\{#usage}

```bash
zilliz volume apply [OPTIONS]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    ボリューム名。

- **--project-id** (*string*) -

    ボリュームをアタッチするプロジェクト ID。

## Example\{#example}

```bash
zilliz volume apply --name my-volume --project-id proj-xxxx
```
