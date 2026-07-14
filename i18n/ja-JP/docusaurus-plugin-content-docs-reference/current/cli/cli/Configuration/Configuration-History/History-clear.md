---
title: "clear | Cloud"
slug: /cli/cli/History-clear
sidebar_label: "clear"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はローカルのコマンド履歴ファイルを切り詰めます。truncate-then-remove シーケンス中、スクリプトは排他的ロックを保持するため、CLI の同時実行によって追加済みレコードが失われることはありません。 | Cloud"
type: docx
token: I7fKd8mPNoKYEAxmKpxcgaH8nsb
sidebar_position: 1
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - clear
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# clear

この操作はローカルのコマンド履歴ファイルを切り詰めます。truncate-then-remove シーケンス中、スクリプトは排他的ロックを保持するため、CLI の同時実行によって追加済みレコードが失われることはありません。

## Synopsis\{#synopsis}

```bash
zilliz history clear
[--force]
```

## Options\{#options}

- **--force** (*boolean*) -

    対話式の `[y/N]` 確認プロンプトをスキップします。非対話型スクリプトでは必須です。

## Example\{#example}

```bash
# Interactive (asks for confirmation)
zilliz history clear

# Non-interactive
zilliz history clear --force
```
