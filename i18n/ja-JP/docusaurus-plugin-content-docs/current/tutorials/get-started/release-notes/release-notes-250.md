---
title: "リリースノート（2024年1月18日） | Cloud"
slug: /release-notes-250
sidebar_label: "2024年1月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層型権限によって API Key を洗練し、メトリクスおよびアラートの仕組みを強化しました。 | Cloud"
type: origin
token: VbjiwU5RYi4bWdkC48Jceltnnpd
sidebar_position: 26
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年1月18日）

Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層型権限によって API Key を洗練し、メトリクスおよびアラートの仕組みを強化しました。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Data Import\{#data-import}

このたび、最新リリースで Parquet データ形式のサポートを発表できることをうれしく思います。ユーザー体験を向上させるために、PyMilvus writer utility を導入しました。これは、シームレスなデータインポートのために JSON または Parquet 形式のファイルを簡単に作成できるよう支援する強力なツールです。詳細を確認し、新たな可能性を [Data Import Hands-On](./data-import-zero-to-hero) でご覧ください。

## API Key\{#api-key}

このリリースで、Zilliz Cloud は [API Key](./manage-api-keys) の統一設計を導入しました。各ユーザーは、単一の統一 API Key を使用して Zilliz Cloud プラットフォームおよび複数のクラスターにアクセスできます。

Zilliz Cloud の権限設計は、RBAC（Role-Based Access Control）の原則に従い、Operation Layer と Data Layer の 2 層に分かれています。Operation Layer では、クラスター、プロジェクト、ユーザー、請求などのリソースに対する運用権限をロールが管理します。Data Layer では、データの追加、削除、変更、クエリの機能を制御することにロールが重点を置いています。

![V6ZhbOu0go1AORx0dxFcELQ3ndd](https://zdoc-images.s3.us-west-2.amazonaws.com/v6zhbou0go1aorx0dxfcelq3ndd.png "V6ZhbOu0go1AORx0dxFcELQ3ndd")

Operation Layer では、Zilliz Cloud は 4 種類のロールをサポートしており、そのうち Organization Owner、Project Owner、Project Member の 3 つが一般的に使用されるロールです。

- Organization Owner: 組織設定、支払い方法と請求、API Key、組織内のすべてのプロジェクト、および関連リソースを含め、組織に対する完全な管理権限を持ちます。

- Project Owner: プロジェクト設定、プロジェクト内のすべてのクラスター、API Key、およびその他の関連リソースを含め、プロジェクトに対する完全な管理権限を持ちます。

- Project Member: プロジェクト内のすべてのクラスターに対する読み取りおよび書き込み権限を持ち、クラスターの詳細を表示し、コレクションとインデックスを管理できます。

Data Layer では、Zilliz Cloud は、データの管理、書き込み、読み取り権限を制御するために、Admin、Read-Only、Read-Write の 3 つの組み込みロールを提供します。Zilliz Cloud では、ユーザーがカスタムロールを作成できます。これらのカスタムロールは、特定のコレクション、パーティション、または操作に対する権限を定義できるため、Zilliz Cloud の利用時に最小権限の原則を確保できます。[Access Control Explained](./access-control-overview) を参照してください。

## Metrics & Alert\{#metrics-and-alert}

このリリースでは、[metric boards and alert system](./metrics-alerts-reference) をリファクタリングしました。新バージョンでは、次のような幅広いメトリクスを監視できます。

- Resource Usage Metrics: CU（Compute Unit）の計算リソース使用率、CU 容量使用率（fullness）、および全体的なストレージ使用量を詳細に確認できます。

- Performance Metrics: search/query のスループットとレイテンシ、データ挿入の効率（スループットとレイテンシの両方）、リクエスト失敗率など、重要なパフォーマンス指標を追跡できます。

- Data Metrics: コレクションの数、エンティティの総数、検索用にロードされたエンティティの数、およびインデックス化されたエンティティの数を把握できます。

さらに、強化された Alert System により、前述のすべてのメトリクスに対してカスタマイズされたアラートルールを設定できます。つまり、Query Per Second（QPS）が 1000 を超えた場合や、CU fullness が 70% を超えた場合などのシナリオに対してアラートを作成でき、システムの健全性とパフォーマンスについて常に把握し、先回りして対応できます。

## Enhancements\{#enhancements}

このリリースには、次のような一連の機能強化も含まれています。

- 複数の Web コンソールページの体験を改善しました。

- 安定性の向上: 既知の問題に対処し、サービスの信頼性をさらに高めました。<br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>

