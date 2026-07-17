---
title: "コストの分析 | BYOC"
slug: /analyze-cost
sidebar_label: "コストの分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、可視化されたコスト分析ツールが提供されており、複数の切り口から Zilliz Cloud の使用状況と費用を表示・追跡できます。 | BYOC"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コストの分析

Zilliz Cloud の **Usage** ページでは、可視化されたコスト分析ツールが提供されており、複数の切り口から Zilliz Cloud の使用状況と費用を表示・追跡できます。

## 前提条件\{#prerequisites}

Zilliz Cloud の使用状況ページを使用してコストにアクセスし分析するには、**Organization Owner** または **Billing Admin** 権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI 経由](./analyze-cost#via-web-ui): コストの傾向を可視化したい場合は、web UI の使用をおすすめします。web UI 上の使用状況の詳細は **小数点以下 10 桁** に丸められます。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次使用状況についてより詳細な分析が必要な場合は、RESTful API の使用をおすすめします。RESTful API から取得される使用状況の詳細は **小数点以下 10 桁** の精度です。

### Web UI 経由\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまな切り口で使用状況とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="📘 Notes">

使用状況データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyzecost.png "analyze_cost")

- **プロジェクト別**

    異なる業務や部門ごとに複数のプロジェクトを作成している場合、特定のプロジェクトの使用状況とコストをフィルタリングして表示できます。

    たとえば、Default Project（R&D 部門向け）と Project_01（Marketing 部門向け）という 2 つのプロジェクトを作成している場合、プロジェクトフィルタで Default Project を選択すると、過去 1 か月間の R&D 部門の使用状況とコストを分析できます。

    Usage Amount の棒グラフには日々の使用量の変化が視覚的に表示され、Usage Amount Details テーブルには表形式でデータが表示されます。

