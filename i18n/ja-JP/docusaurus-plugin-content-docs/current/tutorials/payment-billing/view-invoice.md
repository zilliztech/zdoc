---
title: "インボイス | Cloud"
slug: /view-invoice
sidebar_label: "Invoices"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは組織レベルで請求を行います。請求書にアクセスするには、組織所有者または請求管理者の権限が必要です。 | Cloud"
type: origin
token: IUl2wkH64i6baBk1MRwc0rv9n4g
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - invoice
  - view
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# インボイス

Zilliz Cloudは組織レベルで請求を行います。請求書にアクセスするには、**組織所有者**または**請求管理者**の権限が必要です。

このガイドでは、請求書の表示、支払い、ダウンロード方法、および請求書の詳細の解釈方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>マーケットプレイスに登録すると、マーケットプレイスを通じてZilliz Cloudの使用に関する請求書が届きます。</p>

</Admonition>

## インボイスを理解する{#understand-your-invoices}

各請求書は、いくつかの重要なコンポーネントで構成されています。このセクションでは、各要素を理解するのに役立つ請求書の例を説明します。

![example-invoice](/img/example-invoice.png)

### 請求サイクル{#billing-cycle}

請求書の上部に表示される請求サイクルには、請求が計算される期間と支払い期日が表示されます。

![TBj1w2bjshgRfabC34Fc6WeEnSc](/img/TBj1w2bjshgRfabC34Fc6WeEnSc.png)

- **請求サイクル:**通常、前月の最初の日の00: 0 0:0 0(UTC)から、その月の最終日の23:59:59(UTC)までの1か月間の期間です。たとえば、Zilliz Cloudは2024年9月1日に8月の請求書を発行し、請求期間は2024年8月1日の00:0 0:0 0(UTC)から2024年8月31日の23:59:59(UTC)までです。この期間中に使用料が蓄積され、請求書のステータスは「**未請求**」のままです。

- **問題のデータ:**請求書が生成された日付です。この日、請求書のステータスが「**未払い**」に変更され、支払いが可能になります。支払い方法(例:クレジットカードまたはマーケットプレイスのサブスクリプション)を追加した場合、自動的に請求されます。支払いが成功すると、請求書のステータスが「**支払**済み」に更新されます。支払いに失敗した場合、通知メールが**Organization Owner(s)**および**Billing Admin(s)**に送信されます。

- **期日:**支払いを行う最終日。この日までに支払いがない場合、請求書は**猶予期間**に入ります。

- **猶予期間:**支払いを行うことができる14日間の期間です。この間、毎日メールでリマインダーが送信され、支払いが成功するまで請求書のステータスは「**未払い**」のままです。

- **延滞日:**支払いが未払いの場合、請求書のステータスは「**延滞**」となります。組織が翌日凍結される可能性があるため、速やかに支払うことをお勧めします。凍結後1日以内に支払いがない場合、すべてのクラスター(サーバーレスおよび専用)は自動的に[ごみ箱](./use-recycle-bin)に移動され、30日間そこに保持されます。

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

- **使用量:**すべての請求可能なアイテムの月間合計(CU、ストレージ、バックアップ、パイプライン、読み取りと書き込みのコストを含む)。

- **クレジット:**支払いに適用されるクレジット。

- **小計:小計**=使用量-クレジット。

- **税金:**税金=小計x税率。税率は請求先住所の国に基づいています。

- **合計金額:**合計金額=小計+税金です。

- **Advance Pay:**支払いを相るために使用されるAdvance Payの金額。

- **Amount Due/Amount Paid:**あなたが支払う必要がある、または支払った最終金額。

### クラスター計画の概要{#summary-by-cluster-plan}

Zilliz Cloudには、Free、Serverless、Dedicatedの3つのクラスタータイプがあります。料金はServerlessとDedicatedのクラスターにのみ適用されます。

- **専用クラスター:**使用量に基づいて請求されます。料金は、`クラスターコスト=クラスターCUサイズxランタイムxユニット価格`として計算されます。サーバーレスクラスターとは異なり、専用クラスターの場合、専用リソース割り当てのためにアクティブな読み取り/書き込み操作がなくても料金が適用されます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Dedicatedクラスタのコストについて、ランタイムはクラスタの状態が「<strong>実行中</strong>」「<strong>変更</strong>中」「<strong>凍結</strong>中」などの期間として定義されます。以下の4つの状態のクラスタは課金されません:「<strong>作成</strong>中」「<strong>一時停止中</strong>」「<strong>再開中</strong>」「<strong>一時停止中</strong>」。</p>

    </Admonition>

- **サーバーレスクラスター:**読み書き操作中のvCU消費に対して従量課金制で請求されます。コストは、`読み取りおよび書き込みコスト=vCU使用量×vCUユニット価格`として計算されます。操作が行われない場合、ストレージ料金のみが請求されます。

