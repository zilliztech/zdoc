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

<Admonition type="info" title="Notes">

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

## クラスタープラン別の概要\{#summary-by-cluster-plan}

Zilliz Cloud では、Free、Serverless、Dedicated の 3 種類のクラスターを提供しています。料金が発生するのは Serverless クラスターと Dedicated クラスターのみです。

- **Dedicated クラスター:** 使用量に基づいて課金されます。料金は `Cluster Cost = Cluster CU Size x Runtime x Unit Price` として計算されます。Serverless クラスターとは異なり、Dedicated クラスターは専用リソースが割り当てられるため、アクティブな read/write 操作がなくても料金が発生します。

    <Admonition type="info" title="Notes">

    Dedicated クラスターの料金では、ランタイムは、クラスターのステータスが **Running**、**Modifying**、**Frozen** などの期間として定義されます。次の 4 つのステータスにあるクラスターには料金が発生しません：**Creating**、**Suspending**、**Resuming**、**Suspended**。

    </Admonition>

- **Serverless クラスター:** read/write 操作中の vCU 消費量に対して、従量課金制で請求されます。料金は `Read and Write Cost = vCU Usage x vCU Unit Price` として計算されます。操作が発生しない場合、ストレージ料金のみが請求されます。

追加料金には次のものが含まれます：

- **バックアップコスト:** `Backup File Size x Backup Retention Period` として計算され、単位は「GB-月」です。これは、1 GB のバックアップファイルを 1 か月保持した使用量を表します。<strong>バックアップは、保持期間が 1 日未満であっても、最低 1 日分が請求されます。</strong>つまり、バックアップファイルが作成されたものの 1 日未満しか保持されなかった場合でも、1 日分の料金が請求されます。

- **ストレージコスト:** `Current Storage Size x Cluster Runtime` として計算され、単位は「GB-時間」です。これは、1 GB のデータを 1 時間保存した使用量を表します。**ストレージは、保存期間が 1 時間未満であっても、最低 1 時間分が請求されます。**

    <Admonition type="info" title="Notes">

    ストレージコストでは、ランタイムは、クラスターのステータスが **Running**、**Modifying**、**Frozen** などの期間として定義されます。次のステータスにあるクラスターには料金が発生しません：**Creating**。

    </Admonition>

## 請求書の詳細\{#invoice-details}

このセクションでは、課金対象の各項目の料金を詳細に説明します。

## 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書の発行場所と発行先に関する詳細が含まれます。Zilliz Cloud では、関連する請求メールが Organization Owner、Organization Billing Admin、および請求プロファイルに追加されたメールアドレスに送信されます。そのため、請求書の受領者を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを [招待](./manage-platform-users#invite-organization-members) して Organization Billing Admin として組織に参加させることができます。

請求プロファイルを編集するには、[請求プロファイルの更新](./update-billing-profile) を参照してください。

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始日時と終了日時は何ですか？**

    **説明:** 請求期間は、前月の初日 00:00:00 (UTC) に始まり、その月の最終日 23:59:59 (UTC) に終わります。

    <strong>例:</strong> Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までです。

1. **Zilliz Cloud の使用量詳細に表示される金額の精度はどの程度ですか？**

    Zilliz Cloud は料金を **小数点以下 10 桁** の精度で計算し、すべての請求はこの精度で計算されます。日次料金はまず小数点以下 10 桁まで計算され、請求処理中に合計して小数点以下 10 桁に丸められます。

    - **RESTful API**: すべての数値（単価、使用量、使用金額など）は、常に小数点以下ちょうど 10 桁で返されます。値の小数桁数が 10 桁未満の場合は、10 桁に達するまで末尾にゼロが埋められます。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

    - **Web コンソール UI**: 表示される金額は API の値と一致しますが、読みやすさのため末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

1. **請求書がまだ届かないのはなぜですか？**

    **考えられる原因:** 請求書にアクセスできるのは、**Organization Owner** または **Billing Admin** のみです。

    **解決策:** 必要な権限があることを確認してください。請求書にアクセスできない場合は、Organization Owner または Billing Admin に連絡してください。

1. **支払い方法に問題が発生した場合はどうなりますか？**

    **考えられる原因:** 指定した支払い方法（クレジットカードなど）の有効期限が切れているか、残高が不足している可能性があります。

    <strong>解決策:</strong> 支払いに失敗すると、Zilliz Cloud から **Organization Owners** と **Billing Admins** にメールで通知されます。Organization Owners と Billing Admins は、**Billing Profile** ページで組織の支払い方法を更新し、**14 日間の Grace Period** 内に支払いを再試行できます。

1. **Grace Period とは何ですか？**

    **説明:** **Grace Period** は、支払期日後の 14 日間の期間で、請求書が延滞になる前に引き続き支払いを行うことができます。

    **ヒント:** この期間中は毎日メールでリマインダーが送信され、支払いが完了するまで請求書ステータスは未払いのままです。

1. **延滞日を過ぎても支払わない場合はどうなりますか？**

    **説明:** **Grace Period** 内に支払いが行われない場合：

    - **Overdue Date** に、請求書は延滞としてマークされます。

    - **Overdue Date** の 1 日後、組織は **凍結** され、Zilliz Cloud サービスへのアクセスが制限されます。

    - 組織が凍結された 1 日後も支払いが行われない場合、すべてのクラスター（Serverless および Dedicated）が自動的に削除されます。

    **解決策:** サービス停止やデータ損失を避けるため、**Overdue Date** より前に支払いを完了してください。

1. **Serverless クラスターで操作がなくても料金が請求されるのはなぜですか？**

    **説明:** Serverless クラスターで読み取りまたは書き込み操作が発生しなくても、ストレージ料金は請求されます。ストレージコストは、保存されているデータのサイズと、そのデータが Zilliz Cloud に保持されている時間に基づいて計算されます。

    **解決策:** ストレージコストを最小限に抑えるには、未使用のデータを削除することを検討してください。

1. **組織が凍結されたというメールを受け取りました。どうすればよいですか？**

    **説明:** 組織が凍結されたことを示すメールを受け取った場合、支払いが延滞しており、Zilliz Cloud サービスへのアクセスが制限されていることを意味します。

    **解決策:** 

    組織の凍結を解除するには：

    - クラスターが自動的に削除されないよう、凍結後 1 日以内に必要な支払いを行います。

    - 支払いが処理されると、組織の凍結が解除され、クラスターへの完全なアクセスが復元されます。

1. **請求書の延滞により自動削除されたクラスターを復元するにはどうすればよいですか？**

    **説明:** クラスターが自動的に削除された場合、組織の凍結後も支払いが行われていないことを意味します。

    **解決策:**

    自動削除されたクラスターを復元するには：

    - まず、組織の凍結を解除するための支払いを行います。

    - 支払いが成功したら、Recycle Bin に移動して削除済みクラスターを復元します。

    **ヒント:** 

    - 削除されたクラスターは 30 日間 Recycle Bin に保持されます。クラスターがまだ必要な場合は、クラスター削除から 30 日以内に延滞料金を支払ってください。

    - 支払いまたはクラスターの復元中に問題が発生した場合は、[サポートチケットを送信](http://support.zilliz.com) してください。
