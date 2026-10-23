---
title: "コスト分析 | BYOC"
slug: /analyze-cost
sidebar_label: "コスト分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、視覚化されたコスト分析ツールを利用でき、複数のディメンションから Zilliz Cloud の使用量と費用を表示して追跡できます。 | BYOC"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト分析

Zilliz Cloud の **Usage** ページでは、視覚化されたコスト分析ツールを利用でき、複数のディメンションから Zilliz Cloud の使用量と費用を表示して追跡できます。

## 事前準備\{#prerequisites}

Zilliz Cloud の使用状況ページからコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析するには、2つの方法があります。

- [Web UI 経由](./analyze-cost#via-web-ui): コストの傾向を視覚化する場合は、Web UI の使用をお勧めします。Web UI の使用量の詳細は、**小数点以下 10 桁**に丸められます。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次使用量をより詳細に把握する場合は、RESTful API の使用をお勧めします。RESTful API から取得した使用量の詳細は、**小数点以下 10 桁**まで正確です。

### Web UI 経由\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまなディメンションで使用量とコストの傾向を監視できます。

<Admonition type="info" title="Notes">

使用量データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyzecost.png "analyze_cost")

- **By Project**

    異なる事業や部門用に複数のプロジェクトを作成している場合は、特定のプロジェクトの使用量とコストをフィルタリングして表示できます。

    たとえば、Default Project（R&D 部門向け）と Project_01（マーケティング部門向け）の 2 つのプロジェクトを作成している場合、プロジェクトフィルターで Default Project を選択すると、R&D 部門の過去 1 か月間の使用量とコストを分析できます。

    Usage Amount の棒グラフには日々の使用量の変化が視覚的に表示され、Usage Amount Details テーブルには表形式でデータが表示されます。

- **By Time Period**

    特定の期間における使用量とコストの傾向を確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大範囲は 2 か月です。

    たとえば、2024年8月の日次使用量と費用を分析するには、日付フィルターで 2024年8月1日から 2024年8月31日までを選択します。Usage Amount の棒グラフには、選択した期間の日次コストの傾向が表示されます。

- **By Cloud Region**

    複数のクラウドリージョンにサービスをデプロイしている場合は、クラウドリージョンでフィルタリングして、リージョン固有の使用量とコストを表示できます。

    たとえば、AWS us-east-1（バージニア）と GCP europe-west3（フランクフルト）の両方にクラスターをデプロイしている場合は、AWS us-east-1（バージニア）リージョンの使用量とコストをフィルタリングして表示できます。

分析のニーズに応じて複数のフィルターを組み合わせ、視覚化された使用量とコストのデータを表示できます。

### RESTful API 経由\{#via-restful-api}

<Admonition type="info" title="Notes">

Query Daily Usage RESTful API は現在パブリックプレビューです。この API を使用するには、[お問い合わせ](http://support.zilliz.com) ください。

</Admonition>

また、[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次使用量を照会できます。この RESTful API から取得される使用量の詳細は、小数点以下 8 桁まで正確です。日次コストがどのように累積され、小数点以下 2 桁に丸められるかを理解する必要がある場合は、RESTful API の使用をお勧めします。日次使用量を合計すると、小数点以下 8 桁まで正確な合計使用量が得られます。次に、この合計使用量を小数点以下 2 桁に丸めます（例：&#36;60.56724390 は &#36;60.57 に丸められます）。最終的な合計使用量は、請求書に表示される金額と一致する必要があります。

次の例は、組織の日次使用量を照会する方法を示しています。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-02-01T00:00:00Z"
}'
```

上記のコマンドでは、

- `start`: クエリ期間の開始時刻です。RFC 3339 形式（例：`2024-01-01T00:00:00Z`）で指定します。UTC の午前 0 時である必要があります。UTC 以外のオフセットは先に UTC に変換されるため、日付がずれます。UTC の午前 0 時でない開始時刻を指定すると、エラーにはならず、その日のバケットが空の `items` 配列と `total` の `0` とともに返されます。

- `end`: クエリ期間の終了時刻です。RFC 3339 形式（例：`2024-02-01T00:00:00Z`）で指定します。終了日はその日を含みます。`end` を `start` と等しく設定すると、日次バケットが 1 つ返されます。

## FAQ\{#faq}

**Zilliz Cloud の使用量の詳細に表示される金額はどの程度正確ですか？**

Zilliz Cloud は、**小数点以下 10 桁**の精度で料金を計算し、すべての請求はこの精度で計算されます。日次料金はまず小数点以下 10 桁で計算され、その後、請求処理中に合計されて小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（Unit Price、Usage、Usage Amount など）は常に小数点以下ちょうど 10 桁で返されます。値の小数点以下が 10 桁未満の場合は、10 桁に達するまで末尾にゼロが付加されます。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致しますが、読みやすさのために末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。
