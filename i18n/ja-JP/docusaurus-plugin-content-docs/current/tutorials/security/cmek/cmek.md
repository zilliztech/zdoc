---
title: "カスタマー管理暗号化キー | Cloud"
slug: /cmek
sidebar_key: cmek
sidebar_label: "CMEK"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、デフォルトでディスクやオブジェクトストレージ上の保存データを 256 ビット Advanced Encryption Standard (AES-256) アルゴリズムを使用して暗号化します。最高レベルのセキュリティ要件を持つ顧客向けに、Zilliz Cloud は顧客のクラウドプロバイダーの Key Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能を組み合わせることで、追加のセキュリティ層を提供します。 | Cloud"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cmek
  - カスタマー管理キー

---

import Admonition from '@theme/Admonition';


# カスタマー管理暗号化キー

Zilliz Cloud は、デフォルトでディスク/オブジェクトストレージ上のデータを 256 ビット Advanced Encryption Standard (AES-256) アルゴリズムを使用して暗号化します。最高レベルのセキュリティ要件を持つ顧客向けに、Zilliz Cloud は顧客のクラウドプロバイダーの キー Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption キー (CMEK) 機能を組み合わせることで、追加のセキュリティ層を提供します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 暗号化の仕組み\{#how-encryption-works}

Zilliz Cloud において、カスタマー管理暗号化キーとは、お客様のクラウドプロバイダーの KMS によって作成され、クラスター内のデータを保護するために使用される暗号鍵です。KMS キーを Zilliz Cloud ビジネスクリティカル プロジェクトに追加した後、ディスク上、オブジェクトストレージ内、およびメッセージキューに保存されたデータの暗号化にこのキーを使用できます。

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

上記の図に示すように、Zilliz Cloud は階層的に暗号化キーを管理しており、ユーザーが提供する KMS キーを**ルートキー**として使用します。

クラスター内では、各データベースが**暗号化ゾーン (EZ)** に関連付けられており、Zilliz Cloud は各ゾーンに対して暗号化キーを作成します。これを**暗号化ゾーンキー (EZK)** と呼びます。EZK を保護するため、Zilliz Cloud はこれらをルートキーで暗号化し、暗号化された EZK を保存します。

各データベースファイルに対して、Zilliz Cloud は**データ暗号化キー (DEK)** を生成し、これを使用してファイルを暗号化します。DEK を保護するため、Zilliz Cloud はこれを EZK で暗号化し、暗号化された DEK と暗号化されたファイルの両方を保存します。

ファイルにアクセスする際、Zilliz Cloud は暗号化された EZK を復号するために KMS に送信し、復号された EZK を使用して暗号化された DEK を復号し、さらに復号された DEK を使用してファイルを復号します。

## 暗号化範囲\{#encryption-scope}

以下の場所に保存されるすべてのデータ関連ファイルが暗号化されます：

- オブジェクトストレージ（binlog およびインデックスファイルを含む）、
- ローカルディスク、および
- メッセージキュー内の挿入/削除メッセージ。

## 制限事項\{#limitations}

- カスタマー管理暗号化キーはプロジェクトレベルで管理されます。
- 各プロジェクトに最大 20 個の固有のキーを追加できます。重複したキーを追加すると失敗します。
- クラスターが一度暗号化されると、データベース間でのコレクションの移行は禁止されます。
- KMS キーのクラウドプロバイダーとリージョンが、そのキーを使用する Zilliz Cloud クラスターのそれらと一致していることを常に確認してください。
- Milvus v2.5.x と互換性のある既存のクラスターで CMEK を有効にするには、データをバックアップし、Milvus v2.6.x と互換性のある新しいクラスターにリストアする必要があります。クラスターのアップグレードでは、アップグレード以前のデータは暗号化されません。

<Admonition type="info" icon="📘" title="Notes">

<p>現在、CMEK は AWS リージョンでのみ利用可能です。他のリージョンについては、<a href="https://support.zilliz.com/hc/en-us">お問い合わせください</a>。</p>

</Admonition>

## サポートされている KMS プロバイダー\{#supported-kms-providers}

以下の キー Management Service (KMS) プロバイダーが利用可能です：



import DocCardList from '@theme/DocCardList';

<DocCardList />