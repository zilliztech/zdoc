---
title: "前払いを利用する | Cloud"
slug: /advance-pay
sidebar_key: advance-pay
sidebar_label: "前払い"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クレジットカードの登録や AWS Marketplace でのサブスクリプションに代わる支払い方法として、前払い（銀行振込）も受け付けています。| Cloud"
type: origin
token: K8hFwmeBQiCSO4ktT9ScD9zMnua
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 前払い

---

import Admonition from '@theme/Admonition';


# 前払いの利用

Zilliz Cloud では、クレジットカードの追加や AWS Marketplace での購読に代わる支払い方法として、前払い（銀行振込）も受け付けています。

## 前払い残高への入金\{#add-funds-to-advance-pay}

現在、前払い残高への入金は、[お問い合わせ](https://zilliz.com/contact-sales) からのみ可能です。

<Admonition type="info" icon="📘" title="Note">

<p>支払い方法の優先順位は以下の通りです：クレジット &gt; 前払い &gt; クレジットカード / AWS Marketplace 購読。</p>
<p>つまり、クレジットが残っており、かつ前払い入金およびクレジットカードの追加または AWS Marketplace での購読を行っている場合、利用料金の決済にはまずクレジットが差し引かれます。クレジットが不足している場合は、前払い資金が差し引かれます。それでも資金とクレジットが料金をカバーするのに足りない場合、クレジットカードまたは AWS Marketplace アカウントに対して請求が行われます。</p>

</Admonition>

## 前払い履歴の確認\{#view-advance-pay-history}

銀行振込履歴を確認するには、上部ナビゲーションバーまたは左側ナビゲーションペインで「請求」をクリックし、次に「前払い」セクション内の「履歴」をクリックします。**銀行振込履歴**ページでは、振込を行った日時、追加された資金額など、過去すべての振込の詳細を確認できます。

![add-fund-en](https://zdoc-images.s3.us-west-2.amazonaws.com/add-fund-en.png "add-fund-en")

## 前払い残高の監視設定\{#set-monitor-for-advance-pay-balance}

デフォルトでは、前払い残高の監視は無効になっています。ただし、これを有効にすることで、前払い残高が監視条件で指定した金額を下回った際に通知を受け取ることができます。詳細については、[組織アラートの管理](./manage-organization-alerts) を参照してください。

## 前払い資金の返金\{#refund-advance-pay-funds}

現在、Zilliz Cloud の Web コンソールでは返金をサポートしていません。返金を希望される場合は、Zilliz Cloud の [サポートポータル](https://support.zilliz.com/hc/en-us) にてお問い合わせいただき、リクエストを送信してください。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplace で購読する](./subscribe-on-aws-marketplace)

- [GCP Marketplace で購読する](./subscribe-on-gcp-marketplace)

- [請求書の表示](./view-invoice) 

