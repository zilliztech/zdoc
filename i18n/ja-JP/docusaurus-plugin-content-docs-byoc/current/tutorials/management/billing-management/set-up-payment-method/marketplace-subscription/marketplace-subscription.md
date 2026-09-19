---
title: "マーケットプレイスサブスクリプション | BYOC"
slug: /marketplace-subscription
sidebar_label: "マーケットプレイスサブスクリプション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "対応するクラウドマーケットプレイスを通じて Zilliz Cloud をサブスクライブすると、Zilliz Cloud の料金は既存のクラウド請求アカウントを通じて請求されます。 | BYOC"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# マーケットプレイスサブスクリプション

対応するクラウドマーケットプレイスを通じて Zilliz Cloud をサブスクライブすると、Zilliz Cloud の料金は既存のクラウド請求アカウントを通じて請求されます。

<Admonition type="info" title="Note">

支払い方法とサブスクリプションを管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

Zilliz Cloud は、以下のマーケットプレイスを通じたサブスクリプションに対応しています。

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## サブスクリプションオプション\{#subscription-options}

マーケットプレイスごとに、複数のサブスクリプションオプションをサポートしている場合があります。

- Marketplace パブリックオファー

- Marketplace プライベートオファー

次の表では、各サブスクリプションオプションを比較します。

| **サブスクリプションオプション** | **説明** | **最適な用途** | **商用条件** | **利用可否** |
| --- | --- | --- | --- | --- |
| Marketplace Public Offer | クラウドマーケットプレイスで利用できる標準の Zilliz Cloud リスティングです。 | 標準的な価格と条件によるセルフサービスサブスクリプション。 | マーケットプレイスのリスティングページに記載されている公開価格、契約条件、請求ルールが適用されます。 | **AWS、Google Cloud、Mircosoft** Marketplace を通じた Zilliz Cloud **SaaS** デプロイメントでのみ利用できます。 |
| Marketplace Private Offer | Zilliz がお客様の組織向けに作成するカスタムオファーです。 | エンタープライズ調達、割引、コミット済み支出、カスタム条件、または BYOC の購入。 | 交渉済みの価格、カスタム契約期間、支払いスケジュール、その他の商用条件を含めることができます。 | **AWS、Google Cloud、Mircosoft** Marketplace を通じた Zilliz Cloud **SaaS** および **BYOC** デプロイメントの両方で利用できます。 |

<Admonition type="info" title="Note">

AWS Marketplace Free Trial は AWS Marketplace を通じて開始および管理されます。トライアル後にアップグレードした場合、以降の料金は AWS Marketplace を通じて請求されます。このオプションは、AWS Marketplace での調達と請求を希望するチームに適しています。

Zilliz Cloud Free Trial は Zilliz Cloud コンソールから直接開始され、Zilliz Cloud 内で管理されます。トライアル終了後は、支払い方法として[クレジットカード](./subscribe-by-adding-credit-card)、[マーケットプレイスサブスクリプション](./marketplace-subscription)、または[前払い](./advance-pay)を追加できます。このオプションは、外部の請求を設定する前に Zilliz Cloud を直接試したいユーザーに適しています。

</Admonition>

## 考慮事項\{#considerations}

マーケットプレイスサブスクリプションはあくまで支払い方法であり、プロジェクト、クラスター、および関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace を通じてサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、Azure のいずれかで Zilliz Cloud のプロジェクトとクラスターを引き続き作成できます。

import DocCardList from '@theme/DocCardList';

<DocCardList />
