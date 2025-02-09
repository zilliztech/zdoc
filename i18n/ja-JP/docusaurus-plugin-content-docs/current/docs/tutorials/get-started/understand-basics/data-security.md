---
title: "データセキュリティ | Cloud"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
notebook: FALSE
description: "クラウドプラットフォームにおいて、データセキュリティは重要な要素であり、Zilliz Cloudも例外ではありません。Zilliz Cloudは、データを保護するために、承認と認証、ネットワークの分離、暗号化、バックアップと復元など、様々な側面で堅牢な対策を提供しています。 | Cloud"
type: origin
token: Qc9BwoPsSipgRukNcpUcvWUMnlV
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data
  - security
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';


# データセキュリティ

クラウドプラットフォームにおいて、データセキュリティは重要な要素であり、Zilliz Cloudも例外ではありません。Zilliz Cloudは、データを保護するために、承認と認証、ネットワークの分離、暗号化、バックアップと復元など、様々な側面で堅牢な対策を提供しています。

このトピックでは、Zilliz Cloudが各段階でデータを保護する方法の概要を説明します。

## プライバシー保護付きのアカウントを登録する{#registering-an-account-with-privacy-protection}{#registering-an-account-with-privacy-protection}

Zilliz Cloudは、アカウント登録の瞬間からデータセキュリティを優先します。

ウェブコンソールでアカウントを登録する際、Zilliz Cloudはユーザーデータを保護するために暗号化技術を組み合わせて使用します。[SHA-256](https://en.wikipedia.org/wiki/SHA-2)や[bcrypt](https://en.wikipedia.org/wiki/Bcrypt)などの堅牢な暗号化アルゴリズムを使用してアカウント情報を暗号化します。

さらに、Zilliz Cloudは、システム内にユーザー名とパスワードを保存しないという厳格なポリシーに従っています。このアプローチにより、万が一セキュリティ侵害が発生した場合でも、機密アカウント情報は安全に保たれます。

## セキュリティを使用したクラスタの起動{#starting-a-cluster-with-security}{#starting-a-cluster-with-security}

アカウントが準備できたら、Zilliz Cloudコンソールにログインして、セキュリティを有効にしたクラスタを作成して実行できます。

Zilliz Cloudプラットフォームは、コントロールプレーンとカーネルプレーンの2つのプレーンで構成されています。これらのプレーンは、分離されたネットワークを持つ別々のセキュリティグループに存在しています。このような設計により、データセキュリティが強化されます。

補足として、Zilliz Cloudは、ホワイトリスト、プライベートリンク、アクセス制御、クラスタとの内部および外部通信の保護などのセキュリティ設定をサポートしています。

### 認証プロセス{#authentication}{#authentication}

Zilliz CloudはOAuth 2プロトコルを使用して認証を実装しており、ユーザーがクラスターリソースにアクセスまたは実行する前に、クラスター資格情報(トークン)を提供して身元を証明する必要があります。クラスター資格情報は通常、ユーザー名とパスワードのペアまたはAPIキーで構成されています。

詳細については、[クラスタの認証情報(コンソール)](./cluster-credentials-sdk)および[APIキー](./manage-api-keys)を参照してください。

### アクセス制御{#access-control}{#access-control}

多くの場合、ユーザーの認証だけでは十分ではありません。また、どのユーザーがアクセス可能で、どの範囲の操作を実行できるかを制御する方法も必要です。

これらのニーズを満たすために、Zilliz Cloudはアクセス制御を可能にし、ユーザーの権限を制限し、特定のリソースにのみアクセスを許可することができます。このメカニズムにより、ユーザーはクラスターリソースと操作の権限範囲を決定する1つ以上の役割を付与されることができます。これにより、定義された権限範囲を超えた不正アクセスを防止できます。

詳しくは[アクセス制御](./access-control)をご覧ください。

。