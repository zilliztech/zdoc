---
title: "詳細なプラン比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "Plan Comparison"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、多様な要件に合わせたクラスタープランを提供しています。ベクトルデータベースが初めての方でも、エンタープライズレベルのタスクに堅牢なソリューションが必要な方でも、適切な選択をすることで最適なパフォーマンス、スケーラビリティ、コスト効率が確保されます。このガイドは、情報に基づいた決定をするのに役立ちます。 | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster plan
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz

---

import Admonition from '@theme/Admonition';


# 詳細なプラン比較

Zilliz Cloudは、多様な要件に合わせたクラスタープランを提供しています。ベクトルデータベースが初めての方でも、エンタープライズレベルのタスクに堅牢なソリューションが必要な方でも、適切な選択をすることで最適なパフォーマンス、スケーラビリティ、コスト効率が確保されます。このガイドは、情報に基づいた決定をするのに役立ちます。 

## プラン概要{#plan-overview}

Zilliz Cloudは、その提供を5つの異なるプランに分類しています。

- 無料:無料プランは、Zilliz Cloudを始めたばかりの個人や小規模チーム、またはその機能を試したい人に最適です。5 GBのストレージ、1か月あたり250万vCU、最大5つのコレクションのサポートを提供し、小規模なプロジェクト、プロトタイピング、または学習目的に最適です。Zilliz Cloudを初めて探索し、まだ高度な機能や大規模なリソースが必要ない場合は、このプランを選択してください。

- サーバーレス:サーバーレスプランは、インフラストラクチャを管理する手間がかからない柔軟性とスケーラビリティが必要なユーザー向けに設計されています。変動するワークロードを持つビジネスや、使用した分だけ支払いたい人にとっては素晴らしい選択肢です。大量のデータを低コストで保存する必要があり、固定リソースにコミットすることを好まない場合は、このプランを選択してください。

- 専用(スタンダード):専用(スタンダード)プランは、一貫した高性能ニーズを持つビジネス向けにカスタマイズされています。専用リソースを提供し、信頼性の高いパフォーマンスを確保します。プロジェクトがより高いストレージ、コンピューティングパワー、バックアップや復元などの高度な機能を必要とする場合は、このプランを選択してください。

- 専用(エンタープライズ):専用(エンタープライズ)プランは大企業向けに設計されています。最も厳しい要件を満たすために、強化されたセキュリティ、優先サポート、およびカスタム構成を提供します。厳格なセキュリティ要件があり、プライベートネットワーキング、細粒度のRBAC、およびHIPPAコンプライアンスなどの機能が必要な場合は、このプランを選択してください。

- 「Bring Your Own Cloud(BYOC)」: BYOCプランは、Zilliz Cloudの高度なベクトルデータベース機能を活用しながら、データとインフラストラクチャを完全に制御する必要がある企業に最適です。このプランは、医療、金融、政府など、厳格なデータセキュリティとコンプライアンスのニーズを持つ組織に最適であり、独自のプライベートクラウド環境内での展開を可能にします。既存のクラウドインフラストラクチャとの滑らかな統合、大規模なAIアプリケーションのスケーラビリティ、完全なデータ主権を維持する能力が必要な場合は、BYOCプランを選択してください。

## プラン比較{#plan-comparison}

次の表は、各プランを比較し、各プランで利用可能な特定の機能を詳しく説明しています。

