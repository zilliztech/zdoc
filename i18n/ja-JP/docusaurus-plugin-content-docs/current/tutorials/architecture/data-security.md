---
title: "データセキュリティ | Cloud"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティは Zilliz Cloud の根幹を成す要素です。本書では、Zilliz Cloud がデータを包括的に保護するために実施している主要な対策とポリシーをまとめています。 | Cloud"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティは Zilliz Cloud にとって不可欠な要素です。本書では、Zilliz Cloud がデータを包括的に保護するために実施している主要な対策とポリシーについてまとめています。

## アカウントとプライバシーの保護\{#account-and-privacy-protection}

Zilliz Cloud は、登録の時点からユーザーデータを保護するために、次のことを実施しています。

- 高度な暗号化アルゴリズム（SHA-256、bcrypt）を使用しています。

- ユーザー名とパスワードを内部的に保存しないという厳格なポリシーを遵守しています。

## データの分離とレジデンシー\{#data-isolation-and-residency}

Zilliz Cloud は、クラスターに対して堅牢な分離と保護を提供します。

- **複数のデータレジデンシーオプション**：好みのクラウドプロバイダーとリージョンでクラスターを作成できます。詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

- **Dedicated 名前空間：** 各 Dedicated クラスターは、専用に調整されたネットワークポリシーを備えた分離された名前空間で動作します。

- **ストレージの分離：** データは、専用のオブジェクトストレージバケットに個別に保存されます。

- **個別の VPC またはサブネット：** **コントロールプレーン**（管理タスク）と**データプレーン**（運用処理）は、個別に分離された VPC またはサブネット上に配置されます。

## 認証\{#authentication}

Zilliz Cloud は、安全なユーザー認証のために OAuth0 を利用しています。

- シングルサインオン（SSO）をサポートしています。

- 多要素認証（MFA）をサポートしています。

- API キーとクラスター認証情報を通じてクラスターへのアクセスを提供します。

詳細については、[シングルサインオン（SSO）](./single-sign-on)、[MFA](./multi-factor-auth)、[クラスター認証情報](./cluster-credentials) を参照してください。

## アクセス制御\{#access-control}

きめ細かく、ロールベースのアクセス制御：

- 階層的な権限（組織、プロジェクト、クラスター）。

- 権限の割り当てを簡素化する事前定義済みのロール。

- コンソールでの直感的な操作と、アプリからのプログラムによるアクセスの両方が利用できます。

詳細については、アクセス制御の説明を参照してください。

## セキュアなネットワークアクセス\{#secure-network-access}

Zilliz Cloud は、次の方法でネットワーク通信を保護します：

- **コンソール IP 許可リスト：** 許可された IP 範囲（CIDR ブロック）によってコンソールへのアクセスを制限します。

- **クラスター IP 許可リスト**：IP 範囲によってクラスターのデータプレーンへのネットワークアクセスを制限します。

- **プライベートリンク：** VPC と Zilliz Cloud のコントロールプレーンとの間に、安全でプライベートな接続を確立します。

詳細については、[クラスター IP 許可リストの設定](./setup-whitelist)、[PrivateLink の設定（AWS）](./setup-a-private-link-aws)、[Private Service Connect の設定（GCP）](./setup-a-private-link-gcp)、[プライベートリンクの設定（Azure）](./setup-a-private-link-azure) を参照してください。

## データの暗号化\{#data-encryption}

### 転送中\{#in-transit}

- TLS 1.2 以降を使用する HTTPS/gRPC。

- AES-256 暗号化により、安全なデータ転送を確保します。

### 保存時\{#at-rest}

- Disk/Object Storage に保存されているデータは、AES-256（256 ビット Advanced Encryption Standard）暗号化アルゴリズムを使用して暗号化されます。

## 監査ログとモニタリング\{#audit-logging-and-monitoring}

監査ログを通じて可視性と説明責任を維持します：

- コントロールプレーンとデータプレーンの両方にわたるアクティビティを記録します。

- ログをストレージソリューションに直接ストリーミングします。

- ログ分析にはサードパーティのツールを活用します。

詳細については、[VectorDB 監査ログ](./audit-logs) を参照してください。

## データの整合性とバックアップ\{#data-integrity-and-backup}

データの可用性と復旧を確保します：

- 自動バックアップと手動バックアップのオプション。

- データ復元のためのリサイクルビン機能（保持期間あり）。

詳細については、[バックアップの作成](./create-backup) および [リサイクルビンの使用](./use-recycle-bin) を参照してください。

## 証明書と TLS\{#certificates-and-tls}

Zilliz Cloud は安全な接続を確保します：

- SSL 証明書に Let's Encrypt と AWS Certificate Manager を使用しています。

- 証明書は有効期限の 30 日前に自動更新されます（有効期間：90 日）。

- TLS 1.2 以降のみをサポートしています。

<Admonition type="info" title="Notes">

双方向 TLS（mTLS）は現在ご利用いただけません。

</Admonition>

## まとめ\{#summary}

Zilliz Cloud は常にデータセキュリティを最優先事項として位置づけており、包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーク、一貫した監査プラクティスを通じてデータセキュリティを重視することで、データの機密性、完全性、可用性を維持しています。
