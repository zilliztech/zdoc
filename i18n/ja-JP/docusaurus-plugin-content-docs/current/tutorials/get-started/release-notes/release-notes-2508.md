---
title: "2025年8月 リリースノート | Cloud"
slug: /release-notes-2508
sidebar_label: "2025年8月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: JNWZwEqkwiDmeSkVPBlc4hnanEe
sidebar_position: 11
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025年8月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-20**

    </div>

    <div>

        ## オートスケーリングのアップグレード\{#autoscaling-upgrade}

        **Zilliz Cloud のオートスケーリング機能に大幅なアップグレードを導入し、** より高度で自動化されたリソース管理を実現します。主な改善点は以下のとおりです。

        - **インテリジェントなオートスケーリング:** スケールアップ時の容量しきい値を手動設定する必要がなくなりました。リアルタイムのワークロード負荷に応じて、システムが最適なパフォーマンスとリソース使用率を自動的に維持します。

        - **自動スケールダウンのサポート:** ご要望の多かった機能が追加されました。新しいオートスケーリングでは、低負荷時に自動スケールダウンが行われ、手動操作なしでコストを最適化できます。

        - **設定の簡素化:** 最小および最大の CU サイズを設定するだけになりました。Zilliz Cloud がこの範囲内でスケーリングを自動管理し、可用性とリソース使用率のバランスを最適化します。

        ## Audit Log GA\{#audit-log-ga}

        本リリースより、**Audit Logs** の **GA（一般提供）** を開始しました。これにより、AWS、GCP、Azure の **3つのクラウドプロバイダーすべて** でホストされるクラスターがサポートされます。

        VectorDB Audit Logs は、クラスター内のユーザーアクティビティを詳細に記録し、**セキュリティの強化、コンプライアンスの確保、問題のトラブルシューティング** を効率化します。クエリ/searchやデータ管理操作、接続イベント、ユーザーやロールの変更など、あらゆる操作を完全に可視化することで、**データアクセスの監視**、異常動作の検出、および **エンタープライズガバナンスとコンプライアンス要件への対応** を支援します。

        GA 以降、Audit Log は **有料機能** となります。有効にするには、**Enterprise Plan** の **Dedicated クラスター** を選択してください。

        - 利用方法の詳細については、[VectorDB Audit Logs ユーザーガイド](./audit-logs) を参照してください。

        - 料金については、[Audit Log のコスト](./audit-log-cost) を参照してください。

        ## SSO エクスペリエンスの向上\{#improved-sso-experience}

        本リリースでは、Zilliz Cloud における SSO セットアッププロセスを改善し、設定をよりシンプルかつ迅速に、ミスの少ないものへと進化させました。

        **ハイライト:**

        - **IdP 固有のフロー**: **Okta**（OIDC、SAML 2.0）、**Microsoft Entra**（SAML 2.0）、**Google Workspace**（SAML 2.0）それぞれに最適化されたガイダンスを、コンソールおよび [ドキュメント](./single-sign-on) で提供します。

        - **UX の向上**: フィールドマッピングの明確化と証明書アップロード時の検証強化により、設定ミスを防止できます。

        - **ドキュメントの強化:** **視覚的で IdP 固有の例** を追加し、Zilliz UI と IdP 管理コンソール間を行き来する手間を軽減しました。

        ## 機能強化\{#enhancements}

        - **SDK（Python、Java）を通じてステージのライフサイクル全体** を管理できるようになりました。SDK でステージを作成後、シームレスにファイルをアップロードしてワークフローを処理できるため、開発がよりスムーズかつ効率的になります。

        - **GUI** から直接 **Parquet 形式のローカルファイルをインポート** できるようになりました。JSON に加えて Parquet 形式にも対応したことで、大規模データセットの取り扱いやデータオンボーディングのプロセスがさらに効率化されました。

        - **Milvus バックアップファイルからの移行** 時に、特定の **データベースとコレクション** を選択できるようになりました。これにより、オンプレミスの Milvus からクラウドへデータを転送する際の柔軟性と精度が向上しました。

        - Zilliz GUI で、コレクションに関連付けられた **すべてのエイリアスを表示** できるようになり、エイリアスの管理と使用状況の把握が容易になりました。

        - Zilliz Terraform Provider が BYOC インスタンスの管理に対応しました。Terraform を使用して、BYOC プロジェクト内のインスタンスを作成、更新、削除できます。

        - Usage 画面で使用状況の詳細を CSV にエクスポートできるようになりました。ユーザーエクスペリエンスも改善されており、データの分析やアーカイブがより簡単に行えます。

        - Billing Profile に登録したメールアドレスで請求通知を受信できるようになり、財務チームが最新の情報を確実に把握できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-13**

    </div>

    <div>

        ## AWS シドニーリージョンのサポート\{#support-aws-sydney-region}

    </div>

</Grid>

