---
title: "リリースノート（2024年1月18日） | Cloud"
slug: /release-notes-250
sidebar_label: "2024年1月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データインポート機能のユーザーエクスペリエンスを最適化し、階層型権限を備えた API Key を改良し、メトリクスとアラートの仕組みを強化しました。 | Cloud"
type: origin
token: VbjiwU5RYi4bWdkC48Jceltnnpd
sidebar_position: 26
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年1月18日）

Zilliz Cloud は、データインポート機能のユーザーエクスペリエンスを最適化し、階層型権限を備えた API Key を改良し、メトリクスとアラートの仕組みを強化しました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは、**Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## データインポート\{#data-import}

このたびの最新リリースで、Parquet データ形式のサポートを発表できることをうれしく思います。ユーザーエクスペリエンスを向上させるために、JSON または Parquet 形式のファイルを簡単に作成し、シームレスなデータインポートを実現できる強力なツールである PyMilvus writer utility を導入しました。詳細を確認し、新たな可能性を [Data Import Hands-On](./data-import-zero-to-hero) でご覧ください。

## API Key\{#api-key}

このリリースでは、Zilliz Cloud は [API Key](./manage-api-keys) の統一設計を導入しました。各ユーザーは、単一の統一 API Key を使用して、Zilliz Cloud プラットフォームと複数の Cluster にアクセスできます。

Zilliz Cloud の権限設計は、RBAC（Role-Based Access Control）の原則に従っており、Operation Layer と Data Layer の 2 層に分かれています。Operation Layer では、Role が Cluster、Project、User、Billing などのリソースに対する操作権限を管理します。Data Layer では、Role はデータの追加、削除、変更、クエリの機能を制御することに重点を置いています。

![V6ZhbOu0go1AORx0dxFcELQ3ndd](https://zdoc-images.s3.us-west-2.amazonaws.com/v6zhbou0go1aorx0dxfcelq3ndd.png "V6ZhbOu0go1AORx0dxFcELQ3ndd")

Operation Layer では、Zilliz Cloud は 4 種類の Role をサポートしており、そのうち Organization Owner、Project Owner、Project Member は一般的によく使用される 3 つの Role です。

- Organization Owner: 組織設定、支払い方法と請求の管理、API Key、組織内のすべての Project、および関連リソースを含む、組織全体に対する完全な管理権限を持ちます。

- Project Owner: Project 設定、Project 内のすべての Cluster、API Key、およびその他の関連リソースを含む、Project に対する完全な管理権限を持ちます。

- Project Member: Project 内のすべての Cluster に対する読み取りおよび書き込み権限を持ち、Cluster の詳細を表示し、Collection と Index を管理できます。

Data Layer では、Zilliz Cloud はデータの管理、書き込み、読み取り権限を制御するために、Admin、Read-Only、Read-Write の 3 つの組み込み Role を提供します。Zilliz Cloud では、ユーザーがカスタム Role を作成できます。これらのカスタム Role では、特定の Collection、Partition、または操作に対する権限を定義でき、Zilliz Cloud の使用時に最小権限の原則を確保できます。[Access Control Explained](./access-control-overview) を参照してください。

## メトリクスとアラート\{#metrics-and-alert}

このリリースでは、[metric boards and alert system](./metrics-alerts-reference) をリファクタリングしました。新しいバージョンでは、幅広いメトリクスを包括的に監視できます。

- リソース使用量メトリクス: CU（Compute Unit）の計算リソース使用率、CU 容量使用率（fullness）、および全体的なストレージ使用量を詳細に確認できます。

- パフォーマンスメトリクス: search/query の throughput と latency、データ挿入の効率（throughput と latency の両方）、およびリクエスト失敗率などの重要なパフォーマンス指標を追跡できます。

- データメトリクス: Collection 数、Entity の総数、search 用にロードされた Entity 数、および index 済み Entity 数に関するインサイトを取得できます。

さらに、強化された Alert System により、上記のすべてのメトリクスに対してカスタマイズされたアラートルールを設定できます。つまり、Query Per Second (QPS) が 1000 を超えた場合や、CU fullness が 70% を超えた場合などのシナリオに対してアラートを作成でき、システムの健全性とパフォーマンスについて常に把握し、先手を打って対応できます。

## 機能強化\{#enhancements}

このリリースには、一連の機能強化も含まれています。

- いくつかの Web コンソールページの体験を改善しました。

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

