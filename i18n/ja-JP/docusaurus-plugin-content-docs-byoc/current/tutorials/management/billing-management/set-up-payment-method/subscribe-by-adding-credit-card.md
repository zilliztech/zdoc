---
title: "クレジットカード | BYOC"
slug: /subscribe-by-adding-credit-card
sidebar_label: "クレジットカード"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で組織の支払い用クレジットカードを追加する方法について包括的に説明します。 | BYOC"
type: origin
token: TVnkwXupUiX3zDkzYPWcxKP3nvg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クレジットカード

このガイドでは、Zilliz Cloud で組織の支払い用クレジットカードを追加する方法について包括的に説明します。

<Admonition type="info" icon="📘" title="📘 Note">

- **税金:** 請求書の税金は、入力した請求先住所に基づいて計算されます。VAT または GST ID の入力が必要な企業は、[お問い合わせください](http://support.zilliz.com)。

- **アクセス制御**: 支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## クレジットカードを追加する\{#add-a-credit-card}

<Supademo id="cmpf2ubt32ddyqm8qp3nfrb56" title=""  />

<Procedures>

1. **Billing** に移動します。

1. **+ Add Payment Method** をクリックします。

1. **Credit Card** を選択します。

1. カード情報と請求情報を入力します。

    - クレジットカード情報:

        - **Card number**

        - **Expiration**

        - **CVC**

    - 請求情報:

        - **First Name**

        - **Last Name**

        - **Company Name**

        - **Email**

        - **Street Address**

            会社の住所を使用することをお勧めします。この住所は税額の計算に使用され、発行されるすべての請求書に表示されます。

        - **Country / Region**

        - **State / Province**

        - **City**

        - **ZIP/Postal Code**

1. **Add** をクリックします。

</Procedures>

## クレジットカードを差し替える\{#replace-a-credit-card}

クレジットカードの有効期限が近づいたら、既存のカードを差し替えるか、[Marketplace subscription](./marketplace-subscription) に切り替えることができます。

以下のデモでは、既存のクレジットカードを新しいカードに差し替える方法を示しています。

<Supademo id="cmpf3fm4q2ehaqm8q8j5jx188" title=""  />

<Procedures>

1. **Billing** に移動します。

1. クレジットカードの横にある **Replace** をクリックします。

1. 新しいクレジットカードの情報を入力します。

    - **Card number**

    - **Expiration**

    - **CVC**

1. **Replace** をクリックします。

</Procedures>

## Marketplace subscription に切り替える\{#switch-to-marketplace-subscription}

クレジットカード支払いから Marketplace subscription に移行したい場合は、対応する Marketplace で直接サブスクライブしてください。 

サブスクリプションが正常に完了すると、既存のクレジットカード情報は自動的に置き換えられます。更新内容は、**Billing Overview** ページの **Payment Method** セクションで確認できます。

<Admonition type="info" icon="📘" title="📘 Note">

変更が Billing Overview に反映されるまで、数分かかる場合があります。

</Admonition>

Marketplace subscription の詳細については、[Marketplace Subscription](./marketplace-subscription) を参照してください。

支払い方法の更新の詳細については、[Update Payment Method](./update-payment-method) を参照してください。

## クレジットカードの有効期限モニタリングを設定する\{#set-monitor-for-credit-card-expiration}

デフォルトでは、クレジットカードの有効期限に関するモニタリングは無効になっています。ただし、これを有効にすると、クレジットカードの有効期限が 7 日後または 30 日後に切れる場合に通知を受け取ることができます。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。 

## クレジットカードを削除する\{#remove-credit-card}

現在、Zilliz Cloud は Web コンソールでの支払い用クレジットカードの削除をサポートしていません。リンク済みのクレジットカードを削除する必要がある場合は、お問い合わせのうえ、Zilliz Cloud の[サポートポータル](https://support.zilliz.com/hc/en-us)でチケットを送信してください。
