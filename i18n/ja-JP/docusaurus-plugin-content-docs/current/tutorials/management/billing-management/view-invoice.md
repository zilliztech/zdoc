---
title: "請求書について理解する | Cloud"
slug: /view-invoice
sidebar_label: "請求書について理解する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は組織レベルで課金されます。 | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 請求書について理解する

Zilliz Cloud は組織レベルで課金されます。 

請求書にアクセスするには、**Organization Owner** または **Organization Billing Admin** 権限が必要です。

<Admonition type="info" icon="📘" title="📘 注意">

Marketplace で契約している場合、Zilliz Cloud の利用料金に対する請求書は Marketplace を通じて送付されます。 

</Admonition>

各請求書はいくつかの主要な構成要素で成り立っています。このセクションでは、請求書の例を通して各要素を理解できるように説明します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## 請求サイクル\{#billing-cycle}

請求書の上部に表示される Billing cycle には、料金が計算される期間と支払期日が示されます。

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](https://zdoc-images.s3.us-west-2.amazonaws.com/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **Billing Cycle:** 通常、前月の初日 00:00:00 (UTC) に始まり、その月の最終日 23:59:59 (UTC) に終わる 1 か月間の期間です。たとえば、Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。この期間中の利用に応じて料金が累積され、請求書ステータスは「**unbilled**」のままです。

- **Data of Issue:** 請求書が生成される日付です。この日に請求書ステータスは「**unpaid**」に変わり、支払いが可能になります。支払い方法（例: クレジットカードまたは Marketplace サブスクリプション）を追加している場合は、自動的に請求されます。支払いが正常に完了すると、請求書ステータスは「**paid**」に更新されます。支払いに失敗した場合は、**Organization Owner(s)** と **Billing Admin(s)** に通知メールが送信されます。

- **Due Date:** 支払いを行う最終日です。この日までに支払いが確認されない場合、請求書は **Grace Period** に入ります。

- **Grace Period:** 14 日間の猶予期間で、この期間中も支払いを行うことができます。この期間中は毎日リマインドメールが送信され、支払いが成功するまで請求書ステータスは「**unpaid**」のままです。

- **Overdue Date:** 支払いが未完了のままである場合、請求書ステータスは「**overdue**」になります。翌日に組織が凍結される可能性があるため、速やかに支払うことを推奨します。凍結後 1 日以内に支払いが行われない場合、すべてのクラスター (Serverless および Dedicated) は自動的に [recycle bin](./use-recycle-bin) に移動され、30 日間保持されます。

## 請求書ステータス\{#invoice-status}

Zilliz Cloud では、請求書ステータスは支払いプロセスのさまざまな段階を表します。以下の表は、考えられる各ステータスを説明しています。

| **ステータス** | **定義** |
| --- | --- |
| **Unbilled** | Billing cycle 後で、請求書が生成される前に発生した取引です。これらの金額は直ちに支払期限を迎えるものではありませんが、次の Billing cycle に含まれます。 |
| **Unpaid** | 請求書は発行済みで、支払期限内です。 |
| **Overdue** | 請求書は発行済みですが、支払期限内に支払われていません。 |
| **Paid** | 支払いが完了しており、未払い金額はありません。 |
| **Free** | 支払うべき金額がすべてクレジットで支払われています。 |

## 請求書サマリー\{#invoice-summary}

サマリーセクションでは、請求書の料金概要を確認できます。

- **Usage Amount:** すべての課金対象項目の月間合計です（CU、ストレージ、バックアップ、パイプライン、読み取り/書き込みコストを含む）。

- **Credits:** 支払いに充当されたクレジットです。

- **Subtotal:** Subtotal = Usage Amount - Credits.

- **Tax:** Tax = Subtotal x Tax rate. 税率は請求先住所の国に基づきます。

- **Total Amount:** Total Amount = Subtotal + Tax.

- **Advance Pay:** 支払いの相殺に使用された Advance Pay の金額です。

- **Amount Due/Amount Paid:** 最終的に支払う必要がある、または支払い済みの金額です。

>
