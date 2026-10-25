---
title: "uninstall | Cloud"
slug: /cli/cli/Global-uninstall
sidebar_label: "uninstall"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は CLI バイナリと `zz` エイリアスを削除します。 | Cloud"
type: docx
token: LeH5d568MolZfhxAwoZcmjWTnGc
sidebar_position: 2
keywords: 
  - ベクトル化
  - k 近傍法アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - uninstall
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# uninstall

この操作は CLI バイナリと `zz` エイリアスを削除します。

## Description\{#description}

インストールされた Zilliz CLI バイナリと `zz` エイリアスを削除します。ローカルの Zilliz CLI 設定ディレクトリも削除したい場合は、`--purge` を使用します。

## Synopsis\{#synopsis}

```bash
zilliz uninstall
[--purge]
[--yes]
```

## Options\{#options}

- **--purge** (*boolean*) -

    `~/.zilliz/`（認証情報、設定）も削除します。

- **--yes** (*boolean*) -

    確認プロンプトをスキップします。

## Example\{#example}

```bash
# Uninstall with confirmation
zilliz uninstall

# You can also use the zz alias
zz uninstall

# Uninstall without confirmation
zilliz uninstall --yes

# Uninstall and remove all config
zilliz uninstall --purge --yes
```
