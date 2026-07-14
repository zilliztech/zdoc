---
title: "請求書について理解する | BYOC"
slug: /view-invoice
sidebar_label: "請求書について理解する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は組織レベルで課金されます。 | BYOC"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 請求書について理解する

Zilliz Cloud は組織レベルで課金されます。 

請求書にアクセスするには、**Organization Owner** または **Organization Billing Admin** のいずれかの権限が必要です。

<Admonition type="info" icon="📘" title="📘 Notes">

Marketplace でサブスクライブしている場合、Zilliz Cloud の使用料に関する請求書は Marketplace 経由で受け取ります。 

</Admonition>

各請求書は複数の主要コンポーネントで構成されています。このセクションでは、請求書のサンプルを使って各要素を理解できるように説明します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、料金が計算される期間と支払期限が示されます。

- **Billing Cycle:** 通常、前月の1日 00:00:00 (UTC) に始まり、その月の最終日 23:59:59 (UTC) に終了する1か月間の期間です。たとえば、Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。この期間を通じて使用料金が蓄積され、請求書のステータスは「**unbilled**」のままです。

- **Data of Issue:** 請求書が生成される日付です。この日に請求書のステータスは「**unpaid**」に変わり、支払いが可能になります。支払い方法（例: クレジットカードまたは Marketplace サブスクリプション）を追加している場合、自動的に請求されます。支払いが正常に完了すると、請求書のステータスは「**paid**」に更新されます。支払いに失敗した場合は、**Organization Owner(s)** および **Billing Admin(s)** に通知メールが送信されます。

- **Due Date:** 支払いを行う最終日です。

- **Overdue Date:** 支払いが未完了のままの場合、請求書のステータスは「**overdue**」になります。請求書が overdue になると、リソース使用量を増やす操作（クラスターの作成、クエリ CU やレプリカの増加、自動スケーリングの有効化や使用など）がブロックされる場合があります。請求書は速やかに支払うことをお勧めします。

## 請求書ステータス\{#invoice-status}

Zilliz Cloud では、請求書ステータスは支払いプロセスの異なる段階を表します。以下の表は、各ステータスの意味を説明しています。

| **Status** | **Definition** |
| --- | --- |
| **Unbilled** | 請求サイクル終了後から明細書が生成される前までに発生した取引です。これらの金額は直ちに支払い期限とはなりませんが、次の請求サイクルに含まれます。 |
| **Unpaid** | 請求書は発行済みで、支払い期限内です。 |
| **Overdue** | 請求書は発行済みですが、支払い期限内に支払われていません。 |
| **Paid** | 支払いが完了しており、未払い額はありません。 |
| **Free** | 支払うべきすべての金額がクレジットで支払われています。 |

## 請求書サマリー\{#invoice-summary}

サマリーセクションでは、請求書に記載された料金の概要を確認できます。

- **Usage Amount:** すべての請求対象項目の月間合計額です（CU、ストレージ、バックアップ、パイプライン、読み取りおよび書き込みコストを含む）。

- **Credits:** 支払いに充当されたクレジットです。

- **Subtotal:** Subtotal = Usage Amount - Credits.

- **Tax:** Tax = Subtotal x Tax rate. 税率は請求先住所の国に基づきます。

- **Total Amount:** Total Amount = Subtotal + Tax.

- **Advance Pay:** 支払いの相殺に使用された Advance Pay の金額です。

- **Amount Due/Amount Paid:** 最終的に支払う必要がある金額、または支払済みの金額です。

## クラスタープラン別サマリー\{#summary-by-cluster-plan}

Zilliz Cloud は 3 種類のクラスタータイプ（Free、Serverless、Dedicated）を提供しています。課金対象となるのは Serverless と Dedicated のクラスターのみです。

- **Dedicated Clusters:** 使用量に基づいて課金されます。料金は `Cluster Cost = Cluster CU Size x Runtime x Unit Price` として計算されます。Serverless クラスターとは異なり、Dedicated クラスターでは専用リソースが割り当てられているため、アクティブな読み取り/書き込み操作がなくても料金が発生します。

    <Admonition type="info" icon="📘" title="Notes">

    Dedicated クラスターのコストにおけるランタイムは、クラスターのステータスが "**Running**"、"**Modifying**"、"**Frozen**" などである期間として定義されます。以下の 4 つのステータスのクラスターは課金対象外です: "**Creating**"、"**Suspending**"、"**Resuming**"、"**Suspended**"。 

    </Admonition>

- **Serverless Clusters:** 読み取り/書き込み操作時の vCU 消費量に対する従量課金です。コストは `Read and Write Cost = vCU Usage x vCU Unit Price` として計算されます。操作が発生しない場合は、ストレージ料金のみが請求されます。

追加料金には以下が含まれます。

- **Backup Costs:** `Backup File Size x Backup Retention Period` として計算され、"GB-month" で測定されます。これは、1 GB のバックアップファイルを 1 か月保持した使用量を指します。**バックアップは、保持期間が 1 日未満であっても最低 1 日分課金されます。** つまり、バックアップファイルが作成されて 1 日未満しか保持されなかった場合でも、1 日分の料金で課金されます。

- **Storage Costs:** `Current Storage Size x Cluster Runtime` として計算され、"GB-Hour" で測定されます。これは、1 GB のデータを 1 時間保存した使用量を指します。**ストレージは、保存時間が 1 時間未満であっても最低 1 時間分課金されます。** 

    <Admonition type="info" icon="📘" title="Notes">

    ストレージコストにおけるランタイムは、クラスターのステータスが "**Running**"、"**Modifying**"、"**Frozen**" などである期間として定義されます。以下のステータスのクラスターは課金対象外です: "**Creating**"。

    </Admonition>



## 請求書詳細\{#invoice-details}

このセクションでは、各請求対象項目ごとの料金の詳細な内訳を確認できます。 

## 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書の発行先および宛先に関する詳細が含まれます。Zilliz Cloud では、関連する請求メールは Organization Owners、Organization Billing Admins、および請求プロファイルに追加されたメールアドレスに送信されます。したがって、請求書の受信者を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを[招待](./organization-users)して Organization Billing Admin として組織に参加させることができます。

請求プロファイルを編集するには、[Update Billing Profile](./update-billing-profile) を参照してください。

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始時刻と終了時刻はいつですか？**

    **Explanation:** 請求期間は前月の1日 00:00:00 (UTC) に開始し、その月の最終日 23:59:59 (UTC) に終了します。 

    **Example:** Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。 

1. **Zilliz Cloud の usage details に表示される金額はどの程度の精度ですか？**

    Zilliz Cloud は **小数点以下 10 桁** の精度で料金を計算しており、すべての請求計算はこの精度で処理されます。日次料金はまず小数点以下 10 桁で計算され、その後、請求処理中に合算されて小数点以下 10 桁に丸められます。

    - **RESTful API**: すべての数値（例: Unit Price、Usage、Usage Amount）は常にちょうど小数点以下 10 桁で返されます。値の小数桁数が 10 桁未満の場合は、末尾に 0 が補われて 10 桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

    - **Web Console UI**: 表示される金額は API の値と一致しますが、可読性のため末尾の 0 は省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

1. **なぜ請求書を受け取っていないのですか？**

    **Possible Cause:** 請求書にアクセスできるのは **Organization Owners** または **Billing Admins** のみです。

    **Solution:** 必要な権限を持っていることを確認してください。請求書にアクセスできない場合は、Organization Owner または Billing Admin に連絡してください。

>
