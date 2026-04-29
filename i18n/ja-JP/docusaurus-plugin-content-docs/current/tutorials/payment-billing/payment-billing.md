---
title: "支払いと請求 | Cloud"
slug: /payment-billing
sidebar_key: payment-billing
sidebar_label: "支払いと請求"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud のサービスにサブスクライブするための利用可能な方法と、請求書管理に関する関連事項について詳しく説明します。"
type: origin
token: FmkCwm1QHitB7uk9U9ncLnHrnse
sidebar_position: 17
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - private link
  - 支払い
  - 請求

---

import Admonition from '@theme/Admonition';


# 支払いと請求

このガイドでは、Zilliz Cloud のサービスを購読するための利用可能な方法と、請求書管理に関する注意事項について詳述します。

## 概要\{#overview}

<Admonition type="info" icon="📘" title="Note">

<p>支払いと請求を管理するには、<strong>組織オーナー</strong>である必要があります。</p>

</Admonition>

### 支払いオプション\{#payment-options}

<table>
   <tr>
     <th><p><strong>支払い方法</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>クレジット</p></td>
     <td><p>登録時または Zilliz Cloud イベントへの参加などによりクレジットが付与されます。クレジットは Zilliz Cloud サービスの利用料金の支払いに充てることができます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用状況に基づき、毎月請求書が発行されます。</p></td>
   </tr>
   <tr>
     <td><p>AWS Marketplace による購読</p></td>
     <td><p>AWS Marketplace を通じて Zilliz Cloud の利用状況に対する請求書を受け取ります。</p><p>AWS Marketplace で本サービスを購読し、AWS、GCP、Azure から選択して Zilliz Cloud クラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>GCP Marketplace による購読</p></td>
     <td><p>GCP Marketplace を通じて Zilliz Cloud の利用状況に対する請求書を受け取ります。</p><p>GCP Marketplace で本サービスを購読し、AWS、GCP、Azure から選択して Zilliz Cloud クラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Azure Marketplace による購読</p></td>
     <td><p>Azure Marketplace を通じて Zilliz Cloud の利用状況に対する請求書を受け取ります。</p><p>Azure Marketplace で本サービスを購読し、AWS、GCP、Azure から選択して Zilliz Cloud クラスターを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>前払い</p></td>
     <td><p>Zilliz Cloud サービスに対して事前に資金を支払います。</p></td>
   </tr>
</table>

クレジットと前払いは、クレジットカードまたは Marketplace 購読（AWS/GCP/Azure）のいずれかと組み合わせることができます。ただし、クレジットカードと Marketplace 購読を同時に設定することはできません。

<Admonition type="info" icon="📘" title="Note">

<p>Marketplace 購読は支払い方法に過ぎず、クラスター作成時のクラウドサービスプロバイダーには影響しません。たとえば、AWS Marketplace を通じて購読した後でも、GCP、Azure、または AWS 上でクラスターを<a href="./create-cluster">作成</a>できます。</p>

</Admonition>

### 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法が使用されている場合、その優先順位は以下の通りです。

1. クレジット

1. 前払い資金

1. クレジットカード / AWS Marketplace 購読 / GCP Marketplace 購読 / Azure Marketplace 購読。

**例:** 未払い金額が&#36;500 で、&#36;100 のクレジットと&#36;200 の前払い資金があり、さらにリンクされたクレジットカードがある場合：

- まず&#36;100 のクレジットが使用され、請求額が&#36;400 に減額されます。

- 次に、&#36;200 の前払い資金が適用され、残高が&#36;200 になります。

- 最後に、残りの&#36;200 がリンクされたクレジットカードに請求されます。

### 支払い方法の変更\{#switching-payment-methods}

Zilliz Cloud では、異なる支払い方法間での柔軟な切り替えが可能です。

#### クレジットカードから Marketplace 購読へ\{#from-credit-card-to-marketplace-subscription}

- [AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または [Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) Marketplace で直接購読します。

- クレジットカードを手動で削除する必要はありません。

- Marketplace 購読が成功すると、支払い方法が自動的に更新されます。

#### Marketplace 購読からクレジットカードへ\{#from-marketplace-subscription-to-credit-card}

- 元の [AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)、[GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription)、または [Azure](./subscribe-on-azure-marketplace) Marketplace から手動で解約します。

- Zilliz Cloud Web コンソールで[クレジットカードを追加](./subscribe-by-adding-credit-card)します。

#### Marketplace 購読間での切り替え\{#between-marketplace-subscriptions}

- 現在の Marketplace から解約します。

- 新しい [AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または [Azure](./subscribe-on-azure-marketplace) Marketplace アカウントを使用して再購読します。

## Marketplace 価格規約\{#marketplace-pricing-terms}

[AWS](./subscribe-on-aws-marketplace)、[GPC](./subscribe-on-gcp-marketplace)、または [Azure](./subscribe-on-azure-marketplace) Marketplace で Zilliz Cloud サービスを購読し、その後、[サポートされているクラウドプロバイダー](./cloud-providers-and-regions) にデプロイされたクラスターを作成できます。

価格はクラウドプロバイダー、リージョン、およびクラスタープランによって異なります。詳細については、[Zilliz Cloud 料金表](https://zilliz.com/pricing) をご参照ください。

価格情報に基づくと、AWS-us-east-1 (バージニア) にパフォーマンス最適化 CU を 1 つ備えた**スタンダードプラン**の Zilliz Cloud クラスターをデプロイした場合、Marketplace 購読を通じて&#36;0.159/時間の料金が発生します。

## 関連トピック\{#related-topics}

さまざまな支払い方法を使用した Zilliz Cloud の購読方法や請求書の表示方法について詳しく知りたい場合は、以下のトピックをご参照ください。



import DocCardList from '@theme/DocCardList';

<DocCardList />