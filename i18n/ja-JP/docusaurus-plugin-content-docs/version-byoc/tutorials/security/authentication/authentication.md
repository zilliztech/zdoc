---
title: "認証 | BYOC"
slug: /authentication
sidebar_key: authentication
sidebar_label: "認証"
beta: FALSE
notebook: FALSE
description: "メールアカウントの管理、クラスター資格情報、多要素認証（MFA）対策について詳しく学びます。| BYOC"
type: origin
token: XiOsw8A3eibZInk1aJNceBqznLb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - 認証

---

import Admonition from '@theme/Admonition';


# 認証

メールアカウントの管理、クラスター資格情報、多要素認証 (MFA) 対策について詳しく学びます。

BYOC デプロイメントでは、API キーは Platform API (コントロールプレーン) リクエストの認証にのみ使用されます。データプレーンへのアクセス (Milvus 操作) には、クラスター資格情報 (ユーザー名/パスワード) を使用してください。BYOC において、Milvus SDK やクライアント接続に API キーを使用することはできません。



import DocCardList from '@theme/DocCardList';

<DocCardList />