<table>
   <tr>
     <th><p><strong>フィーチャー</strong></p></th>
     <th><p>フリー</p></th>
     <th><p>サーバーレス</p></th>
     <th><p>専用（スタンダード）</p></th>
     <th><p>専用(エンタープライズ)</p></th>
     <th><p>Bring Your Own Cloud（BYOC）について</p></th>
   </tr>
   <tr>
     <td><p><strong>プランの説明</strong></p></td>
     <td><p>学習、実験、プロトタイピングの出発点であり、有料プランへの簡単な移行が可能です。</p></td>
     <td><p>可変またはまれなトラフィックを持つアプリケーションに対して。最小限の構成が必要です。</p></td>
     <td><p>高い制御と一貫したパフォーマンスを提供し、開発およびテスト環境においてコスト効率が高いです。</p></td>
     <td><p>企業レベルの機能とミッションクリティカルなワークロードのためのカスタム構成。本番環境に合わせてカスタマイズされています。</p></td>
     <td><p>カスタムインフラストラクチャ、強化されたデータ保護、コンプライアンスを優先する組織向けに設計されています。</p></td>
   </tr>
   <tr>
     <td><p><strong>の価格</strong></p></td>
     <td><p>フリー</p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/contact-sales">お問い合わせ</a></p></td>
   </tr>
   <tr>
     <td><p><strong>クラウドプロバイダーと地域</strong></p></td>
     <td><p>GCPエクスクルーシブ</p></td>
     <td><p>GCPエクスクルーシブ</p></td>
     <td><p>AWS, GCP,Azure,クラウド</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
     <td><p>AWS, GCP,Azure,クラウド</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
     <td><p>ユーザーのVPC</p></td>
   </tr>
   <tr>
     <td><p><strong>CU体格オプション</strong></p></td>
     <td><p>シングルCU</p></td>
     <td><p>オートスケール</p></td>
     <td><ul><li><p>ウェブUI上で32 CU以下のクラスタを直接作成できます。より大きなCUサイズの場合は、<a href="https://zilliz.com/contact-sales">お問い合わせ</a>を使用してください。</p></li><li><p>インクリメント: 1、2、4、6、8、12、16、20、24、28、3 2。</p></li></ul></td>
     <td><ul><li><p>256 CUまで。（Web UI上で256 CU以下のクラスタを直接作成できます。より大きなCUサイズの場合は、<a href="https://zilliz.com/contact-sales">お問い合わせ</a>を使用してください。）</p></li><li><p>インクリメント: 1、2、4、6、8、12、16、20、24、28、32、。。。64、72、80、88、。。。1,256<em>(注: CU体格が大なり8の場合、増分は4 CUになります。CU体格が大なり64の場合、増分は8 CUになります)</em></p></li></ul></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><strong>CUタイプのオプション</strong></p></td>
     <td><p>N/A</p></td>
     <td><p>N/A</p></td>
     <td><p>3つのオプション:</p><ul><li><p>Performance-optimizedCU、または</p></li><li><p>容量最適化されたCU</p></li><li><p>拡張キャパシティCU</p></li></ul></td>
     <td><p>3つのオプション:</p><ul><li><p>Performance-optimizedCU、または</p></li><li><p>容量最適化されたCU</p></li><li><p>拡張キャパシティCU</p></li></ul></td>
     <td><p>2オプション</p><ul><li><p>Performance-optimizedCU、または</p></li><li><p>容量最適化されたCU</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>最大プロジェクト数</strong></p></td>
     <td><p>1プロジェクト</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><strong>最大クラスター数</strong></p></td>
     <td><p>1クラスタ</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><strong>最大コレクション数</strong></p></td>
     <td><p>5コレクション</p></td>
     <td><p>クラスタあたり10コレクション。</p></td>
     <td><p>詳細については、<a href="./limits#collections">Zillizクラウドの制限</a>を参照してください。</p></td>
     <td><p>詳細については、<a href="./limits#collections">Zillizクラウドの制限</a>を参照してください。</p></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><strong>稼働時間のSLA</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>99.95%</p></td>
     <td><p>99.95%</p></td>
   </tr>
   <tr>
     <td><p><strong>技術サポート</strong></p></td>
     <td><p>コミュニティサポート</p></td>
     <td><p>レスポンスタイムのSLAによるメールサポート:</p><ul><li><p>緊急: 4時間</p></li><li><p>高い: 1営業日</p></li><li><p>ミディアム: 2営業日</p></li></ul></td>
     <td><p>レスポンスタイムのSLAによるメールサポート:</p><ul><li><p>緊急: 4時間</p></li><li><p>高い: 1営業日</p></li><li><p>ミディアム: 2営業日</p></li></ul></td>
     <td><p>レスポンスタイムのSLAによるメールサポート:</p><ul><li><p>緊急: 1時間</p></li><li><p>ハイ: 4時間</p></li><li><p>ミディアム: 1営業日</p></li></ul></td>
     <td><p>レスポンスタイムのSLAによるメールサポート:</p><ul><li><p>緊急: 1時間</p></li><li><p>ハイ: 4時間</p></li><li><p>ミディアム: 1営業日</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>バックアップと復元</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>マイグレーション</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>高速データインポート</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>OAuth 2.0システム</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>シングルサインオン（SSO）</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用可能(パブリックプレビュー中)</p></td>
     <td><p>利用可能(パブリックプレビュー中)</p></td>
   </tr>
   <tr>
     <td><p><strong>マルチファクタ認証（MFA）</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>監査する</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>APIキーの管理</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>転送中および保存中のデータの暗号化</strong></p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>IPアドレスのアクセス制御</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>非公開リンク</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p>SOC 2 Type IIおよびISO/ICE 2700 1に準拠し、GDPRおよびHIPPAに対応しています。</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>モニタリングダッシュボードを使用した基本的なメトリックス</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>アラート</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>組織とプロジェクトRBAC</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>データプレーンRBAC</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>ごみ箱</strong></p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
</table>

## 関連するトピック{#related-topics}

- [適切なCUを選択してください](./cu-types-explained)

- リンク_PLACEHOLDER_0

- リンク_PLACEHOLDER_0

- [Zilliz Cloudに登録してください。](./register-with-zilliz-cloud)

