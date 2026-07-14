---
title: "Customer-Managed Encryption Keys | Cloud"
slug: /cmek
sidebar_label: "CMEK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はデフォルトで、保存データをディスク/オブジェクトストレージ上で 256-bit Advanced Encryption Standard (AES-256) アルゴリズムを使用して暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud はお客様のクラウドプロバイダーの Key Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能を組み合わせることで、追加のセキュリティレイヤーを提供します。 | Cloud"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Customer-Managed Encryption Keys

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud はデフォルトで、保存データをディスク/オブジェクトストレージ上で 256-bit Advanced Encryption Standard (AES-256) アルゴリズムを使用して暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud はお客様のクラウドプロバイダーの Key Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能を組み合わせることで、追加のセキュリティレイヤーを提供します。 

## 暗号化の仕組み\{#how-encryption-works}

Zilliz Cloud では、カスタマー管理暗号化キーはクラウドプロバイダーの KMS によって作成される暗号鍵であり、クラスター内のデータ保護に使用されます。Zilliz Cloud Business Critical プロジェクトに KMS キーを追加すると、それを使用してディスク、オブジェクトストレージ、およびメッセージキューに保存されるデータを暗号化できます。

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

上の図に示すように、Zilliz Cloud はユーザーが提供した KMS キーを**ルートキー**として使用し、階層的に暗号鍵を管理します。 

クラスター内では、各データベースは **Encryption Zone (EZ)** に関連付けられており、Zilliz Cloud は各ゾーンごとに **Encryption Zone Key (EZK)** と呼ばれる暗号鍵を作成します。EZK を保護するために、Zilliz Cloud はそれらをルートキーで暗号化し、暗号化された EZK を保存します。

各データベースファイルに対して、Zilliz Cloud は **Data Encryption Key (DEK)** を生成し、それを使用してファイルを暗号化します。DEK を保護するために、Zilliz Cloud はそれを EZK で暗号化し、暗号化された DEK と暗号化されたファイルの両方を保存します。

ファイルにアクセスする際、Zilliz Cloud は暗号化された EZK を KMS に送信して復号し、復号された EZK を使用して暗号化された DEK を復号し、さらに復号された DEK を使用してファイルを復号します。

## 暗号化の対象範囲\{#encryption-scope}

以下の場所に保存されるすべてのデータ関連ファイルは暗号化されます。

- binlog およびインデックスファイルを含むオブジェクトストレージ

- ローカルディスク

- メッセージキュー内の insert/delete メッセージ

## 制限事項\{#limitations}

- カスタマー管理暗号化キーはプロジェクトレベルで管理されます。

- 各プロジェクトには最大 20 個の一意なキーを追加できます。重複したキーを追加すると失敗します。

- クラスターが一度暗号化されると、データベース間でのコレクションの移行は禁止されます。

- KMS キーのクラウドプロバイダーとリージョンが、そのキーを使用する Zilliz Cloud クラスターのものと常に一致していることを確認してください。

- Milvus v2.5.x と互換性のある既存のクラスターで CMEK を有効にするには、データをバックアップし、Milvus v2.6.x と互換性のある新しいクラスターに復元してください。クラスターをアップグレードしても、アップグレード前のデータは暗号化されません。

<Admonition type="info" icon="📘" title="注意">

現在、CMEK は AWS リージョンでのみ利用可能です。その他のリージョンについては、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## サポートされている KMS プロバイダー\{#supported-kms-providers}

利用可能な key management service (KMS) プロバイダーは次のとおりです。



import DocCardList from '@theme/DocCardList';

<DocCardList />
