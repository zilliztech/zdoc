---
title: "データセキュリティ | BYOC"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティはZilliz Cloudの核となる要素です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実装する主要な対策とポリシーをまとめています。 | BYOC"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - データ
  - セキュリティ
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティはZilliz Cloudの核となる要素です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実装する主要な対策とポリシーをまとめています。

## アカウントとプライバシーの保護\{#account-and-privacy-protection}

Zilliz Cloudは、登録時からユーザーのデータを保護するため以下の対策を実施：

- 先進的な暗号アルゴリズム（SHA-256、bcrypt）を使用。

- ユーザー名とパスワードの内部ストレージに対する厳格なポリシーを遵守。

## BYOCにおけるVPC分離\{#vpc-isolation-in-byoc}

Zillizは、BYOCソリューションにおいてお客様のVPCと当社のVPCの間で分離を実装し、データセキュリティを確保しています。詳細については、[BYOC概要](/docs/byoc/byoc-intro)の[セキュリティ保証](/docs/byoc/byoc-intro#security-assurance)を参照してください。

## データ分離とレジデンシー\{#data-isolation-and-residency}

Zilliz Cloudは、クラスターのために堅牢な分離と保護を提供します：

- **複数のデータレジデンスオプション**：希望のクラウドプロバイダーおよびリージョンでクラスターを作成できます。

- **専用ネームスペース**：各専用クラスターは、カスタマイズされたネットワークポリシーを持つ分離されたネームスペースで動作します。

- **個別のストレージ**：データは専用のオブジェクトストレージバケットに個別に保存されます。

- **個別のVPCまたはサブネット**：**コントロールプレーン**（管理タスク）と**データプレーン**（運用処理）は、個別に分離されたVPCまたはサブネットに配置されます。

## 認証\{#authentication}

Zilliz Cloudは、安全なユーザー認証のためにOAuth0を使用：

- シングルサインオン（SSO）をサポート。

- マルチファクタ認証（MFA）をサポート。

- APIキーおよびクラスタークレデンシャルを通じてクラスターへのアクセスを提供。

詳細については、[認証](./authentication)を参照してください。

## アクセス制御\{#access-control}

粒度の高いロールベースのアクセス制御：

- 階層的な権限（組織、プロジェクト、クラスター）。

- 権限割り当てを簡略化するための事前定義されたロール。

- コンソール上での直感的な操作と、アプリからのプログラムによるアクセスの両方を提供。

詳細については、[アクセス制御](./access-control)を参照してください。

## 安全なネットワークアクセス\{#secure-network-access}

Zilliz Cloudは、ネットワーク通信を以下の手段で保護：

- **IP許可リスト**：アクセスを制限するために許可されたIP範囲（CIDRブロック）を定義。

- **プライベートリンク**：お客様のVPCとZilliz Cloudコントロールプレーンとの間に安全でプライベートな接続を確立。

## データ暗号化\{#data-encryption}

### 送信中\{#in-transit}

- TLS 1.2以上を使用したHTTPS/gRPC。

- AES-256暗号化により安全なデータ転送を確保。

### 保存時\{#at-rest}

- ディスク/オブジェクトストレージに保存されるデータは、AES-256（256ビット高度暗号化標準）暗号化アルゴリズムを使用して暗号化されます。

## 監査ログとモニタリング\{#audit-logging-and-monitoring}

監査ログを通して可視性と説明責任を維持：

- コントロールプレーンとデータプレーンの両方にわたるアクティビティを記録。

- ログを直接お客様のストレージソリューションにストリーミング。

- ログ分析のためにサードパーティツールを活用。

詳細については、[監査](./auditing)を参照してください。

## データ整合性とバックアップ\{#data-integrity-and-backup}

データ可用性と回復を確保：

- 自動および手動のバックアップオプション。

- データ復元のためのごみ箱機能（定義された保持期間あり）。

詳細については、[バックアップとリストア](./backup-and-restore)および[ごみ箱の利用](./use-recycle-bin)を参照してください。

## 証明書とTLS\{#certificates-and-tls}

Zilliz Cloudは安全な接続を確保：

- Let's EncryptおよびAWS Certificate ManagerをSSL証明書に使用。

- 有効期限の30日前に証明書を自動更新（有効期間：90日）。

- TLS 1.2以上のみをサポート。

<Admonition type="info" icon="📘" title="注意">

<p>双方向TLS（mTLS）は現在ご利用いただけません。</p>

</Admonition>

## まとめ\{#summary}

Zilliz Cloudは常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーキング、および一貫した監査実践を通じてデータセキュリティを重視し、データの機密性、完全性、可用性を維持しています。