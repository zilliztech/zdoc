---
title: "Customer-Managed Encryption Keys | BYOC"
slug: /cmek
sidebar_label: "CMEK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、デフォルトで 256-bit Advanced Encryption Standard (AES-256) アルゴリズムを使用して、ディスク/オブジェクトストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud は、お客様のクラウドプロバイダーの Key Management Service (KMS) を Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能と組み合わせて活用することで、追加のセキュリティレイヤーを提供します。 | BYOC"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Customer-Managed Encryption Keys

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud は、デフォルトで 256-bit Advanced Encryption Standard (AES-256) アルゴリズムを使用して、ディスク/オブジェクトストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud は、お客様のクラウドプロバイダーの Key Management Service (KMS) を Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能と組み合わせて活用することで、追加のセキュリティレイヤーを提供します。 

## 暗号化の仕組み\{#how-encryption-works}

Zilliz Cloud では、customer-managed encryption key はクラウドプロバイダーの KMS によって作成される暗号鍵であり、クラスター内のデータを保護するために使用されます。KMS キーを Zilliz Cloud Business Critical プロジェクトに追加すると、それを使用して、ディスク、オブジェクトストレージ、およびメッセージキューに保存されたデータを暗号化できます。

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

上の図に示すように、Zilliz Cloud はユーザーが提供した KMS キーを **root key** として使用し、階層的に暗号鍵を管理します。 

クラスター内では、各データベースは **Encryption Zone (EZ)** に関連付けられており、Zilliz Cloud は各ゾーンごとに **Encryption Zone Key (EZK)** と呼ばれる暗号鍵を作成します。EZK を保護するために、Zilliz Cloud は root key を使用して EZK を暗号化し、暗号化された EZK を保存します。

各データベースファイルについて、Zilliz Cloud は **Data Encryption Key (DEK)** を生成し、それを使用してファイルを暗号化します。DEK を保護するために、Zilliz Cloud は EZK で DEK を暗号化し、暗号化された DEK と暗号化されたファイルの両方を保存します。

ファイルにアクセスする際、Zilliz Cloud は暗号化された EZK を復号のために KMS に送信し、復号された EZK を使用して暗号化された DEK を復号し、復号された DEK を使用してファイルを復号します。

## 暗号化の対象範囲\{#encryption-scope}

以下の場所に保存される、データに関連するすべてのファイルが暗号化されます。

- binlog およびインデックスファイルを含むオブジェクトストレージ

- ローカルディスク

- メッセージキュー内の insert/delete メッセージ

## 制限事項\{#limitations}

- Customer-managed encryption key はプロジェクトレベルで管理されます。

- 各プロジェクトには最大 20 個の一意のキーを追加できます。重複するキーを追加すると失敗します。

- クラスターが一度暗号化されると、データベース間でコレクションを移行することは禁止されます。

- KMS キーのクラウドプロバイダーとリージョンが、そのキーを使用する Zilliz Cloud クラスターのクラウドプロバイダーとリージョンに一致していることを常に確認してください。

- Milvus v2.5.x と互換性のある既存のクラスターで CMEK を有効にするには、データをバックアップし、Milvus v2.6.x と互換性のある新しいクラスターに復元してください。クラスターをアップグレードしても、アップグレード前のデータは暗号化されません。

## サポートされている KMS プロバイダー\{#supported-kms-providers}

以下の Key Management Service (KMS) プロバイダーを利用できます。



import DocCardList from '@theme/DocCardList';

<DocCardList />
