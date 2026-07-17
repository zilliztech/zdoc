---
title: "コストの分析 | Cloud"
slug: /analyze-cost
sidebar_label: "コストの分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、可視化されたコスト分析ツールを利用でき、複数の観点から Zilliz Cloud の使用状況と費用を表示・追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コストの分析

Zilliz Cloud の **Usage** ページでは、可視化されたコスト分析ツールを利用でき、複数の観点から Zilliz Cloud の使用状況と費用を表示・追跡できます。

マーケットプレイス経由でサブスクライブしており、マーケットプレイスアカウントごとに請求を分けたい場合は、[AWS Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace) とその関連ページを参照してください。

## 前提条件\{#prerequisites}

Zilliz Cloud の usage ページを通じてコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI 経由](./analyze-cost#via-web-ui): コストの傾向を可視化する必要がある場合は、web UI の使用をおすすめします。web UI 上の usage 詳細は **小数点以下 10 桁** に丸められます。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次 usage をより詳細に把握したい場合は、RESTful API の使用をおすすめします。RESTful API で取得される usage 詳細は **小数点以下 10 桁** の精度です。

### Web UI 経由\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまな観点で usage とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="📘 Notes">

Usage データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyzecost.png "analyze_cost")

- **Project 別**

    異なる事業や部門ごとに複数の project を作成している場合は、特定の project の usage とコストをフィルタして表示できます。

    たとえば、2 つの project、Default Project（R&D 部門向け）と Project_01（Marketing 部門向け）を作成している場合、project フィルタで Default Project を選択すると、過去 1 か月間の R&D 部門の usage とコストを分析できます。

    Usage Amount の棒グラフには日次の usage の変化が視覚的に表示され、Usage Amount Details テーブルには表形式のデータが表示されます。

- **Cluster 別**

    ビジネスに応じて複数の異なる cluster を作成している場合は、cluster に応じて特定の cluster の usage とコストをフィルタして表示できます。 

    たとえば、ユーザー情報用と注文情報用にそれぞれ 2 つの異なる cluster を作成している場合、注文情報を保存している cluster の usage とコストを確認する必要があるときは、フィルタで対応する cluster を選択できます。

&lt;include>

- **期間別**

    特定の期間における usage とコストの傾向を確認するには、フィルタで期間を選択できます。

    デフォルトの期間は 1 か月で、最大期間は 2 か月です。

    たとえば、2024 年 8 月の日次 usage と費用を分析するには、日付フィルタで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount の棒グラフには、選択した期間の日次コストの傾向が表示されます。

- **コストタイプ別**

    特定のコストタイプの usage とコストの傾向を調べるには、フィルタで目的の請求項目を選択できます。

    利用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs (Serverless)、Storage Costs (Dedicated)、Backup Costs、Pipelines Costs があります。

    たとえば、過去 1 か月間のすべての project における合計 backup コストを分析するには、コストタイプフィルタで Backup Costs を選択します。Usage Amount の棒グラフには、選択した期間の日次 backup コストの合計が表示されます。

- **Cloud Region 別**

    複数の cloud region にまたがってサービスをデプロイしている場合は、cloud region でフィルタして、region ごとの usage とコストを表示できます。

    たとえば、AWS us-east-1 (Virginia) と GCP europe-west3 (Frankfurt) の両方に cluster をデプロイしている場合、AWS us-east-1 (Virginia) region の usage とコストをフィルタして表示できます。

分析ニーズに応じて複数のフィルタを組み合わせ、可視化された usage とコストデータを表示できます。たとえば、project、期間、コストタイプ、region でフィルタして、usage の傾向とコストを包括的に把握できます。

### RESTful API 経由\{#via-restful-api}

<Admonition type="info" icon="📘" title="📘 Notes">

Query Daily Usage RESTful API は現在パブリックプレビュー中です。この API を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、organization の日次 usage を照会することもできます。この RESTful API から取得する usage 詳細は小数点以下 8 桁の精度です。日次コストがどのように積み上げられ、小数点以下 2 桁に丸められるかを把握したい場合は、RESTful API の使用をおすすめします。日次 usage を合計すると、小数点以下 8 桁の精度を持つ合計 usage amount を取得できます。次に、この合計 usage amount を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な合計 usage amount は、請求書に表示される金額と一致するはずです。

次の例は、organization の日次 usage を照会する方法を示しています。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01",
    "end": "2024-02-01"
}'
```

上記のコマンドでは、

- `start`: 照会期間の開始時刻。形式は `YYYY-MM-DD` です。

- `end`: 照会期間の終了時刻。形式は `YYYY-MM-DD` です。

## FAQ\{#faq}

**Zilliz Cloud の usage 詳細に表示される金額の精度はどの程度ですか？**

Zilliz Cloud は **小数点以下 10 桁** の精度で料金を計算しており、すべての請求はこの精度レベルで算出されます。日次料金はまず小数点以下 10 桁で計算され、その後、請求処理中に合計されて小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（例: Unit Price、Usage、Usage Amount）は常にちょうど小数点以下 10 桁で返されます。値の小数部が 10 桁未満の場合は、末尾に 0 が補われて 10 桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致しますが、可読性のために末尾の 0 は省略されます。たとえば、`0.1234000000` は `0.1234` と表示されます i
