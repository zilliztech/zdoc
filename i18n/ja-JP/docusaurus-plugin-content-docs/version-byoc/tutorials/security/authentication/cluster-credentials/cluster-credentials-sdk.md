---
title: "クラスタの認証情報(コンソール) | BYOC"
slug: /cluster-credentials-sdk
sidebar_label: "クラスタの認証情報(コンソール)"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスター資格情報またはAPIキーを使用してあなたのアイデンティティを認証します。このガイドでは、クラスター資格情報を使用した認証について説明します。 | BYOC"
type: origin
token: EEZPwviJYiSOCukPZI6cvQiRnkA
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - sdk
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# クラスタの認証情報(コンソール)

Zilliz Cloudは、クラスター資格情報またはAPIキーを使用してあなたのアイデンティティを認証します。このガイドでは、クラスター資格情報を使用した認証について説明します。

クラスターの資格情報は、ユーザー名とパスワードのペア(`ユーザー:パスワード`)で構成されており、クラスターとのやり取りの要求の認証と承認に使用されます。

クラスタを設定する際、Zilliz Cloudはデフォルトのクラスタユーザー`db_admin`を`Admin`ロールで作成し、完全なクラスタアクセスを許可します。デフォルトユーザーのパスワードはクラスタ作成時に一度だけ表示されるため、メモして適切な場所に安全に保存することが重要です。

デフォルトの`db_admin`ユーザ以外にも、認証用の対応するパスワードを持つクラスタユーザ[を作成](./cluster-users#create-a-cluster-user)することもできます。

## パスワードのリセット{#reset-password}

ユーザーのパスワードを忘れた場合や漏洩の疑いがある場合は、パスワードをリセットできます。

![reset-cluster-user-password](/byoc/ja-JP/reset-cluster-user-password.png)