---
title: "支払いと請求の概要 | Cloud"
slug: /payment-billing
sidebar_key: payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用できる支払い方法、支払いの優先順位、請求書とサブスクリプションを管理する際の考慮事項について説明します。 | Cloud"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - private link
  - 支払い
  - 請求

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用できる支払い方法、支払いの優先順位、請求書とサブスクリプションを管理する際の考慮事項について説明します。

## 概要\{#overview}

<Admonition type="info" icon="📘" title="Note">

<p>支払いと請求の設定を管理するには、<strong>Organization Owner</strong> または <strong>Organization Billing Admin</strong> である必要があります。</p>

</Admonition>

### 支払いオプション\{#payment-methods}

<table>
   <tr>
     <th><p><strong>支払い方法</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>クレジット</p></td>
     <td><p>登録時や Zilliz Cloud イベントへの参加などにより、クレジットを獲得できます。クレジットは、Zilliz Cloud サービスの利用料金の支払いに使用できます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用料金について、毎月請求書を受け取ります。</p></td>
   </tr>
   <tr>
     <td><p>AWS Marketplace 購読</p></td>
     <td><p>Zilliz Cloud の利用料金について、AWS Marketplace を通じて請求書を受け取ります。</p><p>AWS Marketplace でサービスを購読し、AWS、GCP、Azure から Zilliz Cloud クラスターの作成先を選択できます。</p></td>
   </tr>
   <tr>
     <td><p>GCP Marketplace 購読</p></td>
     <td><p>Zilliz Cloud の利用料金について、GCP Marketplace を通じて請求書を受け取ります。</p><p>GCP Marketplace でサービスを購読し、AWS、GCP、Azure から Zilliz Cloud クラスターの作成先を選択できます。</p></td>
   </tr>
   <tr>
     <td><p>Azure Marketplace 購読</p></td>
     <td><p>Zilliz Cloud の利用料金について、Azure Marketplace を通じて請求書を受け取ります。</p><p>Azure Marketplace でサービスを購読し、AWS、GCP、Azure から Zilliz Cloud クラスターの作成先を選択できます。</p></td>
   </tr>
   <tr>
     <td><p>前払い</p></td>
     <td><p>Zilliz Cloud サービス用にあらかじめ資金を前払いします。</p></td>
   </tr>
</table>

クレジットと前払いは、クレジットカードまたは Marketplace 購読（AWS/GCP/Azure）のいずれかと組み合わせて利用できます。ただし、クレジットカードと Marketplace 購読を同時に設定することはできません。

<Admonition type="info" icon="📘" title="Note">

<p>Marketplace 購読は支払い方法に過ぎず、クラスター作成時のクラウドサービスプロバイダーには影響しません。たとえば、AWS Marketplace を通じて購読した後でも、GCP、Azure、または AWS 上に<a href="./create-cluster">クラスターを作成</a>できます。</p>

</Admonition>

### 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法が使用されている場合、優先順位は以下の通りです。

1. クレジット

1. 前払い資金

1. クレジットカード / AWS Marketplace 購読 / GCP Marketplace 購読 / Azure Marketplace 購読

**例:** 未払い請求が &#36;500 あり、クレジットが &#36;100、前払い資金が &#36;200、さらにリンクされたクレジットカードがある場合：

- まず &#36;100 のクレジットが使用され、請求額は &#36;400 に減少します。

- 次に、&#36;200 の前払い資金が適用され、残高は &#36;200 になります。

- 最後に、残りの &#36;200 がリンクされたクレジットカードに請求されます。

### 支払い方法の切り替え\{#switching-payment-methods}

Zilliz Cloud では、異なる支払い方法間の柔軟な切り替えを提供しています。

#### クレジットカードから Marketplace 購読へ\{#from-credit-card-to-marketplace-subscription}

- [AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または [Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) Marketplace で直接購読します。

- クレジットカードを手動で削除する必要はありません。

- 成功した Marketplace 購読により、支払い方法が自動的に更新されます。

#### Marketplace 購読からクレジットカードへ\{#from-marketplace-subscription-to-credit-card}

- 元の [AWS](./subscribe-on-aws-marketplace#cancel-public-offer-subscription)、[GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription)、または [Azure](./subscribe-on-azure-marketplace) Marketplace から手動で購読解除します。

- Zilliz Cloud Web コンソールで[クレジットカードを追加](./subscribe-by-adding-credit-card)します。

#### Marketplace 購読間の切り替え\{#between-marketplace-subscriptions}

- 現在の Marketplace から購読解除します。

- 新しい [AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または [Azure](./subscribe-on-azure-marketplace) Marketplace アカウントを使用して再購読します。

## Marketplace 価格規約\{#marketplace-pricing-terms}

[AWS](./subscribe-on-aws-marketplace)、[GPC](./subscribe-on-gcp-marketplace)、または [Azure](./subscribe-on-azure-marketplace) Marketplace で Zilliz Cloud サービスを購読し、[サポートされているクラウドプロバイダー](./cloud-providers-and-regions)にデプロイされたクラスターを作成できます。

価格はクラウドプロバイダー、リージョン、クラスタープランによって異なります。詳細については、[Zilliz Cloud 料金](https://zilliz.com/pricing)を参照してください。

この価格情報を使用して、AWS-us-east-1（バージニア）でパフォーマンス最適化 CU 1 つの **スタンダードプラン** の Zilliz Cloud クラスターをデプロイした場合、Marketplace 購読を通じて &#36;0.159/時間 が請求されます。

## 関連トピック\{#related-topics}

異なる支払い方法を使用した Zilliz Cloud の購読や請求書の確認について詳しく知りたい場合は、以下のトピックを参照してください。



import DocCardList from '@theme/DocCardList';

<DocCardList />
