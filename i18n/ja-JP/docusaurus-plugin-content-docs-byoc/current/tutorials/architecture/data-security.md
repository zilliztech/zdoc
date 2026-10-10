---
title: "データセキュリティ | BYOC"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティは Zilliz Cloud に不可欠です。このドキュメントでは、Zilliz Cloud がお客様のデータを包括的に保護するために実施している主要な対策とポリシーをまとめています。 | BYOC"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティは Zilliz Cloud に不可欠です。このドキュメントでは、Zilliz Cloud がお客様のデータを包括的に保護するために実施している主要な対策とポリシーについてまとめます。

## アカウントとプライバシーの保護\{#account-and-privacy-protection}

Zilliz Cloud は、登録時点からユーザーデータを次の方法で保護します。

- 高度な暗号化アルゴリズム（SHA-256、bcrypt）を使用します。

- ユーザー名とパスワードを内部に保存しない厳格なポリシーを遵守します。

## BYOC における VPC 分離\{#vpc-isolation-in-byoc}

Zilliz は、BYOC ソリューションにおけるデータセキュリティを確保するため、お客様の VPC と当社の VPC の間に分離を実装しています。詳細については、[BYOC の概要](/docs/byoc/byoc-intro) の [セキュリティ保証](/docs/byoc/byoc-intro#security-assurance) を参照してください。

## データの分離とレジデンシー\{#data-isolation-and-residency}

Zilliz Cloud は、お客様のクラスターに対して堅牢な分離と保護を提供します。

- **複数のデータレジデンシーオプション**: お好みのクラウドプロバイダーとリージョンにクラスターを作成できます。

- **Dedicated ネームスペース:** 各 Dedicated クラスターは、カスタマイズされたネットワークポリシーを備えた分離されたネームスペースで動作します。

- **ストレージの分離:** データは専用のオブジェクトストレージバケットに個別に保存されます。

- **個別の VPC またはサブネット:** **Control Plane**（管理タスク）と **Data Plane**（運用処理）は、分離された個別の VPC またはサブネットに配置されます。

## 認証\{#authentication}

Zilliz Cloud は、安全なユーザー認証に OAuth0 を利用しています。

- シングルサインオン（SSO）をサポートします。

- 多要素認証（MFA）をサポートします。

- API キーとクラスター認証情報を通じてクラスターへのアクセスを提供します。

詳細については、[シングルサインオン（SSO）](./single-sign-on)、[MFA](./multi-factor-auth)、[クラスター認証情報](./cluster-credentials) を参照してください。

## アクセス制御\{#access-control}

きめ細かなロールベースのアクセス制御:

- 階層的な権限（組織、プロジェクト、クラスター）。

- 権限の割り当てを簡素化する定義済みのロール。

- コンソールでの直感的な操作と、アプリからのプログラムによるアクセスの両方を利用できます。

詳細については、Access Control Explained を参照してください。

## 安全なネットワークアクセス\{#secure-network-access}

Zilliz Cloud は、次の方法でネットワーク通信を保護します。

- **コンソール IP の許可リスト:** 許可された IP 範囲（CIDR ブロック）によってコンソールへのアクセスを制限します。

- **プライベートリンク:** お客様の VPC と Zilliz Cloud のコントロールプレーンとの間に、安全でプライベートな接続を確立します。

## データの暗号化\{#data-encryption}

### 転送中\{#in-transit}

- TLS 1.2 以降を使用した HTTPS/gRPC。

- AES-256 暗号化により、安全なデータ転送を確保します。

### 保存時\{#at-rest}

- Disk/Object Storage に保存されたデータは、AES-256（256 ビット Advanced Encryption Standard）暗号化アルゴリズムを使用して暗号化されます。

## 監査ログと監視\{#audit-logging-and-monitoring}

監査ログを通じて可視性と説明責任を維持します。

- コントロールプレーンとデータプレーンの両方にわたるアクティビティを記録します。

- ログをストレージソリューションに直接ストリーミングします。

- ログ分析にサードパーティのツールを活用します。

詳細については、[VectorDB 監査ログ](./audit-logs) を参照してください。

## データの整合性とバックアップ\{#data-integrity-and-backup}

データの可用性と復元を確保します。

- 自動および手動のバックアップオプション。

- データ復元のためのリサイクルビン機能（定義された保持期間あり）。

詳細については、[バックアップの作成](./create-backup) と [リサイクルビンの使用](./use-recycle-bin) を参照してください。

## 証明書と TLS\{#certificates-and-tls}

Zilliz Cloud は、安全な接続を確保します。

- SSL 証明書に Let's Encrypt と AWS Certificate Manager を使用します。

- 有効期限の 30 日前に証明書を自動更新します（有効期間：90 日）。

- TLS 1.2 以降のみをサポートします。

<Admonition type="info" title="Notes">

双方向 TLS（mTLS）は現在利用できません。

</Admonition>

## まとめ\{#summary}

Zilliz Cloud は、常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーク、一貫した監査プラクティスを通じてデータセキュリティを重視し、データの機密性、整合性、可用性を維持します。
