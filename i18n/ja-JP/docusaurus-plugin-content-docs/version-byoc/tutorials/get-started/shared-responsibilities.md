---
title: "責任の共有 | BYOC"
slug: /shared-responsibilities
sidebar_label: "責任の共有"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudとBYOCのユーザーが、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービスの可用性、技術サポートに関するタスクの分担を明確にし、安全で効率的な運用環境を維持しながらスムーズなコラボレーションを実現するための責任を概説しています。 | BYOC"
type: origin
token: X0MBwUNIqipdMvkTbqDcN3LHnNh
sidebar_position: 10
keywords: 
  - zilliz
  - byoc
  - milvus
  - vector database
  - shared responsibilities
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings

---

import Admonition from '@theme/Admonition';


# 責任の共有

このページでは、Zilliz CloudとBYOCのユーザーが、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービスの可用性、技術サポートに関するタスクの分担を明確にし、安全で効率的な運用環境を維持しながらスムーズなコラボレーションを実現するための責任を概説しています。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## クラウド管理{#cloud-management}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>ジリズBYOC</p></th>
     <th><p>お客様</p></th>
   </tr>
   <tr>
     <td><p>VPCの設定</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>EC 2インスタンスの管理</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Kubernetesクラスタの管理</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>S 3バケットの管理</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Milvusインスタンスのプロビジョニング</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
</table>

## アップグレードとセキュリティ{#upgrade-and-security}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>ジリズBYOC</p></th>
     <th><p>お客様</p></th>
   </tr>
   <tr>
     <td><p>Milvusインスタンスをアップグレードする</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>パッチソフトウェアの脆弱性</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>インフラストラクチャの脆弱性を修正する</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>スケールリソース</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## アクセス制御{#access-control}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>ジリズBYOC</p></th>
     <th><p>お客様</p></th>
   </tr>
   <tr>
     <td><p>IAMロールとサービスアカウントを管理する</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>アクセス制御と監査を実装する</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## サービスの可用性{#service-availability}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>ジリズBYOC</p></th>
     <th><p>お客様</p></th>
   </tr>
   <tr>
     <td><p>ディザスタリカバリ(DR)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>サービスレベル契約（SLA）</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## 技術サポート{#technical-support}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>ジリズBYOC</p></th>
     <th><p>お客様</p></th>
   </tr>
   <tr>
     <td><p>ロギング</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>監査ログ</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>モニタリング</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>ブレイクグラスアクセス</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

