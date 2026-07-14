---
title: "FAQ: 認証 | BYOC"
slug: /faq-authentication
sidebar_label: "FAQ: 認証"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で認証を行う際に発生する可能性のある問題と、それに対応する解決策を説明します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 10
displayed_sidebar: default

---

# FAQ: 認証

このトピックでは、Zilliz Cloud で認証を行う際に発生する可能性のある問題と、それに対応する解決策を説明します。

## 目次

- [Zilliz Cloud クラスターへの接続に使用するパスワードを忘れた場合はどうすればよいですか？](#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster)

## FAQ




BYOC デプロイでは、データプレーン RESTful API エンドポイントを呼び出す際の認証トークンとして、対象クラスターのユーザー名とパスワードをコロンで区切った `username:password` の形式で使用します。

### Zilliz Cloud クラスターへの接続に使用するパスワードを忘れた場合はどうすればよいですか？\{#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster}

パスワードを忘れた場合は、パスワードをリセットできます。ただし、デフォルトユーザーのパスワードを忘れた場合は、新しいパスワードで新しいユーザーを作成できます。詳細については、[Cluster Credentials (Console)](./cluster-credentials) および [Cluster Credentials (Console)](./cluster-credentials) を参照してください。
