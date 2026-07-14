---
title: "list | Cloud"
slug: /cli/cli/StorageIntegration-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では外部ストレージ統合を一覧表示し、import または external collection ワークフローで使用する前に、統合 ID、名前、ステータス、リージョン、バケット、およびサーバーメッセージを確認できます。 | Cloud"
type: docx
token: XScGdoVr8oYyWVxQzqKcy7eQnFG
sidebar_position: 5
keywords: 
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル検索
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

この操作では外部ストレージ統合を一覧表示し、import または external collection ワークフローで使用する前に、統合 ID、名前、ステータス、リージョン、バケット、およびサーバーメッセージを確認できます。

## 概要\{#synopsis}

```bash
zilliz storage-integration list [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    ストレージ統合をフィルタリングするために使用する project ID を指定します。

- **--page-size** (*integer*) -

    1 ページあたりに返す項目数を指定します。

- **--page** (*integer*) -

    返すページ番号を指定します。

## 例\{#example}

```bash
zilliz storage-integration list

zilliz storage-integration list --project-id proj-xxxx
```
