---
title: "カスタマーマネージド暗号化キー | Cloud"
slug: /cmek
sidebar_label: "CMEK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、デフォルトで 256 ビット Advanced Encryption Standard（AES-256）アルゴリズムを使用して、ディスク/object ストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud は、お客様のクラウドプロバイダーの Key Management Service（KMS）と Zilliz Cloud の Customer-Managed Encryption Key（CMEK）機能を組み合わせることで、追加のセキュリティ層を提供します。 | Cloud"
type: origin
token: GLxhwO5vWiWkTBkoNCPcg4ahnbe
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# カスタマーマネージド暗号化キー

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS および Google Cloud で利用できます。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud は、デフォルトで 256 ビット Advanced Encryption Standard（AES-256）アルゴリズムを使用して、ディスク/object ストレージ上の保存データを暗号化します。最高レベルのセキュリティ要件を持つお客様向けに、Zilliz Cloud は、お客様のクラウドプロバイダーの Key Management Service（KMS）と Zilliz Cloud の Customer-Managed Encryption Key（CMEK）機能を組み合わせることで、追加のセキュリティ層を提供します。

## 暗号化の仕組み\{#how-encryption-works}

Zilliz Cloud では、カスタマーマネージド暗号化キーは、クラウドプロバイダーの KMS によって作成され、クラスター内のデータを保護するために使用される暗号化キーです。KMS キーを Zilliz Cloud の Business Critical プロジェクトに追加すると、そのキーを使用して、ディスク、オブジェクトストレージ、およびメッセージキューに保存されているデータを暗号化できます。

![Ehcyw7EZphWQO0bTJMDchzTYnIf](https://zdoc-images.s3.us-west-2.amazonaws.com/Ehcyw7EZphWQO0bTJMDchzTYnIf.png)

上図に示すように、Zilliz Cloud は、ユーザーが提供する KMS キーを**ルートキー**として、暗号化キーを階層的に管理します。

クラスター内では、各データベースが**暗号化ゾーン（EZ）**に関連付けられており、Zilliz Cloud はゾーンごとに**暗号化ゾーンキー（EZK）**と呼ばれる暗号化キーを作成します。EZK を保護するため、Zilliz Cloud はルートキーを使用して EZK を暗号化し、暗号化された EZK を保存します。

各データベースファイルについて、Zilliz Cloud は**データ暗号化キー（DEK）**を生成し、そのキーを使用してファイルを暗号化します。DEK を保護するため、Zilliz Cloud は EZK を使用して DEK を暗号化し、暗号化された DEK と暗号化されたファイルの両方を保存します。

ファイルにアクセスする際、Zilliz Cloud は暗号化された EZK を KMS に送信して復号し、復号した EZK を使用して暗号化された DEK を復号したうえで、復号した DEK を使用してファイルを復号します。

## 暗号化の範囲\{#encryption-scope}

以下の場所に保存されているすべてのデータ関連ファイルが暗号化されます。

- オブジェクトストレージ（binlog およびインデックスファイルを含む）

- ローカルディスク

- メッセージキュー内の Insert/delete メッセージ

## 制限事項\{#limitations}

- カスタマーマネージド暗号化キーはプロジェクトレベルで管理されます。

- 各プロジェクトには最大 20 個の一意なキーを追加できます。重複するキーを追加すると失敗します。

- クラスターが暗号化されると、データベース間でのコレクションの移行は禁止されます。

- KMS キーのクラウドプロバイダーとリージョンが、そのキーを使用する Zilliz Cloud クラスターのクラウドプロバイダーとリージョンに常に一致することを確認してください。

- Milvus v2.5.x に対応する既存のクラスターで CMEK を有効にするには、データをバックアップし、Milvus v2.6.x に対応する新しいクラスターにリストアしてください。クラスターをアップグレードしても、アップグレード前のデータは暗号化されません。

<Admonition type="info" title="Notes">

現在、CMEK は AWS リージョンでのみ利用できます。その他のリージョンについては、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## サポートされている KMS プロバイダー\{#supported-kms-providers}

以下の Key Management Service（KMS）プロバイダーを利用できます。



import DocCardList from '@theme/DocCardList';

<DocCardList />