追加料金には以下が含まれます:

- **バックアップコスト:**`Backup File Size x Backup Retention Periodとして計算され、「GB-month」で測定されます。これは、1か月間保持された1 GBのバックアップファイルの使用量を指します。**バックアップは最低1日で請求されます。**これは、バックアップファイルが作成されたが1日だけ保持された場合でも、1日分の料金が請求されることを意味します。

- **ストレージコスト:**現在の`ストレージサイズ×クラスタランタイム`として計算され、「GB-Hour」で測定されます。これは、1時間に保存された1 GBのデータの使用量を指します。**ストレージは、短いストレージ期間でも最低1時間で請求されます。**

    <Admonition type="info" icon="📘" title="ノート">

    <p>ストレージコストについて、ランタイムはクラスターの状態が「<strong>実行中</strong>」、「<strong>変更中</strong>」、「<strong>凍結</strong>中」などの期間と定義されます。以下の状態のクラスターは課金されません:「<strong>作成</strong>中」。</p>

    </Admonition>

### インボイスの詳細{#invoice-details}

このセクションでは、各請求項目の料金の詳細な内訳を示します。

### 請求プロフィール{#billing-profile}

請求プロフィールには、請求書がどこで誰に発行されるかの詳細が含まれています。請求プロフィールを編集するには、「[クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)する」を参照してください。

## 請求書の管理{#manage-invoices}

組織のオーナーまたは請求管理者の場合、請求書を閲覧、支払い、ダウンロードできます。

### 請求書を見る{#view-invoice}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. 左ナビゲーションの[**請求**]をクリックします。

1. 「**請求書**」タブに切り替えます。現在と過去のすべての請求書が表示されます。

1. 対象の請求書の請求期間をクリックすると、その詳細が表示されます。

![view-invoices](/img/view-invoices.png)

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は、[組織のオーナーまたは請求管理者の役割](./organization-users#organization-roles)を持つ認証APIキーです。次の`GET`リクエストには、Organizationのすべての請求書がリストされています。

```bash
curl --request GET \
--url "${CLUSTER_ENDPOINT}/v2/invoices" \
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

### 特定の請求書の詳細を表示する{#}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. 左ナビゲーションの[**請求**]をクリックします。

1. 請求書タブに切り替えます。

1. 対象の請求書の請求期間をクリックすると、その詳細が表示されます。

