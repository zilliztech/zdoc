---
title: "データセキュリティ | BYOC"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティは Zilliz Cloud に不可欠な要素です。このドキュメントでは、Zilliz Cloud がデータを包括的に保護するために実装している主要な対策とポリシーを要約します。 | BYOC"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティは Zilliz Cloud に不可欠な要素です。このドキュメントでは、Zilliz Cloud がデータを包括的に保護するために実装している主要な対策とポリシーを要約します。

## アカウントとプライバシーの保護\{#account-and-privacy-protection}

Zilliz Cloud は、登録時点から次の方法でユーザーデータを保護します。

- 高度な暗号アルゴリズム（SHA-256、bcrypt）を使用します。

- ユーザー名とパスワードを内部保存しないという厳格なポリシーを順守します。

## BYOC における VPC 分離\{#vpc-isolation-in-byoc}

Zilliz は、BYOC ソリューションにおけるデータセキュリティを確保するために、お客様の VPC と当社の VPC の間で分離を実装しています。詳細については、[BYOC Overview](/docs/byoc/byoc-intro) の [Security assurance](/docs/byoc/byoc-intro#security-assurance) を参照してください。

## データ分離とデータレジデンシー\{#data-isolation-and-residency}

Zilliz Cloud は、お客様のクラスターに対して堅牢な分離と保護を提供します。

- **複数のデータレジデンシーオプション**: ご希望のクラウドプロバイダーとリージョンでクラスターを作成できます。

- **専用名前空間:** 各専用クラスターは、調整されたネットワークポリシーを備えた分離名前空間内で動作します。

- **分離されたストレージ:** データは専用のオブジェクトストレージバケットに個別に保存されます。

- **個別の VPC またはサブネット:** **Control Plane**（管理タスク）と **Data Plane**（運用処理）は、個別に分離された VPC またはサブネット内に存在します。

## 認証\{#authentication}

Zilliz Cloud は、安全なユーザー認証のために OAuth0 を利用しています。

- Single Sign-On（SSO）をサポートします。

- Multi-Factor Authentication（MFA）をサポートします。

- API キーとクラスター認証情報を通じてクラスターへのアクセスを提供します。

詳細については、[Single Sign-on (SSO)](./single-sign-on)、[MFA](./multi-factor-auth)、および [Cluster Credentials](./cluster-credentials) を参照してください。

## アクセス制御\{#access-control}

きめ細かなロールベースのアクセス制御:

- 階層型の権限（組織、プロジェクト、クラスター）。

- 権限割り当てを簡素化する事前定義済みロール。

- コンソールでの直感的な操作と、アプリからのプログラムによるアクセスの両方を利用できます。

詳細については、[Access Control Explained](./access-control-overview) を参照してください。

## セキュアなネットワークアクセス\{#secure-network-access}

Zilliz Cloud は、次の方法でネットワーク上のやり取りを保護します。

- **Console IP Allowlisting:** 許可された IP 範囲（CIDR ブロック）によってコンソールアクセスを制限します。

- **Private Links:** お客様の VPC と Zilliz Cloud control plane の間に安全なプライベート接続を確立します。

## データ暗号化\{#data-encryption}

### 転送中\{#in-transit}

- TLS 1.2+ を使用した HTTPS/gRPC。

- AES-256 暗号化により、安全なデータ転送を実現します。

### 保存時\{#at-rest}

- Disk/Object Storage に保存されるデータは、AES-256（256-bit Advanced Encryption Standard）暗号アルゴリズムを使用して暗号化されます。

## 監査ログとモニタリング\{#audit-logging-and-monitoring}

監査ログによって可視性と説明責任を維持します。

- control-plane と data-plane の両方にわたるアクティビティを記録します。

- ログをお客様のストレージソリューションに直接ストリーミングします。

- ログ分析にサードパーティツールを活用できます。

詳細については、[VectorDB Audit Logs](./audit-logs) を参照してください。

## データ整合性とバックアップ\{#data-integrity-and-backup}

データの可用性と復旧を確保します。

- 自動および手動のバックアップオプション。

- データ復元のためのごみ箱機能（保持期間の定義あり）。

詳細については、[Create Backup](./create-backup) および [Use Recycle Bin](./use-recycle-bin) を参照してください。

## 証明書と TLS\{#certificates-and-tls}

Zilliz Cloud は安全な接続を確保します。

- SSL 証明書に Let's Encrypt と AWS Certificate Manager を使用します。

- 有効期限の 30 日前に証明書を自動更新します（有効期間: 90 日）。

- TLS 1.2 以上のみをサポートします。

<Admonition type="info" icon="📘" title="注意">

双方向 TLS（mTLS）は現在利用できません。 

</Admonition>

## まとめ\{#summary}

Zilliz Cloud は、常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーキング、一貫した監査運用を通じてデータセキュリティを重視し、データの機密性、完全性、可用性を維持します。
