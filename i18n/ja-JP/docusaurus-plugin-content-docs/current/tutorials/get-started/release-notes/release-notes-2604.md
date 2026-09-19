---
title: "2026年4月 リリースノート | Cloud"
slug: /release-notes-2604
sidebar_label: "2026年4月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: N2XtwwchPi79M7kW1UjcnjC4nzc
sidebar_position: 6
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年4月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-04-27**

    </div>

    <div>

        **新リージョン**: 🇰🇷 韓国ソウル（AWS）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-04-11**

    </div>

    <div>

        ## グローバルクラスター\{#global-cluster}

        グローバルクラスターが、洗練されたプラットフォーム機能により、リージョンレベルの災害復旧フェイルオーバーを完全にサポートするようになりました。

        - フェイルオーバー: プライマリクラスターが利用できなくなったときに、いつでもフェイルオーバーをトリガーできるようになりました。フェイルオーバー後は、新しいセカンダリクラスターが自動的に再作成されます。

        - 独立したレプリカスケーリング: プライマリクラスターとセカンダリクラスターが、レプリカ数、Dynamic Scaling、Schedule Scaling の設定をそれぞれ独立して管理できるようになりました。

        - 簡単な変換: グローバルクラスターと通常の専用クラスターの間でシームレスに変換できるようになりました。

        - 監査ログ: 作成、スイッチオーバー、フェイルオーバー、セカンダリクラスターの管理など、グローバルクラスターのすべてのトポロジ変更が監査ログに記録されるようになりました。詳細については、[グローバルクラスターの説明](./global-cluster-explained) および [スイッチオーバーとフェイルオーバー](./switchover-and-failover) を参照してください。

        ## コレクションレベルのメトリクス\{#collection-level-metrics}

        以下のメトリクスがコレクションレベルの内訳をサポートするようになり、個々のコレクションのパフォーマンス問題の特定やキャパシティ計画に役立ちます。

        - QPS (Read/Write)

        - Latency (Read/Write, Average and P99)

        - Entity Count

        - Loaded Entities

        コレクションレベルのメトリクスには、Console UI、Prometheus エンドポイント、または RESTful API からアクセスできます。詳細については、[メトリクスリファレンス](./metrics-alerts-reference) および [Integrate with Prometheus](./prometheus-monitoring) を参照してください。

        ## Access Logs | PUBLIC\{#access-logs-or-public}

        Zilliz Cloud は、クラスター上のクエリレベルのアクティビティ（Search、Hybrid Search、Query）を記録する Access Logs をサポートするようになりました。これは、パフォーマンス分析とビジネスインサイトを目的としています。主な機能は次のとおりです。

        - **設定可能なサンプリング** — 精度とストレージコストのバランスを取れます（例: 1% のサンプリングレート）。

        - **カスタマイズ可能な出力フィールド** — エントリごとのログ詳細度を制御できます。

        - **ホットデータの特定** — 返された主キーを分析して、頻繁にアクセスされるレコードを特定できます。

        - **構造化された JSON Lines 形式** — あらゆる分析パイプラインですぐに利用できます。詳細については、[Access Logs の概要](./access-log-overview) を参照してください。

        ## メンテナンスウィンドウ\{#maintenance-window}

        メンテナンスウィンドウの操作性が再設計され、最小継続時間が 4 時間に延長されました。また、アップグレードの 7/3/1 日前にメールおよびコンソール内通知を受け取れるようになり、アップグレードを 7 日間延期する機能、およびすべての Business Critical プランと Enterprise プランでの利用が可能になりました。詳細については、[Configure Maintenance Windows](./organization-settings#set-up-preferred-maintenance-window) を参照してください。

        ## クラスター管理者ロール\{#cluster-admin-role}

        新しいクラスター管理者ロールにより、プロジェクトレベルの完全な管理者権限を付与することなく、チームメンバーに特定のクラスターへの運用アクセス権を付与できるようになりました。

        - クラスターの運用: クラスター管理者は、スケーリング、suspend/resume, backup/restore, DB ユーザー管理など、日常的な運用タスクを実行できます。

        - クラスター単位のスコープ設定: このロールは特定のクラスターに割り当てることができ、環境やワークロードごとに職務をきめ細かく分離できます。

        - 注: Customized API Keys は現在、クラスター管理者ロールをサポートしていません。詳細については、[プラットフォームロールの管理](./manage-platform-roles#manage-project-roles) を参照してください。

        ## Zilliz Cloud BYOC が Tiered Storage クラスターをサポート\{#zilliz-cloud-byoc-supports-tiered-storage-cluster}

        BYOC デプロイメントで Tiered Storage クラスターを作成できるようになりました。これをサポートするために、BYOC プロジェクトでは Tiered Query Node グループ設定が導入され、Tiered Storage クラスターの Query Node について、インスタンスタイプ、ノード数、スケーリングを個別に設定できます。詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) を参照してください。

        ## 機能強化\{#enhancements}

        - コレクションデータのプレビューを、主キー、数値、その他のスカラーフィールドで昇順または降順に並べ替えられるようになりました。詳細については、[コレクションの管理（Console）](./manage-collections-console) の「コレクションデータをプレビューする」セクションを参照してください。

    </div>

</Grid>
