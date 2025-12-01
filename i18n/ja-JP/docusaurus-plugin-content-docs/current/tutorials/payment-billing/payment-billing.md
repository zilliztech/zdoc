---
title: "支払いと請求 | Cloud"
slug: /payment-billing
sidebar_label: "支払いと請求"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudでサービスに登録する利用可能な方法と請求管理に関する関連ノートを詳しく説明します | Cloud"
type: origin
token: FmkCwm1QHitB7uk9U9ncLnHrnse
sidebar_position: 12
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - プライベートリンク
  - 支払い
  - 請求
  - Zillizベクターデータベース
  - Zillizデータベース
  - 非構造化データ
  - ベクター

---

import Admonition from '@theme/Admonition';


# 支払いと請求

このガイドでは、Zilliz Cloudでサービスに登録するための利用可能な方法と請求管理に関する関連ノートを詳しく説明します

## 概要\{#overview}

<Admonition type="info" icon="📘" title="注意">

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
     <td><p>登録時またはZilliz Cloudイベントへの参加などでクレジットを獲得できます。クレジットは、Zilliz Cloudサービスの使用料金を支払うために使用できます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>Zilliz Cloudでの利用分について毎月請求書を受け取ります。</p></td>
   </tr>
   <tr>
     <td><p>AWSマーケットプレイス登録</p></td>
     <td><p>Zilliz Cloud利用分の請求書をAWSマーケットプレイス経由で受け取ります。</p><p>AWSマーケットプレイスでサービスに登録し、Zilliz Cloudクラスターを作成するクラウドプロバイダーとしてAWS、GCP、Azureの中から選択できます。</p></td>
   </tr>
   <tr>
     <td><p>GCPマーケットプレイス登録</p></td>
     <td><p>Zilliz Cloud利用分の請求書をGCPマーケットプレイス経由で受け取ります。</p><p>GCPマーケットプレイスでサービスに登録し、Zilliz Cloudクラスターを作成するクラウドプロバイダーとしてAWS、GCP、Azureの中から選択できます。</p></td>
   </tr>
   <tr>
     <td><p>Azureマーケットプレイス登録</p></td>
     <td><p>Zilliz Cloud利用分の請求書をAzureマーケットプレイス経由で受け取ります。</p><p>Azureマーケットプレイスでサービスに登録し、Zilliz Cloudクラスターを作成するクラウドプロバイダーとしてAWS、GCP、Azureの中から選択できます。</p></td>
   </tr>
   <tr>
     <td><p>前払い</p></td>
     <td><p>Zilliz Cloudサービス用の資金を前払いします。</p></td>
   </tr>
</table>

クレジットと前払いは、クレジットカードまたはマーケットプレイス登録（AWS/GCP/Azure）のいずれかと組み合わせることができます。ただし、クレジットカードとマーケットプレイス登録を同時に設定することはできません。

<Admonition type="info" icon="📘" title="注意">

<p>マーケットプレイス登録は支払い方法であり、クラスターを作成する際のクラウドサービスプロバイダーには影響しません。たとえば、AWSマーケットプレイス経由で登録した後でも、GCP、Azure、またはAWSにクラスターを<span><a href="./create-cluster">作成</a></span>できます。</p>

</Admonition>

### 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法が使用されている場合、その優先順位は以下のとおりです：

1. クレジット

1. 前払い資金

1. クレジットカード / AWSマーケットプレイス登録 / GCPマーケットプレイス登録 / Azureマーケットプレイス登録。

**例：** 未払い請求額が&#36;500で、利用可能なクレジットが&#36;100、前払い資金が&#36;200、およびリンクされているクレジットカードがある場合：

- 最初に&#36;100のクレジットが使用され、請求額は&#36;400になります。

- 次に、&#36;200の前払い資金が適用され、残高は&#36;200になります。

- 最後に、残りの$200がリンクされているクレジットカードに請求されます。

### 支払い方法の変更\{#switching-payment-methods}

Zilliz Cloudは、異なる支払い方法間での切り替えに柔軟性を提供します：

#### クレジットカードからマーケットプレイス登録への変更\{#from-credit-card-to-marketplace-subscription}

- [AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または[Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)マーケットプレイスで直接登録します。

- クレジットカードを手動で削除する必要はありません。

- マーケットプレイス登録が成功すると、支払い方法が自動的に更新されます。

#### マーケットプレイス登録からクレジットカードへの変更\{#from-marketplace-subscription-to-credit-card}

- 元の[AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)、[GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription)、または[Azure](./subscribe-on-azure-marketplace)マーケットプレイスから手動で登録を解除します。

- Zilliz Cloudウェブコンソールで<span><a href="./subscribe-by-adding-credit-card">クレジットカードを追加</a></span>します。

#### マーケットプレイス登録間の変更\{#between-marketplace-subscriptions}

- 現在のマーケットプレイスから登録を解除します。

- 新しい[AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または[Azure](./subscribe-on-azure-marketplace)マーケットプレイスアカウントを使用して再登録します。

## マーケットプレイス価格用語\{#marketplace-pricing-terms}

[AWS](./subscribe-on-aws-marketplace)、[GCP](./subscribe-on-gcp-marketplace)、または[Azure](./subscribe-on-azure-marketplace)マーケットプレイスでZilliz Cloudサービスに登録し、[対応クラウドプロバイダー](./cloud-providers-and-regions)にデプロイされるクラスターを作成できます。

価格はクラウドプロバイダー、リージョン、クラスタープランによって異なります。詳細については、[Zilliz Cloud価格](https://zilliz.com/pricing)を参照してください。

価格情報を使用して、AWS-us-east-1（バージニア）に**標準プラン**で1つのパフォーマンス最適化CUを持つZilliz Cloudクラスターをデプロイした場合、マーケットプレイス登録経由で時間当たり$0.159が請求されます。

## 関連トピック\{#related-topics}

異なる支払い方法を使用してZilliz Cloudに登録する方法および請求書を表示する方法の詳細については、以下のトピックを参照してください。



import DocCardList from '@theme/DocCardList';

<DocCardList />

