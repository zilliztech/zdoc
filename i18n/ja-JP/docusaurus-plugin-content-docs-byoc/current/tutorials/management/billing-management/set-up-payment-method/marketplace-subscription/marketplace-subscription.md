---
title: "Marketplace Subscription | BYOC"
slug: /marketplace-subscription
sidebar_label: "Marketplace Subscription"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "対応するクラウドマーケットプレイスから Zilliz Cloud にサブスクライブし、既存のクラウド請求アカウントで Zilliz Cloud の料金を支払えます。 | BYOC"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Marketplace Subscription

対応するクラウドマーケットプレイスから Zilliz Cloud にサブスクライブし、既存のクラウド請求アカウントで Zilliz Cloud の料金を支払えます。

<Admonition type="info" icon="📘" title="📘 Note">

支払い方法とサブスクリプションを管理するには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。

</Admonition>

Zilliz Cloud は、以下のマーケットプレイスでのサブスクリプションに対応しています。

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## サブスクリプションオプション\{#subscription-options}

各マーケットプレイスでは、複数のサブスクリプションオプションが提供される場合があります。

- Marketplace 無料トライアル

- Marketplace パブリックオファー

- Marketplace プライベートオファー

次の表に、各サブスクリプションオプションの比較を示します。

| **サブスクリプションオプション** | **説明** | **推奨用途** | **契約条件** | **利用可否** |
| --- | --- | --- | --- | --- |
| Marketplace 無料トライアル | 有料サブスクリプションへの移行前に、クラウドマーケットプレイス経由で Zilliz Cloud を評価できるトライアルサブスクリプションです。 | 初期検証や短期間のテスト。 | 30日間の無料トライアル。終了後は有料サブスクリプションへの[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)が必要です。 | **AWS** Marketplace 経由の Zilliz Cloud **SaaS** デプロイメントのみ対象。 |
| Marketplace パブリックオファー | クラウドマーケットプレイスに掲載されている標準の Zilliz Cloud リスティングです。 | 標準価格・標準条件でのセルフサービスサブスクリプション。 | マーケットプレイスのリスティングページに記載された公開価格、契約条件、請求ルールが適用されます。 | **AWS、Google Cloud、Mircosoft** Marketplace 経由の Zilliz Cloud **SaaS** デプロイメントのみ対象。 |
| Marketplace プライベートオファー | Zilliz がお客様の組織向けに作成するカスタムオファーです。 | エンタープライズ調達、割引、コミット済み支出、個別条件、または BYOC の購入。 | 交渉済みの価格、カスタム契約期間、支払いスケジュールなどの契約条件を含められます。 | **AWS、Google Cloud、Mircosoft** Marketplace 経由の Zilliz Cloud **SaaS** および **BYOC** デプロイメントの両方で利用可能。 |

<Admonition type="info" icon="📘" title="**Note**">

AWS Marketplace 無料トライアルは AWS Marketplace から開始・管理されます。トライアル後にアップグレードすると、その後の料金も AWS Marketplace を通じて請求されます。このオプションは、AWS Marketplace で調達と請求を一括管理したいチームに適しています。

Zilliz Cloud 無料トライアルは Zilliz Cloud コンソールから直接開始し、Zilliz Cloud 内で管理されます。トライアル終了後は、支払い方法として[クレジットカード](./subscribe-by-adding-credit-card)、[マーケットプレイスサブスクリプション](./marketplace-subscription)、または[前払い](./advance-pay)を追加できます。このオプションは、外部の請求設定を行う前に Zilliz Cloud を直接試したいユーザーに適しています。

</Admonition>

## 考慮事項\{#considerations}

Marketplace サブスクリプションはあくまで支払い方法であり、プロジェクト、クラスター、関連リソースを作成するクラウドプロバイダーを規定するものではありません。たとえば、AWS Marketplace でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、Azure のいずれにも Zilliz Cloud のプロジェクトやクラスターを作成できます。

import DocCardList from '@theme/DocCardList';

<DocCardList />
