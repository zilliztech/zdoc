---
title: "エンドポイントを介して Milvus から Zilliz Cloud へ移行 | Cloud"
slug: /via-endpoint
sidebar_key: via-endpoint
sidebar_label: "エンドポイントを介して"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、インフラストラクチャを自ら管理することなく Milvus ベクトルデータベースを利用したいユーザー向けに、Milvus をフルマネージド型のクラウドホストソリューションとして提供しています。このトピックでは、データベースのエンドポイントを介して Milvus から移行する方法について説明します。 | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - milvus
  - endpoint

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# エンドポイントを介して Milvus から Zilliz Cloud へ移行

Zilliz Cloud は、インフラストラクチャを自ら管理することなく Milvus ベクトルデータベースを使用したいユーザー向けに、[Milvus](https://milvus.io/) を完全に管理されたクラウドホスト型ソリューションとして提供しています。このトピックでは、データベースエンドポイントを介して Milvus から移行する方法について説明します。

## 前提条件\{#prerequisites}

Milvus から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Milvus の要件\{#milvus-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Version compatibility</p></td>
     <td><p>Milvus 2.3.6 or later</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク access</p></td>
     <td><p>Source Milvus instance must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Authentication credentials</p></td>
     <td><p>Username and password if authentication is enabled (refer to <a href="https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access">Authenticate User Access</a>)</p></td>
   </tr>
</table>

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User role</p></td>
     <td><p>組織オーナー or プロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>Cluster capacity</p></td>
     <td><p>Sufficient storage and compute resources (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate CU size)</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク access</p></td>
     <td><p>Add <a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a> to allowlists if using network restrictions</p></td>
   </tr>
</table>

## 開始方法\{#getting-started}

次のデモでは、エンドポイントを介して Milvus から移行を開始する方法を段階的に説明します。

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>ソースコレクションで全文検索がすでに有効になっている場合、Zilliz Cloud は移行後にターゲットコレクションの Function 設定を保持します。これらの継承された設定は変更できません。</p></li>
<li><p>また、移行中に他の VARCHAR フィールドに対して全文検索を有効にすることもできます。詳細については、<a href="./full-text-search">Full Text Search</a> を参照してください。</p></li>
</ul>

</Admonition>

## 移行プロセスの監視\{#monitor-the-migration-process}

**Migrate** をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center) ページで移行の進捗状況を確認できます。ジョブのステータスが **進行中** から **成功** に切り替わると、移行が完了します。

![RGsvb7oFpo7uzbxjSSFc6owNn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/rgsvb7ofpo7uzbxjssfc6ownn0c.png "RGsvb7oFpo7uzbxjSSFc6owNn0c")

## 移行後\{#post-migration}

移行ジョブが完了したら、以下の点に注意してください。

- **Index Creation**: 移行プロセスにより、移行されたコレクションに対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **手動ロードが必要です**: 自動インデックス作成が行われますが、移行されたコレクションは直ちに検索やクエリ操作に使用できるようにはなりません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>コレクションがロードされたら、ターゲットクラスター内のコレクション数とエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除し、それらを再移行してください。</p>

</Admonition>

## 移行ジョブのキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、以下の手順に従ってトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [ジョブ](./job-center) ページで、失敗した移行ジョブを特定し、それをキャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログにアクセスします。

</Procedures>