---
title: "請求書の概要 | BYOC"
slug: /view-invoice
sidebar_label: "請求書の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud における組織レベルの課金について説明します。 | BYOC"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 請求書の概要

Zilliz Cloud では、組織単位で課金されます。 

請求書にアクセスするには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。

<Admonition type="info" icon="📘" title="📘 Notes">

Marketplace 経由でサブスクリプションをご利用の場合、Zilliz Cloud の利用に関する請求書は Marketplace を通じて発行されます。 

</Admonition>

各請求書はいくつかの主要な要素で構成されています。このセクションでは、サンプル請求書を用いて各要素を解説します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、料金の算出対象期間と支払い期日が記載されています。

- **Billing Cycle:** 通常、前月の初日 00:00:00 (UTC) から同月最終日 23:59:59 (UTC) までの 1 か月間が対象となります。例えば、Zilliz Cloud が 2024 年 9 月 1 日に 8 月分の請求書を発行する場合、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。この期間中の利用に対して料金が発生し、請求書のステータスは「**unbilled**」のまま維持されます。

- **Data of Issue:** 請求書が発行された日付です。この日付をもって請求書のステータスが「**unpaid**」に変更され、支払いが可能になります。クレジットカードや Marketplace サブスクリプションなどの支払い方法が登録されている場合は、自動的に引き落としが行われます。支払いが正常に完了すると、ステータスは「**paid**」に更新されます。支払いに失敗した場合は、**Organization Owner(s)** および **Billing Admin(s)** に通知メールが送信されます。

- **Due Date:** 支払いを行う最終期限日です。

- **Overdue Date:** 支払いが行われない場合、請求書のステータスは「**overdue**」となります。請求書が延滞状態になると、クラスターの作成、クエリ CU やレプリカの増設、オートスケーリングの有効化・利用など、リソース使用量を増加させる操作が制限される場合があります。お早めにお支払いいただくことを推奨します。

## 請求書のステータス\{#invoice-status}

Zilliz Cloud における請求書のステータスは、支払いプロセスの各段階を表しています。各ステータスの詳細は以下の表をご参照ください。

| **Status** | **Definition** |
| --- | --- |
| **Unbilled** | 請求サイクル終了後、明細書発行前に発生したトランザクションです。即時の支払いは不要ですが、次回の請求サイクルに含まれます。 |
| **Unpaid** | 請求書が発行されており、支払い期限内の状態です。 |
| **Overdue** | 請求書が発行されましたが、支払い期限を過ぎても支払いが完了していない状態です。 |
| **Paid** | 未払い額がなく、支払いが完了している状態です。 |
| **Free** | 請求額の全額がクレジットで相殺された状態です。 |

## 請求サマリー\{#invoice-summary}

サマリー セクションでは、請求書に記載される料金の概要を確認できます。

- **Usage Amount:** すべての課金対象項目（CU、ストレージ、バックアップ、パイプライン、読み取りおよび書き込みコストを含む）の月間合計額です。

- **Credits:** 支払いに適用されたクレジット額です。

- **Subtotal:** Subtotal = Usage Amount - Credits です。

- **Tax:** Tax = Subtotal x Tax rate です。税率は請求先住所の国に基づいて決定されます。

- **Total Amount:** Total Amount = Subtotal + Tax です。

- **Advance Pay:** 支払いに充当された Advance Pay の金額です。

- **Amount Due/Amount Paid:** 支払いが必要な最終金額、または支払い済みの金額です。

## クラスター プラン別サマリー\{#summary-by-cluster-plan}

Zilliz Cloud では、Free、Serverless、Dedicated の 3 種類のクラスターを提供しています。料金が発生するのは Serverless クラスターと Dedicated クラスターのみです。

- **Dedicated クラスター:** 使用量に基づいて請求されます。料金は `Cluster Cost = Cluster CU Size x Runtime x Unit Price` として計算されます。Serverless クラスターとは異なり、専用クラスターでは専用リソースが割り当てられるため、アクティブな読み取り/write操作がない場合でも料金が発生します。

    <Admonition type="info" icon="📘" title="Notes">

    Dedicated クラスターのコストについて、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。次の 4 つのステータスにあるクラスターには料金は発生しません：「**Creating**」、「**Suspending**」、「**Resuming**」、「**Suspended**」。 

    </Admonition>

- **Serverless クラスター:** 読み取り/write操作中の vCU 消費量に基づいて従量課金制で請求されます。コストは `Read and Write Cost = vCU Usage x vCU Unit Price` として計算されます。操作が発生しない場合は、ストレージ料金のみが請求されます。

追加料金の内訳は以下の通りです。

- **Backup Costs:** `Backup File Size x Backup Retention Period` で計算され、「GB-month」単位で計測されます。これは 1 GB のバックアップ ファイルを 1 か月間保持した場合の使用量に相当します。**バックアップは保持期間に関わらず最低 1 日分が課金されます。** つまり、バックアップ ファイルを作成して 1 日未満で削除した場合でも、1 日分の料金が発生します。

- **Storage Costs:** `Current Storage Size x Cluster Runtime` で計算され、「GB-Hour」単位で計測されます。これは 1 GB のデータを 1 時間保存した場合の使用量に相当します。**ストレージは保存期間に関わらず最低 1 時間分が課金されます。** 

    <Admonition type="info" icon="📘" title="Notes">

    ストレージコストについて、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。次のステータスにあるクラスターには料金は発生しません：「**Creating**」。

    </Admonition>



## 請求明細\{#invoice-details}

このセクションでは、各課金対象項目の料金の詳細な内訳を確認できます。 

## 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書の送付先や宛名に関する情報が含まれています。Zilliz Cloud では、請求関連のメールが Organization Owners、Organization Billing Admins、および請求プロファイルに登録されたメールアドレスに送信されます。請求書の受取人を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを Organization Billing Admin として組織に[招待](./manage-platform-users#invite-organization-users)してください。

請求プロファイルを編集するには、[Update Billing Profile](./update-billing-profile) をご参照ください。

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始時刻と終了時刻はいつですか？**

    **Explanation:** 請求期間は、前月の初日 00:00:00 (UTC) から同月最終日 23:59:59 (UTC) までです。 

    **Example:** Zilliz Cloud が 2024 年 9 月 1 日に 8 月分の請求書を発行する場合、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。 

1. **Zilliz Cloud の使用量詳細に表示される金額の精度はどの程度ですか？**

    Zilliz Cloud は料金を**小数点以下 10 桁**の精度で計算しており、すべての課金処理はこの精度で行われます。日次の料金はまず小数点以下 10 桁で算出され、請求処理時に合計されて小数点以下 10 桁に丸められます。

    - **RESTful API**: Unit Price、Usage、Usage Amount などのすべての数値は、常に小数点以下 10 桁で返されます。桁数が 10 桁に満たない場合は、末尾にゼロが埋め込まれて 10 桁に揃えられます。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) をご参照ください。

    - **Web Console UI**: 表示される金額は API の値と一致しますが、可読性を高めるために末尾のゼロは省略されます。例えば、UI 上では `0.1234000000` が `0.1234` と表示されます。

1. **請求書が届かないのはなぜですか？**

    **Possible Cause:** 請求書にアクセスできるのは **Organization Owners** または **Billing Admins** のみです。

    **Solution:** ご自身のアカウントに必要な権限があるか確認してください。請求書にアクセスできない場合は、Organization Owner または Billing Admin にお問い合わせください。

>
