---
title: "詳細プラン比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "プラン比較"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、多様な要件に適した範囲のプロジェクトプランを提供します。ベクターデータベースの初心者でもエンタープライズレベルのタスク用に堅牢なソリューションが必要な場合でも、正しい選択を行うことで最適なパフォーマンス、スケーラビリティ、コスト効率を確保できます。このガイドは、情報に基づいた意思決定に役立ちます。 | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - cluster plan
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector

---

import Admonition from '@theme/Admonition';


# 詳細プラン比較

Zilliz Cloudは、多様な要件に適した範囲のプロジェクトプランを提供します。ベクターデータベースの初心者でもエンタープライズレベルのタスク用に堅牢なソリューションが必要な場合でも、正しい選択を行うことで最適なパフォーマンス、スケーラビリティ、コスト効率を確保できます。このガイドは、情報に基づいた意思決定に役立ちます。

## プラン概要\{#plan-overview}

Zilliz Cloudは、その提供を5つの明確なプランに分類しています。

- **Standard：** Standardプランは非クリティカルワークロード向けに調整されています。プロトタイプおよびテスト環境に最も適しています。詳細については、[Zilliz Cloud価格](https://zilliz.com/pricing)を参照してください。

- **Enterprise：** Enterpriseプランは、エンタープライズグレードの信頼性と制御を提供します。本番アプリケーションに最も適しています。詳細については、[Zilliz Cloud価格](https://zilliz.com/pricing)を参照してください。

- **Business Critical：** Business Criticalプランは、最大限の耐障害性を持つ規制対応です。医療、金融、ミッションクリティカルシステムに最も適しています。Business Criticalプランを選択するには、[営業担当に問い合わせてください](http://zilliz.com/contact-sales)。

- **Bring Your Own Cloud (BYOC)：** BYOCプランは、カスタムインフラ、強化されたデータ保護、およびコンプライアンスを優先する組織向けに設計されています。SaaS専用クラスターと同じ機能およびエクスペリエンスを提供します。BYOCプランを選択するには、[営業担当に問い合わせてください](http://zilliz.com/contact-sales)。

## プラン比較\{#plan-comparison}

以下のセクションでは、プランおよび展開オプションを比較し、各プランで利用可能な特定の機能を詳しく説明します。

### 展開\{#deployment}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>環境</p></td>
     <td><p>共有</p></td>
     <td><p>共有</p></td>
     <td><p>専用</p></td>
     <td><p>専用</p></td>
     <td><p>専用</p></td>
     <td><p>専用</p></td>
   </tr>
   <tr>
     <td><p><a href="./cloud-providers-and-regions">クラウドプロバイダーおよびリージョン</a></p></td>
     <td><p>AWS、GCP</p></td>
     <td><p>AWS、GCP</p></td>
     <td><p>AWS、GCP、Azure</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダーおよびリージョン</a>を参照してください。</p></td>
     <td><p>AWS、GCP、Azure</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダーおよびリージョン</a>を参照してください。</p></td>
     <td><p>AWS、GCP、Azure</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダーおよびリージョン</a>を参照してください。</p></td>
     <td><p>ユーザーのVPC</p></td>
   </tr>
   <tr>
     <td><p>クエリCU数</p></td>
     <td><p>単一クエリCU</p></td>
     <td><p>自動スケーリング。構成不要</p></td>
     <td><ul><li><p>最大32クエリCU。（Web UIで32クエリCU以下のクラスターを直接作成できます。それ以上のクエリCUが必要な場合は、<a href="https://zilliz.com/contact-sales">営業担当に問い合わせてください</a>。</p></li><li><p>増分：1、2、4、6、8、12、16、20、24、28、32。</p></li></ul></td>
     <td><ul><li><p>最大256クエリCU。（Web UIで256クエリCU以下のクラスターを直接作成できます。それ以上のクエリCUが必要な場合は、<a href="https://zilliz.com/contact-sales">営業担当に問い合わせてください</a>。</p></li><li><p>増分：1、2、4、6、8、12、16、20、24、28、32、…、64、72、80、88、…、256 <em>（注：クエリCUが8より大きい場合、増分は4CUになります。クエリCUが64より大きい場合、増分は8CUになります）</em></p></li></ul></td>
     <td><ul><li><p>最大256クエリCU。（Web UIで256クエリCU以下のクラスターを直接作成できます。それ以上のクエリCUが必要な場合は、<a href="https://zilliz.com/contact-sales">営業担当に問い合わせてください</a>。</p></li><li><p>増分：1、2、4、6、8、12、16、20、24、28、32、…、64、72、80、88、…、256 <em>（注：クエリCUが8より大きい場合、増分は4CUになります。クエリCUが64より大きい場合、増分は8CUになります）</em></p></li></ul></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><a href="./scale-cluster">コンピュートスケーリング</a></p></td>
     <td></td>
     <td><p>システム管理の自動スケーリング</p><p>（構成不要）</p></td>
     <td><p>手動スケーリング</p><p>32CUまで</p></td>
     <td><p>構成可能な自動スケーリング</p><p>手動スケーリング256CU以上</p></td>
     <td><p>構成可能な自動スケーリング</p><p>手動スケーリング256CU以上</p></td>
     <td><p>構成可能な自動スケーリング</p><p>手動スケーリング256CU以上</p></td>
   </tr>
   <tr>
     <td><p><a href="./cu-types-explained">クラスタータイプ</a>オプション</p></td>
     <td></td>
     <td></td>
     <td><p>3つのオプション：</p><ul><li><p>パフォーマンス最適化CU</p></li><li><p>容量最適化CU</p></li><li><p>階層ストレージCU</p></li></ul></td>
     <td><p>3つのオプション：</p><ul><li><p>パフォーマンス最適化CU</p></li><li><p>容量最適化CU</p></li><li><p>階層ストレージCU</p></li></ul></td>
     <td><p>3つのオプション：</p><ul><li><p>パフォーマンス最適化CU</p></li><li><p>容量最適化CU</p></li><li><p>階層ストレージCU</p></li></ul></td>
     <td><p>2つのオプション</p><ul><li><p>パフォーマンス最適化CU</p></li><li><p>容量最適化CU</p></li></ul></td>
   </tr>
   <tr>
     <td><p>最大コレクション数</p></td>
     <td><p>5コレクション</p></td>
     <td><p>クラスターあたり10コレクション。</p></td>
     <td><p>詳細については、<a href="./limits#collections">Zilliz Cloud制限</a>を参照してください。</p></td>
     <td><p>詳細については、<a href="./limits#collections">Zilliz Cloud制限</a>を参照してください。</p></td>
     <td><p>詳細については、<a href="./limits#collections">Zilliz Cloud制限</a>を参照してください。</p></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p>アップタイムSLA</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>99.95%</p></td>
     <td><p>99.99%（マルチレプリカが有効な場合）</p></td>
     <td><p>99.95%</p></td>
   </tr>
</table>

### 高可用性\{#high-availability}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>可用性ゾーン</p></td>
     <td></td>
     <td><p>シングル</p></td>
     <td><p>シングル</p></td>
     <td><p>複数</p></td>
     <td><p>複数</p></td>
     <td><p>複数</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-replica">レプリカ</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>スナップショット</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>グローバルクラスター</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
</table>

### データ管理\{#data-managment}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./offline-migration">クラスター間移行</a></p></td>
     <td></td>
     <td><p>無料クラスターから</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./zero-downtime-migration">ダウンタイムゼロ移行</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-external-sources">外部ソースからの移行</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-stages">ステージ</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./import-data">高速データインポート</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./use-recycle-bin">ごみ箱</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### データセキュリティおよびコンプライアンス\{#data-security-and-compliance}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>OAuth 2.0</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./single-sign-on">エンタープライズSSO</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>顧客管理暗号化キー（CMEK）</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="./multi-factor-auth">MFA</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./auditing">監査</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-api-keys">APIキー管理</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./data-security#data-encryption">転送中および保存中のデータ暗号化</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-and-restore">バックアップおよびリストア</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">クロスリージョンバックアップ</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-whitelist">IPアドレスアクセス制御</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-a-private-link">プライベートネットワーキング</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/trust-center">SOC 2 Type IIおよびISO/ICE 27001準拠、GDPR対応</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/trust-center">HIPPA対応</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 監視性\{#observability}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./view-cluster-metric-charts">リアルタイム監視ダッシュボード付きのきめ細かなメトリクス</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-project-alerts">アラート</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./integrate-with-third-parties">アラートおよび監視統合</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./job-center">ジョブセンター</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### ロールベースアクセス制御\{#role-based-access-control}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">組織およびプロジェクトRBAC</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-control">データプレーンRBAC</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 統合およびツール\{#integrations-and-tools}

<table>
   <tr>
     <th></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="/reference/restful">制御およびデータプレーン操作のための直感的なRESTful API</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="/reference/python">複数プログラミング言語のユーザーフレンドリーSDK</a>（Python、Java、Go、およびNode.js SDK）</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/vector-transport-service">VTS（Vector Transport Service）</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/vdbbench-leaderboard">VectorDBBench</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 技術サポート\{#technical-support}

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>無料</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用（Standard）</strong></p></th>
     <th><p><strong>専用（Enterprise）</strong></p></th>
     <th><p><strong>専用（Business Critical）</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>オンコール対応</p></td>
     <td></td>
     <td><p>営業時間</p></td>
     <td><p>営業時間</p></td>
     <td><p>24時間365日</p></td>
     <td><p>24時間365日</p></td>
     <td></td>
   </tr>
   <tr>
     <td rowspan="4"><p>最初の対応SLA</p></td>
     <td><p>緊急</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>30分オンコール</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>至急</p></td>
     <td></td>
     <td><p>4時間</p></td>
     <td><p>4時間</p></td>
     <td><p>1時間</p></td>
     <td><p>1時間</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>高</p></td>
     <td></td>
     <td><p>1営業日</p></td>
     <td><p>1営業日</p></td>
     <td><p>4時間</p></td>
     <td><p>4時間</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>中/通常</p></td>
     <td></td>
     <td><p>2営業日</p></td>
     <td><p>2営業日</p></td>
     <td><p>1営業日</p></td>
     <td><p>1営業日</p></td>
     <td></td>
   </tr>
   <tr>
     <td rowspan="6"><p>サポートオプション</p></td>
     <td><p>コミュニティ</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>サポートボット</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>メール/チケットポータル</p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Slackチャネル</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Zoom/Meet/Teams</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>割り当てサポートエンジニア</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>アーキテクチャガイダンス</p></td>
     <td><p>一般</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>ユースケース固有</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>コードレビュー</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>ライブコンサルテーション</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>