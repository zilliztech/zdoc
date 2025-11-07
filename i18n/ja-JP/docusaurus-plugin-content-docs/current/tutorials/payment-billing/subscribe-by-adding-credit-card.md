---
title: "クレジットカードを追加して登録 | Cloud"
slug: /subscribe-by-adding-credit-card
sidebar_label: "クレジットカード"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudで組織の支払い用クレジットカードを追加する方法について包括的な手順を提供します。 | Cloud"
type: origin
token: TVnkwXupUiX3zDkzYPWcxKP3nvg
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - クレジットカード
  - 登録
  - ヒエラルキカル・ナビゲーブル・スモール・ワールド
  - デンス埋め込み
  - faissベクターデータベース
  - chromaベクターデータベース

---

import Admonition from '@theme/Admonition';


# クレジットカードを追加して登録

このガイドでは、Zilliz Cloudで組織の支払い用クレジットカードを追加する方法について包括的な手順を提供します。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><strong>課税：</strong> 請求書の税金は、提供する請求先住所に基づいて計算されます。VATまたはGST IDの入力が必要な企業の場合は、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</li>
</ul>

</Admonition>

## クレジットカードを追加\{#add-a-credit-card}

1. アカウントを登録してログインした後、左側のメニューから**請求**に移動して請求概要にアクセスします。

1. 画面右下にある**支払い方法**セクションで、**支払い方法を追加**をクリックします。開くダイアログボックスで、**クレジットカード**を選択します。

    ダイアログボックスが表示され、以下を入力するよう求められます：

- クレジットカード情報：

    - **カード番号**

    - **有効期限**

    - **CVC**

- 請求情報：

    - **名**

    - **姓**

    - **会社名**

    - **メールアドレス**

    - **住所**

        - 会社の住所の使用を推奨します。この住所は税金を計算するために使用され、発行されるすべての請求書に表示されます。

    - **国 / リージョン**

    - **都道府県 / 県**

    - **市区町村**

    - **郵便番号**

上記のすべてのフィールドは必須です。入力が完了すると、**追加**ボタンが有効になり、クレジットカード情報と請求情報を保存できます。

![add-credit-card](/img/add-credit-card.png)

## 支払い方法を編集\{#edit-your-payment-method}

支払い方法は、**請求概要**ページからいつでも表示および編集できます。

![payment-overivew](/img/payment-overivew.png)

クレジットカードの有効期限が近づくと、[クレジットカード有効期限モニター](./manage-organization-alerts)によって通知されます。支払い情報を更新するか、都合の良いタイミングで[AWSマーケットプレイス登録](./subscribe-on-aws-marketplace)に切り替えることができます。

### **クレジットカードを編集**\{#edit-credit-card}

クレジットカード情報を更新するには、**支払い方法**エリアの鉛筆アイコンをクリックします。

    ダイアログボックスが表示され、以下を入力するよう求められます：

- クレジットカード情報：

    - **カード番号**

    - **有効期限**

    - **CVC**

- 請求情報：

    - **名**

    - **姓**

    - **会社名**

    - **メールアドレス**

    - **住所**

        - 会社の住所の使用を推奨します。この住所は税金を計算するために使用され、発行されるすべての請求書に表示されます。

    - **国 / リージョン**

    - **都道府県 / 県**

    - **市区町村**

    - **郵便番号**

上記のすべてのフィールドは必須です。入力が完了すると、**更新**ボタンが有効になり、支払い方法を保存できます。

![update-payment-method](/img/update-payment-method.png)

### **請求プロファイルを編集**\{#edit-billing-profile}

請求プロファイルを更新するには、**請求プロファイル**領域の鉛筆アイコンをクリックします。

![edit-billing-profile](/img/edit-billing-profile.png)

### **マーケットプレイス登録に切り替える**\{#switch-to-marketplace-subscription}

クレジットカード支払い方法からAWS、GCP、またはAzureマーケットプレイス登録に移行したい場合は、対応するマーケットプレイスにアクセスしてZilliz Cloudサービスに登録してください。詳細な手順については、[AWSマーケットプレイスで登録](./subscribe-on-aws-marketplace)、[GCPマーケットプレイスで登録](./subscribe-on-gcp-marketplace)、および[Azureマーケットプレイスで登録](./subscribe-on-azure-marketplace)を参照してください。

AWSマーケットプレイス経由で登録が成功すると、既存のクレジットカード情報が自動的に置き換えられます。**請求概要**ページの**支払い方法**セクションで更新内容を確認できます。

<Admonition type="info" icon="📘" title="注意">

<p>請求概要に変更が反映されるまで数分お待ちください。</p>

</Admonition>

## 支払い用クレジットカードを削除\{#remove-payment-credit-card}

現在、Zilliz Cloudではウェブコンソールでの支払い用クレジットカードの削除はサポートされていません。リンクされたクレジットカードを削除する必要がある場合は、お問い合わせいただき、Zilliz Cloud[サポートポータル](https://support.zilliz.com/hc/en-us)でチケットを送信してください。

## 関連トピック\{#related-topics}

- [AWSマーケットプレイスで登録](./subscribe-on-aws-marketplace)

- [GCPマーケットプレイスで登録](./subscribe-on-gcp-marketplace)

- [請求書を表示](./view-invoice)

