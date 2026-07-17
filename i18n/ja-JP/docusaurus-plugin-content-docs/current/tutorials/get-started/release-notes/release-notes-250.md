---
title: "リリースノート（2024年1月18日） | Cloud"
slug: /release-notes-250
sidebar_label: "2024年1月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層型権限を持つ API key を改善し、メトリクスおよびアラートの仕組みを強化しました。 | Cloud"
type: origin
token: VbjiwU5RYi4bWdkC48Jceltnnpd
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年1月18日）

Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層型権限を持つ API key を改善し、メトリクスおよびアラートの仕組みを強化しました。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Data Import\{#data-import}

このたび、最新リリースで Parquet データ形式のサポートを発表できることを嬉しく思います。ユーザー体験を向上させるために、PyMilvus writer utility を導入しました。これは、シームレスなデータインポートのために、ユーザーが JSON または Parquet 形式のファイルを簡単に作成できるよう支援する強力なツールです。詳細を確認し、新たな可能性を [Data Import Hands-On](./data-import-zero-to-hero) でご覧ください。

## API Key\{#api-key}

このリリースでは、Zilliz Cloud は [API Key](./manage-api-keys) の統一設計を導入しました。各ユーザーは、単一の統一 API key を使用して、Zilliz Cloud プラットフォームおよび複数の Cluster にアクセスできます。

Zilliz Cloud の権限設計は、RBAC（Role-Based Access Control）の原則に従い、Operation Layer と Data Layer の 2 つのレイヤーに分かれています。Operation Layer では、ロールが Cluster、Project、User、Billing などのリソースに対する運用権限を管理します。Data Layer では、ロールはデータの追加、削除、変更、クエリを行う機能の制御に重点を置いています。

![V6ZhbOu0go1AORx0dxFcELQ3ndd](https://zdoc-images.s3.us-west-2.amazonaws.com/v6zhbou0go1aorx0dxfcelq3ndd.png "V6ZhbOu0go1AORx0dxFcELQ3ndd")

Operation Layer では、Zilliz Cloud は 4 種類のロールをサポートしており、そのうち Organization Owner、Project Owner、Project Member は一般的によく使用される 3 つのロールです。

- Organization Owner: 組織設定、支払い方法と請求の管理、API Keys、組織内のすべての Project、および関連リソースを含む、組織全体に対する完全な管理権限を持ちます。

- Project Owner: Project 設定、Project 内のすべての cluster、API Keys、およびその他の関連リソースを含む、Project に対する完全な管理権限を持ちます。

- Project Member: Project 内のすべての cluster に対する読み取りおよび書き込み権限を持ち、cluster の詳細を表示し、Collections と Indexes を管理できます。

Data Layer では、Zilliz Cloud はデータの管理、書き込み、読み取り権限を制御するために、Admin、Read-Only、Read-Write の 3 つの組み込みロールを提供しています。Zilliz Cloud では、ユーザーがカスタムロールを作成できます。これらのカスタムロールでは、特定の Collections、Partitions、または操作に対する権限を定義できるため、Zilliz Cloud の利用時に最小権限の原則を確保できます。[Access Control Explained](./access-control-overview) を参照してください。

## Metrics & Alert\{#metrics-and-alert}

このリリースでは、[metric boards and alert system](./metrics-alerts-reference) をリファクタリングしました。新しいバージョンでは、幅広いメトリクスを包括的に監視できます。

- Resource Usage Metrics: CU（Compute Unit）の計算リソース使用率、CU 容量使用率（fullness）、および全体のストレージ使用量の詳細なビューが含まれます。

- Performance Metrics: search/query のスループットとレイテンシー、データ挿入の効率（スループットとレイテンシーの両方）、およびリクエスト失敗率などの重要なパフォーマンス指標を追跡できます。

- Data Metrics: collections の数、entities の総数、search 用にロードされた entities の数、および index 化された entities の数に関するインサイトを得られます。

さらに、強化された Alert System により、上記すべてのメトリクスに対してカスタマイズされたアラートルールを設定できます。これは、たとえば Query Per Second (QPS) が 1000 を超えた場合や、CU fullness が 70% を超えた場合などのシナリオに対してアラートを作成できることを意味し、システムの健全性とパフォーマンスについて常に把握し、先手を打って対応できるようにします。

## Enhancements\{#enhancements}

このリリースには、以下の一連の改善も含まれています。

- 複数の Web コンソールページの体験を改善しました。

- Stability Enhancements: 既知の問題に対処し、サービスの信頼性をさらに向上させました。

