---
title: "Marketplace サブスクリプション | BYOC"
slug: /marketplace-subscription
sidebar_label: "Marketplace サブスクリプション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "サポートされているクラウド Marketplace を通じて Zilliz Cloud をサブスクライブし、既存のクラウド請求アカウントを通じて Zilliz Cloud の料金を支払うことができます。 | BYOC"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Marketplace サブスクリプション

サポートされているクラウド Marketplace を通じて Zilliz Cloud をサブスクライブし、既存のクラウド請求アカウントを通じて Zilliz Cloud の料金を支払うことができます。

<Admonition type="info" icon="📘" title="📘 Note">

支払い方法とサブスクリプションを管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

Zilliz Cloud は以下の Marketplace を通じたサブスクリプションをサポートしています。

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## サブスクリプションオプション\{#subscription-options}

各 Marketplace は複数のサブスクリプションオプションをサポートしている場合があります。

- Marketplace Free trial

- Marketplace Public offer

- Marketplace Private offer

次の表は、サブスクリプションオプションを比較したものです。

| **サブスクリプションオプション** | **説明** | **最適な用途** | **商用条件** | **提供状況** |
| --- | --- | --- | --- | --- |
| Marketplace Free Trial | 有料サブスクリプションに移行する前に、クラウド Marketplace を通じて Zilliz Cloud を評価できるトライアルサブスクリプションです。 | 初期評価および短期間のテスト。 | 30 日間の無料トライアル。無料トライアル終了後は、有料サブスクリプションに[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)する必要があります。 | **AWS** Marketplace を通じた Zilliz Cloud **SaaS** デプロイメントでのみ利用可能です。 |
| Marketplace Public Offer | クラウド Marketplace で利用可能な標準の Zilliz Cloud 掲載です。 | 標準価格と標準条件によるセルフサービスのサブスクリプション。 | Marketplace の掲載ページに表示される公開価格、契約条件、および請求ルールを使用します。 | **AWS, Google Cloud, Mircosoft** Marketplace を通じた Zilliz Cloud **SaaS** デプロイメントでのみ利用可能です。 |
| Marketplace Private Offer | お客様の組織向けに Zilliz が作成するカスタムオファーです。 | エンタープライズ調達、割引、コミットメント支出、カスタム条件、または BYOC 購入。 | 交渉済み価格、カスタム契約期間、支払いスケジュール、その他の商用条件を含めることができます。 | **AWS, Google Cloud, Mircosoft** Marketplace を通じた Zilliz Cloud **SaaS** と **BYOC** の両方のデプロイメントで利用可能です。 |

<Admonition type="info" icon="📘" title="**Note**">

AWS Marketplace Free Trial は AWS Marketplace を通じて開始および管理されます。トライアル後にアップグレードすると、以降の請求は AWS Marketplace を通じて行われます。このオプションは、調達と請求を AWS Marketplace 経由で行いたいチームに適しています。

Zilliz Cloud Free Trial は Zilliz Cloud コンソールから直接開始され、Zilliz Cloud 内で管理されます。トライアル後、サポートされている[支払い方法](./undefined)を追加することを選択できます。このオプションは、外部請求を設定する前に Zilliz Cloud を直接試したいユーザーに適しています。

</Admonition>

## 注意事項\{#considerations}

Marketplace サブスクリプションは支払い方法にすぎません。これは、プロジェクト、クラスター、および関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace を通じてサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされている限り、AWS、Google Cloud、または Azure 上に Zilliz Cloud プロジェクトとクラスターを作成できます。

import DocCardList from '@theme/DocCardList';

<DocCardList />
