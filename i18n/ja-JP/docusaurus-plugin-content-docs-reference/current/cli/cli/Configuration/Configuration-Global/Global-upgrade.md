---
title: "upgrade | Cloud"
slug: /cli/cli/Global-upgrade
sidebar_label: "upgrade"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、最新の GitHub リリースを確認し、ホストプラットフォーム向けの公式インストーラスクリプトに処理を委譲することで、CLI を自己更新します。 | Cloud"
type: docx
token: ZCnedaDvloSUhwxvycSc4gwhnbf
sidebar_position: 3
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# upgrade

この操作は、最新の GitHub リリースを確認し、ホストプラットフォーム向けの公式インストーラスクリプトに処理を委譲することで、CLI を自己更新します。

## Description\{#description}

最新の Zilliz CLI リリースを確認し、アップグレードが利用可能な場合は公式インストーラを実行します。インストールせずに利用可否を確認するには `--check` を使用します。

## Synopsis\{#synopsis}

```bash
zilliz upgrade
[--check]
[--yes]
[--force]
```

## Options\{#options}

- **--check** (*boolean*) -

    新しいバージョンが利用可能かどうかのみを報告します。インストーラは実行しません。

- **--yes** (*boolean*) -

    確認プロンプトをスキップします。

- **--force** (*boolean*) -

    すでに最新バージョンであっても、インストーラを再実行します。

## Example\{#example}

```bash
# インストールせずに更新を確認
zilliz upgrade --check

# 確認プロンプト付きでアップグレード
zilliz upgrade

# プロンプトなしでアップグレード
zilliz upgrade --yes

# 再インストールを強制
zilliz upgrade --force --yes
```
