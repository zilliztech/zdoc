---
title: "2025年8月 リリースノート | Cloud"
slug: /release-notes-2508
sidebar_label: "2025年8月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: JNWZwEqkwiDmeSkVPBlc4hnanEe
sidebar_position: 12
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

        **Zilliz Cloud のオートスケーリング機能に大幅なアップグレードを導入します。** これにより、より優れた自動化されたリソース管理エクスペリエンスを提供できるようになります。主な改善点は以下のとおりです。

        - **インテリジェントなオートスケーリング:** スケールアップ時の容量しきい値を手動設定する必要がなくなりました。リアルタイムのワークロード負荷に応じて、システムが最適なパフォーマンスとリソース使用率を自動的に維持します。

        - **自動スケールダウンのサポート:** ご要望の多かった機能が追加されました。新しいオートスケーリングでは、低負荷時に自動スケールダウンが行われ、手動操作なしでコストを最適化できます。

        - **設定の簡素化:** 最小および最大の CU サイズを設定するだけになりました。Zilliz Cloud がこの範囲内でスケーリングを自動管理し、可用性とリソース使用率のバランスを最適化します。

        ## Audit Log GA\{#audit-log-ga}

        本リリースでは、**Audit Logs** の **GA（一般提供）** を発表できることを嬉しく思います。また、**3つのクラウドプロバイダーすべて**（AWS、GCP、Azure）でホストされるクラスターがサポートされるようになりました。

        VectorDB Audit Logs は、クラスター内のユーザーアクティビティの詳細な記録を提供し、**セキュリティの向上、コンプライアンスの確保、問題のトラブルシューティング** をより効率的に行えるようにします。クエリ/search からデータ管理操作まで、接続イベントからユーザーやロールの変更まで、操作を完全に可視化することで、Audit Log は **データアクセスの監視**、異常な動作の検出、**エンタープライズのガバナンスとコンプライアンス要件の遵守** を可能にします。

        GA 以降、Audit Log は **有料機能** となります。有効にするには、**Enterprise Plan** の **Dedicated クラスター** を選択してください。

        - 利用方法の詳細については、[VectorDB Audit Logs ユーザーガイド](./audit-logs) を参照してください。

        - 料金情報については、[Audit Log のコスト](./audit-log-cost) を参照してください。

        ## SSO エクスペリエンスの向上\{#improved-sso-experience}

        本リリースでは、Zilliz Cloud の SSO セットアッププロセスを改善し、設定をよりシンプルに、より迅速に、ミスが起こりにくいものにしました。

        **ハイライト:**

        - **IdP 固有のフロー**: **Okta**（OIDC、SAML 2.0）、**Microsoft Entra**（SAML 2.0）、**Google Workspace**（SAML 2.0）向けにカスタマイズされたガイダンスを、コンソールと [ドキュメント](./single-sign-on) の両方で提供します。

        - **UX の向上**: フィールドマッピングの明確化と証明書アップロード時の検証により、設定ミスの防止に役立ちます。

        - <strong>ドキュメントの強化:</strong> **視覚的で IdP 固有の例** により、Zilliz UI と IdP 管理コンソールの間を頻繁に行き来する必要を軽減します。

        ## 機能強化\{#enhancements}

        - **SDK（Python、Java）を通じたステージのライフサイクル全体** を管理できるようになりました。SDK でステージを作成した後は、ファイルのアップロードやワークフローの処理をシームレスに行えるため、開発がよりスムーズかつ効率的になります。

        - **GUI** から直接 **Parquet 形式のローカルファイルをインポート** できるようになりました。これにより、JSON に加えてサポートされる形式が拡張され、大規模なデータセットを扱いやすくなり、データオンボーディングプロセスも効率化されます。

        - **Milvus バックアップファイルからの移行** で、特定の **データベースとコレクション** を選択できるようになりました。これにより、オンプレミスの Milvus からクラウドへデータを転送する際の柔軟性と精度が向上します。

        - Zilliz GUI で、コレクションに関連付けられた **すべてのエイリアス** を表示できるようになり、エイリアスの使用状況の管理と追跡が容易になりました。

        - Zilliz の Terraform Provider が BYOC インスタンス管理をサポートするようになりました。Terraform を使用して、BYOC プロジェクト内のインスタンスを作成、更新、削除できます。

        - Usage では、使用状況の詳細を CSV にエクスポートできるようになりました。また、データの分析とアーカイブを容易にするユーザーエクスペリエンスの改善も行われています。

        - Billing Profile のメールアドレスで請求通知を受信できるようになり、財務チームが常に最新の情報を把握できるようになります。

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

