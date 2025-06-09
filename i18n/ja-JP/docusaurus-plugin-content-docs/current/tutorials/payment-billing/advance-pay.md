---
title: "事前支払いを利用する | Cloud"
slug: /advance-pay
sidebar_label: "Advance Pay"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クレジットカードの追加やAWSMarketplaceでのサブスクリプションの代わりに、前払い(銀行振込)を支払い方法として受け付けています。 | Cloud"
type: origin
token: H3mBwoua5idJsokeRfGcii8tnHe
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - advance pay
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';


# 事前支払いを利用する

Zilliz Cloudは、クレジットカードの追加やAWSMarketplaceでのサブスクリプションの代わりに、前払い(銀行振込)を支払い方法として受け付けています。

## Advance Payに資金を追加する{#add-funds-to-advance-pay}

現在、Advance Payの残高に資金を追加するには、[当社までご連絡](https://zilliz.com/jp/contact-sales)ください。

<Admonition type="info" icon="📘" title="ノート">

<p>支払い方法の優先順位は、クレジット&gt;Advance Pay&gt;クレジットカード/AWSマーケットプレイスサブスクリプションです。</p>
<p>これは、まだクレジットが残っていて、資金を追加し、クレジットカードを追加した場合、またはAWSMarketplaceで購読した場合、使用料をカバーするために最初にクレジットが差し引かれることを意味します。クレジットが十分でない場合は、Advance Payの資金を差し引きます。資金とクレジットがまだ料金をカバーするのに十分でない場合は、クレジットカードまたはAWS Marketplaceアカウントに請求することになります。</p>

</Admonition>

## アドバンスペイの履歴を見る{#view-advance-pay-history}

銀行振込履歴を表示するには、上部ナビゲーションバーまたは左ナビゲーションペインの「請求」をクリックします。次に、「前払い」セクションの「履歴」をクリックします。**銀行振込履歴**ページでは、過去のすべての振込の詳細、振込を行った時間、追加した資金の金額などを閲覧できます。

![add-fund-en](/img/add-fund-en.png)

## Advance Payの残高をモニターに設定する{#set-monitor-for-advance-pay-balance}

既定では、事前支払い残高の監視は無効になっています。ただし、事前支払い残高が監視条件で指定した金額よりも少ない場合に通知を受け取るように有効にすることができます。詳細については、「[組織のアラートを管理する](./manage-organization-alerts)」を参照してください。

## Advance Payの資金を返金する{#refund-advance-pay-funds}

現在、Zilliz Cloudはウェブコンソールでの返金をサポートしていません。返金を受けるには、Zilliz Cloud[サポートポータル](https://support.zilliz.com/hc/en-us)にお問い合わせいただき、リクエストを送信してください。

## 関連するトピック{#}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplaceに登録する](./subscribe-on-gcp-marketplace)

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- [インボイス](./view-invoice)

