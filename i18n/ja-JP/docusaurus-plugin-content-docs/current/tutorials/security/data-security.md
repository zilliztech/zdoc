---
title: "データセキュリティ | Cloud"
slug: /data-security
sidebar_label: "データセキュリティ"
beta: FALSE
notebook: FALSE
description: "データセキュリティはZilliz Cloudにとって不可欠です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実施する主要な対策とポリシーをまとめています。 | Cloud"
type: origin
token: SIhBwKFJri4u2CkyD3ucnO7an3g
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data
  - security
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

---

import Admonition from '@theme/Admonition';


# データセキュリティ

データセキュリティはZilliz Cloudにとって不可欠です。このドキュメントでは、Zilliz Cloudがデータを包括的に保護するために実施する主要な対策とポリシーをまとめています。

## アカウントとプライバシーの保護{#account-and-privacy-protection}

Zilliz Cloudは、登録以降のユーザーデータを保護します:

- 高度な暗号化アルゴリズム（SHA-256、bcrypt）を使用しています。

- ユーザー名とパスワードの内部保存に対する厳格なポリシーに従うこと。

## BYOCにおけるVPCアイソレーション{#vpc-isolation-in-byoc}

Zillizは、BYOCソリューションでデータセキュリティを確保するために、VPCと当社の間に分離を実装しています。詳細については、[BYOCの概要](/docs/byoc/byoc-intro)の[セキュリティ保証](/docs/byoc/byoc-intro#security-assurance)を参照してください。

</include>

## データの分離と居住{#data-isolation-and-residency}

Zilliz Cloudは、クラスターに堅牢な分離と保護を提供します。

- **複数のデータレジデンスオプション**:お好みのクラウドプロバイダーやリージョンにクラスターを作成できます。詳細については、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。

- **専用名前空間:**各専用クラスターは、カスタマイズされたネットワークポリシーを持つ孤立した名前空間で動作します。

- **別々のストレージ:**データは専用のオブジェクトストレージバケットに別々に保存されます。

- **明確なVPCまたはサブネット:**コントロールプレーン**(管理タスク)と**データプレーン**(操作処理)は、別々の孤立したVPCまたはサブネットに存在します。

## 認証プロセス{#authentication}

Zilliz Cloudは、安全なユーザー認証のためにOAuth 0を利用しています。

- シングルサインオン（SSO）をサポートします。

- 多要素認証（MFA）をサポートします。

- APIキーとクラスター資格情報を介してクラスターアクセスを提供します。

詳細については、[認証プロセス](./authentication)を参照してください。

## アクセス制御{#access-control}

グラニュラーおよびロールベースのアクセス制御:

- 階層的な権限（組織、プロジェクト、クラスター）。

- 権限の割り当てを簡素化するための定義済みロール。

- コンソールでの直感的な操作とアプリからのプログラムによるアクセスの両方が利用可能です。

詳細については、[アクセス制御](./access-control)を参照してください。

## セキュアなネットワークアクセス{#secure-network-access}

Zilliz Cloudは、以下を通じてネットワークインタラクションを保護します:

- IPアローリスト:アクセスを制限するために許可されたIP範囲(CIDRブロック)を定義します。

- **プライベートリンク:**VPCとZilliz Cloudコントロールプレーンの間に安全でプライベートな接続を確立します。

詳細については、[ホワイトリストの設定](./setup-whitelist)と[プライベートエンドポイントを設定する](./setup-a-private-link)を参照してください。

## データの暗号化{#data-encryption}

### イン・トランジット{#in-transit}

- TLS 1.2+を使用したHTTPS/gRPC。

- AES-256暗号化により、安全なデータ転送が保証されます。

### 安静時に{#at-rest}

- ディスク/オブジェクトストレージに保存されたデータは、AES-256(256ビット高度暗号化標準)暗号化アルゴリズムを使用して暗号化されています

## 監査ログとモニタリング{#audit-logging-and-monitoring}

監査ログを通じて可視性と説明責任を維持する:

- コントロールプレーンとデータプレーンの両方でアクティビティを記録します。

- ストレージソリューションにログを直接ストリーミングします。

- ログ分析にはサードパーティのツールを活用してください。

詳細については、[監査する](./auditing)を参照してください。

## データの整合性とバックアップ{#data-integrity-and-backup}

データの可用性と復旧を確保する:

- 自動および手動のバックアップオプション。

- データ復元のためのごみ箱機能(定義された保持期間付き)。

詳細については、[バックアップと復元](./backup-and-restore)と[使用ごみ箱](./use-recycle-bin)を参照してください。

## 証明書とTLS{#certificates-and-tls}

Zilliz Cloudは安全な接続を確保します:

- SSL証明書にはLet's EncryptとAWS Certificate Managerを使用しています。

- 有効期限の30日前に証明書を自動更新します（有効期限: 90日）。

- TLS 1.2以上のみをサポートします。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、双方向TLS（mTLS）は利用できません。 </p>

</Admonition>

## 要約する{#summary}

Zilliz Cloudは常にデータセキュリティを最優先事項としています。包括的な暗号化、厳格な認証、堅牢なアクセス制御、プライベートネットワーク、一貫した監査プラクティスを通じてデータセキュリティを重視し、データの機密性、完全性、可用性を維持しています。