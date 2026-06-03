---
title: "請求書を理解 | Cloud"
slug: /view-invoice
sidebar_key: view-invoice
sidebar_label: "請求書を理解"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は組織レベルで課金されます。 | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 請求書
  - 表示

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# 請求書を理解

Zilliz Cloud は組織レベルで課金されます。請求書にアクセスするには、**組織オーナー** または **請求管理者** の権限が必要です。

このガイドでは、請求書の表示、支払い、ダウンロードの方法、および請求書の詳細の読み方について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Marketplace で購読している場合、Zilliz Cloud の使用料に関する請求書は Marketplace を通じて受け取ります。 </p>

</Admonition>

## 請求書の理解\{#understand-your-invoices}

各請求書はいくつかの主要な構成要素で構成されています。このセクションでは、サンプルの請求書を見ながら、各要素の意味を説明します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

### 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、料金が計算される期間と支払い期日が示されています。

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](https://zdoc-images.s3.us-west-2.amazonaws.com/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **請求サイクル:** 通常、前月の初日の 00:00:00 (UTC) から開始し、その月の最終日の 23:59:59 (UTC) に終了する 1 か月間の期間です。例えば、Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。この期間中の使用料が累積され、請求書のステータスは「**未請求**」のままとなります。

- **発行日:** 請求書が生成される日付です。この日に、請求書のステータスが「**未払い**」に変更され、支払いが可能になります。支払い方法（クレジットカードや Marketplace 購読など）を追加している場合は自動的に請求されます。支払いが成功すると、請求書のステータスが「**支払い済み**」に更新されます。支払いに失敗した場合、**組織オーナー** および **請求管理者** に通知メールが送信されます。

- **支払い期日:** 支払いを完了させる最終日です。この日までに支払いが確認されない場合、請求書は **猶予期間** に入ります。

- **猶予期間:** 支払いがまだ可能な 14 日間の期間です。この期間中、毎日メールでのリマインダーが送信され、支払いが成功するまで請求書のステータスは「**未払い**」のままです。

- **延滞期日:** 支払いが未払いのままである場合、請求書のステータスが「**延滞**」になります。組織が翌日に凍結される可能性があるため、速やかな支払いをお勧めします。凍結から 1 日以内に支払いがない場合、すべてのクラスター（Serverless および Dedicated）が自動的に [ごみ箱](./use-recycle-bin) に移動され、30 日間保持されます。

### 請求書のステータス\{#invoice-status}

Zilliz Cloud では、請求書のステータスは支払いプロセスの異なる段階を表します。以下の表に、各ステータスの意味を説明します。

<table>
   <tr>
     <th><p><strong>ステータス</strong></p></th>
     <th><p><strong>定義</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>未請求</strong></p></td>
     <td><p>請求サイクル後、明細書が生成される前に発生した取引。これらの金額は即座に支払義務は生じませんが、次の請求サイクルに含まれます。</p></td>
   </tr>
   <tr>
     <td><p><strong>未払い</strong></p></td>
     <td><p>請求書が発行され、支払い期日内です。</p></td>
   </tr>
   <tr>
     <td><p><strong>延滞</strong></p></td>
     <td><p>請求書が発行されたが、支払い期日内に支払われていません。</p></td>
   </tr>
   <tr>
     <td><p><strong>支払い済み</strong></p></td>
     <td><p>支払いが完了し、未払いの金額はありません。</p></td>
   </tr>
   <tr>
     <td><p><strong>無料</strong></p></td>
     <td><p>支払い義務のある全額がクレジットで支払われています。</p></td>
   </tr>
</table>

### 請求書の概要\{#invoice-summary}

概要セクションでは、請求書の料金の概要を高いレベルで提供します。

- **使用料金:** すべての課金対象項目（CU、ストレージ、バックアップ、パイプライン、および読み取り・書き込みコストを含む）の月間合計。

- **クレジット:** 支払いに適用されたクレジット。

- **小計:** 小計 = 使用料金 - クレジット。

- **税:** 税 = 小計 x 税率。税率は請求先住所の国に基づきます。

- **合計金額:** 合計金額 = 小計 + 税。

- **前払い:** 支払いの相殺に使用された前払いの金額。

- **請求金額/支払い済み金額:** 支払う必要がある最終金額、または支払い済みの金額。

### クラスタープラン別の概要\{#summary-by-cluster-plan}

Zilliz Cloud では 3 種類のクラスタータイプを提供しています: Free、Serverless、Dedicated。料金は Serverless および Dedicated クラスターのみに適用されます。

- **Dedicated クラスター:** 使用量に基づいて課金されます。料金は `クラスターコスト = クラスター CU サイズ x 実行時間 x 単価` として計算されます。Serverless クラスターとは異なり、専用クラスターは専用リソースの割り当てのため、アクティブな読み取り/書き込み操作がなくても料金が適用されます。

    <Admonition type="info" icon="📘" title="Notes">

    <p>Dedicated クラスターのコストにおいて、実行時間はクラスターのステータスが「<strong>Running</strong>」、「<strong>変更中</strong>」、「<strong>Frozen</strong>」などの期間として定義されます。以下の 4 つのステータスのクラスターは課金されません: 「<strong>Creating</strong>」、「<strong>一時停止中</strong>」、「<strong>Resuming</strong>」、または「<strong>一時停止</strong>」 </p>

    </Admonition>

- **Serverless クラスター:** 読み取り/書き込み操作時の vCU 消費量に対して従量課金制で課金されます。コストは `読み取り・書き込みコスト = vCU 使用量 x vCU 単価` として計算されます。操作が発生しない場合は、ストレージ料金のみが課金されます。

追加の料金には以下が含まれます:

- **バックアップコスト:** `バックアップファイルサイズ x バックアップ保持期間` として計算され、「GB-月」で測定されます。これは 1 GB のバックアップファイルを 1 か月間保持した使用量を指します。**バックアップは、保持期間が短くても最低 1 日分で課金されます。** つまり、バックアップファイルが作成されたが 1 日未満で保持された場合でも、1 日分のレートで課金されます。

- **ストレージコスト:** `現在のストレージサイズ x クラスター実行時間` として計算され、「GB-時間」で測定されます。これは 1 GB のデータを 1 時間保存した使用量を指します。**ストレージは、保存期間が短くても最低 1 時間分で課金されます。**

    <Admonition type="info" icon="📘" title="Notes">

    <p>ストレージコストにおいて、実行時間はクラスターのステータスが「<strong>Running</strong>」、「<strong>変更中</strong>」、「<strong>Frozen</strong>」などの期間として定義されます。以下のステータスのクラスターは課金されません: 「<strong>Creating</strong>」。</p>

    </Admonition>

### 請求書の詳細\{#invoice-details}

このセクションでは、各課金対象項目の料金の詳細な内訳を提供します。

### 請求プロフィール\{#billing-profile}

請求プロフィールには、請求書の発行先および発行先の詳細情報が含まれます。Zilliz Cloud では、組織オーナー、組織の請求管理者、および請求プロフィールに追加されたメールアドレスに関連する請求メールが送信されます。そのため、請求書の受信者を追加するには、請求プロフィールにメールアドレスを追加するか、ユーザーを組織の請求管理者として [招待](./organization-users) してください。

請求プロフィールを編集するには、[クレジットカードの追加による購読](./subscribe-by-adding-credit-card#edit-billing-profile) を参照してください。

## 請求書の管理\{#manage-invoices}

組織オーナーまたは請求管理者である場合、請求書の表示、支払い、ダウンロードができます。

### すべての請求書を一覧表示\{#list-all-invoices}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoices.png "view-invoices")

<Procedures>

1. 左側のナビゲーションで **請求** をクリックします。

1. **請求書** タブに切り替えます。現在および過去のすべての請求書を確認できます。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

<p>List 請求書 RESTful API は現在パブリックプレビュー中です。この API を使用するには、<a href="http://support.zilliz.com">お問い合わせ</a> ください。</p>

</Admonition>

リクエストは以下の例のようになります。`{TOKEN}` は [組織オーナーまたは請求管理者のロール](./organization-users#invite-a-user-to-your-organization) を持つ認証 API キーです。以下の `GET` リクエストは、組織のすべての請求書を一覧表示します。

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com/v2/invoices" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "invoices": [
#             {
#                 "id": "inv-12312io23810o291",
#                 "orgId": "org-xxxxxx",
#                 "periodStart": "2024-01-01T00:00:00Z",
#                 "periodEnd": "2024-02-01T00:00:00Z",
#                 "invoiceDate": "2024-02-01T00:00:00Z",
#                 "dueDate": "2024-02-01T00:00:00Z",
#                 "currency": "USD",
#                 "status": "unpaid",
#                 "usageAmount": 52400,
#                 "creditsApplied": 12400,
#                 "alreadyBilledAmount": 0,
#                 "subtotal": 40000,
#                 "tax": 5000,
#                 "total": 45000,
#                 "advancePayAmount": 0,
#                 "amountDue": 45000
#             }
#         ]
#     }
# }
```

<Admonition type="info" icon="📘" title="Notes">

<p>API が返す結果では、すべての金額はセント単位で表示されます。</p>

</Admonition>

</TabItem>

</Tabs>

### 特定の請求書の詳細を表示する\{#view-the-details-of-a-specific-invoice}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoice-detail](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoice-detail.png "view-invoice-detail")

<Procedures>

1. 左側のナビゲーションで **請求** をクリックします。

1. **請求書** タブに切り替えます。

1. 対象の請求書の請求期間をクリックして、その詳細を表示します。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

<p>Describe Invoice RESTful API は現在パブリックプレビュー中です。この API を使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p>

</Admonition>

リクエストは以下の例のようになります。`{TOKEN}` は [組織オーナーまたは請求管理者のロール](./organization-users#invite-a-user-to-your-organization) を持つ認証 API キーです。以下の `GET` リクエストは、指定された請求書の詳細を取得します。

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com/v2/invoices/${INVOICE_ID}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "id": "inv-12312io23810o291",
#         "orgId": "org-xxxxxx",
#         "periodStart": "2024-01-01T00:00:00Z",
#         "periodEnd": "2024-02-01T00:00:00Z",
#         "invoiceDate": "2024-02-01T00:00:00Z",
#         "dueDate": "2024-02-01T00:00:00Z",
#         "currency": "USD",
#         "status": "unpaid",
#         "usageAmount": 52400,
#         "creditsApplied": 12400,
#         "alreadyBilledAmount": 0,
#         "subtotal": 40000,
#         "tax": 5000,
#         "total": 45000,
#         "advancePayAmount": 0,
#         "amountDue": 45000
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用される認証情報です。値はご自身のものに置き換えてください。

- `{INVOICE_ID}`: 詳細を確認する請求書のIDです。

<Admonition type="info" icon="📘" title="Notes">

<p>APIが返す結果では、すべての金額はセント単位です。</p>

</Admonition>

</TabItem>

</Tabs>

### 請求書の支払い\{#pay-invoice}

請求書が延滞した場合は、まず支払い方法を確認・更新してから、Zilliz Cloud Webコンソールで支払いを再試行できます。

![pay-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/pay-invoice.png "pay-invoice")

### 請求書のダウンロード\{#download-invoice}

請求書をダウンロードするには、Zilliz Cloud Webコンソールで対象の請求書の横にあるダウンロードアイコンをクリックします。

![download-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/download-invoices.png "download-invoices")

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始時刻と終了時刻はいつですか？**

    **説明:** 請求期間は、前月の1日の00:00:00 (UTC)に開始し、その月の最終日の23:59:59 (UTC)に終了します。

    **例:** Zilliz Cloudは、2024年9月1日に8月分の請求書を発行します。請求期間は、2024年8月1日 00:00:00 (UTC)から2024年8月31日 23:59:59 (UTC)までです。

1. **Zilliz Cloudの使用量詳細に表示される金額の精度はどの程度ですか？**

    Zilliz Cloudは、**小数点以下10桁**の精度で料金を計算し、すべての請求はこの精度で計算されます。日次料金はまず小数点以下10桁で計算され、その後請求処理中に合計されて小数点以下10桁に丸められます。

    - **RESTful API**: すべての数値（例: 単価、Usage、Usage Amount）は、常に小数点以下10桁で返されます。値の小数点以下の桁数が10桁未満の場合、末尾にゼロを追加して10桁にします。RESTful APIの使用方法の詳細については、[日次使用量のクエリ](/reference/restful/query-daily-usage-v2) を参照してください。

    - **WebコンソールUI**: 表示される金額はAPIの値と一致しますが、可読性のため末尾のゼロは省略されます。例えば、`0.1234000000`はUIでは`0.1234`と表示されます。

1. **請求書が届きません。なぜですか？**

    **考えられる原因:** **組織オーナーs** または **請求管理者s** のみが請求書にアクセスできます。

    **ソリューション:** 必要な権限があることを確認してください。請求書にアクセスできない場合は、組織オーナー または 請求管理者 にお問い合わせください。

1. **支払い方法が失敗した場合はどうなりますか？**

    **考えられる原因:** 提供された支払い方法（例: クレジットカード）の有効期限が切れているか、残高が不足している可能性があります。

    **ソリューション:** 支払いが失敗した場合、Zilliz Cloudは **組織オーナーs** および **請求管理者s** にメールで通知します。組織オーナーs および 請求管理者s は、**請求 プロファイル** ページで組織の支払い方法を更新し、**14日間**の **猶予** **期間** 内に支払いを再試行できます。

1. **猶予期間 とは何ですか？**

    **説明:** **猶予期間** は、支払い期日後の14日間の期間で、この期間中に支払いを行うと、請求書が延滞になる前に対応できます。

    **ヒント:** この期間中、毎日メールでリマインダーが送信され、支払いが完了するまで請求書のステータスは未払いのままです。

1. **延滞期日後に支払いを行わない場合はどうなりますか？**

    **説明:** **猶予期間** 内に支払いが行われない場合:

    - **延滞期日** に、請求書は延滞としてマークされます。

    - **延滞期日** の1日後、組織は**凍結**され、Zilliz Cloud サービスへのアクセスが制限されます。

    - 組織が凍結されてから1日経っても支払いが行われない場合、すべてのクラスター（ServerlessおよびDedicated）は自動的に削除されます。

    **ソリューション:** サービスの停止とデータの損失を避けるため、**延滞期日** 前に支払いを解決してください。

1. **Serverless クラスターに操作がないのに、なぜ料金が発生するのですか？**

    **説明:** Serverless クラスターで読み取りや書き込みの操作が行われていなくても、ストレージの料金は発生します。ストレージ費用 は、Zilliz Cloud に保存されているデータのサイズと保存期間に基づいて計算されます。

    **ソリューション:** ストレージ費用 を最小限に抑えるには、未使用のデータを削除することを検討してください。

1. **組織が凍結されたというメールを受信しました。どうすればよいですか？**

    **説明:** 組織が凍結されたことを示すメールを受信した場合、支払いが延滞しており、Zilliz Cloud サービスへのアクセスが制限されていることを意味します。

    **ソリューション:** 

    組織の凍結を解除するには:

    - クラスターの自動削除を防ぐため、凍結後1日以内に必要な支払いを行ってください。

    - 支払いが処理されると、組織の凍結が解除され、クラスターへの完全なアクセスが復元されます。

1. **延滞請求書により自動的に削除されたクラスターを復元するにはどうすればよいですか？**

    **説明:** クラスターが自動的に削除された場合、組織が凍結された後も支払いが行われなかったことを意味します。

    **ソリューション:**

    自動的に削除されたクラスターを復元するには、

    - まず支払いを行って組織の凍結を解除してください。

    - 支払いが成功したら、ごみ箱 に移動して削除されたクラスターを復元してください。

    **ヒント:** 

    - 削除されたクラスターは、ごみ箱に30日間保持されます。クラスターがまだ必要な場合は、クラスター削除から30日以内に延滞支払いを行ってください。

    - 支払いやクラスターの復元で問題がある場合は、[サポートチケットを送信](http://support.zilliz.com) してください。
