---
title: "FAQ: 認証 | BYOC"
slug: /faq-authentication
sidebar_label: "FAQ: 認証"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で認証を行う際に発生する可能性のある問題と、それに対応する解決策を示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 10
displayed_sidebar: default

---

# FAQ: 認証

このトピックでは、Zilliz Cloud で認証を行う際に発生する可能性のある問題と、それに対応する解決策を示します。

## 目次

- [Zilliz Cloud クラスターへの接続に使用するパスワードを忘れた場合はどうすればよいですか？](#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster)
- [Zilliz Cloud コンソールからサインアウトされたのはなぜですか？](#why-was-i-signed-out-of-the-zilliz-cloud-console)

## FAQ




BYOC デプロイでは、データプレーン RESTful API エンドポイントを呼び出す際の認証トークンとして、対象クラスターのユーザー名とパスワードをコロンで区切った `username:password` の形式を使用します。

### Zilliz Cloud クラスターへの接続に使用するパスワードを忘れた場合はどうすればよいですか？\{#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster}

パスワードを忘れた場合は、パスワードをリセットできます。ただし、デフォルトユーザーのパスワードを忘れた場合は、新しいパスワードで新しいユーザーを作成できます。詳細については、[クラスター Credentials (Console)](./cluster-credentials) および [クラスター Credentials (Console)](./cluster-credentials) を参照してください。

### Zilliz Cloud コンソールからサインアウトされたのはなぜですか？\{#why-was-i-signed-out-of-the-zilliz-cloud-console}

セキュリティのため、Zilliz Cloud コンソールのセッションは、6 時間操作がないと失効します。セッションが失効した場合は、再度サインインするとコンソールを引き続き使用できます。詳細については、[Console sessions](./email-accounts#console-session) を参照してください。
