---
title: "login | Cloud"
slug: /cli/cli/Auth-login
sidebar_label: "login"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作は CLI を Zilliz Cloud で認証し、後続のコマンドのためにログイン状態を保存します。対話的なローカル利用にはブラウザログインを、スクリプトまたはヘッドレス環境には API-key ログインを使用し、Zilliz Cloud China サイトにログインする際は `--cn` と `--api-key` を併用してください。 | Cloud"
type: docx
token: GaWqdekPvokCUtxBjRTcpNxInXg
sidebar_position: 1
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースはどのように動作するか
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - ログイン
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# login

この操作は CLI を Zilliz Cloud で認証し、後続のコマンドのためにログイン状態を保存します。対話的なローカル利用にはブラウザログインを、スクリプトまたはヘッドレス環境には API-key ログインを使用し、Zilliz Cloud China サイトにログインする際は `--cn` と `--api-key` を併用してください。

## Description\{#description}

CLI を Zilliz Cloud で認証し、後続のコマンドのためにログイン状態を保存します。対話的なローカル利用にはブラウザログインを、スクリプトまたはヘッドレス環境には API-key ログインを使用します。

## Synopsis\{#synopsis}

```bash
zilliz login
[--api-key <value>]
[--no-browser]
[--cn]
```

## Options\{#options}

- **--api-key** (*string*) -

    ブラウザ OAuth の代わりに API key で認証します。値を指定せずに指定した場合は、対話的に入力を求めます。

- **--no-browser** (*boolean*) -

    ブラウザを開かずに device-code フローを使用します。

- **--cn** (*boolean*) -

    Zilliz Cloud China サイトに対して認証します。China サイトでは API-key ログインを使用するため、`--cn` と `--api-key` を併用してください。

## Example\{#example}

```bash
# Browser OAuth login
zilliz login

# Login with API key
zilliz login --api-key sk-xxxxxxxxxxxx

# Login to the Zilliz Cloud China site
zilliz login --cn --api-key sk-xxxxxxxxxxxx
```
