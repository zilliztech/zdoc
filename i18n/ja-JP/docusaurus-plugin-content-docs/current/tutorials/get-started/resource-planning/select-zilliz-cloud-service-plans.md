---
title: "詳細なプラン比較 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "詳細なプラン比較"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、多様な要件に合わせたクラスタープランを提供しています。ベクトルデータベースが初めての方でも、エンタープライズレベルのタスクに堅牢なソリューションが必要な方でも、適切な選択をすることで最適なパフォーマンス、スケーラビリティ、コスト効率が確保されます。このガイドは、情報に基づいた決定をするのに役立ちます。 | Cloud"
type: origin
token: F4eXw620aina68kLKrXceKv5nkc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster plan
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';


# 詳細なプラン比較

Zilliz Cloudは、多様な要件に合わせたクラスタープランを提供しています。ベクトルデータベースが初めての方でも、エンタープライズレベルのタスクに堅牢なソリューションが必要な方でも、適切な選択をすることで最適なパフォーマンス、スケーラビリティ、コスト効率が確保されます。このガイドは、情報に基づいた決定をするのに役立ちます。

## クラスタプランを選択する{#select-a-cluster-plan}

Zilliz Cloudは、**Free**、**Serverless**、**Dedicated-Standard**、**Dedicated-Enterprise**、**Bring Your Own Cloud(BYOC)**の5つの異なるプランにオファリングを分類しています。

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
     <td><p><strong>価格設定</strong></p></td>
     <td><p>フリー</p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">価格を見る</a></p></td>
     <td><p><a href="https://zilliz.com/contact-sales">コンタクトセールス</a></p></td>
   </tr>
   <tr>
     <td><p><strong>クラウドプロバイダーと地域</strong></p></td>
     <td><p>GCPエクスクルーシブ</p></td>
     <td><p>GCPエクスクルーシブ</p></td>
     <td><p>カテゴリー: AWS,GCP,Azure</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
     <td><p>AWS,GCP,アズール</p><p>詳細については、<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>を参照してください。</p></td>
     <td><p>ユーザーのVPC</p></td>
   </tr>
   <tr>
     <td><p><strong>CU体格オプション</strong></p></td>
     <td><p>シングルCU</p></td>
     <td><p>オートスケール</p></td>
     <td><ul><li><p>32 CUまで。（Web UI上で32 CU以下のクラスタを直接作成できます。より大きなCUサイズの場合は、<a href="https://zilliz.com/contact-sales">営業担当</a>にお問い合わせください。）</p></li><li><p>インクリメント: 1、2、4、6、8、12、16、20、24、28、3 2。</p></li></ul></td>
     <td><ul><li><p>256 CUまで。（Web UI上で256 CU以下のクラスタを直接作成できます。より大きなCUサイズの場合は、<a href="https://zilliz.com/contact-sales">営業担当</a>にお問い合わせください。）</p></li><li><p>インクリメント: 1、2、4、6、8、12、16、20、24、28、32、。。。64、72、80、88、。。。,256<em>(注: CU体格が大なり8の場合、増分は4 CUになります。CU体格が大なり64の場合、増分は8 CUになります)</em></p></li></ul></td>
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
     <td><p><strong>最大クラスタ数</strong></p></td>
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
     <td><p>CUあたり64、および&lt;=409 6</p></td>
     <td><p>CUあたり64、および&lt;=409 6</p></td>
     <td><p>カスタマイズ可能</p></td>
   </tr>
   <tr>
     <td><p><strong>アップタイムSLA</strong></p></td>
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
     <td><p><strong>OAuthの2.0</strong></p></td>
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
     <td><p><strong>マルチファクタ認証(MFA)</strong></p></td>
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
     <td><p><strong>プライベートリンク</strong></p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>利用できません</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>SOC 2タイプIIおよびISO/ICE 2700 1に準拠し、GDPRおよびHIPPAに対応しています。</strong></p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>モニタリングダッシュボードを使用した基本的な指標</strong></p></td>
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
     <td><p>利用できません</p></td>
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
     <td><p><strong>リサイクルビン</strong></p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
   <tr>
     <td><p><strong>パイプライン</strong></p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
     <td><p>ご利用可能</p></td>
   </tr>
</table>

## 関連するトピック{#related-topics}

- [適切なCUを選択](./cu-types-explained)

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)

- [Zilliz Cloudに登録する](./register-with-zilliz-cloud)

