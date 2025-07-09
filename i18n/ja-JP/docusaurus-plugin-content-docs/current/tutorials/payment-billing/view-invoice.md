---
title: "インボイス | Cloud"
slug: /view-invoice
sidebar_label: "Invoices"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは組織レベルで料金を請求します。請求書にアクセスするには、組織所有者または請求管理者の権限が必要です。 | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - invoice
  - view
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


# インボイス

Zilliz Cloudは組織レベルで料金を請求します。請求書にアクセスするには、**組織所有者**または**請求管理者**の権限が必要です。

このガイドでは、請求書の表示、支払い、ダウンロード方法、および請求書の詳細の解釈方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>マーケットプレイスに登録すると、マーケットプレイスを通じてZilliz Cloudの使用に関する請求書が届きます。 </p>

</Admonition>

## インボイスを理解する{#understand-your-invoices}

各請求書は、いくつかの重要なコンポーネントで構成されています。このセクションでは、各要素を理解するのに役立つ請求書の例を説明します。

![example-invoice](/img/example-invoice.png)

### 請求サイクル{#billing-cycle}

請求書の上部に表示される請求サイクルには、請求が計算される期間と支払い期日が表示されます。

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](/img/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- 請求サイクル:通常、前月の最初の日の00: 0 0:0 0(UTC)から、その月の最終日の23:59:59(UTC)までの1か月間の期間です。たとえば、Zilliz Cloudは2024年9月1日に8月の請求書を発行し、請求期間は2024年8月1日の00:0 0:0 0(UTC)から2024年8月31日の23:59:59(UTC)までです。この期間中に使用料が蓄積され、請求書のステータスは「未請求」のままです

- 問題のデータ:請求書が生成された日付。この日、請求書のステータスが「未払い」に変更され、支払いが可能になります。支払い方法(クレジットカードやマーケットプレイスの購読など)を追加した場合、自動的に請求されます。支払いが成功すると、請求書のステータスが「支払い済み」に更新されます。支払いに失敗した場合、通知メールが「組織オーナー」と「請求管理者」に送信されます。

- **期日:**支払いを行う最終日。この日までに支払いがない場合、請求書は**猶予期間**に入ります。

- 猶予期間:支払いがまだできる14日間の期間です。この間、毎日メールのリマインダーが送信され、支払いが成功するまで請求書のステータスは「未払い」のままです。

- 延滞日:支払いが未払いの場合、請求書のステータスは「延滞」となります。組織が翌日凍結される可能性があるため、迅速に支払うことをお勧めします。凍結後1日以内に支払いがない場合、すべてのクラスター(サーバーレスおよび専用)は自動的に[ごみ箱](./use-recycle-bin)に移動され、30日間保持されます。

### 請求書のステータス{#invoice-status}

Zilliz Cloudでは、請求書のステータスは支払い過程の異なる段階を表します。以下の表は、可能な各ステータスを説明しています。

<table>
   <tr>
     <th><p><strong>ステータス</strong></p></th>
     <th><p><strong>の定義</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>請求なし</strong></p></td>
     <td><p>請求サイクルの後、明細書が生成される前に発生する取引。これらの金額は直ちに支払われるわけではありませんが、次の請求サイクルに含まれます。</p></td>
   </tr>
   <tr>
     <td><p><strong>未払い</strong></p></td>
     <td><p>請求書は請求され、期限内です。</p></td>
   </tr>
   <tr>
     <td><p><strong>期限切れ</strong></p></td>
     <td><p>請求書は請求されますが、期限内に支払われません。</p></td>
   </tr>
   <tr>
     <td><p><strong>支払った</strong></p></td>
     <td><p>未払い金額がないまま支払いが完了しました。</p></td>
   </tr>
   <tr>
     <td><p><strong>フリー</strong></p></td>
     <td><p>すべての金額はクレジットで支払われます。</p></td>
   </tr>
</table>

### 請求書の概要{#invoice-summary}

サマリーセクションには、請求書の料金の概要が記載されています。

- 使用量:すべての請求可能なアイテム(CU、ストレージ、バックアップ、パイプライン、読み取りおよび書き込みコストを含む)の月間合計。

- **クレジット:**支払いに適用されるクレジット。

- **小計:**小計=使用量-クレジット。

- **税金:**税金=小計×税率。税率は請求先住所の国に基づいています。

- **合計金額:**合計金額=小計+税金。

- **アドバンスペイ:**支払いを相るために使用されるアドバンスペイの金額。

- **支払期日/支払額:**あなたが支払う必要がある、または支払った最終金額。

### クラスタ計画による概要{#summary-by-cluster-plan}

Zilliz Cloudには、Free、Serverless、Dedicatedの3つのクラスタータイプがあります。料金はServerlessとDedicatedのクラスターにのみ適用されます。

- 専用クラスター:使用状況に基づいて請求されます。料金は`Cluster Cost = Cluster CU Size x Runtime x Unit Price`として計算されます。サーバーレスクラスターとは異なり、専用クラスターの場合、専用リソース割り当てによるアクティブな読み書き操作がなくても料金が適用されます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>専用クラスターのコストについて、ランタイムはクラスターの状態が「実行中」、「変更中」、「凍結」などである期間と定義されます。次の4つの状態にあるクラスターは課金されません:「作成中」、「一時停止中」、「再開中」、または「一時停止中」 </p>

    </Admonition>

- サーバーレスクラスター:読み書き操作中のvCU消費に対して従量課金制で請求されます。コストは`Read and Write Cost = vCU Usage x vCU Unit Price`として計算されます。操作が行われない場合、ストレージ料金のみが請求されます。

追加料金には以下が含まれます:

- バックアップ費用: `Backup File Size x Backup Retention Period`として計算され、「GB-month」で測定されます。これは、1か月間保持された1 GBのバックアップファイルの使用量を指します。バックアップは、保持期間が短い場合でも、最低1日で請求されます。つまり、バックアップファイルが作成されたが1日小なりに保持された場合でも、1日分のレートで請求されます。

- ストレージコスト: `Current Storage Size x Cluster Runtime`として計算され、「GB-Hour」で測定されます。これは、1時間に保存された1 GBのデータの使用量を指します。ストレージは、短いストレージ期間でも最低1時間で請求されます 

    <Admonition type="info" icon="📘" title="ノート">

    <p>ストレージコストについて、ランタイムとは、クラスターの状態が「実行中」、「変更中」、「凍結中」などである期間と定義されます。次の状態のクラスターは課金されません:「作成中」</p>

    </Admonition>

### インボイスの詳細{#invoice-details}

このセクションでは、各請求項目の料金の詳細な内訳を示します。 

### 課金プロフィール{#billing-profile}

請求プロファイルには、請求書がどこで誰に発行されるかの詳細が含まれています。請求プロファイルを編集するには、[クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#edit-billing-profile)を参照してください。

## 請求書の管理{#manage-invoices}

組織のオーナーまたは請求管理者の場合、請求書を閲覧、支払い、ダウンロードできます。

### すべての請求書を一覧表示する{#list-all-invoices}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. 左ナビゲーションの**請求**をクリックしてください。

1. 「請求書」タブに切り替えてください。現在と過去のすべての請求書が表示されます。

![view-invoices](/img/view-invoices.png)

</TabItem>

<tabitem value="Bash"></tabitem>

<Admonition type="info" icon="📘" title="ノート">

<p>List InvoiceのRESTful APIは現在パブリックプレビュー中です。このAPIを使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>を使用してください。</p>

</Admonition>

リクエストは、`{TOKEN}`が[Organization OwnerまたはBilling Adminの役割](./organization-users#organization-roles)を持つ認証APIキーである次の例に似ている必要があります。次の`GET`リクエストには、組織のすべての請求書がリストされています。

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

<Admonition type="info" icon="📘" title="ノート">

<p>APIによって返される結果では、すべての金額がセントで表示されます。</p>

</Admonition>

</TabItem>

</Tabs>

### 特定の請求書の詳細を表示する{#view-the-details-of-a-specific-invoice}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. 左ナビゲーションの**請求**をクリックしてください。

1. 「請求書」タブに切り替えてください。

1. 対象の請求書の請求期間をクリックすると、その詳細が表示されます。

![view-invoice-detail](/img/view-invoice-detail.png)

</TabItem>

<tabitem value="Bash"></tabitem>

<Admonition type="info" icon="📘" title="ノート">

<p>Describe InvoiceのRESTful APIは現在パブリックプレビュー中です。このAPIを使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>を使用してください。</p>

</Admonition>

リクエストは、`{TOKEN}`が[Organization OwnerまたはBilling Adminの役割](./organization-users#organization-roles)を持つ認証APIキーである次の例に似ている必要があります。次の`GET`リクエストは、指定された請求書を説明しています。

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

上記のコマンドで、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{INVOICE_ID}`:説明する請求書のID。

<Admonition type="info" icon="📘" title="ノート">

<p>APIによって返される結果では、すべての金額がセントで表示されます。</p>

</Admonition>

</TabItem>

</Tabs>

### インボイスを支払う{#pay-invoice}

請求書が期限を過ぎている場合は、まず支払い方法を確認して更新してから、Zilliz Cloudウェブコンソールの支払いビューを再試行してください。

![pay-invoice](/img/pay-invoice.png)

### 請求書をダウンロード{#download-invoice}

請求書をダウンロードするには、Zilliz Cloudウェブコンソールの対象請求書の横にあるダウンロードアイコンをクリックしてください。

![download-invoices](/img/download-invoices.png)

## トラブルシューティング/FAQ{#troubleshooting-faq}

1. **請求書の開始時刻と終了時刻は何時ですか?**

    **説明:**請求期間は、前月の最初の日の00: 0 0:0 0(UTC)から、その月の最終日の23:59:59(UTC)までとなります。 

    Zilliz Cloudは、2024年9月1日に8月の請求書を発行し、請求期間は2024年8月1日00: 0 0:0 0(UTC)から2024年8月31日23:59:59(UTC)までです。 

1. **Zilliz Cloudの請求書に表示される金額はどの程度正確ですか?** 

    説明: Zilliz Cloudは、小数点以下8桁の精度で製品の価格を設定します。その結果、料金は小数点以下8桁で計算されます。請求過程では、これらの詳細な日次料金が合計され、小数点以下2桁に丸められます。

    ウェブUIでは、表示される金額は小数点以下2桁に丸められます（例:$60.0 0）。 

    ![precision_invoice_cn](/img/precision_invoice_cn.png)

    [リスト請求書](/reference/restful/list-invoices-v2)および[請求書の説明](/reference/restful/describe-invoice-v2) APIから取得された請求書の金額はセントであり、小数点以下2桁に丸める必要があります。以下は[請求書の説明](/reference/restful/describe-invoice-v2) APIの出力例です。

    ```bash
    {
        "code": 0,
        "data": {
            "id": "inv-12312io23810o291",
            "orgId": "org-xxxxxx",
            "periodStart": "2024-01-01T00:00:00Z",
            "periodEnd": "2024-02-01T00:00:00Z",
            "invoiceDate": "2024-02-01T00:00:00Z",
            "dueDate": "2024-02-01T00:00:00Z",
            "currency": "USD",
            "status": "unpaid",
            "usageAmount": 52400,
            "creditsApplied": 12400,
            "alreadyBilledAmount": 0,
            "subtotal": 40000,
            "tax": 5000,
            "total": 45000,
            "advancePayAmount": 0,
            "amountDue": 45000
        }
    }
    ```

    調整のために、[クエリの毎日の使用](/reference/restful/query-daily-usage-v2) APIを使用して、小数点以下8桁の精度で毎日の使用状況の詳細を取得することをお勧めします。毎日の使用状況の統計は、毎日00: 0 0:0 0に開始し、同じ日の23:59:59まで実行されます。たとえば、2024年8月1日の毎日の使用期間は、2024年8月1日の00:0 0:0 0に開始し、2024年8月1日の23:59:59に終了します。毎日の金額を合計すると、小数点以下8桁の精度で合計使用量が得られます。この金額を小数点以下3桁で四捨五入すると、2桁の月間使用量が得られ、Web UIの請求書に表示される合計使用量と一致するはずです。

    例:調整中に、まず2024年8月1日から8月3日までの[クエリの毎日の使用](/reference/restful/query-daily-usage-v2) APIを介して、1日あたりの使用データを3日間取得するとします。各日の量は8桁の精度を持ちます。

    - 8月1日の合計:$105.0 3 3 3 1200

    - 8月2日の合計:$92.0300 02 4 5

    - 8月3日の合計:$11 4.25300000

    3つの日次合計を合計すると、31 1.316 3 1 4 45ドルの合計が得られ、3番目の小数点を考慮した後、31 1.32ドルに丸められます。この数字は、Web UIの請求書に表示される総使用量と一致する必要があります。

1. **請求書が届いていないのはなぜですか?**

    可能な原因:請求書にアクセスできるのは、組織の所有者または請求管理者だけです。

    **解決策:**必要な権限を持っていることを確認してください。請求書にアクセスできない場合は、組織のオーナーまたは請求管理者に連絡してください。

1. **支払い方法が失敗した場合はどうなりますか?**

    **考えられる原因:**提供した支払い方法(クレジットカードなど)の有効期限が切れているか、資金が不足している可能性があります。

    解決策:支払いが失敗した場合、Zilliz Cloudは組織オーナーと請求管理者にメールで通知します。組織オーナーと請求管理者は、請求プロフィールページで組織の支払い方法を更新し、14日間の猶予期間内に支払いを再試行できます。

1. **猶予期間とは何ですか?**

    説明:「猶予期間」とは、支払い期日から14日間の期間であり、請求書が期限を過ぎる前に支払いを行うことができます。

    **ヒント:**この期間中、毎日メールでリマインダーを受け取り、支払いが完了するまで請求書のステータスは未払いのままです。

1. **延滞日以降に支払いをしない場合はどうなりますか?**

    **説明:**猶予期間内に支払いが行われない場合:

    - **延滞日**に、請求書は延滞としてマークされます。

    - **延滞日**の翌日、あなたの組織は**凍結**され、Zilliz Cloudサービスへのアクセスが制限されます。

    - 組織が凍結されてから1日経っても支払いが行われない場合、すべてのクラスタ（サーバーレスおよび専用）が自動的に削除されます。

    **解決策:**サービスの中断やデータの損失を避けるために、**延滞日**の前に支払いを解決するようにしてください。

1. サーバーレスクラスターに操作がなくても、なぜ請求されるのですか?

    **説明:**サーバーレスクラスターで読み取りまたは書き込み操作が発生しなくても、ストレージに対して料金が発生します。ストレージコストは、保存されたデータの体格とZilliz Cloudに保存された時間に基づいて計算されます。

    **解決策:**ストレージコストを最小限に抑えるために、未使用のデータを削除することを検討してください。

1. **組織が凍結されたというメールを受け取りました。どうすればいいですか?**

    **説明:**組織が凍結されたことを示すメールを受け取った場合、支払いが期限切れであり、Zilliz Cloudサービスへのアクセスが制限されていることを意味します。

    **ソリューション:** 

    組織の凍結を解除するには:

    - クラスタの自動削除を防ぐために、凍結後1日以内に必要な支払いを行ってください。

    - 支払いが処理されると、組織は凍結解除され、完全なクラスターアクセスが復元されます。

1. **期限切れの請求書が原因で自動的に削除されたクラスタを回復するにはどうすればよいですか?**

    クラスターが自動的に削除された場合、組織が凍結された後も支払いができないことを意味します。

    **ソリューション:**

    自動的に削除されたクラスタを復元するには、

    - 最初に組織の凍結を解除するための支払いを行ってください。

    - 支払いが成功したら、ごみ箱に移動して削除したクラスタを復元します。

    **ヒント:** 

    - 削除されたクラスタは、ごみ箱に30日間保持されます。それでもクラスタが必要な場合は、クラスタの削除から3 0日以内に延滞支払いを行ってください。

    - 支払いやクラスタの復元に問題がある場合は、[サポートチケットを送信する](http://support.zilliz.com)をお願いします。

