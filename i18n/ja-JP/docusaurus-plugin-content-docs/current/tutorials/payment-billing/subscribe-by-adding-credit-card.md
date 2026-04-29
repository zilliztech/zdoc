---
title: "クレジットカードを追加して購読 | Cloud"
slug: /subscribe-by-adding-credit-card
sidebar_key: subscribe-by-adding-credit-card
sidebar_label: "クレジットカード"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で組織の支払い用クレジットカードを追加する方法について詳しく説明します。| Cloud"
type: origin
token: TVnkwXupUiX3zDkzYPWcxKP3nvg
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クレジットカード
  - 購読

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クレジットカードを追加して購読する

このガイドでは、Zilliz Cloud 上で組織用に支払い用のクレジットカードを追加する方法について詳しく説明します。

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><strong>課税:</strong> 請求書にかかる税金は、ご提供いただいた請求先住所に基づいて計算されます。VAT または GST ID の入力が必要な企業のお客様は、<a href="http://support.zilliz.com">お問い合わせください</a>。</li>
</ul>

</Admonition>

## クレジットカードの追加\{#add-a-credit-card}

<Procedures>

1. アカウントを登録してログインした後、左側のメニューから**請求**に移動し、**請求概要**にアクセスします。

1. 画面右下にある**支払い** **方法**セクションで、**Add 支払い 方法**をクリックします。表示されるダイアログボックスで、**クレジットカード**を選択します。

    以下の情報を入力するよう促すダイアログボックスが表示されます。

    - クレジットカード情報:

        - **カード番号**

        - **有効期限**

        - **CVC**

    - 請求先情報:

        - **名**

        - **姓**

        - **会社名**

        - **Eメール**

        - **番地**

            - 会社住所の使用を推奨します。この住所は税金の計算に使用され、発行されるすべての請求書に記載されます。

        - **国/地域**

        - **都道府県**

        - **市区町村**

        - **郵便番号**

</Procedures>

上記のすべての項目は必須です。入力が完了すると、**Add**ボタンが有効になり、クレジットカード情報と請求先情報を保存できるようになります。

![add-credit-card](https://zdoc-images.s3.us-west-2.amazonaws.com/add-credit-card.png "add-credit-card")

## 支払い方法の編集\{#edit-your-payment-method}

支払い方法は、**請求** **Overview**ページからいつでも確認および編集できます。

![payment-overivew](https://zdoc-images.s3.us-west-2.amazonaws.com/payment-overivew.png "payment-overivew")

クレジットカードの有効期限が近づくと、[クレジットカード有効期限モニター](./manage-organization-alerts) によって通知されます。都合の良い時に、支払い情報を更新するか、[AWS Marketplace での購読](./subscribe-on-aws-marketplace) に切り替えることができます。

### **クレジットカードの編集**\{#edit-credit-card}

クレジットカード情報を更新するには、**支払い 方法**エリアにある鉛筆アイコンをクリックします。

以下の情報を入力するよう促すダイアログボックスが表示されます。

- クレジットカード情報:

    - **カード番号**

    - **有効期限**

    - **CVC**

- 請求先情報:

    - **名**

    - **姓**

    - **会社名**

    - **Eメール**

    - **番地**

        - 会社住所の使用を推奨します。この住所は税金の計算に使用され、発行されるすべての請求書に記載されます。

    - **国/地域**

    - **都道府県**

    - **市区町村**

    - **郵便番号**

上記のすべての項目は必須です。入力が完了すると、**Update**ボタンが有効になり、支払い方法を保存できるようになります。

![update-payment-method](https://zdoc-images.s3.us-west-2.amazonaws.com/update-payment-method.png "update-payment-method")

### **請求プロファイルの編集**\{#edit-billing-profile}

請求プロファイルを更新するには、**請求 プロファイル**エリアにある鉛筆アイコンをクリックします。

![edit-billing-profile](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-billing-profile.png "edit-billing-profile")

### **Marketplace 購読への切り替え**\{#switch-to-marketplace-subscription}

クレジットカードによる支払い方法から AWS、GCP、または Azure Marketplace での購読に移行したい場合は、該当する Marketplace を訪問し、Zilliz Cloud サービスを購読してください。詳細な手順については、[AWS Marketplace での購読](./subscribe-on-aws-marketplace)、[GCP Marketplace での購読](./subscribe-on-gcp-marketplace)、および [Azure Marketplace での購読](./subscribe-on-azure-marketplace) のガイドを参照してください。

AWS Marketplace を介して購読が正常に完了すると、既存のクレジットカード情報は自動的に置き換えられます。**請求概要**ページの**支払い 方法**セクションで更新内容を確認できます。

<Admonition type="info" icon="📘" title="Note">

<p>請求概要に変更が反映されるまで、数分お待ちください。</p>

</Admonition>

## 支払い用クレジットカードの削除\{#remove-payment-credit-card}

現在、Zilliz Cloud では Web コンソール上で支払い用クレジットカードを削除することはできません。リンクされたクレジットカードを削除する必要がある場合は、Zilliz Cloud の [サポートポータル](https://support.zilliz.com/hc/en-us) までご連絡いただき、チケットを提出してください。

## 関連トピック\{#related-topics}

- [AWS Marketplace での購読](./subscribe-on-aws-marketplace)

- [GCP Marketplace での購読](./subscribe-on-gcp-marketplace)

- [請求書の表示](./view-invoice) 

