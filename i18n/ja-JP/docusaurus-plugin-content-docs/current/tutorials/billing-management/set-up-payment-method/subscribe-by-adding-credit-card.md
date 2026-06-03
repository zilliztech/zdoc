---
title: "クレジットカードの追加で購読 | Cloud"
slug: /subscribe-by-adding-credit-card
sidebar_key: subscribe-by-adding-credit-card
sidebar_label: "クレジットカード"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で組織の支払い用クレジットカードを追加する方法について、包括的な手順を説明します。"
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

# クレジットカードの追加による購読

このガイドでは、Zilliz Cloud で組織の支払い用クレジットカードを追加する方法について、包括的な手順を説明します。

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><strong>課税:</strong> 請求書の税金は、ご提供いただいた請求先住所に基づいて計算されます。VAT または GST ID の入力が必要な企業の場合は、<a href="http://support.zilliz.com">お問い合わせ</a> ください。</li>
</ul>

</Admonition>

## クレジットカードの追加\{#add-a-credit-card}

<Procedures>

1. アカウントを登録しログイン後、左側のメニューから **請求** に移動し、請求概要にアクセスします。

1. 画面の右下にある **支払い** **方法** セクションで、**支払い方法の追加** をクリックします。開いたダイアログボックスで、**クレジットカード** を選択します。

    ダイアログボックスが表示され、以下の入力を求められます:

    - クレジットカード情報:

        - **カード番号**

        - **有効期限**

        - **CVC**

    - 請求情報:

        - **名**

        - **姓**

        - **会社名**

        - **Eメール**

        - **番地**

            - 会社の住所を使用することをお勧めします。この住所は税金の計算に使用され、発行されたすべての請求書に表示されます。

        - **国/地域**

        - **都道府県**

        - **市区町村**

        - **郵便番号**

</Procedures>

上記のすべての項目は必須です。入力が完了すると、**追加** ボタンが有効になり、クレジットカード情報と請求情報を保存できます。

![add-credit-card](https://zdoc-images.s3.us-west-2.amazonaws.com/add-credit-card.png "add-credit-card")

## 支払い方法の編集\{#edit-your-payment-method}

支払い方法は、**請求** **概要** ページからいつでも確認および編集できます。

![payment-overivew](https://zdoc-images.s3.us-west-2.amazonaws.com/payment-overivew.png "payment-overivew")

クレジットカードの有効期限が近づくと、[クレジットカード有効期限モニター](./manage-organization-alerts) から通知を受け取ります。お好みのタイミングで支払い情報を更新するか、[AWS Marketplace 購読](./subscribe-on-aws-marketplace) に切り替えることができます。

### **クレジットカードの編集**\{#replace-a-credit-card}

クレジットカード情報を更新するには、**支払い方法** エリアの鉛筆アイコンをクリックします。

 ダイアログボックスが表示され、以下の入力を求められます:

- クレジットカード情報:

    - **カード番号**

    - **有効期限**

    - **CVC**

- 請求情報:

    - **名**

    - **姓**

    - **会社名**

    - **Eメール**

    - **番地**

        - 会社の住所を使用することをお勧めします。この住所は税金の計算に使用され、発行されたすべての請求書に表示されます。

    - **国/地域**

    - **都道府県**

    - **市区町村**

    - **郵便番号**

上記のすべての項目は必須です。入力が完了すると、**更新** ボタンが有効になり、支払い方法を保存できます。

![update-payment-method](https://zdoc-images.s3.us-west-2.amazonaws.com/update-payment-method.png "update-payment-method")

### **請求プロファイルの編集**\{#edit-billing-profile}

請求プロファイルを更新するには、**請求プロファイル** エリアの鉛筆アイコンをクリックします。

![edit-billing-profile](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-billing-profile.png "edit-billing-profile")

### **Marketplace 購読への切り替え**\{#switch-to-marketplace-subscription}

クレジットカードの支払い方法から AWS、GCP、または Azure Marketplace 購読に移行したい場合は、該当する Marketplace にアクセスし、Zilliz Cloud サービスを購読してください。詳細な手順については、[AWS Marketplace での購読](./subscribe-on-aws-marketplace)、[GCP Marketplace での購読](./subscribe-on-gcp-marketplace)、[Azure Marketplace での購読](./subscribe-on-azure-marketplace) のガイドを参照してください。

AWS Marketplace 経由で購読が完了すると、既存のクレジットカード情報は自動的に置き換えられます。更新内容は、**請求概要** ページの **支払い方法** セクションで確認できます。

<Admonition type="info" icon="📘" title="Note">

<p>請求概要に変更が反映されるまで、数分お待ちください。</p>

</Admonition>

## 支払い用クレジットカードの削除\{#remove-payment-credit-card}

現在、Zilliz Cloud は Web コンソールでの支払い用クレジットカードの削除をサポートしていません。リンク済みのクレジットカードを削除する必要がある場合は、Zilliz Cloud [サポートポータル](https://support.zilliz.com/hc/en-us) からお問い合わせいただき、チケットを送信してください。

## 関連トピック\{#related-topics}

- [AWS Marketplace での購読](./subscribe-on-aws-marketplace)

- [GCP Marketplace での購読](./subscribe-on-gcp-marketplace)

- [請求書の確認](./view-invoice) 
