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
sidebar_position: 5
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年4月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-04-11**

    </div>

    <div>

        ## Global Cluster\{#global-cluster}

        Global Cluster が、洗練されたプラットフォーム機能により、リージョンレベルの災害復旧フェイルオーバーを完全にサポートするようになりました。

        - フェイルオーバー: プライマリ cluster が利用できなくなった場合、いつでもフェイルオーバーをトリガーできるようになりました。フェイルオーバー後、新しいセカンダリは自動的に再作成されます。

        - 独立したレプリカスケーリング: プライマリ cluster とセカンダリ cluster は、レプリカ数、Dynamic Scaling、Schedule Scaling の設定をそれぞれ独立して管理できるようになりました。

        - 簡単な変換: Global Cluster と通常の dedicated cluster の間でシームレスに変換できるようになりました。

        - 監査ログ: 作成、スイッチオーバー、フェイルオーバー、セカンダリ管理を含む、すべての Global Cluster トポロジ変更が監査ログに記録されるようになりました。詳細については、[Global Cluster Explained](./global-cluster-explained) および [Switchover and Failover](./switchover-and-failover) を参照してください。

        ## Collection-Level Metrics\{#collection-level-metrics}

        以下のメトリクスが collection レベルの内訳をサポートするようになり、個々の collection のパフォーマンス問題の特定やキャパシティ計画に役立ちます。

        - QPS（Read/Write）

        - レイテンシ（Read/Write、平均および P99）

        - エンティティ数

        - ロード済みエンティティ

        collection レベルのメトリクスには、Console UI、Prometheus エンドポイント、または RESTful API からアクセスできます。詳細については、[Metrics Reference](./metrics-alerts-reference) および [Integrate with Prometheus](./prometheus-monitoring) を参照してください。

        ## Access Logs | PUBLIC\{#access-logs-or-public}

        Zilliz Cloud は、cluster 上のクエリレベルのアクティビティ（Search、Hybrid Search、Query）を記録する Access Logs をサポートするようになりました。これは、パフォーマンス分析やビジネスインサイトのために設計されています。主な機能は次のとおりです。

        - **設定可能なサンプリング** — 精度とストレージコストのバランスを取れます（例: 1% のサンプリングレート）。

        - **カスタマイズ可能な出力フィールド** — エントリごとのログ詳細度を制御できます。

        - **ホットデータの特定** — 返された主キーを分析して、頻繁にアクセスされるレコードを見つけられます。

        - **構造化された JSON Lines 形式** — あらゆる分析パイプラインですぐに利用できます。詳細については、[Access Logs Overview](./access-log-overview) を参照してください。

        ## Maintenance Window\{#maintenance-window}

        Maintenance Window の体験が再設計され、最小継続時間が 4 時間に延長されました。また、アップグレードの 7/3/1 日前にメールおよびコンソール内通知を受け取れるようになり、アップグレードを 7 日間延期する機能、およびすべての Business Critical プランと Enterprise プランでの利用が可能になりました。詳細については、[Configure Maintenance Windows](./organization-settings#set-up-preferred-maintenance-window) を参照してください。

        ## Cluster Admin Role\{#cluster-admin-role}

        新しい Cluster Admin ロールにより、プロジェクトレベルの完全な管理者権限を与えることなく、特定の cluster への運用アクセス権をチームメンバーに付与できるようになりました。

        - Cluster の運用: Cluster Admin は、スケーリング、停止/再開、バックアップ/リストア、DB ユーザー管理など、日常的な運用タスクを実行できます。

        - Cluster 単位のスコープ設定: このロールは特定の cluster に割り当てることができ、環境やワークロードごとにきめ細かな職務分離を実現します。

        - 注: Customized API Keys は現在、Cluster Admin ロールをサポートしていません。詳細については、[Manage Project Users](./project-users) を参照してください。

        ## Zilliz Cloud BYOC supports Tiered-Storage Cluster\{#zilliz-cloud-byoc-supports-tiered-storage-cluster}

        BYOC デプロイメントで Tiered Storage cluster を作成できるようになりました。これをサポートするために、BYOC プロジェクトでは Tiered Query Node グループ設定が導入され、Tiered Storage cluster の Query Node について、インスタンスタイプ、ノード数、スケーリングを個別に設定できます。詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) を参照してください。

        ## Enhancements\{#enhancements}

        - collection データのプレビューを、主キー、数値、その他の scalar フィールドで昇順または降順に並べ替えられるようになりました。詳細については、[Manage Collections (Console)](./manage-collections-console) の Preview collection data セクションを参照してください。

    </div>

</Grid>
