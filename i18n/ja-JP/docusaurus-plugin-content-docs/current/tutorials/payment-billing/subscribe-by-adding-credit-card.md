---
title: "クレジットカードを追加して購読する | Cloud"
slug: /subscribe-by-adding-credit-card
sidebar_label: "Credit Card"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudに組織の支払いクレジットカードを追加する方法について包括的な手順を提供します。 | Cloud"
type: origin
token: E3TCwE0EXiQFvmk27QLcNMeunId
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - credit card
  - subscribe
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# クレジットカードを追加して購読する

このガイドでは、Zilliz Cloudに組織の支払いクレジットカードを追加する方法について包括的な手順を提供します。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><strong>課税:</strong>請求書の税金は、提供された請求先住所に基づいて計算されます。VATまたはGST IDを入力する必要がある企業の場合は、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</li>
</ul>

</Admonition>

## クレジットカードを追加する{#add-a-credit-card}

1. アカウントを登録してログインした後、左側のメニューから「**請求**」に移動して、請求の概要にアクセスしてください。

1. 画面の右下にある**支払** **方法**セクションで、**支払方法を追加**をクリックします。表示されるダイアログボックスで、**クレジットカード**を選択します。

ダイアログボックスが表示され、入力を促します:

- クレジットカード情報:

    - **カード番号**

    - **有効期限切れ**

    - **CVC**

- 請求情報:

    - **最初の名前**

    - **ラストネーム**

    - **会社の名前**

    - **メール**

    - **ストリートアドレス**

        - 会社の住所を使用することをお勧めします。この住所は税金の計算に使用され、発行されたすべての請求書に表示されます。

    - **国/リージョン**

    - **州/県**

    - **シティ**

    - **ZIPコード/郵便番号**

上記のフィールドはすべて必須です。入力が完了すると、**追加**ボタンが有効になり、クレジットカード情報と請求情報を保存できます。

![add-credit-card](/img/add-credit-card.png)

## 支払い方法を編集する{#edit-your-payment-method}

支払い方法は、**請求** **の概要**ページからいつでも表示および編集できます。

![payment-overivew](/img/payment-overivew.png)

クレジットカードの有効期限が近づくと、[クレジットカード有効期限モニター](./manage-organization-alerts)によって通知されます。お支払い情報を更新するか、[AWS Marketplaceサブスクリプション](./subscribe-on-aws-marketplace)に切り替えることができます。

### クレジットカードの編集{#edit-credit-card}

クレジットカード情報を更新するには、**支払方法**エリアの鉛筆アイコンをクリックしてください。

ダイアログボックスが表示され、入力を促します:

- クレジットカード情報:

    - **カード番号**

    - **有効期限切れ**

    - **CVC**

- 請求情報:

    - **最初の名前**

    - **ラストネーム**

    - **会社の名前**

    - **メール**

    - **ストリートアドレス**

        - 会社の住所を使用することをお勧めします。この住所は税金の計算に使用され、発行されたすべての請求書に表示されます。

    - **国/リージョン**

    - **州/県**

    - **シティ**

    - **ZIPコード/郵便番号**

上記のフィールドはすべて必須です。入力が完了すると、**更新**ボタンが有効になり、払い戻し方法を保存できます。

![update-payment-method](/img/update-payment-method.png)

### 請求プロフィールの編集{#edit-billing-profile}

請求プロフィールを更新するには、**請求プロフィール**エリアの鉛筆アイコンをクリックします。

![edit-billing-profile](/img/edit-billing-profile.png)

### マーケットプレイスのサブスクリプションに切り替える{#switch-to-marketplace-subscription}

クレジットカードからAWS、GCP、またはAzure Marketplaceのサブスクリプションに移行したい方は、対応するMarketplaceを訪問し、Zilliz Cloudサービスに登録してください。詳細な手順については、[AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)、[Google Cloud Marketplaceに登録する](./subscribe-on-gcp-marketplace)、および[Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)のガイドを参照してください。

サブスクリプションがAWSMarketplaceで成功すると、既存のクレジットカード情報が自動的に置き換えられます。更新内容は、**支払方法**セクションの**請求概要**ページで確認できます。

<Admonition type="info" icon="📘" title="ノート">

<p>変更が反映されるまで、請求概要に数分間お時間をいただきますようお願いいたします。</p>

</Admonition>

## 支払いクレジットカードを削除する{#remove-payment-credit-card}

現在、Zilliz Cloudはウェブコンソールでの支払いクレジットカードの削除をサポートしていません。リンクされたクレジットカードを削除する必要がある場合は、Zilliz Cloud[サポートポータル](https://support.zilliz.com/hc/en-us)でチケットを送信してください。

## 関連するトピック{#related-topics}

- [AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplaceに登録する](./subscribe-on-gcp-marketplace)

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- [インボイス](./view-invoice)

