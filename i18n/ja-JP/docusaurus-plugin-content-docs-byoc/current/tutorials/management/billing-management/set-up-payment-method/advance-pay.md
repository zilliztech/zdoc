---
title: "Advance Pay | BYOC"
slug: /advance-pay
sidebar_label: "Advance Pay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クレジットカードの追加や AWS Marketplace でのサブスクリプションに代わる支払い方法として advance pay（銀行振込）を受け付けています。 | BYOC"
type: origin
token: K8hFwmeBQiCSO4ktT9ScD9zMnua
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Advance Pay

Zilliz Cloud では、クレジットカードの追加や AWS Marketplace でのサブスクリプションに代わる支払い方法として、advance pay（銀行振込）を受け付けています。 

<Admonition type="info" icon="📘" title="📘 注">

支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## Advance Pay に資金を追加する\{#add-funds-to-advance-pay}

現在、Advance Pay 残高に資金を追加するには、[お問い合わせ](https://zilliz.com/contact-sales)いただく必要があります。

## Advance Pay の履歴を表示する\{#view-advance-pay-history}

銀行振込の履歴を表示するには、上部のナビゲーションバーまたは左側のナビゲーションペインで Billing をクリックします。次に、Advance Pay セクションの下にある History をクリックします。**Bank Transfer History** ページでは、振込を行った日時、追加した資金の金額など、過去のすべての振込の詳細を確認できます。

![add-fund-en](https://zdoc-images.s3.us-west-2.amazonaws.com/add-fund-en.png "add-fund-en")

## Advance Pay 残高のモニタリングを設定する\{#set-monitor-for-advance-pay-balance}

デフォルトでは、advance pay 残高のモニタリングは無効になっています。ただし、有効にすることで、Advance Pay 残高がモニタリング条件で指定した金額を下回ったときに通知を受け取ることができます。詳細については、[Organization アラートの管理](./manage-organization-alerts) を参照してください。 

## Advance Pay の資金を払い戻す\{#refund-advance-pay-funds}

現在、Zilliz Cloud は Web コンソールでの払い戻しをサポートしていません。払い戻しを受けるには、Zilliz Cloud の[サポートポータル](https://support.zilliz.com/hc/en-us)からお問い合わせのうえ、リクエストを送信してください。

