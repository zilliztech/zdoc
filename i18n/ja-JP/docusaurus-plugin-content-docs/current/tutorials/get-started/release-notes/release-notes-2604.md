---
title: "2026年4月リリースノート | Cloud"
slug: /release-notes-2604
sidebar_key: release-notes-2604
sidebar_label: "2026年4月"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の2026年4月のリリースノートです。"
type: origin
token: N2XtwwchPi79M7kW1UjcnjC4nzc
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 変更履歴

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年4月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-04-11**

    </div>

    <div>

        ## グローバルクラスター\{#global-cluster}

        グローバルクラスターが、強化されたプラットフォーム機能を備えたリージョンレベルのディザスタリカバリーフェイルオーバーを完全にサポートするようになりました。

        - フェイルオーバー: プライマリークラスターが利用できなくなった場合、いつでもフェイルオーバーをトリガーできるようになりました。フェイルオーバー後、新しいセカンダリークラスターが自動的に再作成されます。

        - 独立したレプリカスケーリング: プライマリークラスターとセカンダリークラスターは、それぞれ独立してレプリカ数、Dynamic Scaling、および Schedule Scaling の設定を管理できるようになりました。

        - 簡単な変換: グローバルクラスターと通常の専用クラスター間をシームレスに変換できるようになりました。

        - 監査ログ: グローバルクラスターのトポロジー変更（作成、スイッチオーバー、フェイルオーバー、セカンダリークラスターの管理を含む）がすべて監査ログに記録されるようになりました。詳細については、[グローバルクラスターの解説](./global-cluster-explained) および [スイッチオーバーとフェイルオーバー](./switchover-and-failover) を参照してください。

        ## コレクションレベルのメトリクス\{#collection-level-metrics}

        以下のメトリクスがコレクションレベルの内訳に対応し、個別のコレクションのパフォーマンス問題の特定や容量計画に役立ちます:

        - QPS (読み取り/書き込み)

        - レイテンシー (読み取り/書き込み、平均および P99)

        - エンティティ数

        - ロードされたエンティティ

        コレクションレベルのメトリクスは、Console UI、Prometheus エンドポイント、または RESTful API からアクセスできます。詳細については、[メトリクスリファレンス](./metrics-alerts-reference) および [Prometheus との統合](./prometheus-monitoring) を参照してください。

        ## アクセスログ | PUBLIC\{#access-logs}

        Zilliz Cloud が、アクセスログをサポートするようになりました。これはクラスター上のクエリレベルのアクティビティ（Search、Hybrid Search、Query）をキャプチャするもので、パフォーマンス分析とビジネスインサイトのために設計されています。主な機能:

        - **設定可能なサンプリング** — 精度とストレージコストのバランスを調整可能（例: 1% サンプリングレート）。

        - **カスタマイズ可能な出力フィールド** — エントリーごとのログ詳細度を制御。

        - **ホットデータの特定** — 返されたプライマリーキーを分析して、頻繁にアクセスされるレコードを特定。

        - **構造化された JSON Lines 形式** — あらゆる分析パイプラインでそのまま使用可能。詳細については、[アクセスログ](./access-logs) を参照してください。

        ## メンテナンスウィンドウ\{#maintenance-window}

        メンテナンスウィンドウのエクスペリエンスが再設計されました。最小4時間の延長、メンテナンスの7/3/1日前のメールおよびコンソール内通知、アップグレードを7日間延期する機能、およびすべてのビジネスクリティカルおよび Enterprise プランでの利用が可能になりました。詳細については、[メンテナンスウィンドウの設定](./organization-settings#set-up-preferred-maintenance-window) を参照してください。

        ## クラスター管理者ロール\{#cluster-admin-role}

        新しいクラスター管理者ロールにより、チームメンバーにプロジェクトレベルの完全な管理者権限なしで、特定のクラスターへの運用アクセスを付与できます。

        - クラスター運用: クラスター管理者は、スケーリング、停止/再開、バックアップ/リストア、DB ユーザー管理を含む日々の運用タスクを実行できます。

        - クラスターごとのスコーピング: このロールは特定のクラスターに割り当て可能で、環境やワークロード間でのきめ細かな職務分離を実現します。

        - 注: カスタマイズされた APIキー は現在、クラスター管理者ロールをサポートしていません。詳細については、[プロジェクトユーザーの管理](./project-users) を参照してください。

        ## Zilliz Cloud BYOC が Tiered-Storage クラスターをサポート\{#zilliz-cloud-byoc-supports-tiered-storage-cluster}

        BYOC デプロイメントで Tiered Storage クラスターを作成できるようになりました。これをサポートするため、BYOC プロジェクトに Tiered Query Node グループ設定が導入され、Tiered Storage クラスターの Query Node のインスタンスタイプ、ノード数、スケーリングを独立して設定できます。詳細については、[AWS への BYOC デプロイ](/docs/byoc/deploy-byoc-aws) を参照してください。

        ## 機能強化\{#enhancements}

        - コレクションデータのプレビューを、プライマリーキー、数値、またはその他のスカラーフィールドで昇順または降順にソートできるようになりました。詳細については、[コレクションの管理 (Console)](./manage-collections-console) の「コレクションデータのプレビュー」セクションを参照してください。

    </div>

</Grid>
