---
title: "支払いと請求 | Cloud"
slug: /payment-billing
sidebar_label: "支払いと請求"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudでサービスを購読する方法と、請求書の管理に関する注意事項について詳しく説明しています。 | Cloud"
type: origin
token: OTqfwuVkeivCadkCFYPcLaVWnkc
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - payment
  - billing
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# 支払いと請求

このガイドでは、Zilliz Cloudでサービスを購読する方法と、請求書の管理に関する注意事項について詳しく説明しています。

## 概要について{#overview}

<Admonition type="info" icon="📘" title="ノート">

<p>支払いと請求を管理するには、<strong>組織オーナー</strong>である必要があります。</p>

</Admonition>

### 支払いオプション{#payment-options}

<table>
   <tr>
     <th><p><strong>お支払い方法</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>クレジット</p></td>
     <td><p>会員登録やZilliz Cloudのイベントなどに参加することで、クレジットを獲得できます。クレジットは、Zilliz Cloudのサービスを利用するための費用として使用できます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>Zilliz Cloudでの利用に対して、毎月請求書が届きます。</p></td>
   </tr>
   <tr>
     <td><p>AWSMarketplaceのサブスクリプション</p></td>
     <td><p>Zilliz Cloudの使用に関する請求書は、AWSMarketplaceを通じて受け取ります。 AWS Marketplaceでサービスに登録し、AWS、GCP、Azureから選択してZilliz Cloudクラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>GCPMarketplaceのサブスクリプション</p></td>
     <td><p>Zilliz Cloudの使用に関する請求書は、GCPMarketplaceから受け取ります。 GCP Marketplaceでサービスに登録し、AWS、GCP、Azureから選択してZilliz Cloudクラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Azure Marketplaceのサブスクリプション</p></td>
     <td><p>Azure Marketplaceを通じて、Zilliz Cloudの使用に関する請求書を受け取ります。 Azure Marketplaceでサービスに登録し、AWS、GCP、Azureから選択してZilliz Cloudクラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>事前支払い</p></td>
     <td><p>Zilliz Cloudサービスのために、一定額の資金を前払いします。</p></td>
   </tr>
</table>

クレジットと前払いは、クレジットカードまたはMarketplaceサブスクリプション（AWS/GCP/Azure）のいずれかと組み合わせることができます。ただし、クレジットカードとMarketplaceサブスクリプションの両方を同時に設定することはできません。

<Admonition type="info" icon="📘" title="ノート">

<p>Marketplaceのサブスクリプションは、クラスターを作成する際にクラウドサービスプロバイダーに影響を与えることはなく、支払いの方法としてのみ利用できます。例えば、AWS Marketplaceを通じてサブスクリプションした後でも、GCP、Azure、またはAWS上でクラスターを<a href="./create-cluster">作成</a>することができます。</p>

</Admonition>

### お支払い方法の優先順位{#payment-method-priority}

複数の支払い方法が使用されている場合、その優先順位は次のとおりです。

1. クレジット

1. 事前支払い資金

1. クレジットカード/AWSMarketplaceサブスクリプション/GCP Marketplaceサブスクリプション/Azure Marketplaceサブスクリプション。

**例:**500ドルの未払いの請求書があり、100ドルのクレジットと200ドルのAdvance Pay資金が利用可能で、リンクされたクレジットカードがある場合:

- 最初に100ドルのクレジットが使用され、請求書が400ドルに減額されます。

- その後、200ドルの前払い資金が適用され、残高が200ドルに減少します。

- 最後に、残りの200ドルはリンクされたクレジットカードに請求されます。

### 支払い方法の切り替え{#switching-payment-methods}

Zilliz Cloudは、異なる支払い方法の切り替えに柔軟性を提供しています

#### クレジットカードからマーケットプレイスの定期購読まで{#switching-payment-methods}

- 直接[AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または[Azure](./subscribe-on-azure-marketplace)Marketplaceで購読してください。

- クレジットカードを手動で削除する必要はありません。

- 成功したマーケットプレイスのサブスクリプションは、自動的に支払い方法を更新します。

#### マーケットプレイスの定期購読からクレジットカードへ{#from-marketplace-subscription-to-credit-card}

- 元の[AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)または[GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription)または[Azure](./subscribe-on-azure-marketplace#cancel-azure-marketplace-subscription)Marketplaceから手動で登録解除してください。

- [クレジットカードを](./subscribe-by-adding-credit-card)Zilliz Cloudウェブコンソールに追加します。

#### マーケットプレイスのサブスクリプション間{#between-marketplace-subscriptions}

- 現在のマーケットプレイスから購読を解除してください。

- 新しい[AWS](./subscribe-on-aws-marketplace)または[GCP](./subscribe-on-gcp-marketplace)または[Azure](./subscribe-on-azure-marketplace)Marketplaceアカウントを使用して再登録してください。

## マーケットプレイスの価格条件{#marketplace-pricing-terms}

Zilliz Cloudサービスを[AWS](./subscribe-on-aws-marketplace)、[GPC](./subscribe-on-gcp-marketplace)、または[Azure](./subscribe-on-azure-marketplace)Marketplaceでサブスクライブし、[サポートされるクラウドプロバイダー](./cloud-providers-and-regions)にデプロイされたクラスターを作成できます。

価格はクラウドプロバイダー、リージョン、クラスタープランによって異なります。詳細については、[Zilliz Cloud価格](https://zilliz.com/jp/pricing)を参照してください。

価格情報を使用して、**スタンダードプラン**でZilliz Cloudクラスターをデプロイし、AWS-us-east-1(バージニア)に1つのperformance-optimizedCUを持っている場合、Marketplaceサブスクリプションを通じて1時間あたり$0.159が請求されます。

## 関連するトピック{#related-topics}

さまざまな支払い方法を使用してZilliz Cloudに登録し、請求書を表示する方法の詳細については、以下のトピックを参照してください。



import DocCardList from '@theme/DocCardList';

<DocCardList />