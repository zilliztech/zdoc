---
title: "請求書の仕組み | BYOC"
slug: /view-invoice
sidebar_label: "請求書の仕組み"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、組織レベルで課金されます。 | BYOC"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 請求書の仕組み

Zilliz Cloud では、組織レベルで課金されます。 

請求書にアクセスするには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。

<Admonition type="info" title="Notes">

Marketplace でサブスクリプションを契約している場合、Zilliz Cloud の利用に対する請求書は Marketplace を通じて発行されます。 

</Admonition>

各請求書は、いくつかの主要な項目で構成されています。ここでは請求書の例を取り上げながら、各項目の意味を説明します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、料金が計算される期間と支払期日が示されます。

- **請求サイクル:** 通常は 1 か月間の期間で、前月の初日 00:00:00 (UTC) に始まり、同月の最終日 23:59:59 (UTC) に終了します。たとえば、Zilliz Cloud が 2024 年 9 月 1 日に 8 月分の請求書を発行する場合、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) です。この期間中の利用量に対して料金が累積され、請求書のステータスは「**unbilled**」のままになります。

- **発行日:** 請求書が生成される日です。この日に請求書のステータスは「**unpaid**」に変わり、支払いが可能になります。支払い方法（クレジットカードや Marketplace のサブスクリプションなど）を追加している場合は、自動的に請求されます。支払いが成功すると、請求書のステータスは「**paid**」に更新されます。支払いに失敗した場合は、**Organization Owner(s)** および **Billing Admin(s)** に通知メールが送信されます。

- **支払期日:** 支払いを行う最終日です。

- **延滞日:** 支払いが行われないままの場合、請求書のステータスは「**overdue**」になります。請求書が延滞状態になると、クラスターの作成、クエリ CU やレプリカの増加、オートスケーリングの有効化や使用など、リソース使用量を増やす操作がブロックされる場合があります。請求書は速やかに支払うことをおすすめします。

## 請求書のステータス\{#invoice-status}

Zilliz Cloud では、請求書のステータスは支払いプロセスの各段階を表します。以下の表で、それぞれのステータスについて説明します。

| **ステータス** | **定義** |
| --- | --- |
| **Unbilled** | 請求サイクルの終了後、明細書が生成されるまでの間に発生した取引です。これらの金額はすぐに支払い期限となるものではありませんが、次回の請求サイクルに含まれます。 |
| **Unpaid** | 請求書が発行されており、支払い期限内の状態です。 |
| **Overdue** | 請求書が発行されていますが、支払い期限内に支払われていない状態です。 |
| **Paid** | 支払いが完了しており、未払い額がない状態です。 |
| **Free** | 請求額のすべてがクレジットで支払われている状態です。 |

## 請求書の概要\{#invoice-summary}

概要セクションでは、請求書の料金の概要を確認できます。

- **利用金額:** すべての課金対象項目（CU、ストレージ、バックアップ、パイプライン、読み取りと書き込みのコストを含む）の月間合計額です。

- **クレジット:** 支払いに充当されたクレジットです。

- **小計:** 小計 = 利用金額 - クレジット。

- **税:** 税 = 小計 x 税率。税率は請求先住所の国に基づきます。

- **合計金額:** 合計金額 = 小計 + 税。

- **Advance Pay:** 支払いの相殺に使用された Advance Pay の金額です。

- **Amount Due/Amount Paid:** 最終的に支払う必要がある金額、または支払い済みの金額です。

## クラスタープラン別の概要\{#summary-by-cluster-plan}

Zilliz Cloud では、Free、Serverless、Dedicated の 3 種類のクラスターを提供しています。課金の対象となるのは Serverless クラスターと Dedicated クラスターのみです。

- **Dedicated クラスター:** 使用量に基づいて課金されます。料金は `Cluster Cost = Cluster CU Size x Runtime x Unit Price` として計算されます。Serverless クラスターとは異なり、Dedicated クラスターでは専用のリソースが割り当てられるため、アクティブな read/write 操作がなくても料金が発生します。

    <Admonition type="info" title="Notes">

    Dedicated クラスターのコストでは、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。以下の 4 つのステータスにあるクラスターには課金されません：「**Creating**」、「**Suspending**」、「**Resuming**」、「**Suspended**」。 

    </Admonition>

- **Serverless クラスター:** read/write 操作中の vCU 消費量に対して従量課金制で請求されます。コストは `Read and Write Cost = vCU Usage x vCU Unit Price` として計算されます。操作が発生しない場合は、ストレージ料金のみが請求されます。

その他の料金には以下が含まれます。

- **バックアップコスト:** `Backup File Size x Backup Retention Period` として計算され、「GB-month」で測定されます。これは、1 か月間保持された 1 GB のバックアップファイルの使用量を指します。<strong>バックアップは、保持期間が 1 日未満であっても最低 1 日分として課金されます。</strong> つまり、バックアップファイルを作成しても 1 日未満しか保持しなかった場合は、1 日分の料金が請求されます。

- **ストレージコスト:** `Current Storage Size x Cluster Runtime` として計算され、「GB-Hour」で測定されます。これは、1 時間保存された 1 GB のデータの使用量を指します。**ストレージは、保存期間が 1 時間未満であっても最低 1 時間分として課金されます。** 

    <Admonition type="info" title="Notes">

    ストレージコストでは、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。以下のステータスにあるクラスターには課金されません：「**Creating**」。

    </Admonition>



## 請求書の明細\{#invoice-details}

このセクションでは、課金対象項目ごとの料金の詳細な内訳を確認できます。 

## 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書がどこに誰に対して発行されるかに関する情報が含まれます。Zilliz Cloud では、請求関連のメールは Organization Owners、Organization Billing Admins、および請求プロファイルに追加されたメールアドレスに送信されます。そのため、請求書の受信者を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを Organization Billing Admin として組織に[招待](./manage-platform-users#invite-organization-members)します。

請求プロファイルを編集するには、[請求プロファイルの更新](./update-billing-profile) を参照してください。

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始日時と終了日時はいつですか？**

    **説明:** 請求期間は、前月の初日 00:00:00 (UTC) に始まり、同月の最終日 23:59:59 (UTC) に終了します。 

    <strong>例:</strong> Zilliz Cloud が 2024 年 9 月 1 日に 8 月分の請求書を発行する場合、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) です。 

1. **Zilliz Cloud の利用詳細に表示される金額の精度はどのくらいですか？**

    Zilliz Cloud は **小数点以下 10 桁** の精度で料金を計算しており、すべての請求はこの精度で算出されます。日次の料金はまず小数点以下 10 桁で計算され、請求処理の過程で合算されて小数点以下 10 桁に丸められます。

    - **RESTful API**: すべての数値（Unit Price、Usage、Usage Amount など）は、常に小数点以下 10 桁で返されます。値の小数桁数が 10 桁に満たない場合は、10 桁になるように末尾にゼロが補われます。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

    - **Web Console UI**: 表示される金額は API の値と一致しますが、読みやすさのために末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

1. **請求書が届かないのはなぜですか？**

    **考えられる原因:** 請求書にアクセスできるのは **Organization Owners** または **Billing Admins** のみです。

    **対処法:** 必要な権限を持っていることを確認してください。請求書にアクセスできない場合は、Organization Owner または Billing Admin にお問い合わせください。

>
