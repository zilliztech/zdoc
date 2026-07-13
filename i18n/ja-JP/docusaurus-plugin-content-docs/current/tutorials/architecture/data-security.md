---
title: "データセキュリティ | Cloud"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティは Zilliz Cloud に不可欠です。このドキュメントでは、Zilliz Cloud がデータを包括的に保護するために実装している主要な対策とポリシーをまとめています。 | Cloud"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティは Zilliz Cloud に不可欠です。このドキュメントでは、Zilliz Cloud がデータを包括的に保護するために実装している主要な対策とポリシーをまとめています。

## アカウントとプライバシー保護\{#account-and-privacy-protection}

Zilliz Cloud は、登録時点からユーザーデータを以下の方法で保護します。

- 高度な暗号化アルゴリズム（SHA-256、bcrypt）を使用します。

- ユーザー名とパスワードを内部保存しない厳格なポリシーを遵守します。

## データ分離とレジデンシー\{#data-isolation-and-residency}

Zilliz Cloud は、クラスターに対して堅牢な分離と保護を提供します。

- **複数のデータレジデンシーオプション**: 利用可能なクラウドプロバイダーとリージョンの中から希望する場所にクラスターを作成できます。詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)を参照してください。

- **専用名前空間:** 各専用クラスターは、カスタマイズされたネットワークポリシーを持つ分離された名前空間で動作します。

- **分離されたストレージ:** データは専用のオブジェクトストレージバケットに個別に保存されます。

- **個別の VPC またはサブネット:** **Control Plane**（管理タスク）と **Data Plane**（運用処理）は、分離された個別の VPC またはサブネットに配置されます。

## 認証\{#authentication}

Zilliz Cloud は、安全なユーザー認証に OAuth0 を利用します。

- シングルサインオン（SSO）をサポートします。

- 多要素認証（MFA）をサポートします。

- API キーとクラスター認証情報を通じてクラスターへのアクセスを提供します。

詳細については、[シングルサインオン（SSO）](./single-sign-on)、[MFA](./multi-factor-auth)、および [Cluster Credentials](./cluster-credentials) を参照してください。

## アクセス制御\{#access-control}

きめ細かいロールベースのアクセス制御:

- 階層型権限（組織、プロジェクト、クラスター）。

- 権限の割り当てを簡素化する事前定義ロール。

- コンソールでの直感的な操作と、アプリからのプログラムによるアクセスの両方が利用できます。

詳細については、[アクセス制御の説明](./access-control-overview)を参照してください。

## セキュアなネットワークアクセス\{#secure-network-access}

Zilliz Cloud は、以下を通じてネットワーク上のやり取りを保護します。

- **コンソール IP Allowlisting:** 許可された IP 範囲（CIDR ブロック）によってコンソールアクセスを制限します。

- **Cluster IP Allowlisting**: IP 範囲によってクラスターの Data Plane ネットワークアクセスを制限します。

- **Private Links:** VPC と Zilliz Cloud Control Plane の間に、安全なプライベート接続を確立します。

詳細については、[Cluster IP Allowlist の設定](./setup-whitelist)、[PrivateLink (AWS) の設定](./setup-a-private-link-aws)、[Private Service Connect (GCP) の設定](./setup-a-private-link-gcp)、および [Private Link (Azure) の設定](./setup-a-private-link-azure)を参照してください。

## データ暗号化\{#data-encryption}

### 転送中\{#in-transit}

- TLS 1.2+ による HTTPS/gRPC。

- AES-256 暗号化により、安全なデータ転送を保証します。

### 保管時\{#at-rest}

- Disk/Object Storage 上に保存されたデータは、AES-256（256-bit Advanced Encryption Standard ）暗号化アルゴリズムを使用して暗号化されます。

## 監査ログとモニタリング\{#audit-logging-and-monitoring}

監査ログを通じて可視性と説明責任を維持します。

- Control Plane と Data Plane の両方にわたるアクティビティを記録します。

- ログをストレージソリューションへ直接ストリーミングします。

- ログ分析にサードパーティツールを活用します。

詳細については、[VectorDB Audit Logs](./audit-logs) を参照してください。

## データ整合性とバックアップ\{#data-integrity-and-backup}

データの可用性と復旧を確保します。

- 自動および手動のバックアップオプション。

- データ復元のためのごみ箱機能（定義された保持期間付き）。

詳細については、[バックアップの作成](./create-backup)および[ごみ箱の使用](./use-recycle-bin)を参照してください。

## 証明書と TLS\{#certificates-and-tls}

Zilliz Cloud は安全な接続を保証します。

- SSL 証明書に Let's Encrypt と AWS Certificate Manager を使用します。

- 証明書を有効期限の 30 日前に自動更新します（有効期間: 90 日）。

- TLS 1.2 以上のみをサポートします。

<Admonition type="info" icon="📘" title="Notes">

双方向 TLS（mTLS）は現在利用できません。 

</Admonition>

## まとめ\{#summary}

Zilliz Cloud は常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーキング、一貫した監査プラクティスを通じてデータセキュリティを重視し、データの機密性、整合性、可用性を維持します。
