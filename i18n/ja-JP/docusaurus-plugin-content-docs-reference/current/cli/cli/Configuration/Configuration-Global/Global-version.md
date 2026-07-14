---
title: "version | Cloud"
slug: /cli/cli/Global-version
sidebar_label: "version"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作は、インストールされている Zilliz CLI のバージョンを表示します。 | Cloud"
type: docx
token: MzJHdc3iSoGlKsx4D6TcoY5anOf
sidebar_position: 1
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN Search
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - バージョン
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# version

この操作は、インストールされている Zilliz CLI のバージョンを表示します。

## 説明\{#description}

インストールされている Zilliz CLI のバージョンを表示します。この例では、グローバル出力オプションを使用して JSON 出力を要求する方法も示しています。

## 構文\{#synopsis}

```bash
zilliz version
```

## オプション\{#options}

このコマンドには、コマンド固有のオプションはありません。

## 例\{#example}

```bash
zilliz version

# Example output
# zilliz 1.4.2

# The output format is a global CLI option. To get JSON output:
zilliz version -o json

# Example output
# {
#   "version": "1.4.2"
# }

# If a newer CLI is available, upgrade guidance is written to stderr:
# Tips: A new version of zilliz (1.4.2) is available. Run `zilliz upgrade` to update.
```

## シェル補完\{#shell-completion}

シェル補完は初回実行時に自動的に設定され、各アップグレード後にも再度設定されます。CLI は Bash、Zsh、Fish、Elvish、PowerShell などのインストール済みシェルを検出し、`zilliz` と `zz` の両方に対して補完を登録し、削除された `completion install` コマンドによって作成された設定を移行します。
