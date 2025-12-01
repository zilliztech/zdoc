---
title: "データセキュリティ | Cloud"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データセキュリティはZilliz Cloudにとって不可欠です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実装している主要な対策とポリシーをまとめています。 | Cloud"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - データ
  - セキュリティ
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティはZilliz Cloudにとって不可欠です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実装している主要な対策とポリシーをまとめています。

## アカウントとプライバシー保護\{#account-and-privacy-protection}

Zilliz Cloudは、登録時からユーザーのデータを保護します：

- 高度な暗号アルゴリズム（SHA-256、bcrypt）を使用。

- ユーザー名とパスワードの内部保存に対する厳格なポリシーを遵守。

## データ分離とレジデンシー\{#data-isolation-and-residency}

Zilliz Cloudは、クラスターの堅牢な分離と保護を提供します：

- **複数のデータレジデンスオプション**： 好きなクラウドプロバイダーとリージョンでクラスターを作成できます。詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)を参照してください。

- **専用の名前空間**： 各みの専用クラスターは、カスタマイズされたネットワークポリシーを持つ分離された名前空間で動作します。

- **分離したストレージ**： データは専用のオブジェクトストレージバケットに別々に保存されます。

- **別々のVPCまたはサブネット**： **コントロールプレーン**（管理タスク）と**データプレーン**（運用処理）は、別々の分離されたVPCまたはサブネットに存在します。

## 認証\{#authentication}

Zilliz Cloudは、OAuth0を使用して安全なユーザー認証を行います：

- シングルサインオン（SSO）をサポート。

- マルチファクター認証（MFA）をサポート。

- APIキーおよびクラスターロredentialsを通じたクラスターへのアクセスを提供。

詳細については、[認証](./authentication)を参照してください。

## アクセス制御\{#access-control}

きめ細かくロールベースのアクセス制御：

- ヒ層的な権限（組織、プロジェクト、クラスター）。

- 権限割り当てを簡略化するための事前定義ロール。

- コンソールでの直感的な操作と、アプリからのプログラムによるアクセスの両方を利用できます。

詳細については、[アクセス制御](./access-control)を参照してください。

## セキュアなネットワークアクセス\{#secure-network-access}

Zilliz Cloudは、ネットワーク相互作用を以下のように保護します：

- **IPホワイトリスト**： 許可されたIP範囲（CIDRブロック）を定義してアクセスを制限。

- **プライベートリンク**： VPCとZilliz Cloudコントロールプレーンの間に安全なプライベート接続を確立。

詳細については、[ホワイトリストの設定](./setup-whitelist)および[プライベートエンドポイントの設定](./setup-a-private-link)を参照してください。

## データ暗号化\{#data-encryption}

### 転送中\{#in-transit}

- TLS 1.2以降を使用したHTTPS/gRPC。

- AES-256暗号化により安全なデータ転送を保証。

### 保存時\{#at-rest}

- ディスク/オブジェクトストレージに保存されたデータは、AES-256（256ビット高度暗号化標準）暗号化アルゴリズムを使用して暗号化されます。

## 監査ログとモニタリング\{#audit-logging-and-monitoring}

監査ログを通じて可視性と説明責任を維持：

- コントロールプレーンとデータプレーンの両方のアクティビティを記録。

- ロッグストレージソリューションに直接ログをストリーミング。

- ロッグ分析のためにサードパーティツールを利用。

詳細については、[監査](./auditing)を参照してください。

## データ完全性とバックアップ\{#data-integrity-and-backup}

データ可用性と回復を保証：

- 自動および手動バックアップオプション。

- データ復元のためのリサイクルビン機能（定義された保持期間付き）。

詳細については、[バックアップと復元](./backup-and-restore)および[リサイクルビンの使用](./use-recycle-bin)を参照してください。

## 証明書とTLS\{#certificates-and-tls}

Zilliz Cloudは、安全な接続を保証します：

- SSL証明書にLet's EncryptおよびAWS証明書マネージャーを使用。

- 切れ日前に30日間隔で証明書を自動更新（有効期間：90日）。

- TLS 1.2以上のみをサポート。

<Admonition type="info" icon="📘" title="ノート">

<p>相互TLS（mTLS）は現在利用できません。</p>

</Admonition>

## まとめ\{#summary}

Zilliz Cloudは常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーク、および一貫した監査手法を通じてデータセキュリティを強調し、データの機密性、完全性、可用性を維持しています。