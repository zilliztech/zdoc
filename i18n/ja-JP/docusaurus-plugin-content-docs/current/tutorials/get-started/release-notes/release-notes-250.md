---
title: "リリースノート（2024年1月18日） | Cloud"
slug: /release-notes-250
sidebar_label: "2024年1月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層的な権限を持つ API Key を改良し、メトリクスとアラートの仕組みを強化しました。 | Cloud"
type: origin
token: VbjiwU5RYi4bWdkC48Jceltnnpd
sidebar_position: 27
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年1月18日）

Zilliz Cloud は、データインポート機能のユーザー体験を最適化し、階層的な権限を持つ API Key を改良し、メトリクスとアラートの仕組みを強化しました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## データインポート\{#data-import}

最新リリースで Parquet データ形式のサポートを発表できることをうれしく思います。ユーザー体験を向上させるために、PyMilvus writer utility を導入しました。これは、シームレスなデータインポートのために JSON 形式または Parquet 形式のファイルを手軽に作成できるようユーザーを支援するために設計された強力なツールです。詳細を確認し、[データインポート ハンズオン](./data-import-zero-to-hero) で新たな可能性を探ってみてください。

## API Key\{#api-key}

このリリースで、Zilliz Cloud は [API Key](./manage-api-keys) の統一設計を導入しました。各ユーザーは、単一の統一された API Key を使用して、Zilliz Cloud プラットフォームと複数のクラスターにアクセスできます。

Zilliz Cloud の権限設計は、RBAC（Role-Based Access Control）の原則に従い、Operation Layer と Data Layer の 2つの層に分かれています。Operation Layer では、ロールがクラスター、プロジェクト、ユーザー、請求などのリソースの運用権限を管理します。Data Layer では、ロールはデータの追加、削除、変更、クエリの機能を制御することに重点を置いています。

![V6ZhbOu0go1AORx0dxFcELQ3ndd](https://zdoc-images.s3.us-west-2.amazonaws.com/v6zhbou0go1aorx0dxfcelq3ndd.png "V6ZhbOu0go1AORx0dxFcELQ3ndd")

Operation Layer では、Zilliz Cloud は 4 種類のロールをサポートしており、そのうち Organization Owner、Project Owner、Project Member は一般的に使用される 3つのロールです。

- Organization Owner: 組織設定、支払い方法と請求の管理、API Key、組織内のすべてのプロジェクト、関連リソースなど、組織に対する完全な管理権限を持ちます。

- Project Owner: プロジェクト設定、プロジェクト内のすべてのクラスター、API Key、その他の関連リソースなど、プロジェクトに対する完全な管理権限を持ちます。

- Project Member: プロジェクト内のすべてのクラスターに対する読み取りおよび書き込み権限を持ち、クラスターの詳細を表示し、コレクションとインデックスを管理できます。

Data Layer では、Zilliz Cloud は、データの管理、書き込み、読み取りの権限を制御するために、Admin、Read-Only、Read-Write の 3つの組み込みロールを提供しています。Zilliz Cloud では、ユーザーがカスタムロールを作成できます。これらのカスタムロールでは、特定のコレクション、パーティション、または操作に対する権限を定義できるため、Zilliz Cloud の使用時にデータの最小権限の原則を確保できます。詳細は、[アクセス制御の概要](./access-control-overview) を参照してください。

## メトリクスとアラート\{#metrics-and-alert}

このリリースでは、[メトリクスボードとアラートシステム](./metrics-alerts-reference) をリファクタリングしました。新バージョンでは、包括的な範囲のメトリクスを監視できます。

- リソース使用量メトリクス: CU（Compute Unit）の計算リソース使用率、CU 容量使用率（fullness）、および全体的なストレージ使用量を詳細に確認できます。

- パフォーマンスメトリクス: search/query のスループットとレイテンシー、データ挿入の効率（スループットとレイテンシーの両方）、リクエスト失敗率など、重要なパフォーマンス指標を追跡できます。

- データメトリクス: コレクションの数、エンティティの総数、検索用にロードされたエンティティの数、インデックス化されたエンティティの数を把握できます。

さらに、強化された Alert System では、前述のすべてのメトリクスに対してカスタマイズしたアラートルールを設定できます。つまり、1 秒あたりのクエリ数（QPS）が 1000 を超えた場合や、CU 容量使用率（fullness）が 70% を超えた場合などのシナリオに対してアラートを作成でき、システムの健全性とパフォーマンスを常に把握し、先手を打って対応できます。

## 機能強化\{#enhancements}

このリリースには、以下の一連の機能強化も含まれています。

- 複数の Web コンソールページの体験を改善しました。

- 安定性の強化: 既知の問題に対処し、サービスの信頼性をさらに高めました。<br/>
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