![view-invoice-detail](/img/view-invoice-detail.png)

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は、[組織のオーナーまたは請求管理者の役割](./organization-users#organization-roles)を持つ認証APIキーです。次の`GET`リクエストは、指定された請求書を説明しています。

```bash
curl --request GET \
--url "${CLUSTER_ENDPOINT}/v2/invoices/${INVOICE_ID}" \
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

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `{INVOICE_ID}`:記載する請求書のID。

<Admonition type="info" icon="📘" title="ノート">

<p>APIによって返される結果では、すべての金額がセントで表示されます。</p>

</Admonition>

</TabItem>

</Tabs>

### インボイスを支払う{#pay-invoice}

請求書が期限を過ぎている場合は、まず支払い方法を確認して更新してから、請求書の詳細ページで支払いを再試行してください。

![pay-invoice](/img/pay-invoice.png)

### 請求書をダウンロード{#download-invoice}

請求書をダウンロードするには、対象の請求書の横にあるダウンロードアイコンをクリックします。

![download-invoices](/img/download-invoices.png)

## トラブルシューティング/FAQ{#troubleshooting-faq}

1. 請求書の開始時刻と終了時刻は何時ですか?

    - **説明:**請求期間は、前月の最初の日の00: 0 0:0 0(UTC)から、その月の最終日の23:59:59(UTC)までとなります。

    - **例:**Zilliz Cloudは2024年9月1日に8月の請求書を発行し、請求期間は2024年8月1日00: 0 0:0 0(UTC)から2024年8月31日23:59:59(UTC)までです。

1. Zilliz Cloudの請求書に表示される金額はどの程度正確ですか?

    - **説明:**Zilliz Cloudは小数点以下8桁の精度で製品の価格を設定します。その結果、料金は小数点以下8桁で計算されます。請求過程では、これらの詳細な日次料金が合計され、小数点以下2桁に丸められます。

        ウェブUIでは、表示される金額は小数点以下2桁に丸められます（例:$60.0 0）。

        ![precision_invoice_cn](/img/precision_invoice_cn.png)

        [List Invoice](/ja-JP/reference/restful/list-invoices-v2)と[Describe Invoice API](/ja-JP/reference/restful/describe-invoice-v2)から取得された請求書の金額はセントで表され、小数点以下2桁に丸める必要があります。以下は[Describe Invoice API](/ja-JP/reference/restful/describe-invoice-v2)の出力例です。

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

        調整のために、[Query Org Daily Usage ](/reference/restful/query-daily-usage-v2)[API](/reference/restful/query-daily-usage-v2)を使用して、小数点以下8桁の精度で毎日の使用状況の詳細を取得することをお勧めします。毎日の使用状況の統計は、毎日00: 0 0:0 0から同じ日の23:59:59まで実行されます。たとえば、2024年8月1日の毎日の使用期間は、2024年8月1日の00:0 0:0 0に開始し、2024年8月1日の23:59:59に終了します。毎日の金額を合計すると、小数点以下8桁の精度で合計使用量が得られます。この金額を小数点以下3桁で四捨五入すると、2桁の月間使用量が得られ、Web UIの請求書に表示される合計使用量と一致するはずです。

    - **例:**調整中に、Query Org Daily U sage APIを使用して、2024年8月1日から8月3日までの3日間の毎日の使用データを取得したとします。各日の使用量の精度は8桁です。

        - 8月1日の合計:$105.0 3 3 3 1200

        - 8月2日の合計:$92.0300 02 4 5

        - 8月3日の合計:$11 4.25300000

        3つの日次合計を合計すると、31 1.316 3 1 4 45ドルの合計が得られ、3番目の小数点を考慮した後、31 1.32ドルに丸められます。この数字は、Web UIの請求書に表示される総使用量と一致する必要があります。

1. 請求書が届かないのはなぜですか?

    - **考えられる原因:**請求書にアクセスできるのは**Organizationオーナー**または**請求管理者**のみです。

    - **解決策:**必要な権限を持っていることを確認してください。請求書にアクセスできない場合は、組織のオーナーまたは請求管理者にお問い合わせください。

1. 支払い方法が失敗した場合はどうなりますか?

    - **考えられる原因:**提供した払い戻し方法(クレジットカードなど)の有効期限が切れているか、資金が不足している可能性があります。

    - **ソリューション:**

        - 支払いが失敗した場合、Zilliz Cloudは**オーガニゼーションオーナー**と**請求管理者**にメールで通知します。

        - アカウントの**請求プロフィール**セクションに移動し、有効なクレジットカードまたは支払い方法を追加することで、支払い方法を更新できます。

        - 支払いは**猶予** **期間**(**14日間**)内に再試行できます。

1. 何が猶予期間ですか?

    - **説明:**「**猶予期間**」とは、支払い期日から14日間の期間であり、請求書が期限を過ぎる前に支払いを行うことができます。

    - **ヒント:**この期間中、毎日メールでリマインダーが送信され、支払いが完了するまで請求書のステータスは未払いのままとなります。

1. 延滞日以降に支払いをしない場合はどうなりますか?

    - **説明:**支払いが**猶予期間**内に行われない場合:

        - 延滞**日に**は、請求書は延滞としてマークされます。

        - 期限**超過日**の翌日、組織は**凍結**され、Zilliz Cloudサービスへのアクセスが制限されます。

        - 組織が凍結されてから1日経っても支払いが行われない場合、すべてのクラスタ（サーバーレスおよび専用）が自動的に削除されます。

    - **解決策:**サービスの中断やデータの損失を避けるために、**延滞日**の前に支払いを解決してください。

1. サーバーレスクラスターに操作がなくても、なぜ請求されるのですか?

    - **説明:**サーバーレスクラスターで読み取りや書き込み操作が行われなくても、ストレージに対して料金が発生します。ストレージコストは、Zilliz Cloudに保存されたデータの体格と時間に基づいて計算されます。

    - **解決策:**ストレージコストを最小限に抑えるために、未使用のデータを削除することを検討してください。

1. 組織が凍結されたというメールを受け取りました。どうすればいいですか?

    - **説明:**組織が凍結されたことを示すメールを受け取った場合は、支払いが期限切れであり、Zilliz Cloudサービスへのアクセスが制限されていることを意味します。

    - **ソリューション:** 

        組織の凍結を解除するには:

        - クラスタの自動削除を防ぐために、凍結後1日以内に必要な支払いを行ってください。

        - 支払いが処理されると、組織は凍結解除され、完全なクラスターアクセスが復元されます。

1. 期限切れの請求書が原因で自動的に削除されたクラスタを回復するにはどうすればよいですか?

    - **説明:**クラスタが自動的に削除された場合、組織が凍結された後も支払いができないことを意味します。

    - **ソリューション:**

        自動的に削除されたクラスタを復元するには、

        - 最初に組織の凍結を解除するための支払いを行ってください。

        - 支払いが成功したら、ごみ箱に移動して削除したクラスタを復元します。

    - **ヒント:** 

        - 削除されたクラスタは、ごみ箱に30日間保持されます。それでもクラスタが必要な場合は、クラスタの削除から3 0日以内に延滞支払いを行ってください。

        - 支払いやクラスタの復元に問題がある場合は、[サポートチケットを提出](http://support.zilliz.com)してください。

