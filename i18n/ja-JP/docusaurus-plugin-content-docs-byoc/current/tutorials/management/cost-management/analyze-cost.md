---
title: "コスト分析 | BYOC"
slug: /analyze-cost
sidebar_label: "コスト分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用量と費用を表示および追跡できます。 | BYOC"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト分析

Zilliz Cloud の **Usage** ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用量と費用を表示および追跡できます。

## 前提条件\{#prerequisites}

Zilliz Cloud の使用状況ページを使用してコストにアクセスし分析するには、**Organization Owner** または **Billing Admin** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI を使用](./analyze-cost#via-web-ui): コストの傾向を可視化したい場合は、Web UI の使用をお勧めします。Web UI 上の使用状況の詳細は **小数点以下 10 桁** に丸められます。

- [RESTful API を使用](./analyze-cost#via-restful-api): 日次使用量についてより詳細な分析が必要な場合は、RESTful API の使用をお勧めします。RESTful API で取得される使用状況の詳細は **小数点以下 10 桁** の精度です。

### Web UI を使用\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまな観点で使用量とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="📘 Notes">

使用状況データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyze_cost.png "analyze_cost")

- **プロジェクト別**

    異なる事業や部門ごとに複数のプロジェクトを作成している場合は、特定のプロジェクトの使用量とコストを絞り込んで表示できます。

    たとえば、2 つのプロジェクト、Default Project（R&D 部門向け）と Project_01（Marketing 部門向け）を作成している場合、プロジェクトフィルターで Default Project を選択すると、過去 1 か月の R&D 部門の使用量とコストを分析できます。

    Usage Amount の棒グラフでは日々の使用量の変化が視覚的に表示され、Usage Amount Details テーブルではデータが表形式で提供されます。

- **期間別**

    特定の期間における使用量とコストの傾向を確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大範囲は 2 か月です。

    たとえば、2024 年 8 月の日次使用量と費用を分析するには、日付フィルターで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount の棒グラフには、選択した期間の日次コストの傾向が表示されます。

- **クラウドリージョン別**

    複数のクラウドリージョンにサービスをデプロイしている場合は、クラウドリージョンでフィルタリングして、リージョンごとの使用量とコストを表示できます。

    たとえば、AWS us-east-1 (Virginia) と GCP europe-west3 (Frankfurt) の両方にクラスターをデプロイしている場合、AWS us-east-1 (Virginia) リージョンの使用量とコストを絞り込んで表示できます。

分析ニーズに応じて複数のフィルターを組み合わせ、可視化された使用量とコストデータを表示できます。 

### RESTful API を使用\{#via-restful-api}

<Admonition type="info" icon="📘" title="📘 Notes">

Query Daily Usage RESTful API は現在パブリックプレビュー中です。この API を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

また、[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次使用量を照会することもできます。この RESTful API で取得される使用状況の詳細は小数点以下 8 桁の精度です。日次コストがどのように積み上げられ、小数点以下 2 桁に丸められるかを把握したい場合は、RESTful API の使用をお勧めします。日次使用量を合計すると、小数点以下 8 桁の精度を持つ合計使用量が得られます。次に、この合計使用量を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な合計使用量は、請求書に表示される金額と一致するはずです。

次の例は、組織の日次使用量を照会する方法を示しています。

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

**Zilliz Cloud の使用状況の詳細に表示される金額はどの程度正確ですか？**

Zilliz Cloud は **小数点以下 10 桁** の精度で料金を計算しており、すべての課金はこの精度レベルで算出されます。日次料金はまず小数点以下 10 桁で計算され、その後、課金プロセス中に合計されて小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（例: Unit Price、Usage、Usage Amount）は、常にちょうど小数点以下 10 桁で返されます。値の小数桁数が 10 桁未満の場合は、末尾に 0 が追加されて 10 桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致していますが、可読性向上のために末尾の 0 は省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

