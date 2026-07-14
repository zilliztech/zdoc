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

        ## Autoscaling のアップグレード\{#autoscaling-upgrade}

        **Zilliz Cloud の autoscaling 機能に大幅なアップグレードを導入し、** より優れた自動化されたリソース管理体験を提供できるよう進化します。主な改善点は次のとおりです。

        - **インテリジェント Autoscaling:** スケールアップのために容量しきい値を手動で設定する必要がなくなります。システムがリアルタイムのワークロード需要に基づいて、最適なパフォーマンスとリソース利用率を自動的に確保します。

        - **自動スケールダウンをサポート:** 多くの要望があった機能がついに登場しました。新しい autoscaling は、負荷が低い期間に自動スケールダウンをサポートし、手動介入なしでコストを最適化します。

        - **設定の簡素化:** 必要なのは最小および最大の CU サイズを設定することだけです。Zilliz Cloud がその範囲内で自動的にスケーリングを管理し、可用性とリソース利用率のバランスを取ります。

        ## Audit Log GA\{#audit-log-ga}

        このリリースでは、**Audit Logs** の **GA（一般提供）** を発表できることを嬉しく思います。現在、**3つすべてのクラウドプロバイダー** 上でホストされるクラスターをサポートしています。AWS、GCP、Azure です。

        VectorDB Audit Logs は、クラスター内のユーザーアクティビティの詳細な記録を提供し、**セキュリティの向上、コンプライアンスの確保、問題のトラブルシューティング** をより効率的に行えるようにします。query/search からデータ管理操作、接続イベントからユーザーやロールの変更まで、操作全体を完全に可視化することで、Audit Log は **データアクセスの監視**、異常な動作の検出、そして **エンタープライズガバナンスおよびコンプライアンス要件への対応** を可能にします。

        GA 以降、Audit Log は **有料機能** になります。有効化するには、**Enterprise Plan** の **専用クラスター** を選択してください。

        - 使用方法の詳細については、[VectorDB Audit Logs ユーザーガイド](./audit-logs) を参照してください。

        - 価格情報については、Pricing Guide を参照してください。

        ## SSO 体験の改善\{#improved-sso-experience}

        このリリースでは、設定をよりシンプルに、より速く、よりミスが起こりにくくするために、Zilliz Cloud の SSO セットアッププロセスを改善しました。

        **ハイライト:**

        - **IdP ごとのフロー**: **Okta**(OIDC, SAML 2.0)、**Microsoft Entra**(SAML 2.0)、**Google Workspace**(SAML 2.0) 向けに最適化されたガイダンスを、Console と [Documentation](./single-sign-on) の両方で提供します。

        - **より良い UX**: より明確なフィールドマッピングと証明書アップロードの検証により、設定ミスの防止に役立ちます。

        - **強化されたドキュメント:** **視覚的で IdP ごとの例** を含み、Zilliz UI と IdP 管理コンソールの間を頻繁に行き来する必要を減らします。

        ## 機能強化\{#enhancements}

        - **SDKs(Python, Java)** を通じて、ステージの **ライフサイクル全体** を管理できるようになりました。SDK 経由でステージを作成した後、ファイルのアップロードやワークフローの処理をシームレスに行えるため、開発がよりスムーズで効率的になります。

        - **Parquet 形式のローカルファイル** を **GUI** から直接 **インポート** できるようになりました。これにより、JSON に加えてサポート形式がさらに拡張され、大規模データセットの取り扱いやデータオンボーディングプロセスの効率化が容易になります。

        - **Milvus バックアップファイルからの移行** で、特定の **データベースとコレクション** を選択できるようになりました。これにより、オンプレミスの Milvus からクラウドへデータを移行する際の柔軟性と精度が向上します。

        - Zilliz GUI 上で、コレクションに関連付けられている **すべてのエイリアス** を表示できるようになり、エイリアスの使用状況の管理と追跡が容易になりました。

        - Zilliz の Terraform Provider が BYOC インスタンス管理をサポートするようになりました。Terraform を使用して、BYOC プロジェクト内のインスタンスの作成、更新、削除を行えます。

        - Usage で、使用状況の詳細を CSV にエクスポートできるようになりました。また、データの分析とアーカイブをより簡単にするユーザー体験の改善も行われています。

        - Billing Profile のメールアドレスで請求通知を受信できるようになり、財務チームが最新情報を把握しやすくなりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2025-08-13**

    </div>

    <div>

        ## AWS Sydney リージョンをサポート\{#support-aws-sydney-region}

    </div>

</Grid>

