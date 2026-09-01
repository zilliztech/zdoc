---
title: "請求書の仕組み | BYOC"
slug: /view-invoice
sidebar_label: "請求書の仕組み"
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


# 請求書の仕組み

Zilliz Cloud では、組織レベルで課金されます。

請求書にアクセスするには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。

<Admonition type="info" icon="📘" title="📘 Notes">

Marketplace でサブスクリプションを契約している場合、Zilliz Cloud の利用に対する請求書は Marketplace を通じて発行されます。

</Admonition>

請求書はいくつかの主要な項目で構成されています。このセクションでは、請求書の例をもとに各項目を解説します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、料金の算出対象期間と支払期日が記載されています。

- **請求サイクル:** 通常は1か月間の期間で、前月の初日 00:00:00 (UTC) に始まり、同月の最終日 23:59:59 (UTC) に終了します。たとえば、Zilliz Cloud が2024年9月1日に8月分の請求書を発行する場合、請求期間は2024年8月1日 00:00:00 (UTC) から2024年8月31日 23:59:59 (UTC) となります。この期間中の利用料金が累積され、請求書のステータスは「**unbilled**」のまま維持されます。

- **発行日:** 請求書が生成される日です。この日に請求書のステータスが「**unpaid**」に変更され、支払いが可能になります。支払い方法（クレジットカードや Marketplace サブスクリプションなど）が登録されている場合は、自動的に引き落としが行われます。支払いが完了すると、請求書のステータスは「**paid**」に更新されます。支払いに失敗した場合は、**Organization Owner(s)** および **Billing Admin(s)** に通知メールが送信されます。

- **支払期日:** 支払いを行う最終日です。

- **延滞日:** 支払いが行われない場合、請求書のステータスは「**overdue**」になります。請求書が延滞状態になると、クラスターの作成、クエリ CU やレプリカの増設、オートスケーリングの有効化や利用など、リソース使用量を増加させる操作が制限される場合があります。請求書のお支払いは速やかに行ってください。

## 請求書のステータス\{#invoice-status}

Zilliz Cloud における請求書のステータスは、支払いプロセスの各段階を表しています。各ステータスの詳細は以下の表をご覧ください。

| **ステータス** | **定義** |
| --- | --- |
| **Unbilled** | 請求サイクルの終了後、明細書が生成されるまでの間に発生した取引です。これらの金額は直ちに支払い期限となるわけではありませんが、次回の請求サイクルに含まれます。 |
| **Unpaid** | 請求書が発行されており、支払期日内の状態です。 |
| **Overdue** | 請求書が発行されていますが、支払期日を過ぎても支払いが完了していない状態です。 |
| **Paid** | 支払いが完了しており、未払い額がない状態です。 |
| **Free** | 請求額の全額がクレジットで相殺された状態です。 |

## 請求書の概要\{#invoice-summary}

概要セクションでは、請求書に記載される料金の全体像を確認できます。

- **利用金額:** すべての課金対象項目（CU、ストレージ、バックアップ、パイプライン、読み取り/書き込みコストを含む）の月間合計額です。

- **クレジット:** 支払いに適用されたクレジット額です。

- **小計:** 小計 = 利用金額 - クレジット

- **税:** 税 = 小計 × 税率。税率は請求先住所の国に基づいて決定されます。

- **合計金額:** 合計金額 = 小計 + 税

- **Advance Pay:** 支払いに充当された Advance Pay の金額です。

- **Amount Due/Amount Paid:** 最終的に支払う必要がある金額、または支払い済みの金額です。

## クラスタープラン別の概要\{#summary-by-cluster-plan}

Zilliz Cloud では、Free、Serverless、Dedicated の3種類のクラスターを提供しています。料金が発生するのは Serverless クラスターと Dedicated クラスターのみです。

- **Dedicated クラスター:** 使用量に応じて課金されます。料金は `Cluster Cost = Cluster CU Size x Runtime x Unit Price` で計算されます。Serverless クラスターとは異なり、Dedicated クラスターはリソースが専有されるため、アクティブな読み取り/write操作がない場合でも料金が発生します。

    <Admonition type="info" icon="📘" title="Notes">

    Dedicated クラスターの料金計算において、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。以下の4つのステータスにあるクラスターには課金されません：「**Creating**」、「**Suspending**」、「**Resuming**」、「**Suspended**」。

    </Admonition>

- **Serverless クラスター:** 読み取り/write操作中の vCU 消費量に基づく従量課金制で請求されます。料金は `Read and Write Cost = vCU Usage x vCU Unit Price` で計算されます。操作が発生しない場合は、ストレージ料金のみが請求されます。

その他の料金には以下が含まれます。

- **バックアップコスト:** `Backup File Size x Backup Retention Period` で計算され、「GB-month」単位で計測されます。これは、1 GB のバックアップファイルを1か月間保持した場合の使用量を指します。**バックアップは、保持期間が1日未満の場合でも最低1日分として課金されます。** つまり、バックアップファイルを作成して1日未満しか保持しなかった場合でも、1日分の料金が発生します。

- **ストレージコスト:** `Current Storage Size x Cluster Runtime` で計算され、「GB-Hour」単位で計測されます。これは、1 GB のデータを1時間保存した場合の使用量を指します。**ストレージは、保存期間が1時間未満の場合でも最低1時間分として課金されます。**

    <Admonition type="info" icon="📘" title="Notes">

    ストレージコストの料金計算において、ランタイムはクラスターのステータスが「**Running**」、「**Modifying**」、「**Frozen**」などである期間として定義されます。以下のステータスにあるクラスターには課金されません：「**Creating**」。

    </Admonition>



## 請求書の明細\{#invoice-details}

このセクションでは、課金対象項目ごとの料金の詳細な内訳を確認できます。

## 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書の発行先や宛先に関する情報が含まれています。Zilliz Cloud では、請求関連のメールが Organization Owners、Organization Billing Admins、および請求プロファイルに登録されたメールアドレスに送信されます。請求書の受信者を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを Organization Billing Admin として組織に[招待](./manage-platform-users#invite-organization-members)してください。

請求プロファイルを編集するには、[請求プロファイルの更新](./update-billing-profile)を参照してください。

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始日時と終了日時はいつですか？**

    **説明:** 請求期間は、前月の初日 00:00:00 (UTC) に始まり、同月の最終日 23:59:59 (UTC) に終了します。

    **例:** Zilliz Cloud が2024年9月1日に8月分の請求書を発行する場合、請求期間は2024年8月1日 00:00:00 (UTC) から2024年8月31日 23:59:59 (UTC) となります。

1. **Zilliz Cloud の利用詳細に表示される金額の精度はどの程度ですか？**

    Zilliz Cloud は **小数点以下10桁** の精度で料金を計算しており、すべての請求はこの精度に基づいて算出されます。日次の料金はまず小数点以下10桁で計算され、請求処理時に合算した上で小数点以下10桁に丸められます。

    - **RESTful API**: Unit Price、Usage、Usage Amount などのすべての数値は、常に小数点以下10桁で返されます。値の小数部が10桁に満たない場合は、末尾にゼロが補われて10桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2)を参照してください。

    - **Web Console UI**: 表示される金額は API の値と一致しますが、可読性を高めるため末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

1. **請求書が届かないのはなぜですか？**

    **考えられる原因:** 請求書にアクセスできるのは **Organization Owners** または **Billing Admins** のみです。

    **対処法:** 必要な権限を持っているか確認してください。請求書にアクセスできない場合は、Organization Owner または Billing Admin にお問い合わせください。

>
