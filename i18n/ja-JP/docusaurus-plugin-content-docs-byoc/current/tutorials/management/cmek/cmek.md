---
title: "Customer-Managed Encryption Keys | BYOC"
slug: /cmek
sidebar_label: "CMEK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、デフォルトで 256 ビット Advanced Encryption Standard (AES-256) アルゴリズムを使用し、ディスク/objectストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を満たすため、Zilliz Cloud ではクラウドプロバイダーの Key Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能を組み合わせ、追加のセキュリティ層を提供します。 | BYOC"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 13
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

Zilliz Cloud は、デフォルトで 256 ビット Advanced Encryption Standard (AES-256) アルゴリズムを使用し、ディスク/objectストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を満たすため、Zilliz Cloud ではクラウドプロバイダーの Key Management Service (KMS) と Zilliz Cloud の Customer-Managed Encryption Key (CMEK) 機能を組み合わせ、追加のセキュリティ層を提供します。

## 暗号化の仕組み\{#how-encryption-works}

Zilliz Cloud におけるカスタマーマネージド暗号化キーとは、クラウドプロバイダーの KMS によって作成され、クラスター内のデータを保護するために使用される暗号鍵です。KMS キーを Zilliz Cloud Business Critical プロジェクトに追加すると、ディスク、オブジェクトストレージ、およびメッセージキューに保存されているデータを暗号化できます。

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

上図のように、Zilliz Cloud はユーザーが提供した KMS キーを**ルートキー**として、暗号鍵を階層的に管理します。

クラスター内では、各データベースが**暗号化ゾーン (EZ)** に関連付けられており、Zilliz Cloud はゾーンごとに**暗号化ゾーンキー (EZK)** と呼ばれる暗号鍵を作成します。EZK を保護するため、Zilliz Cloud はルートキーを使用して EZK を暗号化し、その結果を保存します。

各データベースファイルに対して、Zilliz Cloud は**データ暗号化キー (DEK)** を生成してファイルを暗号化します。DEK を保護するため、Zilliz Cloud は EZK で DEK を暗号化し、暗号化された DEK とファイルをともに保存します。

ファイルへのアクセス時、Zilliz Cloud は暗号化された EZK を KMS に送信して復号し、復号した EZK で暗号化された DEK を復号し、さらに復号した DEK でファイルを復号します。

## 暗号化の範囲\{#encryption-scope}

以下の場所に保存されているすべてのデータ関連ファイルが暗号化されます。

- binlog やインデックスファイルを含むオブジェクトストレージ

- ローカルディスク

- メッセージキュー内の Insert/delete メッセージ

## 制限事項\{#limitations}

- カスタマーマネージド暗号化キーはプロジェクト単位で管理されます。

- 各プロジェクトには最大 20 個の一意なキーを追加できます。重複するキーを追加するとエラーになります。

- クラスターの暗号化後は、データベース間でのコレクションの移行はできません。

- KMS キーのクラウドプロバイダーとリージョンは、そのキーを使用する Zilliz Cloud クラスターのものと一致させる必要があります。

- Milvus v2.5.x 対応の既存クラスターで CMEK を有効にするには、データをバックアップし、Milvus v2.6.x 対応の新クラスターにリストアしてください。クラスターのアップグレードだけでは、アップグレード前のデータは暗号化されません。

## サポートされている KMS プロバイダー\{#supported-kms-providers}

以下の Key Management Service (KMS) プロバイダーを利用できます。



import DocCardList from '@theme/DocCardList';

<DocCardList />
