---
title: "請求書 | Cloud"
slug: /view-invoice
sidebar_key: view-invoice
sidebar_label: "請求書"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の料金は組織レベルで課金されます。請求書にアクセスするには、組織オーナーまたは請求管理者の権限が必要です。 | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 7
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

# 請求書

Zilliz Cloud の課金は組織レベルで実施されます。請求書にアクセスするには、**組織オーナー**または**請求管理者**の権限が必要です。

本ガイドでは、請求書の表示、支払い、ダウンロード方法、および請求書の詳細情報の解釈方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Marketplace で購読している場合、Zilliz Cloud の利用に関する請求書は Marketplace を通じて発行されます。</p>

</Admonition>

## 請求書の理解\{#understand-your-invoices}

各請求書はいくつかの主要な構成要素から成り立っています。このセクションでは、サンプル請求書を例に、各要素について解説します。

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

### 請求サイクル\{#billing-cycle}

請求書の上部に表示される請求サイクルには、課金対象期間と支払期日が示されています。

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](https://zdoc-images.s3.us-west-2.amazonaws.com/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **請求サイクル:** 通常、前月の初日の 00:00:00 (UTC) から始まり、その月の末日の 23:59:59 (UTC) に終了する 1 か月間の期間です。例えば、Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行し、請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までとなります。この期間中の利用に基づいて料金が発生し、請求書のステータスは「**未請求**」のままとなります。

- **発行日:** 請求書が生成される日付です。この日に請求書のステータスが「**未払い**」に変更され、支払いが可能になります。支払い方法（クレジットカードや Marketplace での購読など）が登録されている場合、自動的に課金されます。支払いが成功すると、請求書のステータスは「**支払い済み**」に更新されます。支払いが失敗した場合、通知メールが**組織オーナー**および**請求管理者**に送信されます。

- **支払期日:** 支払いを行う最終日です。この日までに支払いが行われない場合、請求書は**猶予期間**に入ります。

- **猶予期間:** 支払いが可能な 14 日間の猶予期間です。この期間中、毎日リマインダーメールが送信され、支払いが完了するまで請求書のステータスは「**未払い**」のままとなります。

- **延滞期日:** 支払いが行われないままの場合、請求書のステータスは「**延滞**」になります。組織が翌日に凍結される可能性があるため、速やかに支払いを行うことをお勧めします。凍結から 1 日以内に支払いが行われない場合、すべてのクラスター（Serverless および専用クラスター）は自動的に[ごみ箱](./use-recycle-bin)に移動され、30 日間そこに保持されます。

### 請求書のステータス\{#invoice-status}

Zilliz Cloud では、請求書のステータスは支払いプロセスにおける異なる段階を表します。以下の表に、考えられる各ステータスの説明を示します。

<table>
   <tr>
     <th><p><strong>ステータス</strong></p></th>
     <th><p><strong>定義</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>未請求</strong></p></td>
     <td><p>請求サイクル後だが請求書が生成される前に発生したトランザクションです。これらの金額は直ちに支払期限を迎えるわけではありませんが、次の請求サイクルに含まれます。</p></td>
   </tr>
   <tr>
     <td><p><strong>未払い</strong></p></td>
     <td><p>請求書が発行され、支払期限内にある状態です。</p></td>
   </tr>
   <tr>
     <td><p><strong>延滞</strong></p></td>
     <td><p>請求書が発行されていますが、支払期限内に支払いが行われていない状態です。</p></td>
   </tr>
   <tr>
     <td><p><strong>支払い済み</strong></p></td>
     <td><p>支払いが完了しており、未払残高がない状態です。</p></td>
   </tr>
   <tr>
     <td><p><strong>無料</strong></p></td>
     <td><p>支払すべき全額がクレジットで相殺された状態です。</p></td>
   </tr>
</table>

### 請求書の概要\{#invoice-summary}

概要セクションでは、請求書に記載される料金の全体像を提供します。

- **利用量:** 課金対象項目すべて（CU、ストレージ、バックアップ、パイプライン、読み書きコストを含む）の月間合計額。

- **クレジット:** 支払いに充当されたクレジット額。

- **小計:** 小計 = 利用量 - クレジット。

- **税金:** 税金 = 小計 × 税率。税率は請求先住所に登録されている国に基づいて適用されます。

- **合計金額:** 合計金額 = 小計 + 税金。

- **前払い金:** 支払いの相殺に使用された前払い金の金額。

- **請求額/支払済額:** 最終的に支払う必要がある金額、またはすでに支払われた金額。

### クラスタープラン別の内訳\{#summary-by-cluster-plan}

Zilliz Cloud では、Free、Serverless、Dedicated の 3 つのクラスタータイプを提供しています。課金対象となるのは Serverless および Dedicated クラスターのみです。

- **専用クラスター:** 利用量に基づいて課金されます。料金は `クラスターコスト = クラスター CU サイズ × 実行時間 × 単価` として計算されます。Serverless クラスターとは異なり、専用クラスターでは読み書き操作がアクティブでなくても、専用リソースが割り当てられているため課金が発生します。

    <Admonition type="info" icon="📘" title="Notes">

    <p>専用クラスターのコストにおける実行時間は、クラスターのステータスが「<strong>Running</strong>」、「<strong>変更中</strong>」、「<strong>Frozen</strong>」などである期間として定義されます。以下の 4 つのステータスにあるクラスターは課金対象外です：「<strong>Creating</strong>」、「<strong>一時停止ing</strong>」、「<strong>Resuming</strong>」、または「<strong>一時停止</strong>」。</p>

    </Admonition>

- **Serverless クラスター:** 読み書き操作中の vCU 消費量に対して従量課金制で課金されます。コストは `読み書きコスト = vCU 使用量 × vCU 単価` として計算されます。操作が行われない場合は、ストレージ料金のみが課金されます。

追加の課金項目には以下が含まれます：

- **バックアップコスト:** `バックアップファイルサイズ × バックアップ保持期間` として計算され、「GB-月」単位で測定されます。これは、1 GB のバックアップファイルを 1 か月間保持した場合の利用量を指します。**バックアップは、保持期間が 1 日未満であっても、最低 1 日分が課金されます。** つまり、バックアップファイルが作成されても 1 日未満しか保持されない場合でも、1 日分の料金で課金されます。

- **ストレージコスト:** `現在のストレージサイズ × クラスター実行時間` として計算され、「GB-時間」単位で測定されます。これは、1 GB のデータを 1 時間保存した場合の利用量を指します。**ストレージは、保存期間が 1 時間未満であっても、最低 1 時間分が課金されます。** 

    <Admonition type="info" icon="📘" title="Notes">

    <p>ストレージコストにおける実行時間は、クラスターのステータスが「<strong>Running</strong>」、「<strong>変更中</strong>」、「<strong>Frozen</strong>」などである期間として定義されます。以下のステータスにあるクラスターは課金対象外です：「<strong>Creating</strong>」。</p>

    </Admonition>

### 請求書の詳細\{#invoice-details}

このセクションでは、各課金項目の料金内訳を詳細に提供します。

### 請求プロファイル\{#billing-profile}

請求プロファイルには、請求書が発行される場所および宛先に関する詳細情報が含まれています。Zilliz Cloud では、関連する請求メールが組織オーナー、組織の請求管理者、および請求プロファイルに追加されたメールアドレスに送信されます。したがって、請求書の受信者を追加するには、請求プロファイルにメールアドレスを追加するか、ユーザーを[招待](./organization-users)して組織の請求管理者として参加させることができます。

請求プロファイルの編集については、[クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#edit-billing-profile) を参照してください。

## 請求書の管理\{#manage-invoices}

組織オーナーまたは請求管理者である場合、請求書の表示、支払い、ダウンロードが可能です。

### すべての請求書の一覧表示\{#list-all-invoices}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoices.png "view-invoices")

<Procedures>

1. 左側のナビゲーションで**請求**をクリックします。

1. **請求書**タブに切り替えます。現在および過去のすべての請求書が表示されます。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

<p>請求書一覧取得 RESTful API は現在パブリックプレビュー中です。この API を使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p>

</Admonition>

リクエストは以下の例のようになります。ここで、`{TOKEN}` は [組織オーナーまたは請求管理者のロール](./organization-users#invite-a-user-to-your-organization) を持つ認証用 API キーです。以下の `GET` リクエストは、組織のすべての請求書を一覧表示します。

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

<p>API から返される結果では、すべての金額はセント単位です。</p>

</Admonition>

</TabItem>

</Tabs>

### 特定の請求書の詳細を表示する\{#view-the-details-of-a-specific-invoice}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoice-detail](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoice-detail.png "view-invoice-detail")

<Procedures>

1. 左側のナビゲーションで**請求**をクリックします。

1. **請求書**タブに切り替えます。

1. 対象の請求書の請求期間をクリックして、その詳細を表示します。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

<p>Describe Invoice RESTful API は現在パブリックプレビュー中です。この API を使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p>

</Admonition>

リクエストは以下の例のようになります。ここで、`{TOKEN}` は[組織オーナー または 請求管理者 ロール](./organization-users#invite-a-user-to-your-organization)を持つ認証 API キーです。以下の `GET` リクエストは、指定された請求書の内容を示します。

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

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値を独自のものに置き換えてください。

- `{INVOICE_ID}`: 説明対象の請求書の ID。

<Admonition type="info" icon="📘" title="Notes">

<p>API によって返される結果では、すべての金額はセント単位です。</p>

</Admonition>

</TabItem>

</Tabs>

### 請求書の支払い\{#pay-invoice}

請求書が延滞している場合、まず Zilliz Cloud Web コンソールで支払い方法を確認および更新し、その後支払いを再試行できます。

![pay-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/pay-invoice.png "pay-invoice")

### 請求書のダウンロード\{#download-invoice}

請求書をダウンロードするには、Zilliz Cloud Web コンソール上で対象の請求書の隣にあるダウンロードアイコンをクリックします。

![download-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/download-invoices.png "download-invoices")

## トラブルシューティング / FAQ\{#troubleshooting-faq}

1. **請求書の開始時刻と終了時刻はいつですか？**

    **説明:** 請求期間は、前月の初日の 00:00:00 (UTC) から始まり、その月の末日の 23:59:59 (UTC) に終了します。

    **例:** Zilliz Cloud は 2024 年 9 月 1 日に 8 月分の請求書を発行します。請求期間は 2024 年 8 月 1 日 00:00:00 (UTC) から 2024 年 8 月 31 日 23:59:59 (UTC) までです。

1. **Zilliz Cloud の利用詳細に表示される金額の精度はどのくらいですか？**

    Zilliz Cloud は**小数点以下 10 桁**の精度で料金を計算し、すべての請求はこの精度レベルで算出されます。日次料金はまず小数点以下 10 桁まで計算され、請求処理中に合計されて小数点以下 10 桁に丸められます。

    - **RESTful API**: すべての数値（例：単価、Usage、Usage Amount）は常に正確に小数点以下 10 桁で返されます。値の小数部が 10 桁未満の場合、末尾にゼロが追加されて 10 桁になります。RESTful API の使用方法の詳細については、[日次利用状況のクエリ](/reference/restful/query-daily-usage-v2) を参照してください。

    - **WebコンソールUI**: 表示される金額は API の値と一致しますが、読みやすさのために末尾のゼロは省略されます。例えば、`0.1234000000` は UI では `0.1234` と表示されます。

1. **請求書が届いていないのはなぜですか？**

    **考えられる原因:** 請求書にアクセスできるのは**組織オーナー**または**請求管理者**のみです。

    **ソリューション:** 必要な権限があることを確認してください。請求書にアクセスできない場合は、組織オーナーまたは請求管理者にお問い合わせください。

1. **支払い方法が無効になった場合どうなりますか？**

    **考えられる原因:** 提供された支払い方法（例：クレジットカード）の有効期限が切れているか、残高不足の可能性があります。

    **ソリューション:** 支払いが失敗した場合、Zilliz Cloud は**組織オーナー**および**請求管理者**にメールで通知します。組織オーナーおよび請求管理者は、**請求プロファイル**ページで組織の支払い方法を更新し、**14 日間**の**猶予****期間**内に支払いを再試行できます。

1. **猶予期間とは何ですか？**

    **説明:** **猶予期間**とは、支払期日後の 14 日間の窓口であり、請求書が延滞になる前に支払いを行うことができる期間です。

    **ヒント:** この期間中、毎日メールのリマインダーが届き、支払いが完了するまで請求書のステータスは「未払い」のままとなります。

1. **延滞期日までに支払いをしなかった場合どうなりますか？**

    **説明:** **猶予期間**内に支払いが行われない場合：

    - **延滞期日**に、請求書は延滞としてマークされます。

    - **延滞期日**の翌日、組織は**凍結**され、Zilliz Cloud サービスへのアクセスが制限されます。

    - 組織が凍結された翌日仍未払いの場合、すべてのクラスター（Serverless および Dedicated）が自動的に削除されます。

    **ソリューション:** サービスの中断とデータ損失を防ぐため、**延滞期日**の前に支払いを解決してください。

1. **Serverless クラスターで操作がないのに課金されているのはなぜですか？**

    **説明:** Serverless クラスターで読み取りや書き込み操作が発生していなくても、ストレージに対して課金されます。ストレージ費用は、Zilliz Cloud に保存されているデータのサイズと保存期間に基づいて計算されます。

    **ソリューション:** ストレージ費用を最小限に抑えるためには、未使用のデータを削除することを検討してください。

1. **組織が凍結されたというメールを受け取りました。どうすればよいですか？**

    **説明:** 組織が凍結されたことを示すメールを受け取った場合、支払いが延滞しており、Zilliz Cloud サービスへのアクセスが制限されていることを意味します。

    **ソリューション:** 

    組織の凍結を解除するには：

    - クラスターの自動削除を防ぐため、凍結後 1 日以内に必要な支払いを行ってください。

    - 支払いが処理されると、組織の凍結が解除され、クラスターへの完全なアクセスが復元されます。

1. **延滞請求書により自動的に削除されたクラスターを回復するにはどうすればよいですか？**

    **説明:** クラスターが自動的に削除された場合、組織が凍結された後も支払いが行われなかったことを意味します。

    **ソリューション:**

    自動的に削除されたクラスターを復元するには、

    - まず支払いを行って組織の凍結を解除してください。

    - 支払いが成功したら、ごみ箱に移動して削除されたクラスターを復元します。

    **ヒント:** 

    - 削除されたクラスターはごみ箱に 30 日間保持されます。クラスターが必要な場合は、クラスター削除から 30 日以内に延滞分の支払いを行ってください。

    - お支払いやクラスターの復元に関して問題がある場合は、[サポートチケットを送信](http://support.zilliz.com) してください。

