---
title: "Marketplace Subscription | Cloud"
slug: /marketplace-subscription
sidebar_label: "Marketplace Subscription"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "対応するクラウドマーケットプレイスから Zilliz Cloud にサブスクライブし、既存のクラウド請求アカウントを通じて Zilliz Cloud の料金をお支払いいただけます。 | Cloud"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Marketplace Subscription

対応するクラウドマーケットプレイスから Zilliz Cloud にサブスクライブし、既存のクラウド請求アカウントを通じて Zilliz Cloud の料金をお支払いいただけます。

<Admonition type="info" icon="📘" title="📘 Note">

支払い方法とサブスクリプションを管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

Zilliz Cloud は、以下のマーケットプレイスでのサブスクリプションに対応しています。

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## サブスクリプションオプション\{#subscription-options}

各マーケットプレイスでは、複数のサブスクリプションオプションを利用できる場合があります。

- Marketplace Free trial

- Marketplace Public offer

- Marketplace Private offer

次の表に、各サブスクリプションオプションの比較を示します。

| **サブスクリプションオプション** | **説明** | **推奨用途** | **商用条件** | **利用可能な環境** |
| --- | --- | --- | --- | --- |
| Marketplace Free Trial | 有料サブスクリプションへの移行前に、クラウドマーケットプレイスを通じて Zilliz Cloud を評価できるトライアルサブスクリプションです。 | 初期評価や短期間のテストに適しています。 | 30日間の無料トライアルを提供します。無料トライアル終了後は、有料サブスクリプションへ[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)する必要があります。 | **AWS** Marketplace 経由の Zilliz Cloud **SaaS** デプロイメントでのみ利用可能です。 |
| Marketplace Public Offer | クラウドマーケットプレイスで提供される標準的な Zilliz Cloud のリスティングです。 | 標準価格および条件に基づくセルフサービスのサブスクリプションです。 | マーケットプレイスのリスティングページに記載された公開価格、契約条件、請求ルールが適用されます。 | **AWS、Google Cloud、Mircosoft** Marketplace 経由の Zilliz Cloud **SaaS** デプロイメントでのみ利用可能です。 |
| Marketplace Private Offer | Zilliz がお客様の組織向けに作成するカスタムオファーです。 | エンタープライズ向けの調達、割引、コミット済み支出、カスタム条件、または BYOC の購入に適しています。 | 交渉済みの価格、カスタム契約期間、支払いスケジュール、その他の商用条件を含めることができます。 | **AWS、Google Cloud、Mircosoft** Marketplace 経由の Zilliz Cloud **SaaS** および **BYOC** デプロイメントの両方で利用可能です。 |

<Admonition type="info" icon="📘" title="**Note**">

AWS Marketplace Free Trial は、AWS Marketplace を通じて開始・管理されます。トライアル後にアップグレードした場合、その後の料金は AWS Marketplace を通じて請求されます。このオプションは、AWS Marketplace で調達と請求を一括管理したいチームに適しています。

Zilliz Cloud Free Trial は Zilliz Cloud コンソールから直接開始でき、Zilliz Cloud 内で管理されます。トライアル終了後は、支払い方法として[クレジットカード](./subscribe-by-adding-credit-card)、[マーケットプレイスサブスクリプション](./marketplace-subscription)、または[前払い](./advance-pay)を追加できます。このオプションは、外部の請求設定を行う前に Zilliz Cloud を直接試したいユーザーに適しています。

</Admonition>

## 考慮事項\{#considerations}

Marketplace サブスクリプションはあくまで支払い方法であり、プロジェクト、クラスター、関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、Azure のいずれにも Zilliz Cloud のプロジェクトやクラスターを作成できます。

import DocCardList from '@theme/DocCardList';

<DocCardList />
